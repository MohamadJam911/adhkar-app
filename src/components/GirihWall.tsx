import React, { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';
import Animated, { makeMutable, useAnimatedScrollHandler, useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';
import { DahriWidgetTimesProvider } from '../widgets/masraPalace/DahriWidgetTimesProvider';
import type { PrayerTimings } from '../widgets/widgetStatus';
import { styles } from '../theme/styles';

// ==========================================
// ✴️ خلفية الخيار ٣ — نقش گره بنجمة ثمانية (خاتم سليمان)
// ==========================================
//  ١. شفافية خفيفة جداً: ٤.٥٪ بالفاتح، ٧٪ بالداكن — بتنحسّ أكتر ما بتنشاف
//  ٢. نجمة ثمانية (مربعين متداخلين) مع مثمّن بالقلب، ونجوم بزوايا البلاطة
//     موصولة بخطوط بتكوّن صلبان بينها — نمط گره بسيط وأصيل
//  ٣. تلاشي: النقش أوضح فوق حوالين شريط البسملة وبيختفي لتحت، فمنطقة القراءة نظيفة
//  ٤. بلاطة كبيرة (72) بخطوط قليلة، وكل الخطوط ≥1pt حتى ما يصير تموّج (moiré)
//  ٥. بيج أغمق درجة مع بطاقات بيضا وظل ناعم جداً (colorThemes.ts)
//  ٦. لون خفيف بيتبع وقت الصلاة الحقيقي (المواقيت الدهرية): دفء بالفجر
//     والمغرب، بنفسجي هادي بعد المغرب، أبرد بالليل، ومحايد بالنهار
//  ٧. parallax: النقش بيتحرّك أبطأ من البطاقات (٣٠٪) — وبينلغى مع "تقليل الحركة"
// ==========================================

const TILE = 72;
const PARALLAX = 0.3;

// آخر موقع تمرير للشاشة الحالية — كل شاشة بتكتب فيه (useBackgroundScroll)،
// والخلفية بتقرا منه. البلاطة بتتكرّر كل 72 فالإزاحة بتلفّ بدون فراغات.
const backgroundScrollY = makeMutable(0);

/** onScroll لـAnimated.ScrollView (reanimated) — بيحرّك نقش الخلفية بالـparallax */
export function useBackgroundScroll() {
  return useAnimatedScrollHandler({
    onScroll: (e) => {
      backgroundScrollY.value = e.contentOffset.y;
    },
  });
}

// ----- البلاطة -----
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
  // خطوط الوصل (بتكوّن صلبان بين النجوم)
  `M${h + R} ${h}H${TILE}M0 ${h}H${h - R}M${h} ${h + R}V${TILE}M${h} 0V${h - R}`,
  `M${R} 0H${TILE - R}M${R} ${TILE}H${TILE - R}M0 ${R}V${TILE - R}M${TILE} ${R}V${TILE - R}`,
].join('');

// ----- لون وقت الصلاة -----
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

// احتياط لو ما في مواقيت محفوظة بعد
const phaseFromClock = (now: Date): Phase => {
  const hr = now.getHours();
  if (hr >= 4 && hr < 7) return 'dawn';
  if (hr >= 7 && hr < 17) return 'day';
  if (hr >= 17 && hr < 19) return 'sunset';
  if (hr >= 19 && hr < 20) return 'dusk';
  return 'night';
};

// كاش مشترك بين الشاشات (كل شاشة إلها خلفيتها)، لكل يوم مرة وحدة
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
          const provider = await DahriWidgetTimesProvider.load();
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

// ----- الخلفية -----
const GirihWall = ({ isDarkMode, children }: { isDarkMode: boolean; children: React.ReactNode }) => {
  const { height: H } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const phase = usePrayerPhase();

  const base = isDarkMode ? (['#201B16', '#14110E', '#0B0907'] as const) : (['#F3EBDD', '#EBE0CE', '#DFD0B8'] as const);
  // نفس ألوان الخلفية بشفافية متزايدة — بتغطّي النقش تدريجياً لتحت
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
      {/* النقش (بيتحرّك بالـparallax) */}
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

      {/* تلاشي النقش لتحت (ثابت) */}
      <LinearGradient pointerEvents="none" colors={fade} locations={[0.12, 0.45, 0.82]} style={StyleSheet.absoluteFill} />

      {/* لون وقت الصلاة من الأعلى */}
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
