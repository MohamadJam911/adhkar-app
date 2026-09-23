import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================
// ⭐ منطق "قيّم التطبيق": رابط مباشر لصفحة التطبيق بالمتجر + تذكير تلقائي
// لطيف يظهر مرة وحدة بعد أول 5 مرات فتح للتطبيق (مو بالفتحة الأولى مباشرة
// حتى ما يكون مزعج)، وبعدين بيحترم قرار المستخدم: لو ضغط "قيّم الآن" أو
// "لا شكراً" ما منسأله مرة تانية أبداً، ولو ضغط "ذكرني لاحقاً" منرجع نسأله
// بعد ١٠ فتحات إضافية بس.
const ANDROID_PACKAGE_NAME = 'com.mohamad.masra';
// ⚠️ التطبيق لسا مو منشور على App Store — لما ينشر، عبّي هون رقم الـ
// "Apple App ID" (بتلاقيه بصفحة التطبيق على App Store Connect بعد إنشائه)
// حتى يشتغل رابط التقييم بالآيفون صح.
const IOS_APP_STORE_ID = '';

const RATE_PROMPT_LAUNCH_THRESHOLD = 5;
const RATE_PROMPT_SNOOZE_GAP = 10;

const getStoreRatingUrl = (): string | null => {
  if (Platform.OS === 'ios') {
    if (!IOS_APP_STORE_ID) return null;
    return `itms-apps://itunes.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`;
  }
  return `market://details?id=${ANDROID_PACKAGE_NAME}`;
};

const openStoreForRating = async () => {
  const url = getStoreRatingUrl();
  if (!url) {
    Alert.alert('قريباً بإذن الله', 'لم يُنشر التطبيق بعد على متجر آيفون، ترقّبوا الإطلاق قريباً!');
    return;
  }
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else if (Platform.OS === 'android') {
      // لو تطبيق Play Store نفسه مش مثبت على الجهاز (نادر)، نفتح الرابط بالمتصفح
      await Linking.openURL(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`);
    } else {
      await Linking.openURL(`https://apps.apple.com/app/id${IOS_APP_STORE_ID}`);
    }
  } catch (e) {
    Alert.alert('تعذّر فتح المتجر', 'يرجى المحاولة لاحقاً.');
  }
};

// بتنحسب مرة وحدة بكل إقلاع للتطبيق (من prepare() بـ App())، وبتحترم قرار
// المستخدم المحفوظ محلياً — ما بترسل ولا بتجمع أي بيانات، كله على الجهاز.
const checkAndMaybeShowRatePrompt = async () => {
  try {
    const countStr = await AsyncStorage.getItem('@app_launch_count');
    const launchCount = (countStr ? parseInt(countStr, 10) : 0) + 1;
    await AsyncStorage.setItem('@app_launch_count', String(launchCount));

    const status = await AsyncStorage.getItem('@rate_prompt_status');
    if (status === 'rated' || status === 'declined') return;

    const nextAtStr = await AsyncStorage.getItem('@rate_prompt_next_at');
    const nextAt = nextAtStr ? parseInt(nextAtStr, 10) : RATE_PROMPT_LAUNCH_THRESHOLD;
    if (launchCount < nextAt) return;

    Alert.alert(
      'قيّم تطبيق مسرى المسلم 🌿',
      'إذا أعجبك التطبيق، فإن تقييمك يدعمنا كثيراً ويوصل التطبيق لأشخاص أكثر — لن يأخذ منك أكثر من دقيقة 🤍',
      [
        {
          text: 'لا شكراً',
          style: 'cancel',
          onPress: () => { AsyncStorage.setItem('@rate_prompt_status', 'declined'); },
        },
        {
          text: 'ذكرني لاحقاً',
          onPress: () => { AsyncStorage.setItem('@rate_prompt_next_at', String(launchCount + RATE_PROMPT_SNOOZE_GAP)); },
        },
        {
          text: 'قيّم الآن',
          onPress: () => {
            AsyncStorage.setItem('@rate_prompt_status', 'rated');
            openStoreForRating();
          },
        },
      ],
      { cancelable: true }
    );
  } catch (e) {
    // التقييم ميزة إضافية غير أساسية — أي خطأ هون بنتجاهله بصمت وما بنوقف التطبيق
  }
};


export { openStoreForRating, checkAndMaybeShowRatePrompt };