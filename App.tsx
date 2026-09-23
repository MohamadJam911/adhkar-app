import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Appearance, ColorSchemeName } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer, DefaultTheme as NavDefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeContext } from './src/theme/ThemeContext';
import type { ThemeMode } from './src/theme/ThemeContext';
import { AnimatedSplash } from './src/components/AnimatedSplash';
import { MainTabs } from './src/navigation/MainTabs';
import { StatsScreen } from './src/screens/StatsScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { syncUncheckedPrayersToQada } from './src/utils/prayerLogic';
import { checkAndMaybeShowRatePrompt } from './src/utils/rateApp';

import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const RootStack = createNativeStackNavigator();

function AppRoot() {
  // نستخدم Appearance مباشرة (بدل الاعتماد فقط على useColorScheme) لأن بعض بيئات
  // Expo Go على iOS لا تُحدّث الـ hook بشكل موثوق عند تغيّر وضع النظام أو عند
  // الإقلاع الأول. هذا لا يحل مشكلة عدم اكتشاف الوضع الداكن أصلاً إن كانت ناتجة
  // عن إعداد app.json (راجع الشرح المرفق)، لكنه يضمن تحديث الواجهة فوراً بمجرد
  // أن يُبلغ النظام عن أي تغيير.
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName | null | undefined>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [fontSize, setFontSize] = useState(22);
  const [appIsReady, setAppIsReady] = useState(false);

  const isDarkMode = themeMode === 'auto' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('@user_theme_mode', mode);
  };

  useEffect(() => {
    async function prepare() {
      try {
        Notifications.requestPermissionsAsync();
        const savedTheme = await AsyncStorage.getItem('@user_theme_mode');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
          setThemeModeState(savedTheme as ThemeMode);
        }
        await syncUncheckedPrayersToQada();
        // مدة ظهور السبلاش المخصص: خفّضناها حتى تحس فيها أسرع (كانت 1800، صارت
        // 700) بس لسا كافية إنه حركة التكبير/التلاشي فوق تخلص وتنعرض بشكل
        // واضح قبل ما ننتقل للتطبيق. عدّل الرقم هون إذا بدك أطول/أقصر.
        await new Promise(resolve => setTimeout(resolve, 700));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // فحص "قيّم التطبيق" بعد ما تجهز الواجهة وتستقر (تأخير بسيط حتى ما يظهر
  // التذكير فوق حركة الانتقال من السبلاش)، وبيحترم عداد الفتحات وقرار
  // المستخدم المحفوظين محلياً (راجع checkAndMaybeShowRatePrompt فوق).
  useEffect(() => {
    if (!appIsReady) return;
    const timer = setTimeout(() => {
      checkAndMaybeShowRatePrompt();
    }, 1500);
    return () => clearTimeout(timer);
  }, [appIsReady]);

  if (!appIsReady) {
    // سبلاش مخصص بـ JavaScript يبلش من نفس شكل الأيقونة الصغيرة يلي يورّيها
    // نظام أندرويد 12+ (قيد نظام تشغيل ما فيه طريقة نلغيه بالكود) وبيكبّرها
    // تدريجياً لحد ما توصل لصورة السبلاش الفنية كاملة الشاشة — أنظر تعريف
    // AnimatedSplash فوق لتفاصيل الحركة.
    return <AnimatedSplash />;
  }

  // لون خلفية الشاشة الأساسي بكل مظهر (نفس أول لون بتدرّج ExactImagePatternWall
  // تقريباً) — منستخدمه هون كخلفية رسمية للتنقّل (Navigation) حتى ما يبين ولا
  // ومضة رمادية افتراضية من react-navigation وقت التنقّل بين الشاشات أو لحظة
  // انتهاء شاشة السبلاش (لأنه بدون هالإعداد، react-navigation بيستخدم لون
  // خلفية افتراضي رمادي فاتح مش متل ألوان التطبيق أبداً).
  const screenBgColor = isDarkMode ? '#14110E' : '#F9F4EC';
  const navTheme = {
    ...(isDarkMode ? NavDarkTheme : NavDefaultTheme),
    colors: {
      ...(isDarkMode ? NavDarkTheme : NavDefaultTheme).colors,
      background: screenBgColor,
      card: screenBgColor,
    },
  };

  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={{ isDarkMode, themeMode, setThemeMode }}>
        <View style={{ flex: 1, backgroundColor: screenBgColor }}>
          <NavigationContainer theme={navTheme}>
            <RootStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: screenBgColor } }}>
  <RootStack.Screen name="MainTabs">
    {(props) => <MainTabs {...props} hapticEnabled={hapticEnabled} fontSize={fontSize} setHapticEnabled={setHapticEnabled} setFontSize={setFontSize} />}
  </RootStack.Screen>
  <RootStack.Screen 
    name="StatsScreen" 
    options={{ headerShown: false }}
  >
    {(props) => <StatsScreen {...props} route={{ params: { fontSize } }} />}
  </RootStack.Screen>

  {/* 👈 هذه هي الشاشة التي كانت ناقصة */}
  <RootStack.Screen 
    name="PrivacyPolicy" 
    options={{ 
      headerShown: true, 
      title: 'سياسة الخصوصية وبنود الاستخدام',
      headerStyle: { backgroundColor: isDarkMode ? '#1E1B18' : '#FBF9F5' },
      headerTintColor: isDarkMode ? '#D4A373' : '#6F4E37',
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: isDarkMode ? '#14110E' : '#EFE7DA' }
    }}
    component={PrivacyPolicyScreen}
  />

  <RootStack.Screen
    name="AboutScreen"
    options={{
      headerShown: true,
      title: 'عن التطبيق',
      headerStyle: { backgroundColor: isDarkMode ? '#1E1B18' : '#FBF9F5' },
      headerTintColor: isDarkMode ? '#D4A373' : '#6F4E37',
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: isDarkMode ? '#14110E' : '#EFE7DA' }
    }}
    component={AboutScreen}
  />

  <RootStack.Screen
    name="الإعدادات"
    options={{ 
      headerShown: true, 
      title: 'الإعدادات',
      headerStyle: { backgroundColor: isDarkMode ? '#1E1B18' : '#FBF9F5' },
      headerTintColor: isDarkMode ? '#D4A373' : '#6F4E37',
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: isDarkMode ? '#14110E' : '#EFE7DA' }
    }}
  >
    {(props) => <SettingsScreen {...props} hapticEnabled={hapticEnabled} setHapticEnabled={setHapticEnabled} fontSize={fontSize} setFontSize={setFontSize} />}
  </RootStack.Screen>
</RootStack.Navigator>
          </NavigationContainer>
        </View>
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}

// ==========================================
// 🛟 شبكة أمان: لو صار خطأ برمجي غير متوقع بأي مكان بشجرة التطبيق (بيانات
// تالفة، حالة غير متوقعة...)، بدل ما يشوف المستخدم شاشة بيضاء/سودة فاضية
// بلا تفسير (سلوك React الافتراضي لأي خطأ غير مُعالَج بالعرض)، بيشوف رسالة
// ودية بالعربي مع زر "إعادة المحاولة" يرجّع يحاول يعرض التطبيق من جديد
// بدون ما يحتاج يقفل التطبيق ويفتحه. لازم يكون Class Component لأن React
// لسا ما بيدعم Error Boundaries بالـ function components (useState وحده
// ما بيقدر يلتقط أخطاء العرض لأولاده).
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.warn('حصل خطأ غير متوقع بالتطبيق:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <View
            style={{
              flex: 1,
              backgroundColor: '#12241F',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 28,
            }}
          >
            <Text style={{ fontSize: 42, marginBottom: 16 }}>🌙</Text>
            <Text style={{ color: '#F5EFE3', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
              حدث خطأ غير متوقع
            </Text>
            <Text style={{ color: '#D9CBB8', fontSize: 15, textAlign: 'center', marginBottom: 26, lineHeight: 22 }}>
              نعتذر، حدثت مشكلة بسيطة في التطبيق. يرجى الضغط على "إعادة المحاولة"، وإذا استمرت المشكلة فأغلق التطبيق وأعد فتحه.
            </Text>
            <TouchableOpacity
              onPress={this.handleRetry}
              activeOpacity={0.8}
              style={{ backgroundColor: '#D4A373', paddingVertical: 13, paddingHorizontal: 30, borderRadius: 16 }}
            >
              <Text style={{ color: '#1E1B18', fontWeight: 'bold', fontSize: 16 }}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaProvider>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppRoot />
    </AppErrorBoundary>
  );
}