import React, { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';
import Animated, { makeMutable, useAnimatedScrollHandler, useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';
import { PrayerTimesProvider } from '../services/PrayerTimesProvider';
import type { PrayerTimings } from '../widgets/widgetStatus';
import { styles } from '../theme/styles';

// ==========================================
// Background option 'girih' — eight-point star (Seal of Solomon) pattern
// ==========================================
//  1. very low opacity: 4.5% in light mode, 7% in dark — felt more than seen
//  2. eight-point star (two overlapping squares) with an octagon centre, and
//     corner stars joined by lines that form crosses — a simple, authentic girih
//  3. fade: clearer at the top around the Basmala banner, gone further down
//  4. a large tile (72) with few lines, all ≥1pt to avoid moiré
//  5. a slightly darker beige with white cards and a very soft shadow (colorThemes.ts)
//  6. a light tint following the real prayer times: warm at Fajr and
//     Maghrib, calm violet after Maghrib, cooler at night, neutral by day
//  7. parallax: the pattern scrolls at 30% of the cards' speed (off with Reduce Motion)
// ==========================================

const TILE = 72;
const PARALLAX = 0.3;

// Latest scroll offset of the current screen — written by useBackgroundScroll and
// read by the background. The tile repeats every 72, so the offset wraps seamlessly.
const backgroundScrollY = makeMutable(0);

/** onScroll for a reanimated Animated.ScrollView — moves the background pattern (parallax) */
export function useBackgroundScroll() {
  return useAnimatedScrollHandler({
    onScroll: (e) => {
      backgroundScrollY.value = e.contentOffset.y;
    },
  });
}

// ----- Tile -----
const star = (cx: number, cy: number, R: number) => {
  const d = R * Math.SQRT1_2;
  const diamond = `M${cx + R} ${cy}L${cx} ${cy + R}L${cx - R} ${cy}L${cx} ${cy - R}Z`;
  const square = `M${cx - d} ${cy - d}H${cx + d}V${cy + d}H${cx - d}Z`;
  const r = R * 0.42;
  const oct = Array.from({ length: 8 }, (_, i) => {
    const a = ((22.5 + i * 45) * Math.PI) / 180;
    return `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join('') + 'Z';
  return diamond + square + oct;
};

const R = 20;
const h = TILE / 2;
const TILE_PATH = [
  star(h, h, R),
  star(0, 0, R),
  star(TILE, 0, R),
  star(0, TILE, R),
  star(TILE, TILE, R),
  // Connecting lines (forming crosses between the stars)
  `M${h + R} ${h}H${TILE}M0 ${h}H${h - R}M${h} ${h + R}V${TILE}M${h} 0V${h - R}`,
  `M${R} 0H${TILE - R}M${R} ${TILE}H${TILE - R}M0 ${R}V${TILE - R}M${TILE} ${R}V${TILE - R}`,
].join('');

// ----- Prayer-time tint -----
type Phase = 'dawn' | 'day' | 'sunset' | 'dusk' | 'night';

const TINTS: Record<'light' | 'dark', Record<Exclude<Phase, 'day'>, [string, number]>> = {
  light: { dawn: ['242,180,140', 0.18], sunset: ['232,147,95', 0.16], dusk: ['181,143,166', 0.12], night: ['138,163,194', 0.13] },
  dark: { dawn: ['232,165,122', 0.1], sunset: ['224,135,79', 0.1], dusk: ['156,122,150', 0.1], night: ['94,127,166', 0.12] },
};

const toMin = (t: string) => {
  const [hh, mm] = t.split(':').map(Number);
  return hh * 60 + mm;
};

const phaseFromTimings = (t: PrayerTimings, now: Date): Phase => {
  const m = now.getHours() * 60 + now.getMinutes();
  const fajr = toMin(t.Fajr);
  const sunrise = toMin(t.Sunrise);
  const maghrib = toMin(t.Maghrib);
  const isha = toMin(t.Isha);
  if (m >= fajr - 20 && m < sunrise + 40) return 'dawn';
  if (m >= sunrise + 40 && m < maghrib - 50) return 'day';
  if (m >= maghrib - 50 && m < maghrib + 25) return 'sunset';
  if (m >= maghrib + 25 && m < isha + 30) return 'dusk';
  return 'night';
};

// Fallback when no prayer times are available yet
const phaseFromClock = (now: Date): Phase => {
  const hr = now.getHours();
  if (hr >= 4 && hr < 7) return 'dawn';
  if (hr >= 7 && hr < 17) return 'day';
  if (hr >= 17 && hr < 19) return 'sunset';
  if (hr >= 19 && hr < 20) return 'dusk';
  return 'night';
};

// Cache shared by all screens (each has its own background), refreshed once a day
let cachedDay = '';
let cachedTimings: PrayerTimings | null = null;

function usePrayerPhase(): Phase {
  const [phase, setPhase] = useState<Phase>(() => phaseFromClock(new Date()));

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      const now = new Date();
      const day = now.toDateString();
      if (cachedDay !== day) {
        try {
          const provider = await PrayerTimesProvider.load();
          cachedTimings = provider.getTimingsFor(now);
          cachedDay = day;
        } catch {
          cachedTimings = null;
        }
      }
      if (alive) setPhase(cachedTimings ? phaseFromTimings(cachedTimings, now) : phaseFromClock(now));
    };
    refresh();
    const id = setInterval(refresh, 5 * 60 * 1000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return phase;
}

// ----- Background -----
const GirihWall = ({ isDarkMode, children }: { isDarkMode: boolean; children: React.ReactNode }) => {
  const { height: H } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const phase = usePrayerPhase();

  const base = isDarkMode ? (['#201B16', '#14110E', '#0B0907'] as const) : (['#F3EBDD', '#EBE0CE', '#DFD0B8'] as const);
  // Background colours with increasing opacity — gradually covering the pattern downwards
  const fade = isDarkMode
    ? (['rgba(32,27,22,0)', 'rgba(20,17,14,0.55)', 'rgba(11,9,7,0.97)'] as const)
    : (['rgba(243,235,221,0)', 'rgba(235,224,206,0.55)', 'rgba(223,208,184,0.97)'] as const);
  const stroke = isDarkMode ? 'rgba(212,163,115,0.07)' : 'rgba(158,109,59,0.045)';

  const tint = phase === 'day' ? null : TINTS[isDarkMode ? 'dark' : 'light'][phase];

  const patternStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ translateY: 0 }] };
    const y = Math.max(0, backgroundScrollY.value) * PARALLAX;
    return { transform: [{ translateY: -(y % TILE) }] };
  });

  return (
    <LinearGradient colors={base} style={styles.canvasContainer}>
      {/* Pattern (moves with parallax) */}
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: 0, left: 0, right: 0, height: H + TILE }, patternStyle]}>
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="girihTile" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
              <Path d={TILE_PATH} fill="none" stroke={stroke} strokeWidth={1.1} strokeLinejoin="round" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#girihTile)" />
        </Svg>
      </Animated.View>

      {/* Pattern fade-out (fixed) */}
      <LinearGradient pointerEvents="none" colors={fade} locations={[0.12, 0.45, 0.82]} style={StyleSheet.absoluteFill} />

      {/* Prayer-time tint from the top */}
      {tint && (
        <LinearGradient
          pointerEvents="none"
          colors={[`rgba(${tint[0]},${tint[1]})`, `rgba(${tint[0]},0)`]}
          locations={[0, 0.6]}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={{ flex: 1 }}>{children}</View>
    </LinearGradient>
  );
};

export { GirihWall };
