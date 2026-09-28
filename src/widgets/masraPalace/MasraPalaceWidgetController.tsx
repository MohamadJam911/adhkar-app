import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import type { PrayerTimings } from '../widgetStatus';
import { DahriWidgetTimesProvider } from './DahriWidgetTimesProvider';
import { MasraPalaceWidgetModel, type MasraPalaceViewModel } from './MasraPalaceWidgetModel';
import { MasraPalaceWidget } from './MasraPalaceWidget';
import { MasraPalaceMiniWidget } from './MasraPalaceMiniWidget';
import { MasraWidgetClock } from '../../../modules/masra-widget-clock';

// ==========================================
// 🔌 نقطة الربط الوحيدة بين ويدجتس "القصر الزمردي" وباقي التطبيق
// ==========================================
//  • widgetTaskHandler.ts  ← buildElement()  (تحديث أندرويد الدوري/إضافة الويدجت، والتطبيق مسكّر)
//  • prayerLogic.tsx       ← requestUpdate() (لحظة ما التطبيق يحسب مواقيت جديدة)
// الويدجتين (4×2 و2×2) بيشتركوا بنفس المواقيت الدهرية ونفس منبّه الدقيقة.
// الأسماء لازم تطابق حقل "name" بـapp.json حرفياً — الـ2×2 محتفظ باسمه
// القديم "PrayerWidget" حتى النسخ الموجودة على الشاشة تتحدّث لحالها.

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

  /** بيحسب المواقيت من جدول DAHRI_TIMES مباشرة ويبني نموذج العرض. */
  static async buildViewModel(lastKnownTimings?: PrayerTimings | null, now: Date = new Date()): Promise<MasraPalaceViewModel> {
    const provider = await DahriWidgetTimesProvider.load(lastKnownTimings);
    const { today, tomorrow } = provider.getTodayAndTomorrow(now);
    return MasraPalaceWidgetModel.build({ today, tomorrow, cityName: provider.location.name, now });
  }

  /**
   * @param size أبعاد الويدجت الفعلية (dp) من أندرويد — بدونها الخلفية
   *             بتنرسم بحجم افتراضي وممكن ما تغطي الويدجت كامل.
   * @param widgetName أي ويدجت منرسم (الافتراضي الـ4×2)
   */
  static async buildElement(
    lastKnownTimings?: PrayerTimings | null,
    size?: WidgetSize,
    widgetName: string = MasraPalaceWidgetController.WIDGET_NAME
  ): Promise<React.JSX.Element> {
    // كل رسمة بتحجز الرسمة الجاية ببداية الدقيقة الجاية — سلسلة بتضل
    // شغّالة لحالها والتطبيق مسكّر. لو انكسرت (إعادة تشغيل الجوال بتمسح
    // المنبّهات) التحديث الدوري لأندرويد (٣٠ دقيقة) بيرجع يشغّلها.
    MasraWidgetClock.scheduleRefresh(widgetName, MasraPalaceWidgetModel.nextRefreshAt());

    let model: MasraPalaceViewModel;
    try {
      model = await MasraPalaceWidgetController.buildViewModel(lastKnownTimings);
    } catch (e) {
      model = MasraPalaceWidgetModel.empty();
    }

    if (widgetName === MasraPalaceWidgetController.MINI_WIDGET_NAME) {
      return <MasraPalaceMiniWidget model={model} widgetWidth={size?.width} widgetHeight={size?.height} />;
    }
    return <MasraPalaceWidget model={model} widgetWidth={size?.width} widgetHeight={size?.height} />;
  }

  /** بعد حذف نسخة من الويدجت: بيحجز للنسخ الباقية، أو بيلغي إذا ما ضل شي. */
  static rescheduleOrCancel(widgetName: string = MasraPalaceWidgetController.WIDGET_NAME): void {
    MasraWidgetClock.scheduleRefresh(widgetName, MasraPalaceWidgetModel.nextRefreshAt());
  }

  /** false على أندرويد ١٤+ لحد ما المستخدم يسمح بـ"المنبهات والتذكيرات". */
  static canRefreshExactly(): boolean {
    return MasraWidgetClock.canScheduleExactAlarms();
  }

  static openExactAlarmSettings(): void {
    MasraWidgetClock.openExactAlarmSettings();
  }

  /**
   * بيعيد رسم كل نسخ الويدجتين الموجودة على الشاشة الرئيسية. آمن للاستدعاء
   * حتى لو المستخدم ما ضاف الويدجت أصلاً (المكتبة ببساطة ما بتعمل شي).
   */
  static async requestUpdate(lastKnownTimings?: PrayerTimings | null): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      if (lastKnownTimings) await DahriWidgetTimesProvider.rememberAppTimings(lastKnownTimings);
    } catch (e) {}

    for (const widgetName of MasraPalaceWidgetController.WIDGET_NAMES) {
      try {
        await requestWidgetUpdate({
          widgetName,
          // المكتبة بتنادي هاي الدالة مرة لكل نسخة من الويدجت، مع أبعادها
          renderWidget: (info) => MasraPalaceWidgetController.buildElement(lastKnownTimings, info, widgetName),
        });
      } catch (e) {}
    }
  }
}
