import { getSafeHijriDate, toEasternArabicNumerals } from '../../utils/formatters';
import type { PrayerIconKey } from '../widgetTheme';
import type { PrayerTimings } from '../widgetStatus';

// ==========================================
// 🧮 نموذج العرض (View Model) لويدجت "القصر الزمردي"
// ==========================================
// كل الحسابات هون (الصلاة القادمة، التمييز، التاريخ الهجري، اسم المدينة)
// حتى يضل مكوّن الويدجت نفسه (MasraPalaceWidget.tsx) رسم بحت بدون منطق.
//
// ⏱️ العدّاد التنازلي بدقة الدقيقة: مكتبة الويدجت بترسم الويدجت كصورة
// PNG ثابتة (ما في شي "بيتكّ" لحاله جوّاها)، فالموديول الأصلي
// masra-widget-clock بيعيد رسمها ببداية كل دقيقة (شوف nextRefreshAt).
// لهيك منعرض الدقائق المتبقية مقرّبة لفوق (ceil) — متل أي عدّاد بدون
// ثواني: "٠٠:٢٦" يعني باقي أقل من ٢٦ دقيقة وأكتر من ٢٥.

export type PalacePrayerCell = {
  key: PrayerIconKey;
  label: string;
  time: string;
  isNext: boolean;
};

export type PalaceNextPrayer = {
  key: PrayerIconKey;
  label: string;
  /** وقت الصلاة نفسه "HH:MM" */
  time: string;
  /** الوقت المتبقي (ساعات/دقائق، مقرّب لفوق للدقيقة) */
  remainingHours: string;
  remainingMinutes: string;
  isTomorrow: boolean;
};

/** نافذة الإقامة: من الأذان لحد الإقامة (نفس دقائق widgetStatus.ts) */
export type PalaceIqama = {
  key: PrayerIconKey;
  label: string;
  /** وقت الإقامة "HH:MM" */
  time: string;
  /** الدقائق المتبقية للإقامة (مقرّبة لفوق) */
  remainingHours: string;
  remainingMinutes: string;
};

export type MasraPalaceViewModel = {
  cityLabel: string;
  hijriDate: string;
  prayers: PalacePrayerCell[];
  next: PalaceNextPrayer | null;
  /** مش null بس بين الأذان والإقامة — الويدجت الصغير بيعرضها بدل "أقرب صلاة" */
  iqama: PalaceIqama | null;
};

type BuildInput = {
  today: PrayerTimings;
  tomorrow: PrayerTimings;
  cityName: string;
  now?: Date;
};

export class MasraPalaceWidgetModel {
  // ترتيب دلالي (فجر ← عشاء)؛ المكوّن بيعكسه وقت الرسم حتى الفجر يطلع
  // أقصى اليمين (المكتبة ما بتعمل mirror تلقائي للصفوف).
  static readonly PRAYERS: { key: PrayerIconKey; label: string }[] = [
    { key: 'Fajr', label: 'الفجر' },
    { key: 'Dhuhr', label: 'الظهر' },
    { key: 'Asr', label: 'العصر' },
    { key: 'Maghrib', label: 'المغرب' },
    { key: 'Isha', label: 'العشاء' },
  ];

  // دقائق ما بين الأذان والإقامة — نفس القيم بـwidgetStatus.ts وprayerLogic.tsx
  static readonly IQAMA_MINUTES: Record<PrayerIconKey, number> = {
    Fajr: 20,
    Dhuhr: 15,
    Asr: 15,
    Maghrib: 10,
    Isha: 15,
  };

  static build({ today, tomorrow, cityName, now = new Date() }: BuildInput): MasraPalaceViewModel {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const upcoming = MasraPalaceWidgetModel.PRAYERS.find((p) => {
      const mins = MasraPalaceWidgetModel.toMinutes(today[p.key]);
      return Number.isFinite(mins) && mins > nowMinutes;
    });

    // بعد العشاء: الصلاة القادمة فجر بكرا — ومنعرض صف بكرا كامل حتى الوقت
    // المميّز بالصف يطابق وقت البطاقة.
    const isTomorrow = !upcoming;
    const nextDef = upcoming ?? MasraPalaceWidgetModel.PRAYERS[0];
    const rowSource = isTomorrow ? tomorrow : today;
    const nextTime = rowSource[nextDef.key] || '';
    const remaining = MasraPalaceWidgetModel.remainingParts(nextTime, isTomorrow, now);

    return {
      cityLabel: MasraPalaceWidgetModel.shortCityLabel(cityName),
      // التصميم المرجعي بيعرض التاريخ الهجري بالأرقام العربية الهندية (١٤٤٨)
      hijriDate: toEasternArabicNumerals(getSafeHijriDate(now)),
      prayers: MasraPalaceWidgetModel.PRAYERS.map((p) => ({
        key: p.key,
        label: p.label,
        time: rowSource[p.key] || '--:--',
        isNext: p.key === nextDef.key,
      })),
      next: {
        key: nextDef.key,
        label: nextDef.label,
        time: nextTime || '--:--',
        remainingHours: remaining.hours,
        remainingMinutes: remaining.minutes,
        isTomorrow,
      },
      iqama: MasraPalaceWidgetModel.currentIqama(today, now),
    };
  }

  private static currentIqama(today: PrayerTimings, now: Date): PalaceIqama | null {
    const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    for (const p of MasraPalaceWidgetModel.PRAYERS) {
      const adhan = MasraPalaceWidgetModel.toMinutes(today[p.key]);
      if (!Number.isFinite(adhan)) continue;
      const iqamaAt = adhan + MasraPalaceWidgetModel.IQAMA_MINUTES[p.key];
      if (nowMinutes >= adhan && nowMinutes < iqamaAt) {
        const time = `${String(Math.floor(iqamaAt / 60) % 24).padStart(2, '0')}:${String(iqamaAt % 60).padStart(2, '0')}`;
        const remaining = MasraPalaceWidgetModel.remainingParts(time, false, now);
        return {
          key: p.key,
          label: p.label,
          time,
          remainingHours: remaining.hours,
          remainingMinutes: remaining.minutes,
        };
      }
    }
    return null;
  }

  /**
   * وقت إعادة الرسم الجاية: بداية الدقيقة الجاية (+نص ثانية أمان حتى ما
   * نرسم قبل الحدّ بلحظة ونطلع بنفس الدقيقة). بما إنه كل وقت صلاة على
   * رأس دقيقة، هاد بيضمن كمان التبديل للصلاة الجاية بنفس دقيقة الأذان.
   */
  static nextRefreshAt(now: Date = new Date()): Date {
    const next = new Date(now);
    next.setSeconds(0, 500);
    next.setMinutes(next.getMinutes() + 1);
    return next;
  }

  private static remainingParts(time: string, isTomorrow: boolean, now: Date): { hours: string; minutes: string } {
    const [h, m] = time.split(':').map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return { hours: '--', minutes: '--' };

    const target = new Date(now);
    if (isTomorrow) target.setDate(target.getDate() + 1);
    target.setHours(h, m, 0, 0);

    const totalMinutes = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 60000));
    return {
      hours: String(Math.floor(totalMinutes / 60)).padStart(2, '0'),
      minutes: String(totalMinutes % 60).padStart(2, '0'),
    };
  }

  static empty(): MasraPalaceViewModel {
    return {
      cityLabel: '',
      hijriDate: '',
      prayers: MasraPalaceWidgetModel.PRAYERS.map((p) => ({ ...p, time: '--:--', isNext: false })),
      next: null,
      iqama: null,
    };
  }

  // أسماء المدن بجدول PALESTINE_CITIES طويلة للويدجت ("القدس الشريف (توقيت
  // الأقصى)"، "حيفا / الداخل الفلسطيني") — منشيل الوصف الإضافي.
  static shortCityLabel(name: string): string {
    return name.split(' (')[0].split(' / ')[0].trim();
  }

  private static toMinutes(time: string | undefined): number {
    if (!time) return NaN;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
