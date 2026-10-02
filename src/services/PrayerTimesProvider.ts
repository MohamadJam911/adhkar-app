import AsyncStorage from '@react-native-async-storage/async-storage';
import { addMinutesToTime } from '../data/dahriTimesData';
import {
  computeDahriTimings,
  computePrayerTimings,
  dahriRowFor,
  type PrayerPlace,
} from '../utils/prayerTimesEngine';
import type { PrayerTimings } from '../widgets/widgetStatus';

// ==========================================
// Prayer-times provider for background work
// ==========================================
// Widgets (Android and iOS) and the notification scheduler run while the
// Prayer Times screen is closed, so they cannot read the times it shows.
// This class resolves the user's location from storage and computes the
// times for any day with the same engine as the screen, so they stay
// correct for days without the app being opened.

export const SELECTED_CITY_STORAGE_KEY = '@user_selected_city';
/** Last GPS fix (with country), written every time the app resolves the user's position. */
export const LAST_GPS_LOCATION_STORAGE_KEY = '@last_gps_location';
const LEGACY_TIMINGS_STORAGE_KEY = '@widget_prayer_timings';
const DATED_TIMINGS_STORAGE_KEY = '@masra_palace_widget_dated_timings';

type DatedTimings = { date: string; timings: PrayerTimings };

/** Same default as the Prayer Times screen when no location is available. */
const JERUSALEM_DEFAULT = { name: 'القدس الشريف', lat: 31.7683, lon: 35.2137 };

/** Town offsets that exist in the Dahri city table (after rounding). */
const KNOWN_ROUNDED_OFFSETS = [-1, 0, 1, 2, 3, 4];
const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export type ProviderLocationSource = 'saved-city' | 'last-gps' | 'calibrated' | 'default';

export type ProviderLocation = {
  name: string;
  source: ProviderLocationSource;
  /** Known coordinates; `null` only for the legacy calibrated case. */
  place: PrayerPlace | null;
  /** Dahri offset inferred from old stored times (legacy installs without coordinates). */
  calibratedOffset?: number;
};

type StoredPlace = {
  name?: string;
  lat?: number | null;
  lon?: number | null;
  dahriOffset?: number;
  countryCode?: string | null;
};

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
};

const hasCoords = (p: StoredPlace | null): p is StoredPlace & { lat: number; lon: number } =>
  !!p && typeof p.lat === 'number' && typeof p.lon === 'number';

export class PrayerTimesProvider {
  readonly location: ProviderLocation;

  constructor(location: ProviderLocation) {
    this.location = location;
  }

  /**
   * Resolves the location with the same priority as the app:
   *  1. the city the user picked (or saved GPS position),
   *  2. the last automatic GPS fix,
   *  3. legacy installs: a Dahri offset inferred from the last stored times,
   *  4. Jerusalem.
   */
  static async load(lastKnownTimings?: PrayerTimings | null): Promise<PrayerTimesProvider> {
    const saved = await PrayerTimesProvider.readJson<StoredPlace>(SELECTED_CITY_STORAGE_KEY);
    if (hasCoords(saved)) {
      return new PrayerTimesProvider({
        name: saved.name || JERUSALEM_DEFAULT.name,
        source: 'saved-city',
        place: { lat: saved.lat, lon: saved.lon, dahriOffset: saved.dahriOffset, countryCode: saved.countryCode },
      });
    }

    const gps = await PrayerTimesProvider.readJson<StoredPlace>(LAST_GPS_LOCATION_STORAGE_KEY);
    if (hasCoords(gps)) {
      return new PrayerTimesProvider({
        name: gps.name || 'موقعك الحالي',
        source: 'last-gps',
        place: { lat: gps.lat, lon: gps.lon, countryCode: gps.countryCode },
      });
    }

    const calibrated = await PrayerTimesProvider.resolveCalibratedOffset(lastKnownTimings);
    if (calibrated !== null) {
      return new PrayerTimesProvider({ name: 'موقعك الحالي', source: 'calibrated', place: null, calibratedOffset: calibrated });
    }

    return new PrayerTimesProvider({
      name: JERUSALEM_DEFAULT.name,
      source: 'default',
      place: { lat: JERUSALEM_DEFAULT.lat, lon: JERUSALEM_DEFAULT.lon },
    });
  }

  /** Stores a GPS fix so background work can use it while the app is closed. */
  static async rememberGpsLocation(place: PrayerPlace, name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_GPS_LOCATION_STORAGE_KEY, JSON.stringify({ ...place, name }));
    } catch (e) {}
  }

  /** Stores the times the app just computed, dated, for legacy offset calibration. */
  static async rememberAppTimings(timings: PrayerTimings, date: Date = new Date()): Promise<void> {
    const snapshot: DatedTimings = { date: date.toISOString(), timings };
    try {
      await AsyncStorage.setItem(DATED_TIMINGS_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {}
  }

  private static async resolveCalibratedOffset(lastKnownTimings?: PrayerTimings | null): Promise<number | null> {
    // Times handed over by the app right now are today's times.
    if (lastKnownTimings) return PrayerTimesProvider.calibrateOffset(lastKnownTimings, new Date(), 0);

    const dated = await PrayerTimesProvider.readJson<DatedTimings>(DATED_TIMINGS_STORAGE_KEY);
    if (dated?.timings && dated.date) {
      return PrayerTimesProvider.calibrateOffset(dated.timings, new Date(dated.date), 0);
    }

    // Very old versions stored times without a date: search the previous days.
    const legacy = await PrayerTimesProvider.readJson<PrayerTimings>(LEGACY_TIMINGS_STORAGE_KEY);
    return legacy ? PrayerTimesProvider.calibrateOffset(legacy, new Date(), 60) : null;
  }

  /**
   * Infers a Dahri town offset from previously computed times: walks back from
   * `date` (up to `maxDaysBack` days) to the first table row where all six
   * times differ by the same amount, trying both winter and summer time.
   * Without a known date two consecutive rows can rarely both match, so the
   * dated snapshot from `rememberAppTimings` is always preferred.
   */
  static calibrateOffset(timings: PrayerTimings, date: Date, maxDaysBack: number): number | null {
    const stored = PRAYER_KEYS.map((k) => toMinutes(timings[k] || ''));
    if (stored.some((m) => !Number.isFinite(m))) return null;

    const day = new Date(date);
    for (let back = 0; back <= maxDaysBack; back++) {
      const base = dahriRowFor(day).map((t, i) => toMinutes(addMinutesToTime(t, 0, i >= 3)));
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

  /** Prayer times for a given day (24-hour, device clock). */
  getTimingsFor(date: Date): PrayerTimings {
    if (this.location.place) return computePrayerTimings(this.location.place, date);
    return computeDahriTimings(this.location.calibratedOffset ?? 0, date);
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
