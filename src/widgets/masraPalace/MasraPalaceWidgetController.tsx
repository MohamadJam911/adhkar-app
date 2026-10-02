import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import type { PrayerTimings } from '../widgetStatus';
import { PrayerTimesProvider } from '../../services/PrayerTimesProvider';
import { loadWidgetTextScale } from '../../services/appPreferences';
import { MasraPalaceWidgetModel, type MasraPalaceViewModel } from './MasraPalaceWidgetModel';
import { MasraPalaceWidget } from './MasraPalaceWidget';
import { MasraPalaceMiniWidget } from './MasraPalaceMiniWidget';
import { MasraWidgetClock } from '../../../modules/masra-widget-clock';

// ==========================================
// Single entry point between the "Emerald Palace" widgets and the app
// ==========================================
//  • widgetTaskHandler.ts ← buildElement()  (Android periodic update / widget added, app closed)
//  • prayerLogic.tsx      ← requestUpdate() (whenever the app computes new times)
// Both widgets (4×2 and 2×2) share the same times and the same minute alarm.
// Names must match the "name" field in app.json exactly — the 2×2 keeps its
// old name "PrayerWidget" so instances already on home screens keep updating.

export type WidgetSize = { width: number; height: number };

export class MasraPalaceWidgetController {
  static readonly WIDGET_NAME = 'MasraPalaceWidget';
  static readonly MINI_WIDGET_NAME = 'PrayerWidget';
  static readonly WIDGET_NAMES = [
    MasraPalaceWidgetController.WIDGET_NAME,
    MasraPalaceWidgetController.MINI_WIDGET_NAME,
  ] as const;

  static handles(widgetName: string): boolean {
    return (MasraPalaceWidgetController.WIDGET_NAMES as readonly string[]).includes(widgetName);
  }

  /** Computes the times with PrayerTimesProvider and builds the view model. */
  static async buildViewModel(lastKnownTimings?: PrayerTimings | null, now: Date = new Date()): Promise<MasraPalaceViewModel> {
    const provider = await PrayerTimesProvider.load(lastKnownTimings);
    const { today, tomorrow } = provider.getTodayAndTomorrow(now);
    return MasraPalaceWidgetModel.build({ today, tomorrow, cityName: provider.location.name, now });
  }

  /**
   * @param size real widget size (dp) from Android — without it the background
   *             is drawn at a default size and may not cover the widget.
   * @param widgetName which widget to render (defaults to the 4×2)
   */
  static async buildElement(
    lastKnownTimings?: PrayerTimings | null,
    size?: WidgetSize,
    widgetName: string = MasraPalaceWidgetController.WIDGET_NAME
  ): Promise<React.JSX.Element> {
    // Every render books the next one at the start of the next minute — a
    // chain that keeps running with the app closed. If it breaks (a reboot
    // clears alarms), Android's periodic update (30 min) restarts it.
    MasraWidgetClock.scheduleRefresh(widgetName, MasraPalaceWidgetModel.nextRefreshAt());

    let model: MasraPalaceViewModel;
    try {
      model = await MasraPalaceWidgetController.buildViewModel(lastKnownTimings);
    } catch (e) {
      model = MasraPalaceWidgetModel.empty();
    }

    // Widget text follows the font size chosen in the app's Settings
    const textScale = await loadWidgetTextScale();

    if (widgetName === MasraPalaceWidgetController.MINI_WIDGET_NAME) {
      return <MasraPalaceMiniWidget model={model} widgetWidth={size?.width} widgetHeight={size?.height} textScale={textScale} />;
    }
    return <MasraPalaceWidget model={model} widgetWidth={size?.width} widgetHeight={size?.height} textScale={textScale} />;
  }

  /** After a widget instance is removed: reschedules for the rest, or cancels if none are left. */
  static rescheduleOrCancel(widgetName: string = MasraPalaceWidgetController.WIDGET_NAME): void {
    MasraWidgetClock.scheduleRefresh(widgetName, MasraPalaceWidgetModel.nextRefreshAt());
  }

  /** false on Android 14+ until the user allows "Alarms & reminders". */
  static canRefreshExactly(): boolean {
    return MasraWidgetClock.canScheduleExactAlarms();
  }

  static openExactAlarmSettings(): void {
    MasraWidgetClock.openExactAlarmSettings();
  }

  /**
   * Redraws every instance of both widgets on the home screen. Safe to call
   * even if the user never added a widget (the library does nothing).
   */
  static async requestUpdate(lastKnownTimings?: PrayerTimings | null): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      if (lastKnownTimings) await PrayerTimesProvider.rememberAppTimings(lastKnownTimings);
    } catch (e) {}

    for (const widgetName of MasraPalaceWidgetController.WIDGET_NAMES) {
      try {
        await requestWidgetUpdate({
          widgetName,
          // The library calls this once per widget instance, with its size
          renderWidget: (info) => MasraPalaceWidgetController.buildElement(lastKnownTimings, info, widgetName),
        });
      } catch (e) {}
    }
  }
}
