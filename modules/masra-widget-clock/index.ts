import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

// ==========================================
// JS bridge to the native MasraWidgetClock module (Kotlin)
// ==========================================
// Optional on purpose: if a JS update (`eas update`) lands on an older build
// without this native module, every function becomes a no-op instead of
// crashing, and the widget falls back to the regular 30-minute update.

export type RefreshScheduleResult = 'exact' | 'inexact' | 'no-widgets' | 'unavailable';

type NativeClock = {
  scheduleRefresh(widgetName: string, triggerAtMs: number): Exclude<RefreshScheduleResult, 'unavailable'>;
  cancelRefresh(widgetName: string): void;
  canScheduleExactAlarms(): boolean;
  openExactAlarmSettings(): void;
};

const native = Platform.OS === 'android' ? requireOptionalNativeModule<NativeClock>('MasraWidgetClock') : null;

export const MasraWidgetClock = {
  isAvailable: native !== null,

  scheduleRefresh(widgetName: string, at: Date): RefreshScheduleResult {
    if (!native) return 'unavailable';
    try {
      return native.scheduleRefresh(widgetName, at.getTime());
    } catch (e) {
      return 'unavailable';
    }
  },

  cancelRefresh(widgetName: string): void {
    try {
      native?.cancelRefresh(widgetName);
    } catch (e) {}
  },

  /** false on Android 14+ until the user enables "Alarms & reminders" for the app. */
  canScheduleExactAlarms(): boolean {
    try {
      return native ? native.canScheduleExactAlarms() : false;
    } catch (e) {
      return false;
    }
  },

  openExactAlarmSettings(): void {
    try {
      native?.openExactAlarmSettings();
    } catch (e) {}
  },
};
