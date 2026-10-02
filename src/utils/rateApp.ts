import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

// ==========================================
// "Rate the app": a direct link to the store page plus a gentle prompt shown
// once after the 5th launch (never on the first one). The user's choice is
// respected: after "Rate now" or "No thanks" it never asks again, and
// "Remind me later" asks again after 10 more launches.
const ANDROID_PACKAGE_NAME = 'com.mohamad.masra';
// The app's Apple ID in App Store Connect (App Information)
const IOS_APP_STORE_ID = '6817377040';

const RATE_PROMPT_LAUNCH_THRESHOLD = 5;
const RATE_PROMPT_SNOOZE_GAP = 10;

// Linking.canOpenURL is not used: on iOS it returns false for itms-apps unless
// declared in LSApplicationQueriesSchemes, and on Android 11+ for market://
// unless declared in <queries>. We try to open directly and fall back on failure.
const openStoreForRating = async () => {
  try {
    if (Platform.OS === 'ios') {
      if (IOS_APP_STORE_ID) {
        await Linking.openURL(`itms-apps://itunes.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`);
        return;
      }
      // Without a store ID: Apple's native review prompt (works without one)
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
        return;
      }
      Alert.alert('قريباً بإذن الله', 'لم يُنشر التطبيق بعد على متجر آيفون، ترقّبوا الإطلاق قريباً!');
      return;
    }

    try {
      await Linking.openURL(`market://details?id=${ANDROID_PACKAGE_NAME}`);
    } catch {
      // If the Play Store app itself is missing (rare), open the web page
      await Linking.openURL(`https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`);
    }
  } catch (e) {
    Alert.alert('تعذّر فتح المتجر', 'يرجى المحاولة لاحقاً.');
  }
};

// Runs once per launch (from prepare() in App) and respects the choice stored
// on the device — nothing is sent or collected.
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
    // Rating is optional — any error here is ignored without affecting the app
  }
};


export { openStoreForRating, checkAndMaybeShowRatePrompt };