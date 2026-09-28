import React, { useContext } from 'react';
import Animated from 'react-native-reanimated';
import { Text, View, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { ThemeContext } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { ExactImagePatternWall, HeritageArchBanner, useBackgroundScroll } from '../components/Decorative';
import { openStoreForRating } from '../utils/rateApp';

// ==========================================
// ℹ️ شاشة "عن التطبيق": أيقونة ورقم الإصدار (مسحوب مباشرة من app.json عبر
// expo-constants حتى ما يحتاج تحديث يدوي بكل نسخة)، نبذة قصيرة عن التطبيق،
// زر تواصل معنا (نفس إيميل التواصل بالصفحة الرئيسية)، ورابط لسياسة الخصوصية.
function AboutScreen({ route, navigation }: { route: any; navigation: any }) {
  const { fontSize } = route.params || { fontSize: 22 };
  const { isDarkMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const openContactEmail = () => {
    Linking.openURL(`mailto:masra.al.rasul.app@gmail.com?subject=${encodeURIComponent('تواصل من مستخدم تطبيق مسرى المسلم')}`);
  };

  // parallax: بيحرّك نقش الخلفية مع التمرير (خيار الخلفية ٣)
  const bgScroll = useBackgroundScroll();

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.ScrollView contentContainerStyle={{ padding: 20 }} onScroll={bgScroll} scrollEventThrottle={16}>
        <HeritageArchBanner title="عن التطبيق" textColor={themeColors.text.color} isDarkMode={isDarkMode} />

        <View style={[styles.card, themeColors.card, { padding: 22, alignItems: 'center', marginBottom: 16 }]}>
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: 84, height: 84, borderRadius: 20, marginBottom: 12 }}
            resizeMode="cover"
          />
          <Text style={[themeColors.text, { fontSize: fontSize + 4, fontWeight: 'bold', marginBottom: 4 }]}>
            مسرى المسلم
          </Text>
          <Text style={[themeColors.subText, { fontSize: fontSize - 4, marginBottom: 4 }]}>
            الإصدار {appVersion}
          </Text>
          <Text style={[themeColors.subText, { fontSize: fontSize - 7, marginBottom: 14, letterSpacing: 0.3 }]}>
            Powered by Mohamad Jammal
          </Text>
           <Text style={[themeColors.subText, { fontSize: fontSize - 7, marginBottom: 14, letterSpacing: 0.3 }]}>
            Ass: Aiham Jabareen
          </Text>
          <Text style={[themeColors.text, { fontSize: fontSize - 3, textAlign: 'center', lineHeight: 24 }]}>
            تطبيق يومي يجمع أذكار الصباح والمساء، مواقيت الصلاة والقبلة، التسبيح، وآيات وأحاديث مختارة — رفيقك لذكر الله في يومك.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.settingRow, themeColors.card, { paddingVertical: 18, marginBottom: 12 }]}
          onPress={() => {
            AsyncStorage.setItem('@rate_prompt_status', 'rated');
            openStoreForRating();
          }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18, color: '#D4A373', fontWeight: 'bold' }}>‹</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.settingLabel, themeColors.text, { fontSize: fontSize - 2, fontWeight: 'bold' }]}>
              ⭐ قيّم التطبيق
            </Text>
            <Text style={[themeColors.subText, { fontSize: fontSize - 6, marginTop: 2 }]}>
              تقييمك يدعمنا ويساعد على وصول التطبيق.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, themeColors.card, { paddingVertical: 18, marginBottom: 12 }]}
          onPress={openContactEmail}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18, color: '#D4A373', fontWeight: 'bold' }}>‹</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.settingLabel, themeColors.text, { fontSize: fontSize - 2, fontWeight: 'bold' }]}>
              تواصل معنا
            </Text>
            <Text style={[themeColors.subText, { fontSize: fontSize - 6, marginTop: 2 }]}>
              masra.al.rasul.app@gmail.com
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, themeColors.card, { paddingVertical: 18 }]}
          onPress={() => navigation.navigate('PrivacyPolicy', { fontSize })}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18, color: '#D4A373', fontWeight: 'bold' }}>‹</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.settingLabel, themeColors.text, { fontSize: fontSize - 2, fontWeight: 'bold' }]}>
              سياسة الخصوصية وبنود الاستخدام
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={[themeColors.subText, { textAlign: 'center', fontSize: fontSize - 6, marginTop: 26, lineHeight: 20 }]}>
          صُمم بنية خالصة لله، نسأل الله أن ينفع به. جزيتم خيراً.
        </Text>
      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}

export { AboutScreen };