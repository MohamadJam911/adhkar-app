import React from 'react';
import { FlexWidget, TextWidget, SvgWidget, OverlapWidget } from 'react-native-android-widget';
import type { TextWidgetStyle } from 'react-native-android-widget';
import {
  PALACE_COLORS as C,
  PALACE_FONTS as F,
  archCardSvg,
  dividerStarSvg,
  palaceBackgroundSvg,
  palacePrayerIconSvg,
  pureGoldDomeEmblemSvg,
} from './masraPalaceTheme';
import type { MasraPalaceViewModel, PalacePrayerCell } from './MasraPalaceWidgetModel';

// ==========================================
// "Emerald Palace" widget (4×2) — a port of the iPhone widget
// ==========================================
// Same layout and numbers as MediumPalaceLayout in
// targets/widget/MasraWidgetViews.swift, so both platforms look identical:
// the "next prayer" arch card on the left, the identity (app name + Dome of
// the Rock emblem, divider, city and Hijri date) on the right, and the five
// prayers below.
//
// Sizes are in grid units multiplied by s = min(width/400, height/designHeight).
// `t` (the widget text size from Settings) scales every text, icon and the
// card together; the design height grows with it, so the layout keeps the
// same proportions at every size.
//
// Library notes: rows are not mirrored for RTL automatically (every row is
// ordered by hand), and text does not follow the phone's system font scale
// (allowFontScaling false) so text and boxes always stay in proportion.

const APP_NAME = 'مسرى المسلم';
const REF_WIDTH = 400;
const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 160;

/** Card and prayer-row text heights, in grid units at t = 1 (they grow with t). */
const CARD_TEXT_HEIGHT = 70;
const ROW_TEXT_HEIGHT = 63;

/** Amiri's Android line box is much taller than on iOS; text is centred in an iOS-height box. */
const AMIRI_LINE = 1.76;

const designHeightFor = (t: number) => 196 + (CARD_TEXT_HEIGHT + ROW_TEXT_HEIGHT) * (t - 1);

export type MasraPalaceWidgetProps = {
  model: MasraPalaceViewModel;
  widgetWidth?: number;
  widgetHeight?: number;
  /** Text scale from the widget text size setting (1 = default). */
  textScale?: number;
};

type Scale = { s: number; t: number };

/** Single-line text that ignores the system font scale. */
export function Label({ text, style }: { text: string; style: TextWidgetStyle }) {
  return <TextWidget text={text} maxLines={1} allowFontScaling={false} style={style} />;
}

/** Amiri text centred in a box of iOS line height, trimming Android's extra font padding. */
export function AmiriText({ text, size, color }: { text: string; size: number; color: TextWidgetStyle['color'] }) {
  return (
    <FlexWidget style={{ height: size * AMIRI_LINE, justifyContent: 'center', alignItems: 'center' }}>
      <Label
        text={text}
        style={{
          fontFamily: F.calligraphy,
          fontSize: size,
          color,
          textAlign: 'center',
          textShadowColor: '#000000',
          textShadowRadius: 2,
          textShadowOffset: { width: 0, height: 1 },
        }}
      />
    </FlexWidget>
  );
}

export function MasraPalaceWidget({ model, widgetWidth, widgetHeight, textScale = 1 }: MasraPalaceWidgetProps) {
  const width = widgetWidth || DEFAULT_WIDTH;
  const height = widgetHeight || DEFAULT_HEIGHT;
  const t = textScale;
  const s = Math.min(width / REF_WIDTH, height / designHeightFor(t));

  return (
    <OverlapWidget clickAction="OPEN_APP" style={{ height: 'match_parent', width: 'match_parent' }}>
      <SvgWidget svg={palaceBackgroundSvg(width, height)} style={{ width: 'match_parent', height: 'match_parent' }} />

      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingTop: 16 * s,
          paddingBottom: 14 * s,
        }}
      >
        {/* Top row: arch card on the left, identity on the right (manual RTL) */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-start', width: 'match_parent', paddingHorizontal: 22 * s }}>
          <NextPrayerArchCard model={model} s={s} t={t} />
          <FlexWidget style={{ flex: 1 }} />
          <BrandBlock model={model} s={s} t={t} />
        </FlexWidget>

        {/* Five prayers — Fajr on the far right */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', width: 'match_parent', paddingHorizontal: 20 * s }}>
          {[...model.prayers].reverse().map((p) => (
            <PrayerCell key={p.key} prayer={p} s={s} t={t} />
          ))}
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}

/** Dome of the Rock emblem in a translucent gold ring. */
export function DomeEmblem({ size }: { size: number }) {
  return (
    <FlexWidget
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: C.goldMetallic,
        backgroundColor: C.emblemRingBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SvgWidget svg={pureGoldDomeEmblemSvg()} style={{ width: size * 0.72, height: size * 0.72 }} />
    </FlexWidget>
  );
}

// App name + emblem, a star divider, and "city • Hijri date"
function BrandBlock({ model, s, t }: { model: MasraPalaceViewModel } & Scale) {
  const u = s * t;
  return (
    <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <DomeEmblem size={28 * u} />
        <FlexWidget style={{ width: 8 * u }} />
        <AmiriText text={APP_NAME} size={20 * u} color={C.goldBright} />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', width: 150 * u, marginTop: 4 * u }}>
        <FlexWidget style={{ flex: 1, height: 1, backgroundColor: C.goldDivider }} />
        <SvgWidget svg={dividerStarSvg(C.goldBright)} style={{ width: 8 * u, height: 8 * u, marginHorizontal: 4 * u }} />
        <FlexWidget style={{ flex: 1, height: 1, backgroundColor: C.goldDivider }} />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 * u }}>
        <Label text={model.hijriDate} style={{ fontFamily: F.body, fontSize: 8 * u, color: C.ivory300 }} />
        <Label text="  •  " style={{ fontFamily: F.body, fontSize: 8 * u, color: C.goldDeep }} />
        <Label text={model.cityLabel} style={{ fontFamily: F.label, fontSize: 8.5 * u, color: C.ivory100 }} />
      </FlexWidget>
    </FlexWidget>
  );
}

// "Next prayer" card — an Islamic arch (large top radii, smaller bottom ones)
function NextPrayerArchCard({ model, s, t }: { model: MasraPalaceViewModel } & Scale) {
  const u = s * t;
  const next = model.next;
  const badge = next?.isTomorrow ? 'أقرب صلاة • غداً' : 'أقرب صلاة';
  // Fixed size (not wrap_content) because the SVG arch needs it up front.
  const cardWidth = 135 * u;
  const cardHeight = (86 + CARD_TEXT_HEIGHT * (t - 1)) * s;

  return (
    <OverlapWidget style={{ width: cardWidth, height: cardHeight }}>
      <SvgWidget svg={archCardSvg(cardWidth, cardHeight, 24 * s, 12 * s)} style={{ width: 'match_parent', height: 'match_parent' }} />
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 3 * s,
        }}
      >
        <GoldBadge text={badge} size={7 * u} />
        <FlexWidget style={{ height: 3 * u }} />
        <AmiriText text={next?.label || '—'} size={19 * u} color={C.ivory100} />
        <FlexWidget style={{ height: 3 * u }} />
        {/* Redrawn every minute by masra-widget-clock */}
        <CountdownStrip hours={next?.remainingHours} minutes={next?.remainingMinutes} size={12.5 * u} s={s} />
      </FlexWidget>
    </OverlapWidget>
  );
}

/** Gold capsule badge ("أقرب صلاة"), as GoldBadge in the iPhone widget. */
export function GoldBadge({ text, size }: { text: string; size: number }) {
  return (
    <FlexWidget
      style={{
        backgroundGradient: { from: C.goldDeep, to: C.goldBright, orientation: 'LEFT_RIGHT' },
        borderRadius: size,
        paddingHorizontal: size,
        paddingVertical: size * 0.12,
      }}
    >
      <Label text={text} style={{ fontFamily: F.label, fontSize: size, color: C.emerald950, textAlign: 'center' }} />
    </FlexWidget>
  );
}

/** "1:05"-style remaining time (hours without a leading zero), like the iPhone widget. */
export const formatRemaining = (hours?: string, minutes?: string): string => {
  const h = Number(hours);
  return Number.isFinite(h) && minutes && minutes !== '--' ? `${h}:${minutes}` : '--:--';
};

/** Full-width dark strip with a thin gold border holding the countdown (LiveCountdown on iPhone). */
export function CountdownStrip({ hours, minutes, size, s }: { hours?: string; minutes?: string; size: number; s: number }) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        marginHorizontal: 1 * s,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: size * 0.18,
        backgroundColor: C.timeBoxBg,
        borderWidth: 1,
        borderColor: C.timeBoxBorder,
        borderRadius: size * 0.25,
      }}
    >
      <Label text={formatRemaining(hours, minutes)} style={{ fontFamily: F.timer, fontSize: size, color: C.goldLight, textAlign: 'center' }} />
    </FlexWidget>
  );
}

function PrayerCell({ prayer, s, t }: { prayer: PalacePrayerCell } & Scale) {
  const u = s * t;
  const active = prayer.isNext;
  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 3 * s,
        paddingVertical: 5 * s,
        borderRadius: 8 * s,
        borderWidth: active ? 1.5 : 0,
        borderColor: active ? C.activeCellBorder : C.inactiveCellBorder,
        backgroundColor: active ? C.activeCellBg : C.inactiveCellBorder,
      }}
    >
      <SvgWidget
        svg={palacePrayerIconSvg(prayer.key, active ? C.goldBright : C.ivory300)}
        style={{ width: 14 * u, height: 14 * u, marginBottom: 1 * s }}
      />
      <Label text={prayer.label} style={{ fontFamily: F.label, fontSize: 13 * u, color: active ? C.goldBright : C.ivory100, textAlign: 'center' }} />
      <Label text={prayer.time} style={{ fontFamily: F.label, fontSize: 11.5 * u, color: active ? C.ivory50 : C.ivory200, textAlign: 'center' }} />
    </FlexWidget>
  );
}
