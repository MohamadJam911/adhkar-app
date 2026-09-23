import React, { useContext } from 'react';
import { Text, View, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemeContext } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { ExactImagePatternWall, HeritageArchBanner, SeniorBackArrow } from '../components/Decorative';
import { ALLAH_NAMES } from '../data/allahNamesData';

function AllahNamesListScreen({ navigation, route }: { navigation: any, route: any }) {
  const { fontSize } = route.params || { fontSize: 22 };
  const { isDarkMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }}>
        <SeniorBackArrow onPress={() => navigation.goBack()} isDarkMode={isDarkMode} />
        <HeritageArchBanner title="أسماء الله الحسنى" textColor={themeColors.text.color} isDarkMode={isDarkMode} />
        <Text style={[styles.allahListSubtitle, themeColors.subText, { fontSize: fontSize - 4 }]}>
          أسماء الله الحسنى ومعانيها للتأمل والذكر
        </Text>
        {ALLAH_NAMES.map((item) => (
          <View key={item.id} style={[styles.allahListItemCard, themeColors.card, { padding: fontSize + 2 }]}>
            <Text style={[styles.allahListItemName, themeColors.accentText, { fontSize: fontSize + 2 }]}>{item.name}</Text>
            <Text style={[styles.allahListItemMeaning, themeColors.text, { fontSize: fontSize - 2, marginTop: 4 }]}>{item.meaning}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}


export { AllahNamesListScreen };
