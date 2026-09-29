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
import { PALESTINE_CITIES, DAHRI_TIMES, getDahriCityOffset, getPalestineDstOffset, addMinutesToTime } from '../data/dahriTimesData';
import { scheduleAppNotifications } from '../services/notificationService';

// --- 2. PRAYER TIMES SCREEN ---
/** هل أول حرف "قوي" (عربي أو لاتيني) بالنص عربي؟ (نفس قاعدة Unicode لاتجاه الفقرة) */
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
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number; dahriOffset: number } | null>(null);

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
  // 🧭 البوصلة شغّالة بس وهي شاشة القبلة ظاهرة فعلاً
  // ==========================================
  // التبويبات بتخلّي الشاشة "مركّبة" بالخلفية بعد ما تنتقل لتبويب تاني —
  // فكانت الحسّاسات (ومعها اهتزاز محاذاة القبلة) تضل شغّالة بكل الشاشات،
  // وحتى والتطبيق بالخلفية على أندرويد. هلأ بتشتغل بس لما الشاشة ظاهرة
  // (isFocused) والتطبيق بالمقدّمة (AppState = active)، وبتنطفي فوراً غير هيك.
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
    // 🧭 مرشِّح تكميلي (Complementary Filter) لثبات اتجاه القبلة
    // ==========================================
    // المشكلة الحقيقية: حساس المغناطيسية (Magnetometer) بطبيعته حساس جداً
    // للتشويش المغناطيسي المحيط (لابتوب، سماعات، أسلاك، حديد بالمكتب أو
    // الحائط، شواحن لاسلكية...)، وهاد التشويش بيغيّر قراءته حتى لو الهاتف
    // نفسه ثابت 100% تماماً بمكانه. هاد تشويش فيزيائي حقيقي وما في أي تطبيق
    // بالدنيا يقدر يلغيه بالكامل من طرف السوفتوير وحده.
    //
    // لكن نقدر نبني نظام "يعرف" هل الهاتف فعلاً استدار ولا لأ، بالاعتماد على
    // حساس الجيروسكوب (Gyroscope) يلي بيقيس *سرعة دوران* الهاتف الفعلية
    // مباشرة، ومش إله أي علاقة بالمغناطيسية إطلاقاً (مش متأثر بالتشويش
    // المغناطيسي أبداً). الفكرة: بكل لحظة منثق بالجيروسكوب شبه بالكامل
    // لتحديد الحركة اللحظية (لو الجيروسكوب قايل "صفر دوران"، المؤشر ما
    // بيتحرك ولو المغناطيسية قالت غير هيك)، وبنفس الوقت منسمح بتصحيح بطيء
    // جداً من المغناطيسية على مدى ثوانٍ حتى ما ننجرف بعيد عن الاتجاه الحقيقي
    // (لأنه الجيروسكوب لحاله بينجرف مع الوقت لو اعتمدنا عليه بس). هاد بالضبط
    // نفس المبدأ المستخدم ببوصلات الطيران وتطبيقات القبلة الاحترافية.
    //
    // ⚠️ ملاحظة تقنية مهمة: اتجاه دوران محور الجيروسكوب (z) ممكن يختلف
    // بالإشارة بين أجهزة أندرويد المختلفة. إذا بعد التجربة صار المؤشر يدور
    // بعكس الاتجاه الصحيح لما تلف الهاتف فعلياً، بدّل السطر
    // "fusedRef.current = wrap360(fusedRef.current - deltaDeg)"
    // تحت لـ "+ deltaDeg" بدل "- deltaDeg".
    const fusedRef = { current: null as number | null };
    let lastGyroTime = Date.now();

    const wrap360 = (deg: number) => ((deg % 360) + 360) % 360;
    const shortestDelta = (from: number, to: number) => {
      let d = (to - from) % 360;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      return d;
    };

    // تصحيح بطيء (٦٪ فقط من الفرق بكل قراءة مغناطيسية) نحو القراءة المطلقة،
    // حتى نلغي الضجيج اللحظي لكن نضل ملتزمين بالاتجاه الصحيح على المدى
    // المتوسط بدل ما ننجرف بعيد عنه كلياً.
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
      if (dt <= 0 || dt > 0.5) return; // تجاهل فجوات زمنية غير طبيعية (مثلاً بعد رجوع التطبيق من الخلفية)

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
      // الجيروسكوب فعّال دايماً على المنصتين — هو اللي بيخلي المؤشر ثابت
      // فعلياً لما الهاتف ثابت، بغض النظر شو قالت المغناطيسية.
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
        // مسار احتياطي (بيصير غالباً على أندرويد لما ما يتوفر
        // watchHeadingAsync): منحسب الاتجاه من المغناطيسية + التسارع معاً
        // (تعويض الميلان / tilt compensation)، مش من المغناطيسية لوحدها متل
        // ما كان بالكود القديم. بدون تعويض الميلان، أي إمالة بسيطة طبيعية
        // بالهاتف وقت ما الشخص ماسكه بيده كانت تعطي انحراف كبير بالاتجاه ممكن
        // يوصل لأكتر من ٤٥ درجة.
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
      const savedCity = await AsyncStorage.getItem('@user_selected_city');
      if (savedCity) {
        const cityObj = JSON.parse(savedCity);
        if (cityObj.lat === null) {
          await fetchLiveGPSAndTimes(true);
        } else {
          setLocationName(cityObj.name);
          applyDahriTimes(cityObj.lat, cityObj.lon, cityObj.dahriOffset);
          calculateQibla(cityObj.lat, cityObj.lon);
        }
        return;
      }
      await fetchLiveGPSAndTimes(false);
    } catch (e) {
      await fetchLiveGPSAndTimes(false);
    }
  };

  const fetchLiveGPSAndTimes = async (isManualGPS: boolean) => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('تعذّر الوصول إلى موقعك • سيتم استخدام القدس افتراضيًا');
        applyDahriTimes(31.7683, 35.2137, 0);
        calculateQibla(31.7683, 35.2137);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      let currentCityStr = 'موقعك الحالي';

      try {
        let reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverse && reverse.length > 0) {
          currentCityStr = getArabicLocationLabel(reverse[0]);
        }
      } catch (netError) {}

      const calculatedOffset = getDahriCityOffset(latitude, longitude);
      setLocationName(currentCityStr);
      applyDahriTimes(latitude, longitude, calculatedOffset);
      calculateQibla(latitude, longitude);

      if (isManualGPS) {
        await AsyncStorage.setItem('@user_selected_city', JSON.stringify({ 
          name: currentCityStr, 
          lat: latitude, 
          lon: longitude, 
          dahriOffset: calculatedOffset 
        }));
      }
    } catch (e) {
      const savedCity = await AsyncStorage.getItem('@user_selected_city');
      if (savedCity) {
        const cityObj = JSON.parse(savedCity);
        if (cityObj.lat !== null) {
          setLocationName(cityObj.name + ' (الموقع المحفوظ)');
          applyDahriTimes(cityObj.lat, cityObj.lon, cityObj.dahriOffset);
          calculateQibla(cityObj.lat, cityObj.lon);
          setLoading(false);
          return;
        }
      }

      setLocationName('تعذّر تحديد موقعك • القدس هي الموقع الافتراضي');
      applyDahriTimes(31.7683, 35.2137, 0);
      calculateQibla(31.7683, 35.2137);
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
      await AsyncStorage.setItem('@user_selected_city', JSON.stringify(city));
      applyDahriTimes(city.lat, city.lon, city.dahriOffset);
      calculateQibla(city.lat, city.lon);
    }
  };

  const applyDahriTimes = (lat: number, lon: number, customOffset?: number) => {
    try {
      setLoading(true);
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const monthArray = DAHRI_TIMES[month - 1] || DAHRI_TIMES[0];
      const baseTimes = monthArray[Math.min(day - 1, monthArray.length - 1)] || ["05:00", "06:30", "11:45", "02:30", "05:00", "06:15"];

      const dahriOffset = customOffset !== undefined ? customOffset : getDahriCityOffset(lat, lon);
      const dstOffset = getPalestineDstOffset(today);

      const totalOffset = Math.round(dahriOffset + dstOffset);
      setCurrentCoords({ lat, lon, dahriOffset });

      const newTimings = {
        Fajr: addMinutesToTime(baseTimes[0], totalOffset, false),
        Sunrise: addMinutesToTime(baseTimes[1], totalOffset, false),
        Dhuhr: addMinutesToTime(baseTimes[2], totalOffset, false),
        Asr: addMinutesToTime(baseTimes[3], totalOffset, true),
        Maghrib: addMinutesToTime(baseTimes[4], totalOffset, true),
        Isha: addMinutesToTime(baseTimes[5], totalOffset, true),
      };

      setTimings(newTimings);
      scheduleAppNotifications(newTimings);

      const status = getPrayerStatus(newTimings);
      updateAndroidWidget(status, newTimings);

      const calculatedMonthList = monthArray.map((dTimes: string[], index: number) => {
        const dNum = index + 1;
        return {
          dayNumber: dNum,
          dayLabel: `اليوم ${dNum}`,
          Fajr: addMinutesToTime(dTimes[0], totalOffset, false),
          Sunrise: addMinutesToTime(dTimes[1], totalOffset, false),
          Dhuhr: addMinutesToTime(dTimes[2], totalOffset, false),
          Asr: addMinutesToTime(dTimes[3], totalOffset, true),
          Maghrib: addMinutesToTime(dTimes[4], totalOffset, true),
          Isha: addMinutesToTime(dTimes[5], totalOffset, true),
        };
      });
      setMonthlyTimesList(calculatedMonthList);
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

  // parallax: بيحرّك نقش الخلفية مع التمرير (خيار الخلفية ٣)
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
          />
        </View>
      </View>

      <View style={{ position: 'absolute', left: -9999, top: 0, width: 1080, opacity: 0 }} pointerEvents="none" collapsable={false}>
        <View ref={imsakiyaCardRef} collapsable={false}>
          <MonthlyImsakiyaSharePage 
            daysList={monthlyTimesList}
            locationName={locationName}
            monthTitle={monthNameStr}
          />
        </View>
      </View>

      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }} onScroll={bgScroll} scrollEventThrottle={16}>
        <HeritageArchBanner title="مواقيت الصلاة والقبلة" textColor={themeColors.text.color} isDarkMode={isDarkMode} />

        <View style={[styles.locationCard, themeColors.card, { padding: 16 }]}>
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.locationTitle, themeColors.subText, { fontSize: fontSize - 4, textAlign: 'right' }]}>موقعك الحالي • التوقيت الدهري</Text>
            {/* اسم المدينة: عربي ← يمين، إنجليزي (ما انترجم) ← يسار — حسب أول حرف "قوي" بالاسم */}
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
            مواقيت الصلاة وفق التقويم الدهري
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

              {/* صف كل صلاة قابل للنقر بالكامل لتبديل حالة الإنجاز، والمربع على اليمين بجانب اسم الصلاة.
                  الشروق ليس صلاة تُقضى، فلا يحصل على مربع اختيار — عرضناه كسطر معلوماتي مُدمج
                  ومُميّز بخط مائل ومحاذاة للوسط بدل تركه فارغاً بجانب صفوف الصلوات القابلة للتحديد. */}
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
                  // الخط المقطّع (dashed) تحت الشروق يبقى كما هو دون أي تعديل.
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

          {/* توجيه نصي عريض وبسيط لليسار واليمين */}
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

          {/* البوصلة التراثية مع رمز الكعبة في الأعلى */}
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

        {/* مودال إمساكية الشهر */}
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

        {/* مودال اختيار المدينة */}
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