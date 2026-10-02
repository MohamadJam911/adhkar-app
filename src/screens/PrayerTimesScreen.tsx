import React, { useState, useEffect, useRef, useContext } from 'react';
import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Modal, FlatList, Alert, AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Magnetometer, Accelerometer, Gyroscope } from 'expo-sensors';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import { ThemeContext } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { HeritageIcons } from '../components/HeritageIcons';
import { ExactImagePatternWall, HeritageArchBanner, GoldenDivider, ThemedCheckbox, useBackgroundScroll } from '../components/Decorative';
import { PrayerSharePage, MonthlyImsakiyaSharePage } from '../components/SharePages';
import { formatArabicNumbers, getArabicLocationLabel, getSafeHijriDate } from '../utils/formatters';
import { getCountdownText, getDuhaTimes, getPrayerStatus, calculateLastThirdOfNight, updateAndroidWidget, QIBLA_ALIGNED_COLOR, QIBLA_ALIGNED_TINT_18, QIBLA_ALIGNED_TINT_12, QIBLA_ALIGNED_TINT_60 } from '../utils/prayerLogic';
import { logStat } from '../utils/statsLogger';
import { PALESTINE_CITIES } from '../data/dahriTimesData';
import { scheduleAppNotifications } from '../services/notificationService';
import { PrayerTimesProvider, SELECTED_CITY_STORAGE_KEY } from '../services/PrayerTimesProvider';
import {
  computePrayerTimings,
  describeTimesMethod,
  resolveTimesMethod,
  type PrayerPlace,
  type TimesMethod,
} from '../utils/prayerTimesEngine';

/** Used when the location is unavailable and nothing is saved. */
const JERUSALEM: PrayerPlace = { lat: 31.7683, lon: 35.2137 };

/** Whether the first "strong" (Arabic or Latin) letter is Arabic — the Unicode paragraph-direction rule. */
const startsWithArabic = (text: string): boolean => {
  const match = text.match(/[؀-ۿݐ-ݿࢠ-ࣿA-Za-zÀ-ɏ]/);
  return !!match && /[؀-ۿݐ-ݿࢠ-ࣿ]/.test(match[0]);
};

function PrayerTimesScreen({ fontSize, hapticEnabled }: { fontSize: number, hapticEnabled: boolean }) {
  const { isDarkMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;
  const [timings, setTimings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [locationName, setLocationName] = useState<string>('جاري تحديد موقعك…');
  const [isAligned, setIsAligned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [timesMethod, setTimesMethod] = useState<TimesMethod | null>(null);
  const methodLabels = describeTimesMethod(timesMethod);

  const [imsakiyaModalVisible, setImsakiyaModalVisible] = useState(false);
  const [monthlyTimesList, setMonthlyTimesList] = useState<any[]>([]);
  const imsakiyaCardRef = useRef<View>(null);
  const prayerCardRef = useRef<View>(null);

  const [, setTick] = useState(0);
  const [completedPrayers, setCompletedPrayers] = useState<{ [key: string]: boolean }>({});

  const todayDateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(`@prayer_tracker_${todayDateStr}`);
        if (saved) setCompletedPrayers(JSON.parse(saved));
      } catch (e) {}
    })();
  }, [todayDateStr]);

  const togglePrayerCheck = async (prayerKey: string) => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const willBeCompleted = !completedPrayers[prayerKey];
    const updated = { ...completedPrayers, [prayerKey]: willBeCompleted };
    setCompletedPrayers(updated);
    await AsyncStorage.setItem(`@prayer_tracker_${todayDateStr}`, JSON.stringify(updated));
    await logStat('prayer', willBeCompleted ? 1 : -1);
  };

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    initializeLiveLocation();
  }, []);

  // ==========================================
  // Compass runs only while the Qibla screen is visible
  // ==========================================
  // Tabs keep screens mounted in the background, so the sensors (and the
  // alignment haptics) used to keep running on every tab, and even in the
  // background on Android. They now run only while the screen is focused and
  // the app is active, and stop immediately otherwise.
  const isFocused = useIsFocused();
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => sub.remove();
  }, []);
  const compassActive = isFocused && appActive;

  useEffect(() => {
    if (!compassActive) return;
    let cancelled = false;

    // ==========================================
    // Complementary filter for a stable Qibla heading
    // ==========================================
    // The magnetometer is very sensitive to nearby interference (laptops,
    // speakers, cables, metal, wireless chargers), which moves its reading
    // even when the phone is perfectly still — no software can remove that.
    //
    // The gyroscope measures the actual rotation rate and is unaffected by
    // magnetic noise. So short-term movement comes almost entirely from the
    // gyroscope (if it reports no rotation, the needle does not move), while
    // the magnetic heading slowly corrects the result over a few seconds so
    // the gyroscope's own drift never accumulates. This is the same principle
    // used by aircraft heading indicators and dedicated Qibla apps.
    //
    // Note: the sign of the gyroscope z-axis can differ between Android
    // devices. If the needle turns the wrong way, change
    // "fusedRef.current = wrap360(fusedRef.current - deltaDeg)" below to "+ deltaDeg".
    const fusedRef = { current: null as number | null };
    let lastGyroTime = Date.now();

    const wrap360 = (deg: number) => ((deg % 360) + 360) % 360;
    const shortestDelta = (from: number, to: number) => {
      let d = (to - from) % 360;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      return d;
    };

    // Slow correction (6% of the difference per magnetic reading) towards the
    // absolute heading: removes instant noise but stays on the true heading.
    const applyAbsoluteCorrection = (rawHeading: number) => {
      if (fusedRef.current === null) {
        fusedRef.current = rawHeading;
      } else {
        const delta = shortestDelta(fusedRef.current, rawHeading);
        fusedRef.current = wrap360(fusedRef.current + delta * 0.06);
      }
      setDeviceHeading(Math.round(fusedRef.current));
    };

    const applyGyroRotation = (gyroZ: number) => {
      if (fusedRef.current === null) return;
      const now = Date.now();
      const dt = (now - lastGyroTime) / 1000;
      lastGyroTime = now;
      if (dt <= 0 || dt > 0.5) return;  // ignore abnormal gaps (e.g. after returning from the background)

      const deltaDeg = gyroZ * (180 / Math.PI) * dt;
      fusedRef.current = wrap360(fusedRef.current - deltaDeg);
      setDeviceHeading(Math.round(fusedRef.current));
    };

    let headingSubscription: any;
    let magSubscription: any;
    let accelSubscription: any;
    let gyroSubscription: any;
    let latestAccel = { x: 0, y: 0, z: 1 };

    (async () => {
      // The gyroscope is always on, on both platforms — it keeps the needle
      // still when the phone is still, whatever the magnetometer says.
      try {
        Gyroscope.setUpdateInterval(60);
        gyroSubscription = Gyroscope.addListener(data => {
          applyGyroRotation(data.z);
        });
      } catch (e) {}

      try {
        headingSubscription = await Location.watchHeadingAsync(heading => {
          if (heading && heading.trueHeading >= 0) {
            applyAbsoluteCorrection(heading.trueHeading);
          } else if (heading && heading.magHeading >= 0) {
            applyAbsoluteCorrection(heading.magHeading);
          }
        });
        if (cancelled) headingSubscription?.remove?.();
      } catch (e) {
        if (cancelled) return;
        // Fallback (mostly on Android when watchHeadingAsync is unavailable):
        // heading from magnetometer + accelerometer together (tilt
        // compensation). Without it, the natural tilt of a hand-held phone
        // could skew the heading by more than 45°.
        Accelerometer.setUpdateInterval(100);
        accelSubscription = Accelerometer.addListener(data => {
          latestAccel = data;
        });

        Magnetometer.setUpdateInterval(150);
        magSubscription = Magnetometer.addListener(mag => {
          const { x: ax, y: ay, z: az } = latestAccel;
          const { x: mx, y: my, z: mz } = mag;

          const normAccel = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
          const nax = Math.max(-1, Math.min(1, ax / normAccel));
          const nay = ay / normAccel;

          const pitch = Math.asin(-nax);
          const cosPitch = Math.cos(pitch) || 0.0001;
          const roll = Math.asin(Math.max(-1, Math.min(1, nay / cosPitch)));

          const xh = mx * Math.cos(pitch) + mz * Math.sin(pitch);
          const yh =
            mx * Math.sin(roll) * Math.sin(pitch) +
            my * Math.cos(roll) -
            mz * Math.sin(roll) * Math.cos(pitch);

          let angle = Math.atan2(yh, xh) * (180 / Math.PI);
          angle = wrap360(angle);
          applyAbsoluteCorrection(angle);
        });
      }
    })();

    return () => {
      cancelled = true;
      if (headingSubscription && typeof headingSubscription.remove === 'function') {
        headingSubscription.remove();
      }
      if (magSubscription) magSubscription.remove();
      if (accelSubscription) accelSubscription.remove();
      if (gyroSubscription) gyroSubscription.remove();
    };
  }, [compassActive]);

  const initializeLiveLocation = async () => {
    try {
      const savedCity = await AsyncStorage.getItem(SELECTED_CITY_STORAGE_KEY);
      if (savedCity) {
        const cityObj = JSON.parse(savedCity);
        if (cityObj.lat === null) {
          await fetchLiveGPSAndTimes(true);
        } else {
          setLocationName(cityObj.name);
          applyPrayerTimes(cityObj);
        }
        return;
      }
      await fetchLiveGPSAndTimes(false);
    } catch (e) {
      await fetchLiveGPSAndTimes(false);
    }
  };

  /** Falls back to the saved city, then Jerusalem, when GPS is unavailable. */
  const applyFallbackLocation = async (message: string) => {
    try {
      const savedCity = await AsyncStorage.getItem(SELECTED_CITY_STORAGE_KEY);
      const cityObj = savedCity ? JSON.parse(savedCity) : null;
      if (cityObj && cityObj.lat !== null) {
        setLocationName(cityObj.name + ' (الموقع المحفوظ)');
        applyPrayerTimes(cityObj);
        return;
      }
    } catch (e) {}
    setLocationName(message);
    applyPrayerTimes(JERUSALEM);
  };

  const fetchLiveGPSAndTimes = async (isManualGPS: boolean) => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        await applyFallbackLocation('تعذّر الوصول إلى موقعك • سيتم استخدام القدس افتراضيًا');
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      let cityName = 'موقعك الحالي';
      let countryCode: string | null = null;
      try {
        const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          cityName = getArabicLocationLabel(reverse[0]);
          countryCode = reverse[0].isoCountryCode ?? null;
        }
      } catch (netError) {}

      const place: PrayerPlace = { lat: latitude, lon: longitude, countryCode };
      // Saved before computing, so widgets and notifications use the same place.
      await PrayerTimesProvider.rememberGpsLocation(place, cityName);
      if (isManualGPS) {
        await AsyncStorage.setItem(SELECTED_CITY_STORAGE_KEY, JSON.stringify({ name: cityName, ...place }));
      }

      setLocationName(cityName);
      applyPrayerTimes(place);
    } catch (e) {
      await applyFallbackLocation('تعذّر تحديد موقعك • القدس هي الموقع الافتراضي');
    } finally {
      setLoading(false);
    }
  };

  const selectCity = async (city: typeof PALESTINE_CITIES[0]) => {
    setModalVisible(false);
    if (city.lat === null) {
      await fetchLiveGPSAndTimes(true);
    } else {
      setLocationName(city.name);
      setLoading(true);
      await AsyncStorage.setItem(SELECTED_CITY_STORAGE_KEY, JSON.stringify(city));
      applyPrayerTimes({ lat: city.lat, lon: city.lon!, dahriOffset: city.dahriOffset });
    }
  };

  /** Computes today's and this month's times for a place and refreshes everything that depends on them. */
  const applyPrayerTimes = (place: PrayerPlace) => {
    try {
      setLoading(true);
      const today = new Date();
      setTimesMethod(resolveTimesMethod(place));
      calculateQibla(place.lat, place.lon);

      const newTimings = computePrayerTimings(place, today);
      setTimings(newTimings);
      scheduleAppNotifications(newTimings);
      updateAndroidWidget(getPrayerStatus(newTimings), newTimings);

      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const monthList = Array.from({ length: daysInMonth }, (_, index) => {
        const dayNumber = index + 1;
        const day = new Date(today.getFullYear(), today.getMonth(), dayNumber, 12);
        return { dayNumber, dayLabel: `اليوم ${dayNumber}`, ...computePrayerTimings(place, day) };
      });
      setMonthlyTimesList(monthList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sharePrayerTimesImage = async () => {
    let uri: string | null = null;
    try {
      if (!prayerCardRef.current) return;
      await new Promise(resolve => setTimeout(resolve, 300));
      await new Promise(requestAnimationFrame);

      uri = await captureRef(prayerCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { dialogTitle: 'مشاركة مواقيت الصلاة اليوم', mimeType: 'image/png', UTI: 'public.png' });
    } catch (error) {
      Alert.alert('خطأ', 'تعذر تجهيز صورة المواقيت للمشاركة.');
    } finally {
      if (uri) {
        try { releaseCapture(uri); } catch (e) {}
      }
    }
  };

  const shareMonthlyImsakiyaImage = async () => {
    let uri: string | null = null;
    try {
      if (!imsakiyaCardRef.current) return;
      await new Promise(resolve => setTimeout(resolve, 300));
      await new Promise(requestAnimationFrame);

      uri = await captureRef(imsakiyaCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { dialogTitle: 'مشاركة إمساكية الشهر بالكامل', mimeType: 'image/png', UTI: 'public.png' });
    } catch (error) {
      Alert.alert('خطأ', 'تعذر تصدير صورة الإمساكية.');
    } finally {
      if (uri) {
        try { releaseCapture(uri); } catch (e) {}
      }
    }
  };

  const calculateQibla = (lat: number, lon: number) => {
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const phi1 = (lat * Math.PI) / 180;
    const phi2 = (kaabaLat * Math.PI) / 180;
    const deltaLambda = ((kaabaLon - lon) * Math.PI) / 180;

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    let qibla = (Math.atan2(y, x) * 180) / Math.PI;
    qibla = (qibla + 360) % 360;
    setQiblaDirection(Math.round(qibla));
  };

  const needleRotation = qiblaDirection !== null ? (qiblaDirection - deviceHeading + 360) % 360 : 0;
  
  const signedDiff = ((needleRotation + 180) % 360) - 180;
  const absDiff = Math.abs(signedDiff);

  useEffect(() => {
    if (!compassActive) return;
    if (qiblaDirection !== null) {
      const isNowAligned = absDiff <= 4;
      if (isNowAligned && !isAligned) {
        setIsAligned(true);
        if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (!isNowAligned && isAligned) {
        setIsAligned(false);
      } else if (absDiff <= 12 && hapticEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [needleRotation, absDiff, compassActive]);

  const getSeniorGuidance = () => {
    if (isAligned) {
      return { text: 'تم تحديد اتجاه القبلة ✓', color: QIBLA_ALIGNED_COLOR, arrow: '' };
    }
    if (signedDiff > 4) {
      return { text: 'أدر هاتفك لليمين', color: '#D4A373', arrow: '↻ ' };
    }
    if (signedDiff < -4) {
      return { text: 'أدر هاتفك لليسار', color: '#D4A373', arrow: '↺ ' };
    }
      return { text: 'تم تحديد اتجاه القبلة ✓', color: QIBLA_ALIGNED_COLOR, arrow: '' };
  };

  const guidance = getSeniorGuidance();

  const now = new Date();
  const gregorianDateStr = formatArabicNumbers(now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  const monthNameStr = formatArabicNumbers(now.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }));
  const hijriDateStr = formatArabicNumbers(getSafeHijriDate(now));
  const duhaTimes = timings ? getDuhaTimes(timings.Sunrise, timings.Dhuhr) : { start: '--:--', end: '--:--', rawStart: 0, rawEnd: 0 };
  const nightInfo = timings ? calculateLastThirdOfNight(timings.Maghrib, timings.Fajr) : { start: '--:--', remaining: '--' };
  const prayerStatus = timings ? getPrayerStatus(timings) : null;

  const isDuhaPeriod = () => {
    if (!timings) return false;
    const [fH, fM] = timings.Fajr.split(':').map(Number);
    const [dH, dM] = timings.Dhuhr.split(':').map(Number);
    const currentMins = now.getHours() * 60 + now.getMinutes();
    return currentMins >= (fH * 60 + fM) && currentMins < (dH * 60 + dM);
  };

  const showDuha = isDuhaPeriod();

  // Parallax: moves the background pattern with scrolling (background option 'girih')
  const bgScroll = useBackgroundScroll();

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <View style={{ position: 'absolute', left: -9999, top: 0, width: 1080, opacity: 0 }} pointerEvents="none" collapsable={false}>
        <View ref={prayerCardRef} collapsable={false}>
          <PrayerSharePage 
            timings={timings}
            locationName={locationName}
            gregorianDate={gregorianDateStr}
            hijriDate={hijriDateStr}
            duhaTimes={duhaTimes}
            nightInfo={nightInfo}
            title={methodLabels.cardTitle}
          />
        </View>
      </View>

      <View style={{ position: 'absolute', left: -9999, top: 0, width: 1080, opacity: 0 }} pointerEvents="none" collapsable={false}>
        <View ref={imsakiyaCardRef} collapsable={false}>
          <MonthlyImsakiyaSharePage 
            daysList={monthlyTimesList}
            locationName={locationName}
            monthTitle={monthNameStr}
            title={methodLabels.imsakiyaTitle}
          />
        </View>
      </View>

      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }} onScroll={bgScroll} scrollEventThrottle={16}>
        <HeritageArchBanner title="مواقيت الصلاة والقبلة" textColor={themeColors.text.color} isDarkMode={isDarkMode} />

        <View style={[styles.locationCard, themeColors.card, { padding: 16 }]}>
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.locationTitle, themeColors.subText, { fontSize: fontSize - 4, textAlign: 'right' }]}>موقعك الحالي • {methodLabels.sourceLabel}</Text>
            {/* City name: Arabic → right-aligned, untranslated English → left-aligned, based on its first strong letter */}
            <Text
              style={[
                styles.locationNameText,
                themeColors.text,
                {
                  fontSize: fontSize - 1,
                  fontWeight: 'bold',
                  textAlign: startsWithArabic(locationName) ? 'right' : 'left',
                  writingDirection: startsWithArabic(locationName) ? 'rtl' : 'ltr',
                },
              ]}
            >
              {locationName}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <TouchableOpacity style={[styles.changeCityBtn, { backgroundColor: '#C8A875' }]} onPress={() => setImsakiyaModalVisible(true)}>
              <Text style={styles.changeCityBtnText}>إمساكية الشهر</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.changeCityBtn} onPress={sharePrayerTimesImage}>
              <Text style={styles.changeCityBtnText}>مشاركة اليوم</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.changeCityBtn, { backgroundColor: '#8A5E33' }]} onPress={() => setModalVisible(true)}>
              <Text style={[styles.changeCityBtnText, { color: '#FFFFFF' }]}>تغيير البلد</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.prayerCard, themeColors.card]}>
          <Text style={[styles.prayerTitle, themeColors.accentText, { fontSize: fontSize, textAlign: 'center', marginBottom: 14 }]}>
            {methodLabels.cardTitle}
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#D4A373" style={{ marginVertical: 20 }} />
          ) : timings ? (
            <>
              {prayerStatus && (
                <View style={[styles.nextPrayerBanner, prayerStatus.isIqama && { borderColor: '#E5B279', backgroundColor: 'rgba(229,178,121,0.25)' }]}>
                  <Text style={[styles.nextPrayerTitleText, { fontSize: fontSize }]}>
                    {prayerStatus.title}
                  </Text>
                  <Text style={[styles.nextPrayerCountdownText, { fontSize: fontSize - 3 }]}>
                    {prayerStatus.countdown}
                  </Text>
                  {prayerStatus.silentNote && (
                    <Text style={styles.silentNoticeText}>{prayerStatus.silentNote}</Text>
                  )}
                </View>
              )}

              {/* Each prayer row toggles its "done" state; Sunrise is not a prayer, so it is shown as an info line without a checkbox. */}
              {[
                { key: 'fajr', name: 'الفجر', time: timings.Fajr, showCountdown: true },
                { key: 'sunrise', name: 'الشروق', time: timings.Sunrise, showCountdown: false },
                { key: 'dhuhr', name: 'الظهر', time: timings.Dhuhr, showCountdown: true },
                { key: 'asr', name: 'العصر', time: timings.Asr, showCountdown: true },
                { key: 'maghrib', name: 'المغرب', time: timings.Maghrib, showCountdown: true },
                { key: 'isha', name: 'العشاء', time: timings.Isha, showCountdown: true },
              ].map((item, idx, arr) => {
                const isLastRow = idx === arr.length - 1;

                if (item.key === 'sunrise') {
                  // Sunrise is informational only: no checkbox, dashed divider kept as is.
                  return (
                    <View key={item.key} style={styles.sunriseRow}>
                      <HeritageIcons.Sunrise size={14} color={themeColors.subText.color} />
                      <Text style={[styles.sunriseText, themeColors.subText, { fontSize: fontSize - 4 }]}>
                        {item.name} · {formatArabicNumbers(item.time)}
                      </Text>
                    </View>
                  );
                }

                const isDone = !!completedPrayers[item.key];
                return (
                  <React.Fragment key={item.key}>
                    <TouchableOpacity
                      style={[styles.prayerRow, isDone && { opacity: 0.5 }]}
                      activeOpacity={0.7}
                      onPress={() => togglePrayerCheck(item.key)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isDone }}
                      accessibilityLabel={`صلاة ${item.name}`}
                    >
                      <View>
                        <Text style={[styles.prayerName, themeColors.text, { fontSize: fontSize - 2 }]}>
                          {formatArabicNumbers(item.time)}
                        </Text>
                        {item.showCountdown && (
                          <Text style={[themeColors.subText, { fontSize: fontSize - 6 }]}>
                            {getCountdownText(item.time)}
                          </Text>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.prayerTime, themeColors.text, { fontSize: fontSize - 2, marginRight: 10 }]}>
                          {item.name}
                        </Text>
                        <ThemedCheckbox checked={isDone} accentColor={themeColors.accentText.color} />
                      </View>
                    </TouchableOpacity>
                    {!isLastRow && <GoldenDivider style={{ marginBottom: 2 }} />}
                  </React.Fragment>
                );
              })}

              <View style={[styles.sunnahContainer, themeColors.card]}>
                <Text style={[styles.sunnahHeaderTitle, themeColors.accentText]}>السنن والنوافل اليومية</Text>

                <TouchableOpacity
                  style={[styles.sunnahRow, !!completedPrayers['duha'] && { opacity: 0.5 }]}
                  activeOpacity={0.7}
                  onPress={() => togglePrayerCheck('duha')}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!completedPrayers['duha'] }}
                  accessibilityLabel="صلاة الضحى"
                >
                  <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
                    <Text style={[themeColors.text, { fontSize: fontSize - 3, fontWeight: 'bold', textAlign: 'right' }]}>
                      صلاة الضحى (صلاة الأوّابين)
                    </Text>
                    <Text style={[themeColors.subText, { fontSize: fontSize - 5, textAlign: 'right', marginTop: 2 }]}>
                      وقتها: من {duhaTimes.start} إلى {duhaTimes.end}
                    </Text>
                  </View>
                  <ThemedCheckbox checked={!!completedPrayers['duha']} accentColor={themeColors.accentText.color} />
                </TouchableOpacity>

                <GoldenDivider style={{ marginBottom: 2 }} />

                <TouchableOpacity
                  style={[styles.sunnahRow, { paddingBottom: 0 }, !!completedPrayers['witr'] && { opacity: 0.5 }]}
                  activeOpacity={0.7}
                  onPress={() => togglePrayerCheck('witr')}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!completedPrayers['witr'] }}
                  accessibilityLabel="ركعة الوتر"
                >
                  <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
                    <Text style={[themeColors.text, { fontSize: fontSize - 3, fontWeight: 'bold', textAlign: 'right' }]}>
                      ركعة الوتر (ختام الليل)
                    </Text>
                    <Text style={[themeColors.subText, { fontSize: fontSize - 5, textAlign: 'right', marginTop: 2 }]}>
                      وقتها: بعد صلاة العشاء وحتى أذان الفجر
                    </Text>
                  </View>
                  <ThemedCheckbox checked={!!completedPrayers['witr']} accentColor={themeColors.accentText.color} />
                </TouchableOpacity>
              </View>

              <View style={[styles.card, themeColors.card, { marginTop: 15, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#D4A37355' }]}>
                {showDuha ? (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <HeritageIcons.Sun size={18} color="#D4A373" />
                      <Text style={[themeColors.accentText, { fontSize: fontSize - 1, fontWeight: 'bold' }]}>
                        صلاة الضحى (النهار)
                      </Text>
                    </View>
                    <Text style={[themeColors.text, { fontSize: fontSize - 2 }]}>
                      من {duhaTimes.start} إلى {duhaTimes.end}
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <HeritageIcons.Crescent size={18} color="#D4A373" />
                      <Text style={[themeColors.accentText, { fontSize: fontSize - 1, fontWeight: 'bold' }]}>
                        الثلث الأخير من الليل
                      </Text>
                    </View>
                    <Text style={[themeColors.text, { fontSize: fontSize - 2 }]}>
                      يبدأ الساعة: {nightInfo.start}
                    </Text>
                    <Text style={[themeColors.subText, { fontSize: fontSize - 4, marginTop: 4 }]}>
                      {nightInfo.remaining}
                    </Text>
                  </>
                )}
              </View>
            </>
          ) : (
            <Text style={[styles.prayerTime, themeColors.text, { textAlign: 'center', fontSize: fontSize - 2 }]}>تعذر جلب المواقيت حالياً</Text>
          )}
        </View>

        <View style={[styles.qiblaContainer, themeColors.card, { alignItems: 'center', paddingVertical: 25 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <HeritageIcons.Kaaba size={22} color={isAligned ? QIBLA_ALIGNED_COLOR : '#D4A373'} />
            <Text style={[styles.qiblaHeader, themeColors.text, { fontSize: fontSize + 2, marginBottom: 0 }]}>بوصلة القبلة المشرفة</Text>
          </View>

          {/* Large, simple turn-left / turn-right guidance */}
          <View style={{
            backgroundColor: isAligned ? QIBLA_ALIGNED_TINT_18 : 'rgba(212, 163, 115, 0.15)',
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 16,
            borderWidth: 1.8,
            borderColor: isAligned ? QIBLA_ALIGNED_COLOR : '#D4A373',
            marginVertical: 12,
            alignItems: 'center',
            minWidth: '80%'
          }}>
            <Text style={{ fontSize: fontSize + 1, fontWeight: 'bold', color: isAligned ? QIBLA_ALIGNED_COLOR : themeColors.text.color, textAlign: 'center' }}>
              {guidance.arrow}{guidance.text}
            </Text>
          </View>

          {/* Heritage compass with the Kaaba marker on top */}
          <View style={[
            styles.ornateCompassOuterRing,
            isAligned && { borderColor: QIBLA_ALIGNED_COLOR, backgroundColor: QIBLA_ALIGNED_TINT_12 }
          ]}>
            <View style={{ position: 'absolute', top: 6, zIndex: 3 }}>
              <HeritageIcons.Kaaba size={18} color={isAligned ? QIBLA_ALIGNED_COLOR : '#D4A373'} />
            </View>

            <View style={[
              styles.ornateCompassInnerRing,
              isAligned && { borderColor: QIBLA_ALIGNED_TINT_60 }
            ]}>
              <View style={[styles.compassCenterDot, isAligned && { backgroundColor: QIBLA_ALIGNED_COLOR }]} />
              <View style={[styles.compassNeedleContainer, { transform: [{ rotate: `${needleRotation}deg` }] }]}>
                <View style={[styles.compassArrowHead, { borderBottomColor: isAligned ? QIBLA_ALIGNED_COLOR : '#C86D51' }]} />
                <View style={[styles.compassArrowShaft, { backgroundColor: isAligned ? QIBLA_ALIGNED_COLOR : '#C86D51' }]} />
              </View>
            </View>
          </View>

          <Text style={[themeColors.subText, { fontSize: fontSize - 5, marginTop: 10, textAlign: 'center' }]}>
            ضع هاتفك بشكل مستوٍ وأدره ببطء
          </Text>
          <Text style={[themeColors.subText, { fontSize: fontSize - 7, marginTop: 4, textAlign: 'center', opacity: 0.75 }]}>
            إذا لاحظت عدم استقرار في المؤشر، حرّك هاتفك على شكل رقم ٨ عدة مرات لمعايرة البوصلة، وابتعد عن الأجسام المعدنية والمغناطيسية القريبة
          </Text>
        </View>

        {/* Monthly Imsakiya modal */}
        <Modal visible={imsakiyaModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, themeColors.card, { maxHeight: '85%', width: '95%' }]}>
              <Text style={[styles.modalTitle, themeColors.text, { fontSize: fontSize + 1 }]}>
                إمساكية شهر {monthNameStr}
              </Text>
              <Text style={[themeColors.subText, { fontSize: fontSize - 4, marginBottom: 12 }]}>
                مواقيت الصلاة في {locationName}
              </Text>

              <ScrollView style={{ width: '100%', marginBottom: 15 }}>
                <View style={{ flexDirection: 'row', backgroundColor: 'rgba(212,163,115,0.2)', paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: fontSize - 5, color: '#D4A373' }}>اليوم</Text>
                  <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: fontSize - 5, color: '#D4A373' }}>الفجر</Text>
                  <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: fontSize - 5, color: '#D4A373' }}>الظهر</Text>
                  <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: fontSize - 5, color: '#D4A373' }}>العصر</Text>
                  <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: fontSize - 5, color: '#D4A373' }}>المغرب</Text>
                  <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: fontSize - 5, color: '#D4A373' }}>العشاء</Text>
                </View>

                {monthlyTimesList.map((row, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 0.6, borderColor: 'rgba(212,163,115,0.2)' }}>
                    <Text style={[{ flex: 1, textAlign: 'center', fontSize: fontSize - 5 }, themeColors.accentText]}>{formatArabicNumbers(row.dayNumber)}</Text>
                    <Text style={[{ flex: 1, textAlign: 'center', fontSize: fontSize - 5 }, themeColors.text]}>{formatArabicNumbers(row.Fajr)}</Text>
                    <Text style={[{ flex: 1, textAlign: 'center', fontSize: fontSize - 5 }, themeColors.text]}>{formatArabicNumbers(row.Dhuhr)}</Text>
                    <Text style={[{ flex: 1, textAlign: 'center', fontSize: fontSize - 5 }, themeColors.text]}>{formatArabicNumbers(row.Asr)}</Text>
                    <Text style={[{ flex: 1, textAlign: 'center', fontSize: fontSize - 5, fontWeight: 'bold' }, themeColors.accentText]}>{formatArabicNumbers(row.Maghrib)}</Text>
                    <Text style={[{ flex: 1, textAlign: 'center', fontSize: fontSize - 5 }, themeColors.text]}>{formatArabicNumbers(row.Isha)}</Text>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.shareOptionBtn, { marginBottom: 8 }]} onPress={shareMonthlyImsakiyaImage} activeOpacity={0.8}>
                <Text style={styles.shareOptionBtnText}>حفظ ومشاركة الإمساكية</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setImsakiyaModalVisible(false)}>
                <Text style={styles.closeModalBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* City picker modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, themeColors.card]}>
              <Text style={[styles.modalTitle, themeColors.text, { fontSize: fontSize + 2 }]}>اختر مدينتك أو منطقتك</Text>
              <FlatList
                data={PALESTINE_CITIES}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.cityOption} onPress={() => selectCity(item)}>
                    <Text style={[styles.cityOptionText, themeColors.text, { fontSize: fontSize - 1 }]}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModalBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}


export { PrayerTimesScreen };