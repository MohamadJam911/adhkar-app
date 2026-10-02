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
import { syncUncheckedPrayersToQada, updateHomeScreenWidgets } from './src/utils/prayerLogic';
import { checkAndMaybeShowRatePrompt } from './src/utils/rateApp';
import { refreshAppNotifications } from './src/services/notificationService';
import { DEFAULT_FONT_SIZE, loadFontSize, loadHapticsEnabled, saveFontSize, saveHapticsEnabled } from './src/services/appPreferences';

import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const RootStack = createNativeStackNavigator();

function AppRoot() {
  // Read Appearance directly (not only useColorScheme), because the hook does
  // not always update reliably on iOS at first launch or when the system
  // theme changes; this keeps the UI in sync as soon as the system reports a change.
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
  const [hapticEnabled, setHapticEnabledState] = useState(true);
  const [fontSize, setFontSizeState] = useState(DEFAULT_FONT_SIZE);
  const [appIsReady, setAppIsReady] = useState(false);

  const isDarkMode = themeMode === 'auto' ? systemColorScheme === 'dark' : themeMode === 'dark';

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('@user_theme_mode', mode);
  };

  // Font size and haptics are saved so they survive restarts; the widgets
  // read the font size too, so they are redrawn after it changes.
  const setFontSize = async (size: number) => {
    setFontSizeState(size);
    await saveFontSize(size);
    updateHomeScreenWidgets();
  };

  const setHapticEnabled = (enabled: boolean) => {
    setHapticEnabledState(enabled);
    saveHapticsEnabled(enabled);
  };

  useEffect(() => {
    async function prepare() {
      try {
        // Once the notification permission is settled, reschedule the next days
        // with exact times (not awaited, so the splash is not delayed).
        Notifications.requestPermissionsAsync()
          .then(() => refreshAppNotifications())
          .catch(() => {});
        const savedTheme = await AsyncStorage.getItem('@user_theme_mode');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
          setThemeModeState(savedTheme as ThemeMode);
        }
        setFontSizeState(await loadFontSize());
        setHapticEnabledState(await loadHapticsEnabled());
        await syncUncheckedPrayersToQada();
        // Refresh the home-screen widgets (Android + iOS) from the saved location
        // on every launch, even if the Prayer Times screen is never opened.
        updateHomeScreenWidgets();
        // How long the custom splash stays: long enough for its zoom/fade
        // animation to finish before the app appears.
        await new Promise(resolve => setTimeout(resolve, 700));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  // "Rate the app" check once the UI has settled (a short delay so the prompt
  // never appears over the splash transition). Respects the launch counter
  // and the user's saved choice (see checkAndMaybeShowRatePrompt).
  useEffect(() => {
    if (!appIsReady) return;
    const timer = setTimeout(() => {
      checkAndMaybeShowRatePrompt();
    }, 1500);
    return () => clearTimeout(timer);
  }, [appIsReady]);

  if (!appIsReady) {
    // JavaScript splash that starts from the small icon Android 12+ always
    // shows (an OS constraint) and grows into the full-screen splash art —
    // see AnimatedSplash for the animation.
    return <AnimatedSplash />;
  }

  // Main background colour per theme (about the first colour of the
  // background gradient), used as the navigation theme background so
  // react-navigation never flashes its default light grey between screens
  // or when the splash ends.
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
            {/* 'minimal' back button: arrow only — otherwise iOS showed the internal "MainTabs" route name next to it. */}
            <RootStack.Navigator
              screenOptions={{
                headerShown: false,
                headerBackButtonDisplayMode: 'minimal',
                contentStyle: { backgroundColor: screenBgColor },
              }}
            >
  <RootStack.Screen name="MainTabs">
    {(props) => <MainTabs {...props} hapticEnabled={hapticEnabled} fontSize={fontSize} setHapticEnabled={setHapticEnabled} setFontSize={setFontSize} />}
  </RootStack.Screen>
  <RootStack.Screen 
    name="StatsScreen" 
    options={{ headerShown: false }}
  >
    {(props) => <StatsScreen {...props} route={{ params: { fontSize } }} />}
  </RootStack.Screen>

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
// Error boundary: if an unexpected error happens anywhere in the tree
// (corrupted data, unexpected state…), the user sees a friendly Arabic
// message with a "try again" button instead of a blank screen, without
// restarting the app. It must be a class component — React only supports
// error boundaries in class components.
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