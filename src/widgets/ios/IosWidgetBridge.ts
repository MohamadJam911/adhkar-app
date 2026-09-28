import { Platform } from 'react-native';
import type { ExtensionStorage as ExtensionStorageType } from '@bacons/apple-targets';
import type { PrayerTimings } from '../widgetStatus';
import { DahriWidgetTimesProvider } from '../masraPalace/DahriWidgetTimesProvider';
import { MasraPalaceWidgetModel } from '../masraPalace/MasraPalaceWidgetModel';

// ==========================================
// 🍎 جسر ويدجت الآيفون (WidgetKit — targets/widget بـSwift)
// ==========================================
// ويدجت الآيفون ما بيقدر يشغّل JS، فالتطبيق بيحسب مواقيت ١٤ يوم قدّام من
// جدول DAHRI_TIMES (نفس DahriWidgetTimesProvider تبع أندرويد بالحرف —
// نفس المدينة والإزاحة والتوقيت الصيفي) وبيكتبها كـJSON بمخزن الـApp Group
// المشترك، والويدجت بيبني منها جدولاً زمنياً (timeline) لحاله: بيتبدّل
// للصلاة الجاية بلحظة الأذان بالضبط وعدّاده بيتكّ بالثواني — بدون ما
// التطبيق يكون مفتوح. لازم يتطابق مع:
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
  days: IosWidgetDay[];
};

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// المكتبة بتقرا المتغيّر العام `expo` لحظة استيرادها — منحمّلها بس على iOS
// ووقت الحاجة، حتى ما تنلمس أبداً على أندرويد (ولا بمهمة الويدجت الخلفية).
const loadExtensionStorage = (): typeof ExtensionStorageType =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@bacons/apple-targets').ExtensionStorage;

export class IosWidgetBridge {
  private static storage: ExtensionStorageType | null = null;

  /** بيبني بيانات الويدجت (بدون كتابة) — مفصول حتى ينفحص بسهولة. */
  static async buildPayload(lastKnownTimings?: PrayerTimings | null, now: Date = new Date()): Promise<IosWidgetPayload> {
    const provider = await DahriWidgetTimesProvider.load(lastKnownTimings);
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
      days,
    };
  }

  /**
   * بيكتب مواقيت ١٤ يوم للويدجت وبيطلب من iOS يعيد بناء جدوله الزمني.
   * آمن للاستدعاء على أندرويد (ما بيعمل شي) وعلى نسخة iOS ما فيها الموديول.
   */
  static async sync(lastKnownTimings?: PrayerTimings | null): Promise<void> {
    if (Platform.OS !== 'ios') return;
    try {
      if (lastKnownTimings) await DahriWidgetTimesProvider.rememberAppTimings(lastKnownTimings);
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
