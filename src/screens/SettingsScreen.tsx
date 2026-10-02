import React, { useContext, useEffect, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemeContext } from '../theme/ThemeContext';
import type { ThemeMode } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { ExactImagePatternWall, HeritageArchBanner, useBackgroundScroll } from '../components/Decorative';
import {
  DEFAULT_WIDGET_FONT_SIZE,
  WIDGET_FONT_SIZE_OPTIONS,
  loadWidgetFontPreference,
  saveWidgetFontPreference,
  type WidgetFontPreference,
} from '../services/appPreferences';
import { updateHomeScreenWidgets } from '../utils/prayerLogic';

function SettingsScreen({ hapticEnabled, setHapticEnabled, fontSize, setFontSize, navigation }: any) {
  const { isDarkMode, themeMode, setThemeMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  // Parallax: moves the background pattern with scrolling (background option 'girih')
  const bgScroll = useBackgroundScroll();

  // Widget text size: automatic (follows the app's text size) or a fixed size
  const [widgetFont, setWidgetFont] = useState<WidgetFontPreference>({ auto: true, size: DEFAULT_WIDGET_FONT_SIZE });
  useEffect(() => {
    loadWidgetFontPreference().then(setWidgetFont);
  }, []);

  const changeWidgetFont = async (pref: WidgetFontPreference) => {
    setWidgetFont(pref);
    await saveWidgetFontPreference(pref);
    updateHomeScreenWidgets();
  };

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }} onScroll={bgScroll} scrollEventThrottle={16}>
        <HeritageArchBanner title="الإعدادات والتفضيلات" textColor={themeColors.text.color} isDarkMode={isDarkMode} />
        
        {/* Appearance (light / dark / automatic) */}
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

        {/* Title on the right, switch on the left (Arabic layout) */}
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

        {/* Widget text size: automatic, or a fixed size chosen below */}
        <View style={[styles.settingRowColumn, themeColors.card]}>
          <Text style={[styles.settingLabel, themeColors.text, { marginBottom: 10, fontSize: fontSize - 2, textAlign: 'right' }]}>حجم خط الويدجت</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Switch value={widgetFont.auto} onValueChange={(auto) => changeWidgetFont({ ...widgetFont, auto })} />
            <View style={{ flex: 1, alignItems: 'flex-end', marginLeft: 10 }}>
              <Text style={[themeColors.text, { fontSize: fontSize - 4, textAlign: 'right' }]}>تلقائي</Text>
              <Text style={[themeColors.subText, { fontSize: fontSize - 7, textAlign: 'right', marginTop: 2 }]}>حسب حجم نص التطبيق</Text>
            </View>
          </View>
          {!widgetFont.auto && (
            <View style={[styles.fontButtonsRow, { marginTop: 14 }]}>
              {WIDGET_FONT_SIZE_OPTIONS.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[styles.fontBtn, themeColors.circleBtn, widgetFont.size === size && styles.activeFontBtn]}
                  onPress={() => changeWidgetFont({ auto: false, size })}
                  accessibilityLabel={`حجم خط الويدجت ${size}`}
                >
                  <Text style={[styles.fontBtnText, themeColors.circleText]}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Privacy policy and terms */}
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

        {/* About screen */}
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
