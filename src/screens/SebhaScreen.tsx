import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { ExactImagePatternWall, HeritageArchBanner, TasbihCircleOrnament } from '../components/Decorative';
import { formatArabicNumbers } from '../utils/formatters';
import { logStat } from '../utils/statsLogger';

function SebhaScreen({ hapticEnabled, fontSize }: { hapticEnabled: boolean, fontSize: number }) {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState<number | null>(33);
  const [rounds, setRounds] = useState(0);
  const { isDarkMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  const handleTasbeeh = async () => {
    const nextCount = count + 1;
    await logStat('tasbeeh', 1);

    if (target) {
      if (nextCount >= target) {
        if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCount(0);
        setRounds(prev => prev + 1);
        return;
      }
    }

    if (nextCount % 33 === 0 || nextCount === 100) {
      if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setCount(nextCount);
  };

  const selectTarget = (newTarget: number | null) => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTarget(newTarget);
    setCount(0);
    setRounds(0);
  };

  const resetSebha = () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount(0);
    setRounds(0);
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
            {target ? `الجولة: ${formatArabicNumbers(rounds + 1)} • الهدف: ${formatArabicNumbers(target)}` : 'التسبيح الحر'}
          </Text>
          
          <TouchableOpacity
            onPress={handleTasbeeh}
            activeOpacity={0.85}
            style={styles.tasbihDecorRing}
            accessibilityRole="button"
            accessibilityLabel="عداد السبحة"
            accessibilityHint="اضغط لزيادة العداد بواحد"
            accessibilityValue={{ text: `${count}` }}
          >
            <LinearGradient
              colors={['#E5B279', '#C8935E']}
              style={[styles.bigSebhaCircle, { width: fontSize * 8, height: fontSize * 8, borderRadius: (fontSize * 8) / 2 }]}
            >
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <TasbihCircleOrnament />
              </View>
              <Text style={[styles.bigSebhaNumber, themeColors.circleText, { fontSize: fontSize * 2 }]}>{formatArabicNumbers(count)}</Text>
              <Text style={[styles.bigSebhaHint, themeColors.circleSubText, { fontSize: fontSize - 8 }]}>اضغط هنا للتسبيح</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetSebhaBtn} onPress={resetSebha}>
            <Text style={[styles.resetSebhaText, { fontSize: fontSize - 3 }]}>تصفير العداد والهدف</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ExactImagePatternWall>
  );
}

export { SebhaScreen };
