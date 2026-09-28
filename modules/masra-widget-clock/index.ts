import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

// ==========================================
// ⏰ جسر JS للموديول الأصلي MasraWidgetClock (Kotlin)
// ==========================================
// "Optional" عمداً: لو نزل تحديث JS عبر `eas update` على نسخة تطبيق قديمة
// ما فيها هاد الموديول الأصلي، كل الدوال هون بتصير no-op بدل ما التطبيق
// ينهار — والويدجت بيرجع للتحديث الدوري العادي (كل ٣٠ دقيقة).

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

  /** false على أندرويد ١٤+ لحد ما المستخدم يفعّل "المنبهات والتذكيرات" للتطبيق. */
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
