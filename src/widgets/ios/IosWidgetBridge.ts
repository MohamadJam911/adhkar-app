import { Platform } from 'react-native';
import type { ExtensionStorage as ExtensionStorageType } from '@bacons/apple-targets';
import type { PrayerTimings } from '../widgetStatus';
import { PrayerTimesProvider } from '../../services/PrayerTimesProvider';
import { MasraPalaceWidgetModel } from '../masraPalace/MasraPalaceWidgetModel';
import { loadWidgetTextScale } from '../../services/appPreferences';

// ==========================================
// iPhone widget bridge (WidgetKit — Swift in targets/widget)
// ==========================================
// The iPhone widget cannot run JavaScript, so the app computes 14 days of
// prayer times with PrayerTimesProvider (same location and engine as the
// Android widgets) and writes them as JSON to the shared App Group. The
// widget builds its own timeline from them: it switches to the next prayer
// exactly at the adhan and its countdown ticks every second — without the
// app running. Must match:
//   • app.json ← ios.entitlements["com.apple.security.application-groups"]
//   • targets/widget/MasraWidget.swift ← appGroup / storageKey / widgetKind

export const IOS_APP_GROUP = 'group.com.mohamad.masra';
const STORAGE_KEY = 'masra.widget.schedule';
const WIDGET_KIND = 'MasraPrayerWidget';
const DAYS_AHEAD = 14;
const SCHEMA_VERSION = 1;

type IosWidgetDay = { d: string } & Pick<PrayerTimings, 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'>;

export type IosWidgetPayload = {
  v: number;
  city: string;
  generatedAt: string;
  iqama: Record<string, number>;
  /** Text scale from the app's font size (read by the Swift widget from build 1.0.1). */
  textScale: number;
  days: IosWidgetDay[];
};

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// The library reads the global `expo` at import time, so it is loaded lazily
// and only on iOS — never on Android or in the background widget task.
const loadExtensionStorage = (): typeof ExtensionStorageType =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@bacons/apple-targets').ExtensionStorage;

export class IosWidgetBridge {
  private static storage: ExtensionStorageType | null = null;

  /** Builds the widget payload without writing it — separate so it is easy to test. */
  static async buildPayload(lastKnownTimings?: PrayerTimings | null, now: Date = new Date()): Promise<IosWidgetPayload> {
    const provider = await PrayerTimesProvider.load(lastKnownTimings);
    const days: IosWidgetDay[] = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 12);
      const t = provider.getTimingsFor(date);
      days.push({ d: dayKey(date), Fajr: t.Fajr, Sunrise: t.Sunrise, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha });
    }
    return {
      v: SCHEMA_VERSION,
      city: MasraPalaceWidgetModel.shortCityLabel(provider.location.name),
      generatedAt: now.toISOString(),
      iqama: { ...MasraPalaceWidgetModel.IQAMA_MINUTES },
      textScale: await loadWidgetTextScale(),
      days,
    };
  }

  /**
   * Writes 14 days of times for the widget and asks iOS to rebuild its timeline.
   * Safe to call on Android (no-op) and on iOS builds without the module.
   */
  static async sync(lastKnownTimings?: PrayerTimings | null): Promise<void> {
    if (Platform.OS !== 'ios') return;
    try {
      if (lastKnownTimings) await PrayerTimesProvider.rememberAppTimings(lastKnownTimings);
      const payload = await IosWidgetBridge.buildPayload(lastKnownTimings);
      const ExtensionStorage = loadExtensionStorage();
      IosWidgetBridge.storage ??= new ExtensionStorage(IOS_APP_GROUP);
      IosWidgetBridge.storage.set(STORAGE_KEY, JSON.stringify(payload));
      ExtensionStorage.reloadWidget(WIDGET_KIND);
    } catch (e) {
      console.warn('iOS widget sync failed:', e);
    }
  }
}
