import { getSafeHijriDate, toEasternArabicNumerals } from '../../utils/formatters';
import type { PalacePrayerIconKey as PrayerIconKey } from './masraPalaceTheme';
import type { PrayerTimings } from '../widgetStatus';

// ==========================================
// View model for the "Emerald Palace" widgets
// ==========================================
// All logic lives here (next prayer, highlighting, Hijri date, city name) so
// the widget components stay pure rendering.
//
// Minute-accurate countdown: the widget library renders the widget as a
// static image (nothing ticks inside it), so the native masra-widget-clock
// module redraws it at the start of every minute (see nextRefreshAt). The
// remaining minutes are therefore rounded up, like any countdown without
// seconds: "00:26" means between 25 and 26 minutes left.

export type PalacePrayerCell = {
  key: PrayerIconKey;
  label: string;
  time: string;
  isNext: boolean;
};

export type PalaceNextPrayer = {
  key: PrayerIconKey;
  label: string;
  /** Prayer time "HH:MM" */
  time: string;
  /** Time remaining (hours/minutes, rounded up to the minute) */
  remainingHours: string;
  remainingMinutes: string;
  isTomorrow: boolean;
};

/** Iqama window: from the adhan until the iqama (same minutes as widgetStatus.ts) */
export type PalaceIqama = {
  key: PrayerIconKey;
  label: string;
  /** Iqama time "HH:MM" */
  time: string;
  /** Minutes left until the iqama (rounded up) */
  remainingHours: string;
  remainingMinutes: string;
};

export type MasraPalaceViewModel = {
  cityLabel: string;
  hijriDate: string;
  prayers: PalacePrayerCell[];
  next: PalaceNextPrayer | null;
  /** Non-null only between adhan and iqama — the small widget shows it instead of the next prayer */
  iqama: PalaceIqama | null;
};

type BuildInput = {
  today: PrayerTimings;
  tomorrow: PrayerTimings;
  cityName: string;
  now?: Date;
};

export class MasraPalaceWidgetModel {
  // Semantic order (Fajr → Isha); the component reverses it when rendering so
  // Fajr ends up on the far right (the library does not mirror rows).
  static readonly PRAYERS: { key: PrayerIconKey; label: string }[] = [
    { key: 'Fajr', label: 'الفجر' },
    { key: 'Dhuhr', label: 'الظهر' },
    { key: 'Asr', label: 'العصر' },
    { key: 'Maghrib', label: 'المغرب' },
    { key: 'Isha', label: 'العشاء' },
  ];

  // Minutes between adhan and iqama — same values as widgetStatus.ts and prayerLogic.tsx
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

    // After Isha the next prayer is tomorrow's Fajr, and tomorrow's full row is
    // shown so the highlighted time matches the card.
    const isTomorrow = !upcoming;
    const nextDef = upcoming ?? MasraPalaceWidgetModel.PRAYERS[0];
    const rowSource = isTomorrow ? tomorrow : today;
    const nextTime = rowSource[nextDef.key] || '';
    const remaining = MasraPalaceWidgetModel.remainingParts(nextTime, isTomorrow, now);

    return {
      cityLabel: MasraPalaceWidgetModel.shortCityLabel(cityName),
      // Hijri date in Arabic-Indic digits (١٤٤٨), as in the design
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
   * Next redraw: the start of the next minute (+0.5 s so we never draw just
   * before the boundary and land in the same minute). Since every prayer time
   * is on a whole minute, this also switches to the next prayer within the
   * adhan's minute.
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

  // City names in PALESTINE_CITIES are too long for the widget ("القدس الشريف
  // (توقيت الأقصى)", "حيفا / الداخل الفلسطيني"), so the extra description is dropped.
  static shortCityLabel(name: string): string {
    return name.split(' (')[0].split(' / ')[0].trim();
  }

  private static toMinutes(time: string | undefined): number {
    if (!time) return NaN;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
