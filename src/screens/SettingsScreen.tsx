import React, { useContext } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemeContext } from '../theme/ThemeContext';
import type { ThemeMode } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { ExactImagePatternWall, HeritageArchBanner, useBackgroundScroll } from '../components/Decorative';

function SettingsScreen({ hapticEnabled, setHapticEnabled, fontSize, setFontSize, navigation }: any) {
  const { isDarkMode, themeMode, setThemeMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  // parallax: بيحرّك نقش الخلفية مع التمرير (خيار الخلفية ٣)
  const bgScroll = useBackgroundScroll();

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }} onScroll={bgScroll} scrollEventThrottle={16}>
        <HeritageArchBanner title="الإعدادات والتفضيلات" textColor={themeColors.text.color} isDarkMode={isDarkMode} />
        
        {/* اختيار المظهر (فاتح / داكن / تلقائي) */}
        <View style={[styles.settingRowColumn, themeColors.card]}>
          <Text style={[styles.settingLabel, themeColors.text, { marginBottom: 12, fontSize: fontSize - 2, textAlign: 'right' }]}>المظهر</Text>
          <View style={styles.segmentedButtonsRow}>
            {[
              { label: 'تلقائي', val: 'auto' as ThemeMode },
              { label: 'فاتح', val: 'light' as ThemeMode },
              { label: 'داكن', val: 'dark' as ThemeMode },
            ].map((opt) => {
              const active = themeMode === opt.val;
              return (
                <TouchableOpacity
                  key={opt.val}
                  onPress={() => setThemeMode(opt.val)}
                  style={[
                    styles.segmentedBtn,
                    active 
                      ? { backgroundColor: '#D4A373' }
                      : { backgroundColor: isDarkMode ? '#1E1B18' : '#FAF6F0', borderWidth: 1, borderColor: 'rgba(212,163,115,0.3)' }
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentedBtnText, { color: active ? '#1E1B18' : themeColors.text.color }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* العنوان يمين والمفتاح يسار (ترتيب عربي) */}
        <View style={[styles.settingRow, themeColors.card]}>
          <Switch value={hapticEnabled} onValueChange={setHapticEnabled} />
          <Text style={[styles.settingLabel, themeColors.text, { fontSize: fontSize - 2, textAlign: 'right' }]}>الاهتزاز اللمسي</Text>
        </View>
        
        <View style={[styles.settingRowColumn, themeColors.card]}>
          <Text style={[styles.settingLabel, themeColors.text, { marginBottom: 10, fontSize: fontSize - 2, textAlign: 'right' }]}>حجم النص</Text>
          <View style={styles.fontButtonsRow}>
            <TouchableOpacity style={[styles.fontBtn, themeColors.circleBtn, fontSize === 18 && styles.activeFontBtn]} onPress={() => setFontSize(18)}><Text style={[styles.fontBtnText, themeColors.circleText]}>18</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.fontBtn, themeColors.circleBtn, fontSize === 22 && styles.activeFontBtn]} onPress={() => setFontSize(22)}><Text style={[styles.fontBtnText, themeColors.circleText]}>22</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.fontBtn, themeColors.circleBtn, fontSize === 26 && styles.activeFontBtn]} onPress={() => setFontSize(26)}><Text style={[styles.fontBtnText, themeColors.circleText]}>26</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.fontBtn, themeColors.circleBtn, fontSize === 30 && styles.activeFontBtn]} onPress={() => setFontSize(30)}><Text style={[styles.fontBtnText, themeColors.circleText]}>30</Text></TouchableOpacity>
          </View>
        </View>

        {/* 👇 الزر التفاعلي لسياسة الخصوصية وبنود الاستخدام */}
        <TouchableOpacity 
          style={[styles.settingRow, themeColors.card, { paddingVertical: 18 }]} 
          onPress={() => navigation.navigate('PrivacyPolicy', { fontSize })}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18, color: '#D4A373', fontWeight: 'bold' }}>‹</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.settingLabel, themeColors.text, { fontSize: fontSize - 2, fontWeight: 'bold' }]}>سياسة الخصوصية وبنود الاستخدام</Text>
            <Text style={[themeColors.subText, { fontSize: fontSize - 6, marginTop: 2 }]}>اطّلع على الشروط وسياسة حماية البيانات</Text>
          </View>
        </TouchableOpacity>

        {/* 👇 زر التنقل لشاشة "عن التطبيق" الجديدة */}
        <TouchableOpacity
          style={[styles.settingRow, themeColors.card, { paddingVertical: 18, marginTop: 12 }]}
          onPress={() => navigation.navigate('AboutScreen', { fontSize })}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18, color: '#D4A373', fontWeight: 'bold' }}>‹</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.settingLabel, themeColors.text, { fontSize: fontSize - 2, fontWeight: 'bold' }]}>عن التطبيق</Text>
            <Text style={[themeColors.subText, { fontSize: fontSize - 6, marginTop: 2 }]}>الإصدار، التواصل معنا، وسياسة الخصوصية</Text>
          </View>
        </TouchableOpacity>

      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}


export { SettingsScreen };
