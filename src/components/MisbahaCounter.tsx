import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// ==========================================
// Animated misbaha counter
// ==========================================
// 33 dim gold beads around the counter (like a real misbaha), with the imam
// bead on top:
//   • each tap lights the next bead in bright gold, with a small pulse
//   • at 33 every bead and the imam bead are lit — the round is complete
//   • tap 34: a gold pulse (the circle grows ~6% and a gold halo flashes),
//     the beads reset within ~250 ms, then the first bead lights up (tap 34
//     is the first dhikr of the new round)
// With "Reduce Motion" enabled: no scaling, only a soft halo.

const BEADS = 33;
const PULSE_UP_MS = 110;
const PULSE_DOWN_MS = 140;
const RELIGHT_DELAY_MS = PULSE_UP_MS + PULSE_DOWN_MS - 20;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** How many beads are lit for a count: 1..33 per round (0 before the first tap) */
const litForCount = (count: number) => (count <= 0 ? 0 : ((count - 1) % BEADS) + 1);

// ==========================================
// Ornament inside the gold circle (translucent white, behind the number):
//   • a scalloped border like the edge of illuminated-manuscript medallions
//   • a 12-petal floral rosette radiating from the centre
//   • a ring of soft dots between the petals and a small inner ring
// 100×100 viewBox, so it fits any size (Misbaha screen and quick dhikr).
// ==========================================
const SCALLOPS = 24;
const scallopPath = (() => {
  const rIn = 43.5;
  const rOut = 47.5;
  let d = '';
  for (let i = 0; i < SCALLOPS; i++) {
    const a0 = (i / SCALLOPS) * Math.PI * 2;
    const a1 = ((i + 1) / SCALLOPS) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const p0 = [50 + rIn * Math.cos(a0), 50 + rIn * Math.sin(a0)];
    const c = [50 + rOut * Math.cos(am), 50 + rOut * Math.sin(am)];
    const p1 = [50 + rIn * Math.cos(a1), 50 + rIn * Math.sin(a1)];
    d += `${i === 0 ? `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}` : ''}Q${c[0].toFixed(2)} ${c[1].toFixed(2)} ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
  }
  return d + 'Z';
})();

const PETALS = Array.from({ length: 12 }, (_, i) => i * 30);
const PETAL_DOTS = Array.from({ length: 12 }, (_, i) => {
  const a = ((i * 30 + 15) * Math.PI) / 180;
  return { x: 50 + 33 * Math.cos(a), y: 50 + 33 * Math.sin(a) };
});

const MedallionArabesque = () => (
  <Svg width="100%" height="100%" viewBox="0 0 100 100" style={StyleSheet.absoluteFill} pointerEvents="none">
    <Path d={scallopPath} fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth={0.9} />
    <Circle cx={50} cy={50} r={40} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={0.6} />
    {PETALS.map((deg) => (
      <Path
        key={deg}
        d="M50 50 C44 40, 45 24, 50 14 C55 24, 56 40, 50 50 Z"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={0.6}
        transform={`rotate(${deg} 50 50)`}
      />
    ))}
    {PETAL_DOTS.map((p, i) => (
      <Circle key={i} cx={p.x} cy={p.y} r={1.1} fill="rgba(255,255,255,0.35)" />
    ))}
    <Circle cx={50} cy={50} r={9} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={0.7} />
  </Svg>
);

type Props = {
  count: number;
  /** Diameter of the gold circle itself (the beads are drawn around it) */
  size: number;
  isDarkMode: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  children?: React.ReactNode;
};

function MisbahaCounter({ count, size, isDarkMode, onPress, accessibilityLabel, accessibilityHint, children }: Props) {
  const reduceMotion = useReducedMotion();

  // Room for the bead ring around the circle
  const ringGap = Math.max(16, size * 0.11);
  const outer = size + ringGap * 2;
  const ringRadius = size / 2 + ringGap / 2;
  const beadR = Math.max(2.4, size * 0.018);

  const offColor = isDarkMode ? 'rgba(212,163,115,0.28)' : 'rgba(212,163,115,0.38)';
  const litColor = isDarkMode ? '#E5B279' : '#C8935E';
  const glowColor = isDarkMode ? 'rgba(229,178,121,0.28)' : 'rgba(200,147,94,0.22)';

  const [lit, setLit] = useState(() => litForCount(count));
  const prevCount = useRef(count);

  const scale = useSharedValue(1);
  const halo = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    const increased = count > prevCount.current;
    prevCount.current = count;

    // First tap after completing 33 (34, 67, 100…): gold pulse and bead reset
    const startsNewRound = increased && count > 1 && count % BEADS === 1;
    if (startsNewRound) {
      setLit(0);
      if (!reduceMotion) {
        scale.value = withSequence(
          withTiming(1.06, { duration: PULSE_UP_MS, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: PULSE_DOWN_MS, easing: Easing.inOut(Easing.quad) })
        );
      }
      halo.value = withSequence(
        withTiming(1, { duration: 60 }),
        withTiming(0, { duration: PULSE_UP_MS + PULSE_DOWN_MS - 60, easing: Easing.out(Easing.quad) })
      );
      const timer = setTimeout(() => {
        setLit(1);
        if (!reduceMotion) pop.value = withSequence(withTiming(1.7, { duration: 80 }), withTiming(1, { duration: 140 }));
      }, RELIGHT_DELAY_MS);
      return () => clearTimeout(timer);
    }

    setLit(litForCount(count));
    if (increased && !reduceMotion) {
      pop.value = withSequence(withTiming(1.7, { duration: 80 }), withTiming(1, { duration: 140 }));
    }
    return undefined;
  }, [count]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: halo.value,
    transform: [{ scale: 1 + (1 - halo.value) * 0.12 + 0.02 }],
  }));
  const newestBeadProps = useAnimatedProps(() => ({ r: beadR * pop.value }));

  // Beads evenly spaced around the circle, leaving a gap at the top for the imam bead
  const gapDeg = 16;
  const beads = Array.from({ length: BEADS }, (_, i) => {
    const deg = -90 + gapDeg / 2 + ((360 - gapDeg) / (BEADS - 1)) * i;
    const a = (deg * Math.PI) / 180;
    return { x: outer / 2 + ringRadius * Math.cos(a), y: outer / 2 + ringRadius * Math.sin(a) };
  });
  const roundComplete = lit === BEADS;
  const imamW = beadR * 1.9;
  const imamH = beadR * 3.2;
  const imamTop = outer / 2 - ringRadius - imamH / 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityValue={{ text: `${count}` }}
    >
      {/* Bead ring */}
      <Svg width={outer} height={outer} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Circle cx={outer / 2} cy={outer / 2} r={ringRadius} stroke={offColor} strokeWidth={0.8} fill="none" />
        {beads.map((b, i) => {
          const isLit = i < lit;
          const isNewest = isLit && i === lit - 1;
          return (
            <React.Fragment key={i}>
              {isLit && <Circle cx={b.x} cy={b.y} r={beadR * 2.1} fill={glowColor} />}
              {isNewest ? (
                <AnimatedCircle cx={b.x} cy={b.y} fill={litColor} animatedProps={newestBeadProps} />
              ) : (
                <Circle cx={b.x} cy={b.y} r={beadR} fill={isLit ? litColor : offColor} />
              )}
            </React.Fragment>
          );
        })}
        {/* Imam bead — lights up when the round is complete */}
        <Path
          d={`M${outer / 2 - imamW / 2} ${imamTop} h${imamW} l${-imamW * 0.15} ${imamH} h${-imamW * 0.7} z`}
          fill={roundComplete ? litColor : offColor}
        />
      </Svg>

      {/* Pulse halo */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: litColor,
            backgroundColor: glowColor,
          },
          haloStyle,
        ]}
      />

      {/* Gold circle and number */}
      <Animated.View style={circleStyle}>
        <LinearGradient
          colors={['#E5B279', '#C8935E']}
          style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          <MedallionArabesque />
          {children}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export { MisbahaCounter };
