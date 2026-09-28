import React, { useState, useContext } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemeContext } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { ExactImagePatternWall, HeritageArchBanner } from '../components/Decorative';
import { MisbahaCounter } from '../components/MisbahaCounter';
import { formatArabicNumbers } from '../utils/formatters';
import { logStat } from '../utils/statsLogger';

function SebhaScreen({ hapticEnabled, fontSize }: { hapticEnabled: boolean, fontSize: number }) {
  // العدّاد بيضل ماشي (٣٣ ← ٣٤ ← …) بدل ما يرجع صفر عند الهدف — حبّات
  // المسبحة حوالين الدائرة بتوضّح موقعك بكل ٣٣، والجولة محسوبة من العدد.
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState<number | null>(33);
  const { isDarkMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  const currentRound = target && count > 0 ? Math.floor((count - 1) / target) + 1 : 1;

  const handleTasbeeh = async () => {
    const nextCount = count + 1;
    setCount(nextCount);
    logStat('tasbeeh', 1);

    if (!hapticEnabled) return;
    const reachedTarget = !!target && nextCount % target === 0;
    if (reachedTarget || nextCount % 33 === 0) {
      // اكتملت ٣٣ (أو الهدف)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (nextCount > 1 && nextCount % 33 === 1) {
      // الضغطة ٣٤ (وأخواتها): مع النبضة الذهبية
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const selectTarget = (newTarget: number | null) => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTarget(newTarget);
    setCount(0);
  };

  const resetSebha = () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount(0);
  };

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1, padding: 15 }}>
        <HeritageArchBanner title="السبحة الرقمية" textColor={themeColors.text.color} isDarkMode={isDarkMode} />
        
        <View style={[styles.centerScreen, { flex: 1 }]}>
          <View style={styles.sebhaPresetRow}>
            {[
              { label: '33', val: 33 },
              { label: '100', val: 100 },
              { label: 'حر ∞', val: null },
            ].map((preset, idx) => {
              const active = target === preset.val;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => selectTarget(preset.val)}
                  style={[
                    styles.sebhaPresetBtn,
                    active 
                      ? { backgroundColor: '#D4A373' } 
                      : { backgroundColor: isDarkMode ? '#28231F' : '#FFFFFF', borderColor: 'rgba(212,163,115,0.4)', borderWidth: 1 }
                  ]}
                >
                  <Text style={{ color: active ? '#1E1B18' : (isDarkMode ? '#F4EADF' : '#332922'), fontWeight: 'bold', fontSize: fontSize - 5 }}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sebhaLabel, themeColors.text, { fontSize: fontSize - 2, marginBottom: 25 }]}>
            {target ? `الجولة: ${formatArabicNumbers(currentRound)} • الهدف: ${formatArabicNumbers(target)}` : 'التسبيح الحر'}
          </Text>

          <MisbahaCounter
            count={count}
            size={fontSize * 8}
            isDarkMode={isDarkMode}
            onPress={handleTasbeeh}
            accessibilityLabel="عداد السبحة"
            accessibilityHint="اضغط لزيادة العداد بواحد"
          >
            <Text style={[styles.bigSebhaNumber, themeColors.circleText, { fontSize: fontSize * 2 }]}>{formatArabicNumbers(count)}</Text>
            <Text style={[styles.bigSebhaHint, themeColors.circleSubText, { fontSize: fontSize - 8 }]}>اضغط هنا للتسبيح</Text>
          </MisbahaCounter>

          <TouchableOpacity style={styles.resetSebhaBtn} onPress={resetSebha}>
            <Text style={[styles.resetSebhaText, { fontSize: fontSize - 3 }]}>تصفير العداد والهدف</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ExactImagePatternWall>
  );
}

export { SebhaScreen };
