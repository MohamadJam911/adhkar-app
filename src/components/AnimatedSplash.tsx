import React, { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

// لون خلفية شاشة التحميل — مطابق تماماً للون خلفية أيقونة التطبيق نفسها
// (./assets/icon.png، مأخوذ منها بالضبط) ولنفس اللون بإعداد السبلاش الأصلي
// (Native) بـ app.json، لحتى ما تبين أي "قطة" لونية أو إحساس بصورتين
// مختلفتين وقت التبديل بين الأيقونة وشاشة التحميل.
const SPLASH_BG_COLOR = '#12241F';

// سبلاش مُتحرّك: أندرويد 12+ حتماً رح يورّي أيقونة صغيرة بمنتصف الشاشة لحظة
// إقلاع التطبيق (سلوك نظام تشغيل، ما فيه طريقة نلغيه بالكود). فبدل ما نحارب
// هالسلوك، عم نستغله: بنخلي أيقونة السبلاش الأصلية هي نفسها ./assets/icon.png
// (تعديل بـ app.json)، وهون بنبلش صورة السبلاش الكاملة من حجم صغير (قريب من
// حجم الأيقونة) وبتكبر بنعومة (scale) مع تلاشي دخول (fade in) لحد ما توصل
// لحجمها الطبيعي كامل الشاشة — فيحس المستخدم إنه فيه حركة واحدة متواصلة
// بدل قطع مفاجئ. (ملاحظة: أول نسخة كانت بتستخدم interpolate/Extrapolation
// وصورتين متراكبتين، وطلعت فيها مشكلة عرض على آيفون بالـ Expo Go — رجّعناها
// لطريقة أبسط وأكيد إنها شغالة، بنفس النمط المستخدم بانيميشن الأذكار
// (DhikrPulseCard) فوق: useSharedValue + useAnimatedStyle + withTiming.)
//
// 🛠️ ملاحظة مهمة (باغ تم اكتشافه وإصلاحه): على بناء حقيقي (EAS Build/APK)
// كان الـ SplashScreen.hideAsync() بينستدعى بس لما تجهز الشاشة الرئيسية
// (appIsReady = true)، يعني السبلاش الأصلي (Native) كان ضل غاطي الشاشة كاملة
// طول فترة ظهور AnimatedSplash (كانت عم تشتغل وتتحرك "تحت" السبلاش الأصلي
// بدون ما يشوفها المستخدم أبداً!) ولما أخيراً يختفي السبلاش الأصلي، كانت
// الشاشة الرئيسية جاهزة أصلاً فبيبين التطبيق مباشرة — وهيك AnimatedSplash ما
// كانت تبين إطلاقاً. الحل: نخفي السبلاش الأصلي فور ما AnimatedSplash نفسها
// تخلص أول رسمة (onLayout)، مش لما التطبيق الرئيسي يجهز.
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
      {/* cover (مش contain): الصورة طويلة وضيّقة (862×1825)، فعلى الآيباد
          (شاشة أعرض) contain كانت بتترك فراغ أخضر ~٣٠٠ نقطة عالجانبين. cover
          بتكبّر لحد ما تغطي الشاشة كلها — على الجوالات التكبير ٢-٥٪ بس، وعلى
          الآيباد ~١.٥× بيقصّ شوي من فوق (رأس القوس) وتحت (السجادة)، والعنوان
          وقبة الصخرة بالنص بيضلّوا ظاهرين كاملين. */}
      <Animated.Image
        source={require('../../assets/splash.png')}
        resizeMode="cover"
        style={[{ width: '100%', height: '100%' }, animatedImageStyle]}
      />
    </View>
  );
};


export { AnimatedSplash };
