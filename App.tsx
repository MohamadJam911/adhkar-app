import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Linking, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, { FadeIn, Layout, SlideOutRight, SlideOutLeft, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Path, Rect, Circle } from 'react-native-svg';

import adhkarData from './src/data/adhkar.json';
import homeData from './src/data/homeData.json';
import { PALESTINE_CITIES, DAHRI_TIMES, getDahriCityOffset, getPalestineDstOffset, addMinutesToTime } from './src/data/dahriTimesData';

type Dhikr = {
  id: string;
  text: string;
  count: number;
  reward?: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const formatArabicNumbers = (text: string | number) => {
  if (text === null || text === undefined) return '';
  const str = String(text);
  const hindiToWestern: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return str.replace(/[٠-٩]/g, (match) => hindiToWestern[match] || match);
};

// خلفية نقش الأرابيسك المزخرفة والواضحة عبر StyleSheet.absoluteFill
const ExactImagePatternWall = ({ isDarkMode, children }: { isDarkMode: boolean, children: React.ReactNode }) => {
  const gradientColors = isDarkMode 
    ? ['#201C17', '#14110E', '#0B0907'] as const 
    : ['#F9F4EC', '#EFE7DA', '#DFD3C3'] as const;

  const patternColor = isDarkMode ? 'rgba(212, 163, 115, 0.22)' : 'rgba(158, 109, 59, 0.25)';

  return (
    <LinearGradient colors={gradientColors} style={styles.canvasContainer}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Defs>
            <Pattern id="islamicPattern" width="45" height="45" patternUnits="userSpaceOnUse">
              <Path d="M22.5 0 L45 22.5 L22.5 45 L0 22.5 Z" fill="none" stroke={patternColor} strokeWidth="1.2" />
              <Circle cx="22.5" cy="22.5" r="9" fill="none" stroke={patternColor} strokeWidth="1.2" />
              <Path d="M0 0 L45 45 M45 0 L0 45" stroke={patternColor} strokeWidth="0.6" opacity="0.6" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#islamicPattern)" />
        </Svg>
      </View>
      {children}
    </LinearGradient>
  );
};

const HeritageArchBanner = ({ title, textColor }: { title: string, textColor: string }) => {
  return (
    <View style={styles.heritageArchContainer}>
      <View style={[styles.heritageArchShape, { borderColor: textColor }]}>
        <Text style={[styles.heritageArchTitleText, { color: textColor }]}>{title}</Text>
      </View>
    </View>
  );
};

// --- 1. HOME SCREEN ---
function HomeScreen({ navigation, isDarkMode, hapticEnabled, fontSize }: { navigation: any, isDarkMode: boolean, hapticEnabled: boolean, fontSize: number }) {
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  const [currentTime, setCurrentTime] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [tasbeehCount, setTasbeehCount] = useState(0);

  const verseIndex = new Date().getDate() % homeData.quranVerses.length;
  const nameIndex = new Date().getDate() % homeData.allahNames.length;

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(formatArabicNumbers(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })));
      setGregorianDate(formatArabicNumbers(now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })));
      
      try {
        const hijriOpt: Intl.DateTimeFormatOptions = { calendar: 'islamic-umalqura', day: 'numeric', month: 'long', year: 'numeric' };
        setHijriDate(formatArabicNumbers(new Intl.DateTimeFormat('ar-SA-u-ca-islamic', hijriOpt).format(now)));
      } catch (e) {
        setHijriDate('التقويم الهجري');
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickTasbeeh = () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasbeehCount(prev => prev + 1);
  };

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/972000000000?text=السلام%20عليكم%20أخي،%20أعجبني%20تطبيق%20حصن%20المسلم');
  };

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <ScrollView contentContainerStyle={{ padding: 15 }}>

        <HeritageArchBanner title="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" textColor={themeColors.text.color} />

        <View style={[styles.mainHeaderCard, themeColors.card]}>
          <Text style={[styles.clockText, themeColors.text, { fontSize: fontSize + 12 }]}>{currentTime}</Text>
          <Text style={[styles.dateText, themeColors.subText, { fontSize: fontSize - 2 }]}>{gregorianDate}</Text>
          <Text style={[styles.hijriText, themeColors.accentText, { fontSize: fontSize - 2 }]}>{hijriDate}</Text>
        </View>

        <View style={[styles.verseCard, themeColors.card]}>
          <Text style={[styles.verseBadgeTitle, themeColors.accentText, { fontSize: fontSize - 2 }]}>📌 بلغوا عني ولو آية</Text>
          <Text style={[styles.verseText, themeColors.text, { fontSize: fontSize + 2, lineHeight: (fontSize + 2) * 1.5 }]}>
            {homeData.quranVerses[verseIndex]}
          </Text>
        </View>

        <View style={[styles.tasbeehCard, themeColors.card]}>
          <Text style={[styles.tasbeehTitle, themeColors.text, { fontSize: fontSize }]}>الذكر السريع</Text>
          <Text style={[styles.tasbeehWords, themeColors.subText, { fontSize: fontSize - 3 }]}>استغفر الله • لا إله إلا الله • الحمد لله</Text>
          
          <TouchableOpacity style={[styles.tasbeehCircle, themeColors.circleBtn, { width: fontSize * 6, height: fontSize * 6, borderRadius: (fontSize * 6) / 2 }]} onPress={handleQuickTasbeeh} activeOpacity={0.8}>
            <Text style={[styles.tasbeehNumber, themeColors.circleText, { fontSize: fontSize + 14 }]}>{formatArabicNumbers(tasbeehCount)}</Text>
            <Text style={[styles.tasbeehTapLabel, themeColors.circleSubText, { fontSize: fontSize - 7 }]}>اضغط للتسبيح</Text>
          </TouchableOpacity>
          {tasbeehCount > 0 && (
            <TouchableOpacity onPress={() => setTasbeehCount(0)} style={styles.resetTasbeehBtn}>
              <Text style={[styles.resetTasbeehText, { fontSize: fontSize - 3 }]}>إعادة العداد</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.nameCard, themeColors.card]}>
          <Text style={[styles.nameCardHeader, themeColors.accentText, { fontSize: fontSize - 2 }]}>✨ من أسماء الله الحسنى</Text>
          <Text style={[styles.allahName, themeColors.text, { fontSize: fontSize + 6 }]}>{homeData.allahNames[nameIndex].name}</Text>
          <Text style={[styles.allahMeaning, themeColors.subText, { fontSize: fontSize - 2 }]}>{homeData.allahNames[nameIndex].meaning}</Text>
        </View>

        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={[styles.gridItem, themeColors.card]} 
            onPress={() => navigation.navigate('الأذكار', { screen: 'DhikrList', params: { type: 'morning', title: 'أذكار الصباح', isDarkMode, hapticEnabled, fontSize } })}
          >
            <Text style={styles.gridEmoji}>☀️</Text>
            <Text style={[styles.gridTitle, themeColors.text, { fontSize: fontSize - 1 }]}>أذكار الصباح</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, themeColors.card]} 
            onPress={() => navigation.navigate('الأذكار', { screen: 'DhikrList', params: { type: 'evening', title: 'أذكار المساء', isDarkMode, hapticEnabled, fontSize } })}
          >
            <Text style={styles.gridEmoji}>🌙</Text>
            <Text style={[styles.gridTitle, themeColors.text, { fontSize: fontSize - 1 }]}>أذكار المساء</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, themeColors.card]} 
            onPress={() => navigation.navigate('السبحة')}
          >
            <Text style={styles.gridEmoji}>📿</Text>
            <Text style={[styles.gridTitle, themeColors.text, { fontSize: fontSize - 1 }]}>السبحة الحرة</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridItem, themeColors.card]} 
            onPress={openWhatsApp}
          >
            <Text style={styles.gridEmoji}>💬</Text>
            <Text style={[styles.gridTitle, themeColors.text, { fontSize: fontSize - 1 }]}>تواصل معنا</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ExactImagePatternWall>
  );
}

// --- 2. ADHKAR LIBRARY / LIST SCREEN ---
function DhikrCard({ dhikr, onPresItem, isDarkMode, type, hapticEnabled, fontSize }: { dhikr: Dhikr, onPresItem: (id: string) => void, isDarkMode: boolean, type: string, hapticEnabled: boolean, fontSize: number }) {
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;
  const scale = useSharedValue(1);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressCard = () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withTiming(0.97, { duration: 80 }), withTiming(1, { duration: 80 }));
    onPresItem(dhikr.id);
  };

  const exitingAnimation = type === 'morning' ? SlideOutRight : SlideOutLeft;

  return (
    <Animated.View exiting={exitingAnimation} layout={Layout.springify()}>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePressCard}>
        <Animated.View style={[styles.card, themeColors.card, animatedCardStyle, { padding: fontSize + 2 }]}>
          <Text style={[styles.dhikrText, themeColors.text, { fontSize, lineHeight: fontSize * 1.5 }]}>{dhikr.text}</Text>
          {dhikr.reward ? (
            <Text style={[styles.rewardText, themeColors.subText, { fontSize: fontSize - 3 }]}>فضل الذكر: {dhikr.reward}</Text>
          ) : null}
          <View style={[styles.counterBadge, themeColors.badge]}>
            <Text style={[styles.counterText, themeColors.counterText, { fontSize: fontSize - 3 }]}>متبقي: {formatArabicNumbers(dhikr.count)}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DhikrListScreen({ route }: { route: any }) {
  const { type, isDarkMode, hapticEnabled, fontSize } = route.params;
  const storageKey = `@adhkar_progress_${type}`;
  const initialData = type === 'morning' ? adhkarData.morning : adhkarData.evening;
  
  const [adhkarList, setAdhkarList] = useState<Dhikr[]>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  useEffect(() => {
    (async () => {
      try {
        const savedData = await AsyncStorage.getItem(storageKey);
        if (savedData) setAdhkarList(JSON.parse(savedData));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const handlePress = async (id: string) => {
    const updatedList = adhkarList.map(dhikr => {
      if (dhikr.id === id && dhikr.count > 0) return { ...dhikr, count: dhikr.count - 1 };
      return dhikr;
    });
    setAdhkarList(updatedList);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedList));
  };

  const resetProgress = async () => {
    if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAdhkarList(initialData);
    await AsyncStorage.setItem(storageKey, JSON.stringify(initialData));
  };

  if (!isLoaded) return null;
  const allCompleted = adhkarList.every(dhikr => dhikr.count === 0);

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.View entering={FadeIn} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 15 }}>
          <HeritageArchBanner title={type === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'} textColor={themeColors.text.color} />
          {allCompleted ? (
            <View style={styles.completionContainer}>
              <Text style={styles.completionEmoji}>🌟</Text>
              <Text style={[styles.completionTitle, themeColors.text, { fontSize: fontSize + 2 }]}>تقبل الله طاعتك</Text>
              <Text style={[styles.completionSubtitle, themeColors.subText, { fontSize: fontSize - 2 }]}>بارك الله في وقتك، وأدام عليك نور ذكره وطاعته.</Text>
              <TouchableOpacity style={[styles.resetButton, themeColors.circleBtn]} onPress={resetProgress}>
                <Text style={[styles.resetButtonText, themeColors.circleText, { fontSize: fontSize - 2 }]}>إعادة الورد من جديد</Text>
              </TouchableOpacity>
            </View>
          ) : (
            adhkarList.map((dhikr) => {
              if (dhikr.count === 0) return null;
              return <DhikrCard key={dhikr.id} dhikr={dhikr} onPresItem={handlePress} isDarkMode={isDarkMode} type={type} hapticEnabled={hapticEnabled} fontSize={fontSize} />;
            })
          )}
        </ScrollView>
      </Animated.View>
    </ExactImagePatternWall>
  );
}

function LibraryScreen({ navigation, isDarkMode, hapticEnabled, fontSize }: { navigation: any, isDarkMode: boolean, hapticEnabled: boolean, fontSize: number }) {
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }}>
        <HeritageArchBanner title="مكتبة الأذكار" textColor={themeColors.text.color} />
        <View style={styles.menuContainer}>
          <TouchableOpacity style={[styles.menuCard, themeColors.card]} onPress={() => navigation.navigate('DhikrList', { type: 'morning', title: 'أذكار الصباح', isDarkMode, hapticEnabled, fontSize })}>
            <Text style={[styles.menuTitle, themeColors.text, { fontSize: fontSize + 2 }]}>☀️ أذكار الصباح</Text>
            <Text style={[styles.menuSubtitle, themeColors.subText, { fontSize: fontSize - 2 }]}>حصن نفسك مع إشراقة كل يوم</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuCard, themeColors.card]} onPress={() => navigation.navigate('DhikrList', { type: 'evening', title: 'أذكار المساء', isDarkMode, hapticEnabled, fontSize })}>
            <Text style={[styles.menuTitle, themeColors.text, { fontSize: fontSize + 2 }]}>🌙 أذكار المساء</Text>
            <Text style={[styles.menuSubtitle, themeColors.subText, { fontSize: fontSize - 2 }]}>أحصن حصونك عند الغروب</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}

// --- 3. FREE SEBHA SCREEN ---
function SebhaScreen({ isDarkMode, hapticEnabled, fontSize }: { isDarkMode: boolean, hapticEnabled: boolean, fontSize: number }) {
  const [count, setCount] = useState(0);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  const handleTasbeeh = () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCount(prev => prev + 1);
  };

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1, padding: 15 }}>
        <HeritageArchBanner title="المسبحة الرقمية" textColor={themeColors.text.color} />
        <View style={[styles.centerScreen, { flex: 1 }]}>
          <Text style={[styles.sebhaLabel, themeColors.text, { fontSize: fontSize + 2 }]}>سبحة التسبيح الحرة</Text>
          <TouchableOpacity style={[styles.bigSebhaCircle, themeColors.circleBtn, { width: fontSize * 8, height: fontSize * 8, borderRadius: (fontSize * 8) / 2 }]} onPress={handleTasbeeh} activeOpacity={0.85}>
            <Text style={[styles.bigSebhaNumber, themeColors.circleText, { fontSize: fontSize * 2 }]}>{formatArabicNumbers(count)}</Text>
            <Text style={[styles.bigSebhaHint, themeColors.circleSubText, { fontSize: fontSize - 8 }]}>اضغط هنا للتسبيح</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetSebhaBtn} onPress={() => setCount(0)}>
            <Text style={[styles.resetSebhaText, { fontSize: fontSize - 3 }]}>تصفير العداد</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ExactImagePatternWall>
  );
}

// --- 4. ACCURATE PRAYER TIMES & ORNATE QIBLA COMPASS SCREEN ---
function PrayerTimesScreen({ isDarkMode, fontSize, hapticEnabled }: { isDarkMode: boolean, fontSize: number, hapticEnabled: boolean }) {
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;
  const [timings, setTimings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [locationName, setLocationName] = useState<string>('جاري تحديد الموقع الحي...');
  const [isAligned, setIsAligned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [timeMode, setTimeMode] = useState<'auto' | 'summer' | 'winter'>('auto');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number; dahriOffset: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem('@dahri_time_mode');
        if (savedMode === 'summer' || savedMode === 'winter' || savedMode === 'auto') {
          setTimeMode(savedMode);
        }
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    if (currentCoords) {
      applyDahriTimes(currentCoords.lat, currentCoords.lon, currentCoords.dahriOffset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeMode]);

  const handleSelectTimeMode = async (mode: 'auto' | 'summer' | 'winter') => {
    if (hapticEnabled) Haptics.selectionAsync();
    setTimeMode(mode);
    await AsyncStorage.setItem('@dahri_time_mode', mode);
  };

  useEffect(() => {
    initializeLiveLocation();

    let subscription: any;
    (async () => {
      try {
        subscription = await Location.watchHeadingAsync(heading => {
          if (heading && heading.trueHeading >= 0) {
            setDeviceHeading(Math.round(heading.trueHeading));
          } else if (heading && heading.magHeading >= 0) {
            setDeviceHeading(Math.round(heading.magHeading));
          }
        });
      } catch (e) {
        Magnetometer.setUpdateInterval(100);
        subscription = Magnetometer.addListener(data => {
          let { x, y } = data;
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          angle = angle >= 0 ? angle : angle + 360;
          setDeviceHeading(Math.round(angle));
        });
      }
    })();

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

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
          await updateLiveQiblaOnly();
        }
        return;
      }

      await fetchLiveGPSAndTimes(false);
    } catch (e) {
      await fetchLiveGPSAndTimes(false);
    }
  };

  const updateLiveQiblaOnly = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      calculateQibla(location.coords.latitude, location.coords.longitude);
    } catch (e) {
      calculateQibla(31.7683, 35.2137);
    }
  };

  const fetchLiveGPSAndTimes = async (isManualGPS: boolean) => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('تم رفض إذن الموقع (افتراضي: القدس)');
        applyDahriTimes(31.7683, 35.2137, 0);
        calculateQibla(31.7683, 35.2137);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      let reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      let currentCityStr = 'الموقع الحالي (GPS حي)';
      if (reverse && reverse.length > 0) {
        currentCityStr = `${reverse[0].city || reverse[0].subregion || 'منطقة'} / ${reverse[0].country || ''}`;
      }

      const calculatedOffset = getDahriCityOffset(latitude, longitude);
      setLocationName(currentCityStr);
      applyDahriTimes(latitude, longitude, calculatedOffset);
      calculateQibla(latitude, longitude);

      if (isManualGPS) {
        await AsyncStorage.setItem('@user_selected_city', JSON.stringify({ name: currentCityStr, lat: null, lon: null, dahriOffset: calculatedOffset }));
      }
    } catch (e) {
      setLocationName('تعذر جلب الموقع الحي');
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
      await updateLiveQiblaOnly();
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

      let dstOffset = 0;
      if (timeMode === 'auto') {
        dstOffset = getPalestineDstOffset(today);
      } else if (timeMode === 'summer') {
        dstOffset = 60;
      } else {
        dstOffset = 0;
      }

      const totalOffset = Math.round(dahriOffset + dstOffset);
      setCurrentCoords({ lat, lon, dahriOffset });

      setTimings({
        Fajr: addMinutesToTime(baseTimes[0], totalOffset),
        Sunrise: addMinutesToTime(baseTimes[1], totalOffset),
        Dhuhr: addMinutesToTime(baseTimes[2], totalOffset),
        Asr: addMinutesToTime(baseTimes[3], totalOffset),
        Maghrib: addMinutesToTime(baseTimes[4], totalOffset),
        Isha: addMinutesToTime(baseTimes[5], totalOffset),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
  
  useEffect(() => {
    if (qiblaDirection !== null) {
      const diff = Math.abs(needleRotation > 180 ? 360 - needleRotation : needleRotation);
      const isNowAligned = diff <= 4;
      if (isNowAligned && !isAligned) {
        setIsAligned(true);
        if (hapticEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else if (!isNowAligned && isAligned) {
        setIsAligned(false);
      }
    }
  }, [needleRotation]);

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }}>
        <HeritageArchBanner title="مواقيت الصلاة والقبلة" textColor={themeColors.text.color} />

        <View style={[styles.locationCard, themeColors.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }]}>
          <View>
            <Text style={[styles.locationTitle, themeColors.subText, { fontSize: fontSize - 4 }]}>📍 الموقع الحالي (التوقيت الدهري):</Text>
            <Text style={[styles.locationNameText, themeColors.text, { fontSize: fontSize - 1, fontWeight: 'bold' }]}>{locationName}</Text>
          </View>
          <TouchableOpacity style={styles.changeCityBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.changeCityBtnText}>تغيير البلد</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.timeModeCard, themeColors.card]}>
          <Text style={[styles.timeModeLabel, themeColors.subText, { fontSize: fontSize - 4 }]}>
            وضع التوقيت (الجدول الرسمي مُعدّ على التوقيت الشتوي)[cite: 1]
          </Text>
          <View style={styles.timeModeRow}>
            <TouchableOpacity
              style={[styles.timeModeBtn, timeMode === 'auto' && styles.timeModeBtnActive]}
              onPress={() => handleSelectTimeMode('auto')}
            >
              <Text style={[styles.timeModeBtnText, timeMode === 'auto' && styles.timeModeBtnTextActive, { fontSize: fontSize - 4 }]}>تلقائي</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeModeBtn, timeMode === 'summer' && styles.timeModeBtnActive]}
              onPress={() => handleSelectTimeMode('summer')}
            >
              <Text style={[styles.timeModeBtnText, timeMode === 'summer' && styles.timeModeBtnTextActive, { fontSize: fontSize - 4 }]}>صيفي</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeModeBtn, timeMode === 'winter' && styles.timeModeBtnActive]}
              onPress={() => handleSelectTimeMode('winter')}
            >
              <Text style={[styles.timeModeBtnText, timeMode === 'winter' && styles.timeModeBtnTextActive, { fontSize: fontSize - 4 }]}>شتوي</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. مواقيت الصلاة أولاً */}
        <View style={[styles.prayerCard, themeColors.card]}>
          <Text style={[styles.prayerTitle, themeColors.accentText, { fontSize: fontSize }]}>مواقيت الصلاة وفق التقويم الدهري</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#D4A373" style={{ marginVertical: 20 }} />
          ) : timings ? (
            <>
              <View style={styles.prayerRow}><Text style={[styles.prayerName, themeColors.text, { fontSize: fontSize - 2 }]}>الفجر</Text><Text style={[styles.prayerTime, themeColors.text, { fontSize: fontSize - 2 }]}>{formatArabicNumbers(timings.Fajr)}</Text></View>
              <View style={styles.prayerRow}><Text style={[styles.prayerName, themeColors.text, { fontSize: fontSize - 2 }]}>الشروق</Text><Text style={[styles.prayerTime, themeColors.text, { fontSize: fontSize - 2 }]}>{formatArabicNumbers(timings.Sunrise)}</Text></View>
              <View style={styles.prayerRow}><Text style={[styles.prayerName, themeColors.text, { fontSize: fontSize - 2 }]}>الظهر</Text><Text style={[styles.prayerTime, themeColors.text, { fontSize: fontSize - 2 }]}>{formatArabicNumbers(timings.Dhuhr)}</Text></View>
              <View style={styles.prayerRow}><Text style={[styles.prayerName, themeColors.text, { fontSize: fontSize - 2 }]}>العصر</Text><Text style={[styles.prayerTime, themeColors.text, { fontSize: fontSize - 2 }]}>{formatArabicNumbers(timings.Asr)}</Text></View>
              <View style={styles.prayerRow}><Text style={[styles.prayerName, themeColors.text, { fontSize: fontSize - 2 }]}>المغرب</Text><Text style={[styles.prayerTime, themeColors.text, { fontSize: fontSize - 2 }]}>{formatArabicNumbers(timings.Maghrib)}</Text></View>
              <View style={styles.prayerRow}><Text style={[styles.prayerName, themeColors.text, { fontSize: fontSize - 2 }]}>العشاء</Text><Text style={[styles.prayerTime, themeColors.text, { fontSize: fontSize - 2 }]}>{formatArabicNumbers(timings.Isha)}</Text></View>
            </>
          ) : (
            <Text style={[styles.prayerTime, themeColors.text, { textAlign: 'center', fontSize: fontSize - 2 }]}>تعذر جلب المواقيت حالياً</Text>
          )}
        </View>

        {/* 2. بوصلة القبلة المزخرفة تحتيّاً */}
        <View style={[styles.qiblaContainer, themeColors.card, { alignItems: 'center', paddingVertical: 25 }]}>
          <Text style={[styles.qiblaHeader, themeColors.text, { fontSize: fontSize + 2 }]}>🧭 بوصلة القبلة المشرفة</Text>
          <Text style={[styles.qiblaDesc, themeColors.subText, { fontSize: fontSize - 3, marginBottom: 15 }]}>
            {qiblaDirection !== null ? `زاوية القبلة: ${formatArabicNumbers(qiblaDirection)}° (من موقعك الحي)` : 'جاري حساب اتجاه الكعبة...'}
          </Text>

          <View style={styles.ornateCompassOuterRing}>
            <View style={styles.ornateCompassInnerRing}>
              <View style={styles.compassCenterDot} />
              <View style={[styles.compassNeedleContainer, { transform: [{ rotate: `${needleRotation}deg` }] }]}>
                <View style={[styles.compassArrowHead, { borderBottomColor: isAligned ? '#D4A373' : '#C86D51' }]} />
                <View style={[styles.compassArrowShaft, { backgroundColor: isAligned ? '#D4A373' : '#C86D51' }]} />
              </View>
            </View>
          </View>

          <Text style={[styles.alignmentStatus, { color: isAligned ? '#D4A373' : (isDarkMode ? '#B5A290' : '#7A6B5D'), fontSize: fontSize - 2, fontWeight: 'bold', marginTop: 15 }]}>
            {isAligned ? '✨ تم استهداف القبلة بنجاح' : 'الرجاء توجيه الهاتف نحو السهم حتى يتحول للذهبي'}
          </Text>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, themeColors.card]} >
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
                <Text style={styles.closeModalBtnText}>إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}

// --- 5. SETTINGS SCREEN ---
function SettingsScreen({ isDarkMode, setIsDarkMode, hapticEnabled, setHapticEnabled, fontSize, setFontSize }: any) {
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }}>
        <HeritageArchBanner title="الإعدادات والتفضيلات" textColor={themeColors.text.color} />
        
        <View style={styles.settingRow}><Text style={[styles.settingLabel, themeColors.text, { fontSize: fontSize - 2 }]}>الوضع الداكن / الفاتح</Text><Switch value={isDarkMode} onValueChange={setIsDarkMode} /></View>
        <View style={[styles.settingRow, themeColors.card]}><Text style={[styles.settingLabel, themeColors.text, { fontSize: fontSize - 2 }]}>الاهتزاز اللمسي</Text><Switch value={hapticEnabled} onValueChange={setHapticEnabled} /></View>
        
        <View style={[styles.settingRowColumn, themeColors.card]}>
          <Text style={[styles.settingLabel, themeColors.text, { marginBottom: 10, fontSize: fontSize - 2 }]}>حجم الخط الأساسي: {formatArabicNumbers(fontSize)}</Text>
          <View style={styles.fontButtonsRow}>
            <TouchableOpacity style={[styles.fontBtn, themeColors.circleBtn]} onPress={() => setFontSize(18)}><Text style={[styles.fontBtnText, themeColors.circleText]}>١٨</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.fontBtn, themeColors.circleBtn]} onPress={() => setFontSize(22)}><Text style={[styles.fontBtnText, themeColors.circleText]}>٢٢</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.fontBtn, themeColors.circleBtn]} onPress={() => setFontSize(26)}><Text style={[styles.fontBtnText, themeColors.circleText]}>٢٦</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.fontBtn, themeColors.circleBtn]} onPress={() => setFontSize(30)}><Text style={[styles.fontBtnText, themeColors.circleText]}>٣٠</Text></TouchableOpacity>
          </View>
        </View>

        <View style={[styles.settingRowColumn, themeColors.card]}>
          <Text style={[styles.settingLabel, themeColors.text, { marginBottom: 8, fontSize: fontSize - 2 }]}>سياسة الخصوصية</Text>
          <Text style={[styles.policyText, themeColors.subText, { fontSize: fontSize - 4 }]}>هذا التطبيق لا يجمع أي بيانات شخصية للمستخدمين. جميع العدادات والتفضيلات تُحفظ محلياً لضمان الخصوصية التامة.</Text>
        </View>
      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}

// --- MAIN APP WITH TABS ---
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [fontSize, setFontSize] = useState(22);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ navigation }: any) => ({
          headerStyle: { backgroundColor: isDarkMode ? '#1E1B18' : '#FBF9F5' },
          headerTintColor: isDarkMode ? '#D4A373' : '#6F4E37',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('الإعدادات')} 
              style={{ marginRight: 15 }}
            >
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
          ),
          tabBarStyle: { backgroundColor: isDarkMode ? '#1E1B18' : '#FBF9F5', borderTopColor: isDarkMode ? '#3A322A' : '#E6DCCH', height: 60, paddingBottom: 8 },
          tabBarActiveTintColor: '#D4A373',
          tabBarInactiveTintColor: isDarkMode ? '#8C7A6B' : '#8C7A6B',
        })}
      >
        <Tab.Screen name="الرئيسية" options={{ title: 'الرئيسية', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> }}>
          {(props) => <HomeScreen {...props} isDarkMode={isDarkMode} hapticEnabled={hapticEnabled} fontSize={fontSize} />}
        </Tab.Screen>
        <Tab.Screen name="الأذكار" options={{ title: 'الأذكار', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📖</Text> }}>
          {(props) => <LibraryStack isDarkMode={isDarkMode} hapticEnabled={hapticEnabled} fontSize={fontSize} />}
        </Tab.Screen>
        <Tab.Screen name="السبحة" options={{ title: 'السبحة', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📿</Text> }}>
          {(props) => <SebhaScreen isDarkMode={isDarkMode} hapticEnabled={hapticEnabled} fontSize={fontSize} />}
        </Tab.Screen>
        <Tab.Screen name="القبلة" options={{ title: 'القبلة والصلاة', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🕋</Text> }}>
          {(props) => <PrayerTimesScreen isDarkMode={isDarkMode} fontSize={fontSize} hapticEnabled={hapticEnabled} />}
        </Tab.Screen>
        <Tab.Screen name="الإعدادات" options={{ tabBarButton: () => null, title: 'الإعدادات' }}>
          {(props) => <SettingsScreen {...props} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} hapticEnabled={hapticEnabled} setHapticEnabled={setHapticEnabled} fontSize={fontSize} setFontSize={setFontSize} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function LibraryStack({ isDarkMode, hapticEnabled, fontSize }: any) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryMain">
        {(props) => <LibraryScreen {...props} isDarkMode={isDarkMode} hapticEnabled={hapticEnabled} fontSize={fontSize} />}
      </Stack.Screen>
      <Stack.Screen name="DhikrList" component={DhikrListScreen} />
    </Stack.Navigator>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  canvasContainer: { flex: 1, width: '100%', height: '100%' },
  heritageArchContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  heritageArchShape: {
    borderWidth: 1.5,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#D4A373',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  heritageArchTitleText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  locationCard: {
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#D4A37344',
  },
  locationTitle: {},
  locationNameText: {},
  changeCityBtn: {
    backgroundColor: '#D4A373',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  changeCityBtnText: {
    color: '#1E1B18',
    fontWeight: 'bold',
    fontSize: 13,
  },
  timeModeCard: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#D4A37344',
  },
  timeModeLabel: {
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  timeModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeModeBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 163, 115, 0.15)',
    alignItems: 'center',
  },
  timeModeBtnActive: {
    backgroundColor: '#D4A373',
  },
  timeModeBtnText: {
    fontWeight: 'bold',
    color: '#9E6D3B',
  },
  timeModeBtnTextActive: {
    color: '#1E1B18',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 22,
    maxHeight: '60%',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  cityOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4A37322',
  },
  cityOptionText: {
    textAlign: 'right',
  },
  closeModalBtn: {
    marginTop: 15,
    backgroundColor: '#C86D51',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  centerScreen: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 10, alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontWeight: 'bold' },
  mainHeaderCard: { padding: 22, borderRadius: 28, alignItems: 'center', marginBottom: 15, borderWidth: 1.5, borderColor: '#D4A37344' },
  clockText: { fontWeight: 'bold', marginBottom: 5 },
  dateText: { marginBottom: 3 },
  hijriText: { fontWeight: '600' },
  verseCard: { padding: 20, borderRadius: 28, marginBottom: 15, borderWidth: 1.5, borderColor: '#D4A37344' },
  verseBadgeTitle: { fontWeight: 'bold', marginBottom: 8 },
  verseText: { textAlign: 'right' },
  tasbeehCard: { padding: 22, borderRadius: 28, alignItems: 'center', marginBottom: 15, borderWidth: 1.5, borderColor: '#D4A37344' },
  tasbeehTitle: { fontWeight: 'bold', marginBottom: 4 },
  tasbeehWords: { marginBottom: 15 },
  tasbeehCircle: { justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },
  tasbeehNumber: { fontWeight: 'bold' },
  tasbeehTapLabel: { marginTop: 2, fontWeight: '600' },
  resetTasbeehBtn: { marginTop: 12 },
  resetTasbeehText: { color: '#C86D51' },
  nameCard: { padding: 20, borderRadius: 28, alignItems: 'center', marginBottom: 15, borderWidth: 1.5, borderColor: '#D4A37344' },
  nameCardHeader: { fontWeight: 'bold', marginBottom: 5 },
  allahName: { fontWeight: 'bold', marginBottom: 4 },
  allahMeaning: { textAlign: 'center' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  gridItem: { width: '48%', padding: 20, borderRadius: 28, alignItems: 'center', marginBottom: 15, borderWidth: 1.5, borderColor: '#D4A37344' },
  gridEmoji: { fontSize: 28, marginBottom: 8 },
  gridTitle: { fontWeight: 'bold' },
  menuContainer: { paddingHorizontal: 5 },
  menuCard: { padding: 20, borderRadius: 28, marginBottom: 15, borderWidth: 1.5, borderColor: '#D4A37344' },
  menuTitle: { fontWeight: 'bold', marginBottom: 5 },
  menuSubtitle: {},
  card: { borderRadius: 28, marginBottom: 15, borderWidth: 1.5, borderColor: '#D4A37344' },
  dhikrText: { textAlign: 'right', marginBottom: 12 },
  rewardText: { textAlign: 'right', marginBottom: 12, fontStyle: 'italic' },
  counterBadge: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 18, alignSelf: 'flex-start' },
  counterText: { fontWeight: 'bold' },
  completionContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, padding: 20 },
  completionEmoji: { fontSize: 55, marginBottom: 15 },
  completionTitle: { fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  completionSubtitle: { textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  resetButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 22 },
  resetButtonText: { fontWeight: 'bold' },
  sebhaLabel: { fontWeight: 'bold', marginBottom: 30 },
  bigSebhaCircle: { justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  bigSebhaNumber: { fontWeight: 'bold' },
  bigSebhaHint: { marginTop: 4, fontWeight: '600' },
  resetSebhaBtn: { marginTop: 40, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 18 },
  resetSebhaText: { color: '#C86D51', fontWeight: 'bold' },
  prayerCard: { padding: 22, borderRadius: 28, marginBottom: 15, borderWidth: 1.5, borderColor: '#D4A37344' },
  prayerTitle: { fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  prayerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  prayerName: {},
  prayerTime: { fontWeight: 'bold' },
  qiblaContainer: { padding: 22, borderRadius: 28, alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderColor: '#D4A37344' },
  qiblaHeader: { fontWeight: 'bold', marginBottom: 8 },
  qiblaDesc: { textAlign: 'center', lineHeight: 20 },
  errorText: { color: '#C86D51', textAlign: 'center', marginBottom: 10 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 28, marginBottom: 12, borderWidth: 1.5, borderColor: '#D4A37344' },
  settingRowColumn: { padding: 20, borderRadius: 28, marginBottom: 12, borderWidth: 1.5, borderColor: '#D4A37344' },
  settingLabel: { fontWeight: '600' },
  fontButtonsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },
  fontBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14 },
  fontBtnText: { fontWeight: 'bold' },
  policyText: { lineHeight: 22 },
  
  ornateCompassOuterRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#D4A373',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 163, 115, 0.08)',
    marginVertical: 10,
    shadowColor: '#D4A373',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  ornateCompassInnerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 163, 115, 0.5)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassCenterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D4A373',
    position: 'absolute',
    zIndex: 2,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  compassNeedleContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  compassArrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: 15,
  },
  compassArrowShaft: {
    width: 3.5,
    height: 50,
    position: 'absolute',
    top: 35,
    borderRadius: 2,
  },
  alignmentStatus: {
    textAlign: 'center',
  },
});

const heritageDarkTheme = {
  card: { backgroundColor: '#28231F', borderWidth: 1.5, borderColor: '#D4A37333' },
  text: { color: '#F4EADF' },
  subText: { color: '#B5A290' },
  accentText: { color: '#D4A373' },
  badge: { backgroundColor: '#3A322A' },
  counterText: { color: '#D4A373' },
  circleBtn: { backgroundColor: '#D4A373' },
  circleText: { color: '#1E1B18' },
  circleSubText: { color: '#4A3B2C' },
};

const heritageLightTheme = {
  card: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, borderWidth: 1.5, borderColor: '#D4A37344' },
  text: { color: '#332922' },
  subText: { color: '#7A6B5D' },
  accentText: { color: '#9E6D3B' },
  badge: { backgroundColor: '#F4ECE1' },
  counterText: { color: '#9E6D3B' },
  circleBtn: { backgroundColor: '#D4A373' },
  circleText: { color: '#FFFFFF' },
  circleSubText: { color: '#FAF6F0' },
};