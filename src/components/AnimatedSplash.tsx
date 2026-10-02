import React, { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

// Splash background — exactly the app icon's background colour and the
// native splash colour in app.json, so there is no visible colour jump
// between the icon and the splash.
const SPLASH_BG_COLOR = '#12241F';

// Animated splash: Android 12+ always shows a small icon in the centre at
// launch (an OS behaviour that cannot be disabled). Instead of fighting it,
// the native splash icon is the app icon itself, and this splash starts the
// full splash art at roughly the icon's size and scales it up with a fade-in
// until it fills the screen — one continuous motion instead of a hard cut.
// Built with useSharedValue + useAnimatedStyle + withTiming, like DhikrPulseCard.
//
// The native splash is hidden as soon as this component has laid out
// (onLayout), not when the app is ready — otherwise the native splash covered
// this animation for its whole duration on release builds and it was never seen.
const AnimatedSplash = () => {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const hasHiddenNativeSplash = useRef(false);

  useEffect(() => {
    scale.value = withDelay(60, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
    opacity.value = withDelay(60, withTiming(1, { duration: 320 }));
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handleLayout = useCallback(() => {
    if (!hasHiddenNativeSplash.current) {
      hasHiddenNativeSplash.current = true;
      SplashScreen.hideAsync();
    }
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: SPLASH_BG_COLOR, justifyContent: 'center', alignItems: 'center' }}
      onLayout={handleLayout}
    >
      {/* "cover", not "contain": the art is tall and narrow (862×1825), so on iPad
          "contain" left ~300pt green bars on the sides. "cover" scales ~2–5% on
          phones and ~1.5× on iPad, cropping only the arch top and the carpet. */}
      <Animated.Image
        source={require('../../assets/splash.png')}
        resizeMode="cover"
        style={[{ width: '100%', height: '100%' }, animatedImageStyle]}
      />
    </View>
  );
};


export { AnimatedSplash };
