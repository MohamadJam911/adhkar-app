import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect, Circle, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../theme/styles';

const ExactImagePatternWall = ({ isDarkMode, children }: { isDarkMode: boolean, children: React.ReactNode }) => {
  const gradientColors = isDarkMode
    ? ['#201C17', '#14110E', '#0B0907'] as const
    : ['#F9F4EC', '#EFE7DA', '#DFD3C3'] as const;

  const patternColor = isDarkMode ? 'rgba(212, 163, 115, 0.22)' : 'rgba(158, 109, 59, 0.25)';

  return (
    <LinearGradient colors={gradientColors} style={styles.canvasContainer}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Defs>
            <Pattern id="islamicPattern" width="45" height="45" patternUnits="userSpaceOnUse">
              <Path d="M22.5 0 L45 22.5 L22.5 45 L0 22.5 Z" fill="none" stroke={patternColor} strokeWidth="1.2" />
              <Circle cx="22.5" cy="22.5" r="9" fill="none" stroke={patternColor} strokeWidth="1.2" />
              <Path d="M0 0 L45 45 M45 0 L0 45" stroke={patternColor} strokeWidth="0.6" opacity="0.6" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#islamicPattern)" />
        </Svg>
      </View>
      {children}
    </LinearGradient>
  );
};

const HeritageArchBanner = ({ title, textColor, isDarkMode }: { title: string, textColor: string, isDarkMode: boolean }) => {
  const bannerBackgroundColor = isDarkMode ? '#28231F' : '#FFFFFF';
  const bannerBorderColor = isDarkMode ? 'rgba(212, 163, 115, 0.5)' : 'rgba(158, 109, 59, 0.5)';
  const innerPatternColor = isDarkMode ? 'rgba(212, 163, 115, 0.10)' : 'rgba(158, 109, 59, 0.08)';

  return (
    <View style={styles.heritageArchContainer}>
      <View style={[styles.heritageArchShape, { backgroundColor: bannerBackgroundColor, borderColor: bannerBorderColor }]}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg height="100%" width="100%" style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden' }}>
            <Defs>
              <Pattern id="bannerPattern" width="24" height="24" patternUnits="userSpaceOnUse">
                <Circle cx="12" cy="12" r="1.5" fill={innerPatternColor} />
                <Path d="M12 0 L24 12 L12 24 L0 12 Z" fill="none" stroke={innerPatternColor} strokeWidth="0.8" />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#bannerPattern)" />
          </Svg>
        </View>
        <Text style={[styles.heritageArchTitleText, { color: textColor }]}>{title}</Text>
      </View>
    </View>
  );
};

const SeniorBackArrow = ({ onPress, isDarkMode }: { onPress: () => void, isDarkMode: boolean }) => {
  const arrowColor = isDarkMode ? '#E5B279' : '#6F4E37';
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start', marginBottom: 5 }}>
      <Text style={{ fontSize: 28, color: arrowColor, fontWeight: 'bold' }}>〈</Text>
    </TouchableOpacity>
  );
};

// ==========================================
// ✅ مربع اختيار (Checkbox) ديناميكي حسب المظهر الحالي
// ==========================================
// بدل الاعتماد على لون ثابت (#D4A373) لكل المظاهر، ولوجود نص "✓" شفاف
// بشكل دائم خلف المربع (وهو ما قد يظهر كمربع أسود على بعض الأجهزة بسبب
// طريقة عرض بعض الخطوط لرمز الشيك)، أصبح إطار المربع ولون التعبئة يعتمدان
// على لون التمييز (accent) الخاص بالمظهر الحالي، ولا نعرض نص الشيك أساساً
// إلا عند التفعيل.
// ==========================================
// 📿 زخرفة داخلية لدوائر التسبيح الذهبية: حلقة منقّطة + 8 "حبّات" ماسية
// صغيرة تلف حوالين الدائرة (تيمّن بحبات السبحة نفسها) وحلقة داخلية خفيفة
// إضافية — كلها بلون أبيض شفاف خفيف فوق التدرّج الذهبي، فبتظهر كنقش محفور
// بسيط بدون ما تأثر على وضوح الرقم والنص بالنص. مستخدمة كطبقة خلفية داخل
// دوائر التسبيح (خلف الأرقام)، وviewBox نسبي (100x100) حتى تتأقلم تلقائياً
// مع أي حجم دائرة (كبيرة بالسبحة الرقمية، أصغر بالذكر السريع بالهوم).
const TASBIH_ORNAMENT_BEADS = Array.from({ length: 8 }, (_, i) => {
  const angle = (Math.PI / 4) * i - Math.PI / 2;
  const r = 40;
  return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) };
});

const TasbihCircleOrnament = () => (
  <Svg width="100%" height="100%" viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="41" stroke="rgba(255,255,255,0.38)" strokeWidth="1" fill="none" strokeDasharray="1.5,4.5" />
    {TASBIH_ORNAMENT_BEADS.map((p, i) => (
      <Path
        key={i}
        d={`M ${p.x} ${p.y - 2.3} L ${p.x + 2.3} ${p.y} L ${p.x} ${p.y + 2.3} L ${p.x - 2.3} ${p.y} Z`}
        fill="rgba(255,255,255,0.42)"
      />
    ))}
    <Circle cx="50" cy="50" r="30" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" fill="none" />
  </Svg>
);

// ==========================================
// 🕌 زخرفة زاوية بسيطة للخانات الرئيسية بالصفحة الرئيسية (بطاقة الآية، الحديث،
// اسم الله، الذكر السريع): مجموعة معينات صغيرة متدرّجة الحجم والشفافية —
// تلاشي تدريجي بعيداً عن الزاوية — بنفس لون التمييز الذهبي المستخدم أصلاً
// بحدود البطاقات (#D4A373)، محصورة بزاوية وحدة بس (يسار-تحت) وبمساحة صغيرة
// حتى ما تملا البطاقة أو تأثر على وضوح النص. غير تفاعلية (pointerEvents none).
const CardCornerOrnament = ({ color = '#D4A373' }: { color?: string }) => (
  <View style={{ position: 'absolute', bottom: 6, left: 6, width: 46, height: 46 }} pointerEvents="none">
    <Svg width="100%" height="100%" viewBox="0 0 60 60">
      <Path d="M9 44.5 L15.5 51 L9 57.5 L2.5 51 Z" fill={color} opacity={0.4} />
      <Path d="M22 33 L27 38 L22 43 L17 38 Z" fill={color} opacity={0.26} />
      <Path d="M33 23.5 L36.5 27 L33 30.5 L29.5 27 Z" fill={color} opacity={0.15} />
      <Circle cx="43" cy="17" r="2" fill={color} opacity={0.12} />
    </Svg>
  </View>
);

// ==========================================
// ✨ خط فاصل ذهبي كامل العرض (تدرّج شفاف-ذهبي-شفاف): يُستخدم أسفل نص
// "اضغط لآية/حديث/اسم آخر" في بطاقات الآية والحديث واسم الله، حتى يفصل
// بصرياً بين محتوى البطاقة ونص التلميح بلمسة ذهبية أنيقة وخفيفة.
const GoldenDivider = ({ style }: { style?: any }) => (
  <LinearGradient
    colors={['transparent', '#D4A373', 'transparent']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={[{ height: 1, width: '100%' }, style]}
  />
);

// ==========================================
// 🌟 مساعد لرسم نجمة ثمانية الرؤوس (نمط زخرفي عثماني كلاسيكي) كمسار SVG
// بإحداثيات مركز ونصف قطر خارجي/داخلي — تُستخدم في زخرفة خانة الساعة والتاريخ.
const buildStarPath = (cx: number, cy: number, rOuter: number, rInner: number, spikes: number = 8) => {
  let path = '';
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return path + 'Z';
};

const OttomanCornerStar = ({ color = '#D4A373', opacity = 0.3 }: { color?: string; opacity?: number }) => (
  <Svg width="100%" height="100%" viewBox="0 0 40 40">
    <Path d={buildStarPath(20, 20, 13, 5.4)} fill={color} opacity={opacity} />
    <Circle cx="20" cy="20" r="2.6" fill={color} opacity={Math.min(opacity + 0.18, 1)} />
  </Svg>
);

// ==========================================
// 🕌 زخرفة عثمانية مميزة لخانة الساعة والتاريخ في الصفحة الرئيسية: أربع
// نجمات ثمانية الرؤوس صغيرة في زوايا البطاقة (أكبر وأوضح بالأعلى، أخف
// بالأسفل) — طبقة خلفية غير تفاعلية بلون التمييز الذهبي وبشفافية خفيفة
// جداً حتى ما تأثر على وضوح الوقت والتاريخ.
const OttomanHeaderOrnament = ({ color = '#D4A373' }: { color?: string }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <View style={{ position: 'absolute', top: 8, left: 8, width: 22, height: 22 }}>
      <OttomanCornerStar color={color} opacity={0.32} />
    </View>
    <View style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22 }}>
      <OttomanCornerStar color={color} opacity={0.32} />
    </View>
    <View style={{ position: 'absolute', bottom: 8, left: 8, width: 15, height: 15 }}>
      <OttomanCornerStar color={color} opacity={0.18} />
    </View>
    <View style={{ position: 'absolute', bottom: 8, right: 8, width: 15, height: 15 }}>
      <OttomanCornerStar color={color} opacity={0.18} />
    </View>
  </View>
);

// فاصل زخرفي صغير (خط - معين - خط) بين الوقت والتاريخ داخل خانة الساعة،
// يمنحها طابعاً مميزاً عن باقي الخانات.
const OttomanFlourishDivider = ({ color = '#D4A373' }: { color?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', width: '60%', marginVertical: 4 }}>
    <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.35 }} />
    <View style={{ marginHorizontal: 6, width: 6, height: 6, backgroundColor: color, opacity: 0.55, transform: [{ rotate: '45deg' }] }} />
    <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.35 }} />
  </View>
);

// ==========================================
// 🌿 زخرفة خفيفة صغيرة تحت عناوين أقسام مكتبة الأذكار (أذكار الصباح، المساء...):
// خط قصير + معين صغير محاذيين لجهة العنوان (يمين)، بلمسة ذهبية بسيطة وغير مزعجة.
const TitleFlourish = ({ color = '#D4A373' }: { color?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 }}>
    <View style={{ width: 14, height: 1, backgroundColor: color, opacity: 0.4 }} />
    <View style={{ width: 4, height: 4, backgroundColor: color, opacity: 0.5, transform: [{ rotate: '45deg' }] }} />
  </View>
);

const ThemedCheckbox = ({ checked, accentColor }: { checked: boolean; accentColor: string }) => (
  <View style={[styles.checkSquareBtn, { borderColor: accentColor }, checked && { backgroundColor: accentColor }]}>
    {checked && <Text style={[styles.checkSquareText, styles.checkSquareTextActive]}>✓</Text>}
  </View>
);


export {
  ExactImagePatternWall,
  HeritageArchBanner,
  SeniorBackArrow,
  TasbihCircleOrnament,
  CardCornerOrnament,
  GoldenDivider,
  OttomanCornerStar,
  OttomanHeaderOrnament,
  OttomanFlourishDivider,
  TitleFlourish,
  ThemedCheckbox,
};
