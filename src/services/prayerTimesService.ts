// import {
//   Coordinates,
//   CalculationMethod,
//   PrayerTimes,
//   Madhab,
//   HighLatitudeRule,
// } from 'adhan';

// import tzLookup from '@photostructure/tz-lookup';

// import {
//   PALESTINE_CITIES,
//   DAHRI_TIMES,
//   getDahriCityOffset,
//   getPalestineDstOffset as getCuratedPalestineDstOffset,
// } from '../data/dahriTimesData';

// // ============================================================================
// // 1. TYPES
// // ============================================================================

// export type AsrMadhab = 'SHAFI' | 'HANAFI';

// export type CalculationMethodOption =
//   | 'AUTO'
//   | 'UMM_AL_QURA'
//   | 'EGYPTIAN'
//   | 'TURKEY'
//   | 'MWL'
//   | 'NORTH_AMERICA'
//   | 'DUBAI'
//   | 'KARACHI'
//   | 'SINGAPORE';

// export type PrayerTimesOutput = {
//   Fajr: string;
//   Sunrise: string;
//   Dhuhr: string;
//   Asr: string;
//   Maghrib: string;
//   Isha: string;
//   source: 'DAHRI_OFFICIAL' | 'GLOBAL_ASTRONOMICAL';
//   methodLabel: string;
//   cityName?: string;
//   timeZoneUsed: string;
//   isHighLatitudeEstimated?: boolean;
//   isApproximateMethod?: boolean;
// };

// // ============================================================================
// // 2. CONSTANTS
// // ============================================================================

// const PALESTINE_TIME_ZONE = 'Asia/Jerusalem';
// const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

// // ============================================================================
// // 3. VALIDATION HELPERS
// // ============================================================================

// const isFiniteCoordinate = (lat: number, lon: number): boolean => {
//   return (
//     Number.isFinite(lat) &&
//     Number.isFinite(lon) &&
//     lat >= -90 &&
//     lat <= 90 &&
//     lon >= -180 &&
//     lon <= 180
//   );
// };

// const isValidDate = (date: Date): boolean => {
//   return date instanceof Date && !Number.isNaN(date.getTime());
// };

// const isValidTimeString = (value: string): boolean => {
//   if (!value || !/^\d{2}:\d{2}$/.test(value)) return false;
//   const [hours, minutes] = value.split(':').map(Number);
//   return (
//     Number.isInteger(hours) &&
//     Number.isInteger(minutes) &&
//     hours >= 0 &&
//     hours <= 23 &&
//     minutes >= 0 &&
//     minutes <= 59
//   );
// };

// const timeToMinutes = (value: string): number => {
//   if (!isValidTimeString(value)) return NaN;
//   const [hours, minutes] = value.split(':').map(Number);
//   return hours * 60 + minutes;
// };

// // ============================================================================
// // 4. TARGET TIMEZONE
// // ============================================================================

// export const resolveTargetTimeZone = (
//   lat: number,
//   lon: number,
//   customTimeZone?: string
// ): string => {
//   if (customTimeZone && customTimeZone.trim()) {
//     return customTimeZone.trim();
//   }

//   if (!isFiniteCoordinate(lat, lon)) {
//     return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
//   }

//   try {
//     const zone = tzLookup(lat, lon);
//     if (zone && typeof zone === 'string') return zone;
//   } catch (error) {}

//   return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
// };

// // ============================================================================
// // 5. LOCAL DATE EXTRACTION
// // ============================================================================

// export const getTargetLocalDateParts = (
//   date: Date,
//   timeZone: string
// ): { year: number; month: number; day: number } => {
//   if (!isValidDate(date)) {
//     throw new Error('Invalid date supplied to prayer engine.');
//   }

//   try {
//     const formatter = new Intl.DateTimeFormat('en-GB', {
//       timeZone: timeZone || 'UTC',
//       year: 'numeric',
//       month: 'numeric',
//       day: 'numeric',
//     });
//     const parts = formatter.formatToParts(date);
//     const year = Number(parts.find((p) => p.type === 'year')?.value);
//     const month = Number(parts.find((p) => p.type === 'month')?.value);
//     const day = Number(parts.find((p) => p.type === 'day')?.value);

//     if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
//       throw new Error('Unable to extract target local date.');
//     }
//     return { year, month, day };
//   } catch (error) {
//     return {
//       year: date.getFullYear(),
//       month: date.getMonth() + 1,
//       day: date.getDate(),
//     };
//   }
// };

// const buildCalculationDate = (date: Date, timeZone: string): Date => {
//   const { year, month, day } = getTargetLocalDateParts(date, timeZone);
//   return new Date(year, month - 1, day, 12, 0, 0, 0);
// };

// // ============================================================================
// // 6. FORMAT TIME
// // ============================================================================

// export const formatTimeInTimeZone = (
//   date: Date | null | undefined,
//   timeZone: string
// ): string => {
//   if (!date || Number.isNaN(date.getTime())) return '--:--';
//   try {
//     const formatter = new Intl.DateTimeFormat('en-GB', {
//       timeZone: timeZone || 'UTC',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//     });
//     return formatter.format(date);
//   } catch (error) {
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     return `${hours}:${minutes}`;
//   }
// };

// // ============================================================================
// // 7. PALESTINE GEOGRAPHICAL POLYGON
// // ============================================================================

// const PALESTINE_APPROX_POLYGON: [number, number][] = [
//   [33.092, 35.105],
//   [33.105, 35.200],
//   [33.250, 35.400],
//   [33.285, 35.575],
//   [33.200, 35.650],
//   [32.850, 35.650],
//   [32.650, 35.580],
//   [32.380, 35.560],
//   [32.050, 35.530],
//   [31.750, 35.530],
//   [31.300, 35.400],
//   [30.750, 35.250],
//   [30.000, 35.100],
//   [29.490, 34.910],
//   [29.550, 34.880],
//   [30.000, 34.600],
//   [30.700, 34.400],
//   [31.220, 34.270],
//   [31.330, 34.200],
//   [31.600, 34.500],
//   [31.900, 34.700],
//   [32.500, 34.900],
//   [32.950, 35.070],
//   [33.092, 35.105],
// ];

// export const isCoordinateInsidePalestine = (lat: number, lon: number): boolean => {
//   if (!isFiniteCoordinate(lat, lon)) return false;

//   let inside = false;
//   const n = PALESTINE_APPROX_POLYGON.length;

//   for (let i = 0, j = n - 1; i < n; j = i++) {
//     const [latI, lonI] = PALESTINE_APPROX_POLYGON[i];
//     const [latJ, lonJ] = PALESTINE_APPROX_POLYGON[j];

//     const intersects =
//       lonI > lon !== lonJ > lon &&
//       lat < ((latJ - latI) * (lon - lonI)) / (lonJ - lonI) + latI;

//     if (intersects) inside = !inside;
//   }
//   return inside;
// };

// // ============================================================================
// // 8. TIME ARITHMETIC
// // ============================================================================

// const addMinutesToStandardTime = (timeStr: string, minutesToAdd: number): string => {
//   if (!isValidTimeString(timeStr)) return '--:--';

//   const [hours, minutes] = timeStr.split(':').map(Number);
//   const totalMinutes = (((hours * 60 + minutes + minutesToAdd) % 1440) + 1440) % 1440;
//   const finalHours = Math.floor(totalMinutes / 60);
//   const finalMinutes = totalMinutes % 60;

//   return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
// };

// // ============================================================================
// // 9. DAHRI TIME NORMALIZATION
// // ============================================================================

// const normalizeDahriTimesTo24Hour = (times: string[]): string[] => {
//   return times.map((time, index) => {
//     if (!time || !time.includes(':')) return '--:--';
//     const [hString, mString] = time.split(':');
//     let hours = Number(hString);
//     const minutes = Number(mString);

//     if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
//       return '--:--';
//     }

//     if (index >= 3 && hours < 12) hours += 12;

//     return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
//   });
// };

// // ============================================================================
// // 10. CALCULATION METHOD RESOLUTION
// // ============================================================================

// export const resolveGlobalMethodParams = (
//   methodOption: CalculationMethodOption,
//   lat: number,
//   lon: number
// ): { params: any; label: string; isApproximate: boolean } => {
//   switch (methodOption) {
//     case 'UMM_AL_QURA':
//       return { params: CalculationMethod.UmmAlQura(), label: 'تقويم أم القرى (مكة المكرمة)', isApproximate: false };
//     case 'EGYPTIAN':
//       return { params: CalculationMethod.Egyptian(), label: 'الهيئة المصرية العامة للمساحة', isApproximate: false };
//     case 'TURKEY':
//       return { params: CalculationMethod.Turkey(), label: 'رئاسة الشؤون الدينية التركية (Diyanet)', isApproximate: false };
//     case 'NORTH_AMERICA':
//       return { params: CalculationMethod.NorthAmerica(), label: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', isApproximate: false };
//     case 'DUBAI':
//       return { params: CalculationMethod.Dubai(), label: 'دائرة الشؤون الإسلامية بدبي', isApproximate: false };
//     case 'KARACHI':
//       return { params: CalculationMethod.Karachi(), label: 'جامعة العلوم الإسلامية بكراتشي', isApproximate: false };
//     case 'SINGAPORE':
//       return { params: CalculationMethod.Singapore(), label: 'مجلس أوغاما إسلام سنغافورا (MUIS)', isApproximate: false };
//     case 'MWL':
//       return { params: CalculationMethod.MuslimWorldLeague(), label: 'رابطة العالم الإسلامي', isApproximate: false };
//     case 'AUTO':
//     default: {
//       if (lat >= 22 && lat <= 26.5 && lon >= 51 && lon <= 57) {
//         return { params: CalculationMethod.Dubai(), label: 'توقيت دبي (اختيار تلقائي تقريبي)', isApproximate: true };
//       }
//       if (lat >= 12 && lat <= 32 && lon >= 36 && lon <= 60) {
//         return { params: CalculationMethod.UmmAlQura(), label: 'تقويم أم القرى (اختيار تلقائي تقريبي)', isApproximate: true };
//       }
//       if (lat >= 35.5 && lat <= 42.5 && lon >= 26 && lon <= 45) {
//         return { params: CalculationMethod.Turkey(), label: 'رئاسة الشؤون الدينية التركية (اختيار تلقائي تقريبي)', isApproximate: true };
//       }
//       if (lat >= 4 && lat <= 37 && lon >= -18 && lon <= 35) {
//         return { params: CalculationMethod.Egyptian(), label: 'الهيئة المصرية للمساحة (اختيار تلقائي تقريبي)', isApproximate: true };
//       }
//       if (lat >= 24 && lat <= 70 && lon >= -145 && lon <= -50) {
//         return { params: CalculationMethod.NorthAmerica(), label: 'أمريكا الشمالية ISNA (اختيار تلقائي تقريبي)', isApproximate: true };
//       }
//       if (lat >= 5 && lat <= 38 && lon >= 60 && lon <= 90) {
//         return { params: CalculationMethod.Karachi(), label: 'جامعة كراتشي (اختيار تلقائي تقريبي)', isApproximate: true };
//       }
//       if (lat >= -11 && lat <= 8 && lon >= 95 && lon <= 141) {
//         return { params: CalculationMethod.Singapore(), label: 'MUIS سنغافورة (اختيار تلقائي تقريبي)', isApproximate: true };
//       }
//       return { params: CalculationMethod.MuslimWorldLeague(), label: 'رابطة العالم الإسلامي (حساب فلكي افتراضي)', isApproximate: true };
//     }
//   }
// };

// // ============================================================================
// // 11. GLOBAL SANITY CHECK
// // ============================================================================

// const validatePrayerTimes = (times: {
//   Fajr: string;
//   Sunrise: string;
//   Dhuhr: string;
//   Asr: string;
//   Maghrib: string;
//   Isha: string;
// }): boolean => {
//   const values = PRAYER_KEYS.map((key) => times[key]);
//   if (values.some((value) => !isValidTimeString(value))) return false;

//   const minutes = values.map(timeToMinutes);
//   for (let i = 1; i < minutes.length; i++) {
//     if (!Number.isFinite(minutes[i]) || !Number.isFinite(minutes[i - 1]) || minutes[i] <= minutes[i - 1]) {
//       return false;
//     }
//   }
//   return true;
// };

// // ============================================================================
// // 12. GLOBAL ASTRONOMICAL ENGINE
// // ============================================================================

// const executeGlobalAstronomical = (
//   lat: number,
//   lon: number,
//   date: Date,
//   methodOption: CalculationMethodOption,
//   madhab: AsrMadhab,
//   timeZone: string
// ): PrayerTimesOutput => {
//   const { params, label, isApproximate } = resolveGlobalMethodParams(methodOption, lat, lon);
//   params.madhab = madhab === 'HANAFI' ? Madhab.Hanafi : Madhab.Shafi;

//   let isHighLatitudeEstimated = false;

//   if (Math.abs(lat) > 48) {
//     params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
//   }

//   let effectiveLatitude = lat;
//   if (Math.abs(lat) > 65) {
//     effectiveLatitude = lat > 0 ? 48 : -48;
//     isHighLatitudeEstimated = true;
//   }

//   const calculationDate = buildCalculationDate(date, timeZone);
//   const coordinates = new Coordinates(effectiveLatitude, lon);
//   let prayerTimes = new PrayerTimes(coordinates, calculationDate, params);

//   let output: PrayerTimesOutput = {
//     Fajr: formatTimeInTimeZone(prayerTimes.fajr, timeZone),
//     Sunrise: formatTimeInTimeZone(prayerTimes.sunrise, timeZone),
//     Dhuhr: formatTimeInTimeZone(prayerTimes.dhuhr, timeZone),
//     Asr: formatTimeInTimeZone(prayerTimes.asr, timeZone),
//     Maghrib: formatTimeInTimeZone(prayerTimes.maghrib, timeZone),
//     Isha: formatTimeInTimeZone(prayerTimes.isha, timeZone),
//     source: 'GLOBAL_ASTRONOMICAL',
//     methodLabel: label,
//     timeZoneUsed: timeZone,
//     isHighLatitudeEstimated,
//     isApproximateMethod: isApproximate,
//   };

//   if (!validatePrayerTimes(output)) {
//     try {
//       params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
//       const fallbackLatitude = lat >= 0 ? 45 : -45;
//       const fallbackCoordinates = new Coordinates(fallbackLatitude, lon);
//       prayerTimes = new PrayerTimes(fallbackCoordinates, calculationDate, params);

//       output = {
//         Fajr: formatTimeInTimeZone(prayerTimes.fajr, timeZone),
//         Sunrise: formatTimeInTimeZone(prayerTimes.sunrise, timeZone),
//         Dhuhr: formatTimeInTimeZone(prayerTimes.dhuhr, timeZone),
//         Asr: formatTimeInTimeZone(prayerTimes.asr, timeZone),
//         Maghrib: formatTimeInTimeZone(prayerTimes.maghrib, timeZone),
//         Isha: formatTimeInTimeZone(prayerTimes.isha, timeZone),
//         source: 'GLOBAL_ASTRONOMICAL',
//         methodLabel: `${label} — تقدير خطوط العرض العليا`,
//         timeZoneUsed: timeZone,
//         isHighLatitudeEstimated: true,
//         isApproximateMethod: true,
//       };
//     } catch (error) {
//       return {
//         Fajr: '--:--',
//         Sunrise: '--:--',
//         Dhuhr: '--:--',
//         Asr: '--:--',
//         Maghrib: '--:--',
//         Isha: '--:--',
//         source: 'GLOBAL_ASTRONOMICAL',
//         methodLabel: `${label} — تعذر الحساب`,
//         timeZoneUsed: timeZone,
//         isHighLatitudeEstimated: true,
//         isApproximateMethod: true,
//       };
//     }
//   }

//   return output;
// };

// // ============================================================================
// // 13. PALESTINE DST
// // ============================================================================

// const getJerusalemOffsetMinutesFallback = (date: Date): number => {
//   try {
//     const parts = new Intl.DateTimeFormat('en-US', {
//       timeZone: PALESTINE_TIME_ZONE,
//       timeZoneName: 'shortOffset',
//       hour: '2-digit',
//     }).formatToParts(date);

//     const offsetPart = parts.find((part) => part.type === 'timeZoneName')?.value;
//     if (!offsetPart) return 120;

//     const match = offsetPart.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?/);
//     if (!match) return 120;

//     const sign = match[1] === '-' ? -1 : 1;
//     const hours = Number(match[2]);
//     const minutes = Number(match[3] || 0);
//     return sign * (hours * 60 + minutes);
//   } catch (error) {
//     return 120;
//   }
// };

// const getPalestineDstOffsetFallback = (date: Date): number => {
//   const offset = getJerusalemOffsetMinutesFallback(date);
//   return offset >= 180 ? 60 : 0;
// };

// const resolvePalestineDstOffset = (date: Date): number => {
//   if (typeof getCuratedPalestineDstOffset === 'function') {
//     try {
//       const curated = getCuratedPalestineDstOffset(date);
//       if (Number.isFinite(curated)) return curated as number;
//     } catch (error) {}
//   }
//   return getPalestineDstOffsetFallback(date);
// };

// // ============================================================================
// // 14. PALESTINE DAHRI ENGINE
// // ============================================================================

// const emptyDahriResult = (cityName?: string): PrayerTimesOutput => ({
//   Fajr: '--:--',
//   Sunrise: '--:--',
//   Dhuhr: '--:--',
//   Asr: '--:--',
//   Maghrib: '--:--',
//   Isha: '--:--',
//   source: 'DAHRI_OFFICIAL',
//   methodLabel: 'التقويم الدهري الفلسطيني',
//   cityName: cityName || 'فلسطين',
//   timeZoneUsed: PALESTINE_TIME_ZONE,
// });

// const executePalestineDahri = (
//   lat: number,
//   lon: number,
//   date: Date,
//   selectedCityName?: string
// ): PrayerTimesOutput => {
//   const { month, day } = getTargetLocalDateParts(date, PALESTINE_TIME_ZONE);

//   if (month < 1 || month > 12 || day < 1 || day > 31) {
//     return emptyDahriResult(selectedCityName);
//   }

//   const monthArray = DAHRI_TIMES[month - 1];
//   if (!monthArray || !monthArray.length) {
//     return emptyDahriResult(selectedCityName);
//   }

//   const rawBase = monthArray[Math.min(day - 1, monthArray.length - 1)];
//   if (!rawBase || rawBase.length < 6) {
//     return emptyDahriResult(selectedCityName);
//   }

//   const normalized = normalizeDahriTimesTo24Hour(rawBase);
//   const dahriOffset = getDahriCityOffset(lat, lon);
//   const dstOffset = resolvePalestineDstOffset(date);
//   const totalOffset = Math.round(dahriOffset + dstOffset);

//   const result: PrayerTimesOutput = {
//     Fajr: addMinutesToStandardTime(normalized[0], totalOffset),
//     Sunrise: addMinutesToStandardTime(normalized[1], totalOffset),
//     Dhuhr: addMinutesToStandardTime(normalized[2], totalOffset),
//     Asr: addMinutesToStandardTime(normalized[3], totalOffset),
//     Maghrib: addMinutesToStandardTime(normalized[4], totalOffset),
//     Isha: addMinutesToStandardTime(normalized[5], totalOffset),
//     source: 'DAHRI_OFFICIAL',
//     methodLabel: 'التقويم الدهري الفلسطيني (أوقاف القدس الشريف)',
//     cityName: selectedCityName || 'فلسطين',
//     timeZoneUsed: PALESTINE_TIME_ZONE,
//     isApproximateMethod: false,
//   };

//   if (!validatePrayerTimes(result)) {
//     return { ...result, Fajr: '--:--', Sunrise: '--:--', Dhuhr: '--:--', Asr: '--:--', Maghrib: '--:--', Isha: '--:--' };
//   }

//   return result;
// };

// // ============================================================================
// // 15. REGISTERED PALESTINIAN CITY VALIDATION
// // ============================================================================

// type PalestineCityLike = {
//   name?: string;
//   lat?: number | null;
//   lon?: number | null;
// };

// const findRegisteredPalestineCity = (city: PalestineCityLike | null): PalestineCityLike | null => {
//   if (!city || !city.name || city.lat === null || city.lat === undefined || city.lon === null || city.lon === undefined) {
//     return null;
//   }

//   const registered = PALESTINE_CITIES.find(
//     (candidate: any) => candidate.name === city.name && candidate.lat !== null && candidate.lon !== null
//   );

//   return registered || null;
// };

// // ============================================================================
// // 16. UNIFIED PRODUCTION PIPELINE
// // ============================================================================

// export const calculateProductionPrayerTimes = (
//   lat: number,
//   lon: number,
//   date: Date = new Date(),
//   userSelectedCity: PalestineCityLike | null = null,
//   methodOption: CalculationMethodOption = 'AUTO',
//   madhab: AsrMadhab = 'SHAFI',
//   customTimeZone?: string
// ): PrayerTimesOutput => {
//   if (!isFiniteCoordinate(lat, lon) || !isValidDate(date)) {
//     return {
//       Fajr: '--:--',
//       Sunrise: '--:--',
//       Dhuhr: '--:--',
//       Asr: '--:--',
//       Maghrib: '--:--',
//       Isha: '--:--',
//       source: 'GLOBAL_ASTRONOMICAL',
//       methodLabel: 'إحداثيات أو تاريخ غير صالح',
//       timeZoneUsed: customTimeZone || 'UTC',
//       isApproximateMethod: true,
//     };
//   }

//   const registeredCity = findRegisteredPalestineCity(userSelectedCity);
//   if (registeredCity && registeredCity.lat != null && registeredCity.lon != null) {
//     return executePalestineDahri(registeredCity.lat, registeredCity.lon, date, registeredCity.name);
//   }

//   if (isCoordinateInsidePalestine(lat, lon)) {
//     return executePalestineDahri(lat, lon, date);
//   }

//   const targetTimeZone = resolveTargetTimeZone(lat, lon, customTimeZone);
//   return executeGlobalAstronomical(lat, lon, date, methodOption, madhab, targetTimeZone);
// };

// // ============================================================================
// // 17. BOUNDARY TESTS
// // ============================================================================

// export const runBoundarySanityChecks = (): { name: string; expected: boolean; actual: boolean; pass: boolean }[] => {
//   const cases = [
//     { name: 'القدس', lat: 31.7767, lon: 35.2345, expected: true },
//     { name: 'غزة', lat: 31.5017, lon: 34.4668, expected: true },
//     { name: 'الناقورة اللبنانية', lat: 33.10, lon: 35.11, expected: false },
//     { name: 'طابا المصرية', lat: 29.49, lon: 34.89, expected: false },
//     { name: 'إيلات', lat: 29.5577, lon: 34.9519, expected: true },
//     { name: 'عمّان الأردن', lat: 31.9539, lon: 35.9106, expected: false },
//   ];

//   return cases.map((item) => {
//     const actual = isCoordinateInsidePalestine(item.lat, item.lon);
//     return { name: item.name, expected: item.expected, actual, pass: actual === item.expected };
//   });
// };

// // ============================================================================
// // 18. TIMEZONE TESTS
// // ============================================================================

// export const runTimeZoneSanityChecks = (): { name: string; expected: string; actual: string; pass: boolean }[] => {
//   const cases = [
//     { name: 'نيويورك', lat: 40.7128, lon: -74.006, expected: 'America/New_York' },
//     { name: 'لندن', lat: 51.5074, lon: -0.1278, expected: 'Europe/London' },
//     { name: 'دبي', lat: 25.2048, lon: 55.2708, expected: 'Asia/Dubai' },
//     { name: 'القدس', lat: 31.7683, lon: 35.2137, expected: 'Asia/Jerusalem' },
//     { name: 'طوكيو', lat: 35.6762, lon: 139.6503, expected: 'Asia/Tokyo' },
//   ];

//   return cases.map((item) => {
//     const actual = resolveTargetTimeZone(item.lat, item.lon);
//     return { name: item.name, expected: item.expected, actual, pass: actual === item.expected };
//   });
// };

// // ============================================================================
// // 19. FULL ENGINE SELF TEST
// // ============================================================================

// export const runPrayerEngineSelfTest = () => {
//   const boundary = runBoundarySanityChecks();
//   const timeZones = runTimeZoneSanityChecks();

//   const sampleDates = [
//     new Date(),
//     new Date(2026, 0, 15),
//     new Date(2026, 5, 21),
//     new Date(2026, 8, 15),
//     new Date(2026, 11, 21),
//   ];

//   const globalSamples = sampleDates.map((date) => {
//     const result = calculateProductionPrayerTimes(40.7128, -74.006, date, null, 'NORTH_AMERICA', 'SHAFI');
//     return { date: date.toISOString(), result, valid: validatePrayerTimes(result) };
//   });

//   const palestineSamples = sampleDates.map((date) => {
//     const result = calculateProductionPrayerTimes(31.7683, 35.2137, date, null, 'AUTO', 'SHAFI');
//     return { date: date.toISOString(), result, valid: validatePrayerTimes(result) };
//   });

//   return {
//     boundary,
//     timeZones,
//     globalSamples,
//     palestineSamples,
//     allBoundaryPassed: boundary.every((item) => item.pass),
//     allTimeZonePassed: timeZones.every((item) => item.pass),
//     allGlobalSamplesValid: globalSamples.every((item) => item.valid),
//     allPalestineSamplesValid: palestineSamples.every((item) => item.valid),
//   };
// };