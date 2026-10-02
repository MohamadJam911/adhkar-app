import { CalculationMethod, Coordinates, HighLatitudeRule, Madhab, PrayerTimes } from 'adhan';
import type { CalculationParameters } from 'adhan';
import { DAHRI_TIMES, addMinutesToTime, findDahriOffset, getDahriClockShift } from '../data/dahriTimesData';
import type { PrayerTimings } from '../widgets/widgetStatus';

// ==========================================
// Prayer-times engine
// ==========================================
// Single source of truth for prayer times, used by the Prayer Times screen,
// both platforms' widgets and the notification scheduler:
//   • Inside Palestine and its immediate surroundings → the Dahri calendar
//     table, shifted per town and converted to the device clock.
//   • Everywhere else → astronomical calculation (adhan library) with the
//     method that is official / most common in the user's country.

/** A location to compute prayer times for. */
export type PrayerPlace = {
  lat: number;
  lon: number;
  /** ISO 3166-1 alpha-2 code from reverse geocoding, if known. */
  countryCode?: string | null;
  /** Explicit Dahri town offset (minutes) for cities picked from the list. */
  dahriOffset?: number | null;
};

type AstronomicalMethodKey =
  | 'MuslimWorldLeague'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'Karachi'
  | 'Dubai'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey'
  | 'NorthAmerica';

export type TimesMethod =
  | { kind: 'dahri'; offset: number }
  | { kind: 'astronomical'; method: AstronomicalMethodKey; hanafi: boolean };

const METHOD_LABELS: Record<AstronomicalMethodKey, string> = {
  MuslimWorldLeague: 'رابطة العالم الإسلامي',
  UmmAlQura: 'تقويم أم القرى',
  Egyptian: 'الهيئة المصرية العامة للمساحة',
  Karachi: 'جامعة العلوم الإسلامية بكراتشي',
  Dubai: 'دائرة الشؤون الإسلامية بدبي',
  Kuwait: 'وزارة الأوقاف الكويتية',
  Qatar: 'وزارة الأوقاف القطرية',
  Singapore: 'مجلس الشؤون الإسلامية بسنغافورة',
  Tehran: 'معهد الجيوفيزياء بطهران',
  Turkey: 'رئاسة الشؤون الدينية التركية',
  NorthAmerica: 'الجمعية الإسلامية لأمريكا الشمالية',
};

/** Country → calculation method. Anything not listed uses Muslim World League. */
const COUNTRY_METHODS: Record<string, AstronomicalMethodKey> = {
  SA: 'UmmAlQura', YE: 'UmmAlQura',
  AE: 'Dubai', OM: 'Dubai', BH: 'Dubai',
  KW: 'Kuwait',
  QA: 'Qatar',
  EG: 'Egyptian', SD: 'Egyptian', LY: 'Egyptian',
  PK: 'Karachi', IN: 'Karachi', BD: 'Karachi', AF: 'Karachi',
  SG: 'Singapore', MY: 'Singapore', BN: 'Singapore', ID: 'Singapore',
  IR: 'Tehran',
  TR: 'Turkey',
  US: 'NorthAmerica', CA: 'NorthAmerica',
};

/** Countries that follow the Hanafi school for the Asr time. */
const HANAFI_COUNTRIES = new Set(['PK', 'IN', 'BD', 'AF']);

const METHOD_FACTORIES: Record<AstronomicalMethodKey, () => CalculationParameters> = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  UmmAlQura: CalculationMethod.UmmAlQura,
  Egyptian: CalculationMethod.Egyptian,
  Karachi: CalculationMethod.Karachi,
  Dubai: CalculationMethod.Dubai,
  Kuwait: CalculationMethod.Kuwait,
  Qatar: CalculationMethod.Qatar,
  Singapore: CalculationMethod.Singapore,
  Tehran: CalculationMethod.Tehran,
  Turkey: CalculationMethod.Turkey,
  NorthAmerica: CalculationMethod.NorthAmerica,
};

/**
 * Picks how times are computed for a place. Locations outside the Dahri zone
 * always get astronomical times, even if an old saved city carries a stale
 * `dahriOffset` of 0 from earlier app versions.
 */
export const resolveTimesMethod = (place: PrayerPlace): TimesMethod => {
  const zoneOffset = findDahriOffset(place.lat, place.lon);
  if (zoneOffset !== null) {
    return { kind: 'dahri', offset: typeof place.dahriOffset === 'number' ? place.dahriOffset : zoneOffset };
  }
  const country = place.countryCode?.toUpperCase() ?? '';
  return {
    kind: 'astronomical',
    method: COUNTRY_METHODS[country] ?? 'MuslimWorldLeague',
    hanafi: HANAFI_COUNTRIES.has(country),
  };
};

const pad = (n: number) => String(n).padStart(2, '0');
const toClock = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const FALLBACK_DAHRI_ROW = ['05:00', '06:30', '11:45', '02:30', '05:00', '06:15'];

/** Raw Dahri table row for a date (Palestine standard time, 12-hour PM values). */
export const dahriRowFor = (date: Date): string[] => {
  const monthArray = DAHRI_TIMES[date.getMonth()] || DAHRI_TIMES[0];
  return monthArray[Math.min(date.getDate() - 1, monthArray.length - 1)] || FALLBACK_DAHRI_ROW;
};

/** Dahri times for a date, shifted by the town offset and converted to the device clock. */
export const computeDahriTimings = (offset: number, date: Date): PrayerTimings => {
  const row = dahriRowFor(date);
  const shift = Math.round(offset + getDahriClockShift(date));
  return {
    Fajr: addMinutesToTime(row[0], shift, false),
    Sunrise: addMinutesToTime(row[1], shift, false),
    Dhuhr: addMinutesToTime(row[2], shift, false),
    Asr: addMinutesToTime(row[3], shift, true),
    Maghrib: addMinutesToTime(row[4], shift, true),
    Isha: addMinutesToTime(row[5], shift, true),
  };
};

const computeAstronomicalTimings = (
  method: Extract<TimesMethod, { kind: 'astronomical' }>,
  place: PrayerPlace,
  date: Date
): PrayerTimings => {
  const coordinates = new Coordinates(place.lat, place.lon);
  const params = METHOD_FACTORIES[method.method]();
  params.madhab = method.hanafi ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);

  // adhan reads the calendar day from the date; noon avoids DST edge cases.
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const times = new PrayerTimes(coordinates, day, params);
  return {
    Fajr: toClock(times.fajr),
    Sunrise: toClock(times.sunrise),
    Dhuhr: toClock(times.dhuhr),
    Asr: toClock(times.asr),
    Maghrib: toClock(times.maghrib),
    Isha: toClock(times.isha),
  };
};

/** Prayer times (24-hour "HH:mm", device clock) for a place on a given day. */
export const computePrayerTimings = (place: PrayerPlace, date: Date = new Date()): PrayerTimings => {
  const method = resolveTimesMethod(place);
  return method.kind === 'dahri'
    ? computeDahriTimings(method.offset, date)
    : computeAstronomicalTimings(method, place, date);
};

/** Arabic labels describing where the times come from, for the UI and share cards. */
export const describeTimesMethod = (method: TimesMethod | null) => {
  if (!method || method.kind === 'dahri') {
    return {
      sourceLabel: 'التوقيت الدهري',
      cardTitle: 'مواقيت الصلاة وفق التقويم الدهري',
      imsakiyaTitle: 'إمساكية مواقيت الصلاة (التقويم الدهري)',
    };
  }
  const methodLabel = METHOD_LABELS[method.method] + (method.hanafi ? ' • العصر حنفي' : '');
  return {
    sourceLabel: `حساب فلكي • ${methodLabel}`,
    cardTitle: 'مواقيت الصلاة بالحساب الفلكي',
    imsakiyaTitle: 'إمساكية مواقيت الصلاة (حساب فلكي)',
  };
};
