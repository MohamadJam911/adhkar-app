import React, { useContext } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { ExactImagePatternWall, HeritageArchBanner } from '../components/Decorative';
import { TERMS_OF_SERVICE_TEXT } from '../data/termsOfService';
import { PRIVACY_POLICY_TEXT } from '../data/privacyPolicy';

function PrivacyPolicyScreen({ route }: { route: any }) {
  const { fontSize } = route.params || { fontSize: 22 };
  const { isDarkMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <HeritageArchBanner title="سياسة الخصوصية وبنود الاستخدام" textColor={themeColors.text.color} isDarkMode={isDarkMode} />
        
        <View style={[styles.card, themeColors.card, { padding: 18, marginBottom: 20 }]}>
          <Text style={[themeColors.accentText, { fontWeight: 'bold', fontSize: fontSize, marginBottom: 10, textAlign: 'right' }]}>
            بنود الاستخدام
          </Text>
          <Text style={[themeColors.text, { fontSize: fontSize - 3, lineHeight: 26, textAlign: 'right', marginBottom: 20 }]}>
            {TERMS_OF_SERVICE_TEXT}
          </Text>

          <View style={{ borderTopWidth: 1, borderColor: 'rgba(212,163,115,0.3)', paddingTop: 20, marginTop: 10 }}>
            <Text style={[themeColors.accentText, { fontWeight: 'bold', fontSize: fontSize, marginBottom: 10, textAlign: 'right' }]}>
              سياسة الخصوصية
            </Text>
            <Text style={[themeColors.text, { fontSize: fontSize - 3, lineHeight: 26, textAlign: 'right' }]}>
              {PRIVACY_POLICY_TEXT}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ExactImagePatternWall>
  );
}

export { PrivacyPolicyScreen };
