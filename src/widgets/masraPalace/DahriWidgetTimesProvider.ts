import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DAHRI_TIMES,
  getDahriCityOffset,
  getPalestineDstOffset,
  addMinutesToTime,
} from '../../data/dahriTimesData';
import type { PrayerTimings } from '../widgetStatus';

// ==========================================
// 📅 مزوّد مواقيت "التقويم الدهري" الخاص بالويدجت
// ==========================================
// الويدجتس القديمة بتقرأ آخر مواقيت حفظها التطبيق (@widget_prayer_timings)
// — يعني بعد نص الليل بتضل تعرض مواقيت مبارح لحد ما المستخدم يفتح
// التطبيق. هاد الكلاس بيحسب المواقيت مباشرة من جدول DAHRI_TIMES لأي
// يوم (اليوم وبكرا)، بنفس المعادلة الحرفية لـapplyDahriTimes بصفحة
// PrayerTimesScreen (إزاحة المدينة + التوقيت الصيفي + تحويل العصر/المغرب/
// العشاء لنظام ٢٤ ساعة)، فبيضل صح حتى لو التطبيق مسكّر أيام.

export const SELECTED_CITY_STORAGE_KEY = '@user_selected_city';
const LAST_TIMINGS_STORAGE_KEY = '@widget_prayer_timings';
const DATED_TIMINGS_STORAGE_KEY = '@masra_palace_widget_dated_timings';

type DatedTimings = { date: string; timings: PrayerTimings };

// نفس الافتراضي المستخدم بـPrayerTimesScreen لما يفشل تحديد الموقع
const JERUSALEM_DEFAULT = { name: 'القدس الشريف', lat: 31.7683, lon: 35.2137 };
const FALLBACK_ROW = ['05:00', '06:30', '11:45', '02:30', '05:00', '06:15'];

// الإزاحات الممكنة فعلياً بجدول المدن (بعد التقريب) — منستخدمها لما
// نستنتج الإزاحة من آخر مواقيت محفوظة (شوف calibrateOffset تحت).
const KNOWN_ROUNDED_OFFSETS = [-1, 0, 1, 2, 3, 4];
const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export type DahriLocationSource = 'saved-city' | 'calibrated' | 'default';

export type DahriLocation = {
  name: string;
  dahriOffset: number;
  source: DahriLocationSource;
};

type SavedCity = {
  name?: string;
  lat?: number | null;
  lon?: number | null;
  dahriOffset?: number;
};

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
};

export class DahriWidgetTimesProvider {
  readonly location: DahriLocation;

  constructor(location: DahriLocation) {
    this.location = location;
  }

  /**
   * بيحدد موقع المستخدم بنفس أولويات التطبيق:
   *  ١) المدينة المحفوظة (@user_selected_city) — نفس إزاحتها الدهرية.
   *  ٢) ما في مدينة محفوظة (GPS بدون حفظ): منستنتج الإزاحة من آخر مواقيت
   *     حسبها التطبيق، حتى ما نعرض توقيت القدس لمستخدم بغزة مثلاً.
   *  ٣) ولا شي من هدول: القدس (نفس افتراضي التطبيق).
   */
  static async load(lastKnownTimings?: PrayerTimings | null): Promise<DahriWidgetTimesProvider> {
    const saved = await DahriWidgetTimesProvider.readJson<SavedCity>(SELECTED_CITY_STORAGE_KEY);
    if (saved && typeof saved.lat === 'number' && typeof saved.lon === 'number') {
      const dahriOffset =
        typeof saved.dahriOffset === 'number' ? saved.dahriOffset : getDahriCityOffset(saved.lat, saved.lon);
      return new DahriWidgetTimesProvider({
        name: saved.name || JERUSALEM_DEFAULT.name,
        dahriOffset,
        source: 'saved-city',
      });
    }

    const calibrated = await DahriWidgetTimesProvider.resolveCalibratedOffset(lastKnownTimings);
    if (calibrated !== null) {
      return new DahriWidgetTimesProvider({ name: 'موقعك الحالي', dahriOffset: calibrated, source: 'calibrated' });
    }

    return new DahriWidgetTimesProvider({
      name: JERUSALEM_DEFAULT.name,
      dahriOffset: getDahriCityOffset(JERUSALEM_DEFAULT.lat, JERUSALEM_DEFAULT.lon),
      source: 'default',
    });
  }

  /** صف الجدول الخام (بدون إزاحات) لتاريخ معيّن — نفس منطق الشاشة. */
  static baseRow(date: Date): string[] {
    const monthArray = DAHRI_TIMES[date.getMonth()] || DAHRI_TIMES[0];
    return monthArray[Math.min(date.getDate() - 1, monthArray.length - 1)] || FALLBACK_ROW;
  }

  /**
   * بيحفظ مواقيت التطبيق مع تاريخ حسابها — حتى الاستنتاج تحت يفحص يوم
   * واحد بالضبط بدل ما يخمّن اليوم. بينادى من الكونترولر لحظة ما التطبيق
   * يحسب مواقيت جديدة (يعني هي مواقيت اليوم أكيد).
   */
  static async rememberAppTimings(timings: PrayerTimings, date: Date = new Date()): Promise<void> {
    const snapshot: DatedTimings = { date: date.toISOString(), timings };
    try {
      await AsyncStorage.setItem(DATED_TIMINGS_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {}
  }

  private static async resolveCalibratedOffset(lastKnownTimings?: PrayerTimings | null): Promise<number | null> {
    // مواقيت جاية من التطبيق هلأ = مواقيت اليوم
    if (lastKnownTimings) return DahriWidgetTimesProvider.calibrateOffset(lastKnownTimings, new Date(), 0);

    const dated = await DahriWidgetTimesProvider.readJson<DatedTimings>(DATED_TIMINGS_STORAGE_KEY);
    if (dated?.timings && dated.date) {
      return DahriWidgetTimesProvider.calibrateOffset(dated.timings, new Date(dated.date), 0);
    }

    // نسخ قديمة من التطبيق ما حفظت تاريخ — منبحث بالأيام الماضية
    const legacy = await DahriWidgetTimesProvider.readJson<PrayerTimings>(LAST_TIMINGS_STORAGE_KEY);
    return legacy ? DahriWidgetTimesProvider.calibrateOffset(legacy, new Date(), 60) : null;
  }

  /**
   * بيستنتج إزاحة المدينة من مواقيت محسوبة سابقاً: مندوّر (من `date` لورا
   * لحد `maxDaysBack` يوم) على أول صف بالجدول بيعطي نفس الفرق بالضبط
   * للصلوات الست كلها — لأنه التطبيق بيضيف نفس الإزاحة (المدينة + التوقيت
   * الصيفي) لكل الصلوات. منجرّب التوقيت الصيفي والشتوي الاثنين.
   * ⚠️ بدون تاريخ معروف (maxDaysBack > 0) في أيام نادرة صفّين متتاليين
   * بيختلفوا دقيقة وحدة بالضبط بكل الصلوات، فالنتيجة ممكن تغلط بدقيقة —
   * لهيك منفضّل دايماً النسخة المؤرّخة (rememberAppTimings).
   */
  static calibrateOffset(timings: PrayerTimings, date: Date, maxDaysBack: number): number | null {
    const stored = PRAYER_KEYS.map((k) => toMinutes(timings[k] || ''));
    if (stored.some((m) => !Number.isFinite(m))) return null;

    const day = new Date(date);
    for (let back = 0; back <= maxDaysBack; back++) {
      const base = DahriWidgetTimesProvider.baseRow(day).map((t, i) => toMinutes(addMinutesToTime(t, 0, i >= 3)));
      for (const dst of [0, 60]) {
        const diffs = stored.map((m, i) => m - base[i] - dst);
        if (diffs.every((d) => d === diffs[0]) && KNOWN_ROUNDED_OFFSETS.includes(diffs[0])) {
          return diffs[0];
        }
      }
      day.setDate(day.getDate() - 1);
    }
    return null;
  }

  /** مواقيت يوم معيّن بنظام ٢٤ ساعة — مطابقة حرفياً لـapplyDahriTimes. */
  getTimingsFor(date: Date): PrayerTimings {
    const row = DahriWidgetTimesProvider.baseRow(date);
    const totalOffset = Math.round(this.location.dahriOffset + getPalestineDstOffset(date));
    return {
      Fajr: addMinutesToTime(row[0], totalOffset, false),
      Sunrise: addMinutesToTime(row[1], totalOffset, false),
      Dhuhr: addMinutesToTime(row[2], totalOffset, false),
      Asr: addMinutesToTime(row[3], totalOffset, true),
      Maghrib: addMinutesToTime(row[4], totalOffset, true),
      Isha: addMinutesToTime(row[5], totalOffset, true),
    };
  }

  getTodayAndTomorrow(now: Date = new Date()): { today: PrayerTimings; tomorrow: PrayerTimings } {
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    return { today: this.getTimingsFor(now), tomorrow: this.getTimingsFor(tomorrowDate) };
  }

  private static async readJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      return null;
    }
  }
}
