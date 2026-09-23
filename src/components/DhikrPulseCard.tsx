import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { styles } from '../theme/styles';
import { formatArabicNumbers } from '../utils/formatters';
import type { Dhikr } from '../types';

// ==========================================
// 📿 بطاقة ذِكر مع نبضة خفيفة عند الضغط
// ==========================================
const DhikrPulseCard = ({
  dhikr,
  isDarkMode,
  themeColors,
  fontSize,
  onPress,
}: {
  dhikr: Dhikr;
  isDarkMode: boolean;
  themeColors: any;
  fontSize: number;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.975, { duration: 55 }),
      withTiming(1.008, { duration: 65 }),
      withTiming(1, { duration: 70 })
    );
    onPress();
  };

  return (
    <Animated.View style={pulseStyle}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={{ backgroundColor: isDarkMode ? '#1E1B18' : '#FAF6F0', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(212,163,115,0.25)' }}
        accessibilityRole="button"
        accessibilityLabel={dhikr.text}
        accessibilityHint="اضغط لإنقاص العداد بواحد"
        accessibilityValue={{ text: `متبقي ${dhikr.count}` }}
      >
        <Text style={[themeColors.text, { fontSize: fontSize - 1, lineHeight: (fontSize - 1) * 1.5, textAlign: 'right', marginBottom: 8 }]}>
          {dhikr.text}
        </Text>
        <View style={[styles.counterBadge, themeColors.badge, { alignSelf: 'flex-start' }]}>
          <Text style={[styles.counterText, themeColors.counterText, { fontSize: fontSize - 4 }]}>
            متبقي: {formatArabicNumbers(dhikr.count)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};


export { DhikrPulseCard };
