import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect, Circle, G, RadialGradient, Stop, Mask, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../theme/styles';
import { BACKGROUND_STYLE } from '../theme/backgroundStyle';
import { GirihWall, useBackgroundScroll } from './GirihWall';

export { useBackgroundScroll };

// ==========================================
// "Courtyard" background (BACKGROUND_STYLE = 'courtyard'):
//   • a soft vertical gradient with warm light falling from the top
//   • a faint interlocking-circles pattern (same as the title banner) that fades out downwards
//   • a large, faint mihrab arch framing the top of the screen
// Fixed behind the content, which scrolls over it.
// ==========================================
const CourtyardWall = ({ isDarkMode, children }: { isDarkMode: boolean; children: React.ReactNode }) => {
  const { width: W } = useWindowDimensions();
  const gradientColors = isDarkMode
    ? (['#241F1A', '#17130F', '#0C0A08'] as const)
    : (['#FBF7F0', '#F3EADC', '#E6D8C2'] as const);
  const latticeColor = isDarkMode ? 'rgba(212, 163, 115, 0.10)' : 'rgba(158, 109, 59, 0.12)';
  const archColor = isDarkMode ? '#D4A373' : '#9E6D3B';
  const archOpacity = isDarkMode ? 0.16 : 0.2;
  const lightColor = isDarkMode ? '#E5B279' : '#FFFFFF';
  const lightOpacity = isDarkMode ? 0.1 : 0.6;

  // Pointed mihrab arch. Wide enough for its sides to run in the 15px gutter
  // between the cards and the screen edge, framing the cards like a doorway.
  const archPath = (inset: number) => {
    const aw = W - 12 - inset * 2;
    const x0 = (W - aw) / 2;
    const x1 = x0 + aw;
    const apex = 14 + inset;
    const spring = 175;
    const bottom = 520;
    return `M${x0} ${bottom} V${spring} C${x0} ${spring - 80} ${W / 2 - aw * 0.14} ${apex + 38} ${W / 2} ${apex} C${W / 2 + aw * 0.14} ${apex + 38} ${x1} ${spring - 80} ${x1} ${spring} V${bottom}`;
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.canvasContainer}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Defs>
            <Pattern id="courtyardLattice" width="36" height="36" patternUnits="userSpaceOnUse">
              {[[0, 0], [36, 0], [0, 36], [36, 36], [18, 18]].map(([x, y]) => (
                <Circle key={`${x}-${y}`} cx={x} cy={y} r="18" fill="none" stroke={latticeColor} strokeWidth="0.9" />
              ))}
              <Circle cx="18" cy="18" r="1.4" fill={latticeColor} />
            </Pattern>
            {/* Vertical fade: pattern and arch are visible at the top and vanish downwards */}
            <SvgLinearGradient id="courtyardFade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
              <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.55} />
              <Stop offset="0.8" stopColor="#FFFFFF" stopOpacity={0} />
            </SvgLinearGradient>
            <Mask id="courtyardMask">
              <Rect width="100%" height="100%" fill="url(#courtyardFade)" />
            </Mask>
            <RadialGradient id="courtyardLight" cx="50%" cy="0%" rx="75%" ry="45%">
              <Stop offset="0" stopColor={lightColor} stopOpacity={lightOpacity} />
              <Stop offset="1" stopColor={lightColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          <Rect width="100%" height="100%" fill="url(#courtyardLight)" />
          <G mask="url(#courtyardMask)">
            <Rect width="100%" height="100%" fill="url(#courtyardLattice)" />
            <Path d={archPath(0)} fill="none" stroke={archColor} strokeOpacity={archOpacity} strokeWidth={1.4} />
            <Path d={archPath(4)} fill="none" stroke={archColor} strokeOpacity={archOpacity * 0.6} strokeWidth={0.8} />
          </G>
        </Svg>
      </View>
      {children}
    </LinearGradient>
  );
};

// Background chosen in src/theme/backgroundStyle.ts ('classic' | 'courtyard' | 'girih')
const ExactImagePatternWall = ({ isDarkMode, children }: { isDarkMode: boolean; children: React.ReactNode }) => {
  if (BACKGROUND_STYLE === 'girih') return <GirihWall isDarkMode={isDarkMode}>{children}</GirihWall>;
  if (BACKGROUND_STYLE === 'courtyard') return <CourtyardWall isDarkMode={isDarkMode}>{children}</CourtyardWall>;
  return <ClassicPatternWall isDarkMode={isDarkMode}>{children}</ClassicPatternWall>;
};

// Original background (diamond and circle grid), kept for BACKGROUND_STYLE = 'classic'
const ClassicPatternWall = ({ isDarkMode, children }: { isDarkMode: boolean, children: React.ReactNode }) => {
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

// ==========================================
// Screen title banner (Basmala, Prayer Times & Qibla, …):
//   • soft gold glow behind the title
//   • interlocking-circles (petal) pattern
//   • thin inner gold frame following the arch, like a manuscript double frame
//   • small rosette crest on top and two scrolls framing the title like ﴿ ﴾
// ==========================================
const BANNER_TOP_R = 30;
const BANNER_BOTTOM_R = 12;

/** Rectangle path with different top/bottom corner radii, inset by `inset`. */
const bannerFramePath = (w: number, h: number, inset: number) => {
  const t = BANNER_TOP_R - inset;
  const b = Math.max(BANNER_BOTTOM_R - inset, 2);
  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  return [
    `M${x0} ${y1 - b}`,
    `V${y0 + t}`,
    `A${t} ${t} 0 0 1 ${x0 + t} ${y0}`,
    `H${x1 - t}`,
    `A${t} ${t} 0 0 1 ${x1} ${y0 + t}`,
    `V${y1 - b}`,
    `A${b} ${b} 0 0 1 ${x1 - b} ${y1}`,
    `H${x0 + b}`,
    `A${b} ${b} 0 0 1 ${x0} ${y1 - b}`,
    'Z',
  ].join(' ');
};

/** Scroll with a leaf, opening towards the title. */
const TitleScroll = ({ color, flip }: { color: string; flip?: boolean }) => (
  <View style={{ width: 20, height: 26, transform: flip ? [{ scaleX: -1 }] : undefined }} pointerEvents="none">
    <Svg width="100%" height="100%" viewBox="0 0 22 28">
      <Path d="M19 3C9 3 7 11 12.5 14 7 17 9 25 19 25" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path d="M12.5 14C9.5 12 5.5 12 2 14c3.5 2 7.5 2 10.5 0z" fill={color} fillOpacity={0.3} stroke={color} strokeWidth={0.9} />
      <Circle cx={19} cy={3} r={1.5} fill={color} />
      <Circle cx={19} cy={25} r={1.5} fill={color} />
    </Svg>
  </View>
);

/** Small rosette crest on top of the arch. */
const BannerCrest = ({ color, bg }: { color: string; bg: string }) => (
  <Svg width={22} height={14} viewBox="0 0 22 14">
    <Circle cx={11} cy={7} r={6.5} fill={bg} />
    {Array.from({ length: 8 }, (_, i) => (
      <Circle
        key={i}
        cx={11 + 3.4 * Math.cos((i * Math.PI) / 4)}
        cy={7 + 3.4 * Math.sin((i * Math.PI) / 4)}
        r={1.5}
        fill={color}
        fillOpacity={0.55}
      />
    ))}
    <Circle cx={11} cy={7} r={1.6} fill={color} />
  </Svg>
);

const HeritageArchBanner = ({ title, textColor, isDarkMode }: { title: string, textColor: string, isDarkMode: boolean }) => {
  const bannerBackgroundColor = isDarkMode ? '#28231F' : '#FFFFFF';
  const bannerBorderColor = isDarkMode ? 'rgba(212, 163, 115, 0.5)' : 'rgba(158, 109, 59, 0.5)';
  const innerPatternColor = isDarkMode ? 'rgba(212, 163, 115, 0.11)' : 'rgba(158, 109, 59, 0.08)';
  const accent = isDarkMode ? '#D4A373' : '#9E6D3B';
  const glowOpacity = isDarkMode ? 0.18 : 0.12;

  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  return (
    <View style={styles.heritageArchContainer}>
      <View
        style={[styles.heritageArchShape, { backgroundColor: bannerBackgroundColor, borderColor: bannerBorderColor }]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (!box || Math.abs(box.w - width) > 1 || Math.abs(box.h - height) > 1) setBox({ w: width, h: height });
        }}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg height="100%" width="100%">
            <Defs>
              <Pattern id="bannerPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <Circle cx="0" cy="0" r="10" fill="none" stroke={innerPatternColor} strokeWidth="0.8" />
                <Circle cx="20" cy="0" r="10" fill="none" stroke={innerPatternColor} strokeWidth="0.8" />
                <Circle cx="0" cy="20" r="10" fill="none" stroke={innerPatternColor} strokeWidth="0.8" />
                <Circle cx="20" cy="20" r="10" fill="none" stroke={innerPatternColor} strokeWidth="0.8" />
                <Circle cx="10" cy="10" r="10" fill="none" stroke={innerPatternColor} strokeWidth="0.8" />
                <Circle cx="10" cy="10" r="1.2" fill={innerPatternColor} />
              </Pattern>
              <RadialGradient id="bannerGlow" cx="50%" cy="55%" rx="45%" ry="75%">
                <Stop offset="0" stopColor="#E5B279" stopOpacity={glowOpacity} />
                <Stop offset="1" stopColor="#E5B279" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#bannerPattern)" />
            <Rect width="100%" height="100%" fill="url(#bannerGlow)" />
            {box && (
              <Path d={bannerFramePath(box.w, box.h, 4)} fill="none" stroke={accent} strokeOpacity={0.45} strokeWidth={0.8} />
            )}
          </Svg>
        </View>

        <View style={{ position: 'absolute', top: -1, alignSelf: 'center' }} pointerEvents="none">
          <BannerCrest color={accent} bg={bannerBackgroundColor} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <TitleScroll color={accent} />
          <Text style={[styles.heritageArchTitleText, { color: textColor, flexShrink: 1 }]}>{title}</Text>
          <TitleScroll color={accent} flip />
        </View>
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
// Misbaha ring drawn around the tasbih counter: 33 beads (a traditional
// misbaha) with a larger marker bead every 11, the rectangular "imam" bead
// on top with its thread, and a soft inner circle framing the number.
// Relative viewBox (100×100) so it scales to any counter size.
const TASBIH_BEAD_COUNT = 33;
const TASBIH_RING_RADIUS = 42;
const TASBIH_BEADS = Array.from({ length: TASBIH_BEAD_COUNT }, (_, i) => {
  // Beads are evenly spaced, leaving a gap at the top for the imam bead
  const gapDeg = 14;
  const angleDeg = -90 + gapDeg / 2 + ((360 - gapDeg) / (TASBIH_BEAD_COUNT - 1)) * i;
  const a = (angleDeg * Math.PI) / 180;
  const isSeparator = i === 10 || i === 21;
  return { x: 50 + TASBIH_RING_RADIUS * Math.cos(a), y: 50 + TASBIH_RING_RADIUS * Math.sin(a), isSeparator };
});

const TasbihCircleOrnament = () => (
  <Svg width="100%" height="100%" viewBox="0 0 100 100">
    {/* Thread */}
    <Circle cx="50" cy="50" r={TASBIH_RING_RADIUS} stroke="rgba(255,255,255,0.28)" strokeWidth="0.6" fill="none" />
    {/* Beads */}
    {TASBIH_BEADS.map((b, i) => (
      <Circle
        key={i}
        cx={b.x}
        cy={b.y}
        r={b.isSeparator ? 2.4 : 1.55}
        fill={b.isSeparator ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.46)'}
      />
    ))}
    {/* Rectangular imam bead with a small knot */}
    <Path d="M47.9 3.2 h4.2 l-0.6 6.4 h-3 z" fill="rgba(255,255,255,0.6)" />
    <Circle cx="50" cy="10.9" r="1.1" fill="rgba(255,255,255,0.6)" />
    {/* Soft inner circle framing the number */}
    <Circle cx="50" cy="50" r="34" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" fill="none" />
  </Svg>
);

// ==========================================
// Small corner ornament for Home cards: diamonds fading away from the
// bottom-left corner, in the card border gold. Non-interactive.
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
// Full-width gold divider (transparent → gold → transparent) separating a
// card's content from its "tap for another…" hint.
const GoldenDivider = ({ style }: { style?: any }) => (
  <LinearGradient
    colors={['transparent', '#D4A373', 'transparent']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={[{ height: 1, width: '100%' }, style]}
  />
);

// ==========================================
// SVG path for an eight-point star, from a centre and outer/inner radii.
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
// Ottoman-style ornament for the clock card: four eight-point stars in the
// corners (stronger at the top), very faint so the time stays readable.
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

// Small line–diamond–line divider between the time and the date in the clock card.
const OttomanFlourishDivider = ({ color = '#D4A373' }: { color?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', width: '60%', marginVertical: 4 }}>
    <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.35 }} />
    <View style={{ marginHorizontal: 6, width: 6, height: 6, backgroundColor: color, opacity: 0.55, transform: [{ rotate: '45deg' }] }} />
    <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.35 }} />
  </View>
);

// ==========================================
// Small underline (short line + diamond) for section titles in the adhkar library.
const TitleFlourish = ({ color = '#D4A373' }: { color?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 }}>
    <View style={{ width: 14, height: 1, backgroundColor: color, opacity: 0.4 }} />
    <View style={{ width: 4, height: 4, backgroundColor: color, opacity: 0.5, transform: [{ rotate: '45deg' }] }} />
  </View>
);

// ==========================================
// Card motifs: each Home card gets a thin gold line drawing that matches
// its content instead of generic stars:
//   quran   ← an open mushaf on a stand, with a soft glow
//   hadith  ← a reed pen and inkwell
//   dhikr   ← a misbaha hanging in the corner with its tassel
//   names   ← a shamsa, the radiant rosette of illuminated manuscripts
// Low opacity and non-interactive.
// ==========================================
export type CardMotifVariant = 'quran' | 'hadith' | 'dhikr' | 'names';

const MOTIF_STROKE = { fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const QuranMotif = ({ color }: { color: string }) => (
  <G {...MOTIF_STROKE} stroke={color}>
    {/* Glow above the mushaf */}
    <Path d="M32 7v5M21.5 10l2.6 4M42.5 10l-2.6 4" strokeWidth={1.3} />
    {/* Pages */}
    <Path d="M32 22C26 17 17 17 10 20v16c7-3 16-3 22 2z" fill={color} fillOpacity={0.12} />
    <Path d="M32 22c6-5 15-5 22-2v16c-7-3-16-3-22 2z" fill={color} fillOpacity={0.12} />
    <Path d="M32 22v16" />
    {/* Text lines */}
    <Path d="M14.5 25c4-1.3 9-1.3 13 .6M14.5 29.5c4-1.3 9-1.3 13 .6M36.5 25.6c4-1.9 9-1.9 13-.6M36.5 30.1c4-1.9 9-1.9 13-.6" strokeWidth={1} />
    {/* Stand */}
    <Path d="M20 37l24 22M44 37L20 59M15 59.5h9M40 59.5h9" />
  </G>
);

const HadithMotif = ({ color }: { color: string }) => (
  <G {...MOTIF_STROKE} stroke={color}>
    {/* Inkwell */}
    <Path d="M8 50c0-5.5 20-5.5 20 0l-2 10H10z" fill={color} fillOpacity={0.14} />
    <Path d="M13 44.8V41h10v3.8M11.5 41h13" />
    {/* Reed pen */}
    <Path d="M19 41L50 10l4 4-31 31z" fill={color} fillOpacity={0.12} />
    <Path d="M50 10l6-6.5L54 14M52.6 9.2l2.2-2.4" />
    {/* Ink trail */}
    <Path d="M32 58c6-5 12 3 20-3 3-2 5-1 6 1" strokeWidth={1.3} />
  </G>
);

const DhikrMotif = ({ color }: { color: string }) => {
  // A closed loop of beads whose ends meet at the rectangular imam bead,
  // with a knot and a branching tassel below. Each bead has a small
  // highlight so it reads as round.
  const cx = 32;
  const cy = 25;
  const r = 17;
  const joinY = 45;  // where the two ends of the thread meet above the imam bead
  const beads = Array.from({ length: 16 }, (_, i) => {
    // from 112° to 428°, leaving a gap around 90° for the thread down to the imam bead
    const deg = 112 + (316 / 15) * i;
    const a = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  const left = beads[0];
  const right = beads[beads.length - 1];
  return (
    <G {...MOTIF_STROKE} stroke={color}>
      {/* Thread */}
      <Circle cx={cx} cy={cy} r={r} strokeWidth={0.8} strokeOpacity={0.7} />
      <Path d={`M${left.x.toFixed(1)} ${left.y.toFixed(1)}L${cx} ${joinY}M${right.x.toFixed(1)} ${right.y.toFixed(1)}L${cx} ${joinY}`} strokeWidth={0.9} />
      {/* Beads with highlights */}
      {beads.map((b, i) => (
        <G key={i}>
          <Circle cx={b.x} cy={b.y} r={2.6} fill={color} fillOpacity={0.4} strokeWidth={1} />
          <Circle cx={b.x - 0.8} cy={b.y - 0.8} r={0.7} fill={color} stroke="none" />
        </G>
      ))}
      {/* Imam bead and knot */}
      <Path d={`M${cx - 2.4} ${joinY}h4.8l-.9 7.5h-3z`} fill={color} fillOpacity={0.45} strokeWidth={1.1} />
      <Circle cx={cx} cy={joinY + 9} r={1.3} fill={color} stroke="none" />
      {/* Tassel */}
      <Path
        d={`M${cx} ${joinY + 10}L${cx - 5} ${joinY + 18}M${cx} ${joinY + 10}L${cx - 2} ${joinY + 18.5}M${cx} ${joinY + 10}L${cx + 1} ${joinY + 18.5}M${cx} ${joinY + 10}L${cx + 4} ${joinY + 18}`}
        strokeWidth={1}
      />
    </G>
  );
};

const NamesMotif = ({ color }: { color: string }) => {
  // Shamsa: dotted ring, 24 alternating rays and two nested circles
  const cx = 30;
  const cy = 34;
  const rays = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    const outer = i % 2 === 0 ? 17.5 : 14.5;
    return `M${(cx + 11 * Math.cos(a)).toFixed(1)} ${(cy + 11 * Math.sin(a)).toFixed(1)}L${(cx + outer * Math.cos(a)).toFixed(1)} ${(cy + outer * Math.sin(a)).toFixed(1)}`;
  }).join('');
  return (
    <G {...MOTIF_STROKE} stroke={color}>
      <Circle cx={cx} cy={cy} r={20.5} strokeWidth={1.2} strokeDasharray="0.1 3.4" />
      <Path d={rays} strokeWidth={1.2} />
      <Circle cx={cx} cy={cy} r={9.5} fill={color} fillOpacity={0.12} />
      <Circle cx={cx} cy={cy} r={5.5} />
      <Circle cx={cx} cy={cy} r={2} fill={color} fillOpacity={0.6} />
    </G>
  );
};

// placement:
//   'corner' ← bottom-left corner of the card (quick dhikr)
//   'inline' ← a regular element in the layout, used by MotifOnLine so the
//              motif sits exactly on the card's bottom gold line
const CardMotif = ({
  variant,
  color = '#D4A373',
  placement = 'corner',
  size,
}: {
  variant: CardMotifVariant;
  color?: string;
  placement?: 'corner' | 'inline';
  size?: number;
}) => {
  const dim = size ?? (placement === 'inline' ? 36 : 58);
  const position = placement === 'inline' ? null : ({ position: 'absolute', bottom: 6, left: 6 } as const);
  return (
    <View style={[position, { width: dim, height: dim, opacity: 0.5 }]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 64 64">
        {variant === 'quran' && <QuranMotif color={color} />}
        {variant === 'hadith' && <HadithMotif color={color} />}
        {variant === 'dhikr' && <DhikrMotif color={color} />}
        {variant === 'names' && <NamesMotif color={color} />}
      </Svg>
    </View>
  );
};

// Motif at the start of the bottom gold line: motif on the left, line extending
// to the right, with the motif's base exactly on the line.
const MotifOnLine = ({ variant, size = 36, style }: { variant: CardMotifVariant; size?: number; style?: any }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'flex-end' }, style]}>
    <CardMotif variant={variant} placement="inline" size={size} />
    <GoldenDivider style={{ flex: 1, width: undefined, marginLeft: 4 }} />
  </View>
);

// Inline shamsa used on both sides of a Name of Allah, like the rosettes
// framing names in illuminated manuscripts.
const ShamsaEmblem = ({ size = 30, color = '#D4A373', opacity = 0.75 }: { size?: number; color?: string; opacity?: number }) => (
  <View style={{ width: size, height: size, opacity }} pointerEvents="none">
    {/* viewBox cropped to the shamsa itself (centre 30,34, radius 20.5) */}
    <Svg width="100%" height="100%" viewBox="8.5 12.5 43 43">
      <NamesMotif color={color} />
    </Svg>
  </View>
);

// ==========================================
// Lantern and crescent line drawings for the clock card ornament.
// ==========================================
const Lantern = ({ color }: { color: string }) => (
  <Svg width="100%" height="100%" viewBox="0 0 30 44">
    <G fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 0v5.5" />
      <Circle cx={15} cy={7.3} r={1.7} />
      <Path d="M9 14l6-5 6 5z" fill={color} fillOpacity={0.22} />
      <Path d="M9 14h12l2.2 8-2.2 10H9L6.8 22z" fill={color} fillOpacity={0.1} />
      <Path d="M15 14v18M7.4 22h15.2" strokeWidth={1} />
      <Path d="M11 32l4 5 4-5" />
      <Circle cx={15} cy={22} r={2.2} fill={color} fillOpacity={0.45} stroke="none" />
    </G>
  </Svg>
);

const Crescent = ({ color }: { color: string }) => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24">
    <Path d="M15 3.5a9 9 0 1 0 5.2 13.8A7.2 7.2 0 1 1 15 3.5z" fill={color} fillOpacity={0.3} stroke={color} strokeWidth={1} />
  </Svg>
);

// Clock card ornament: one lantern in the top-right corner and one crescent in the bottom-left.
const HeaderLanternOrnament = ({ color = '#D4A373' }: { color?: string }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <View style={{ position: 'absolute', top: 0, right: 14, width: 20, height: 30, opacity: 0.5 }}>
      <Lantern color={color} />
    </View>
    <View style={{ position: 'absolute', bottom: 9, left: 11, width: 14, height: 14, opacity: 0.4 }}>
      <Crescent color={color} />
    </View>
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
  CardMotif,
  MotifOnLine,
  ShamsaEmblem,
  HeaderLanternOrnament,
  GoldenDivider,
  OttomanCornerStar,
  OttomanHeaderOrnament,
  OttomanFlourishDivider,
  TitleFlourish,
  ThemedCheckbox,
};
