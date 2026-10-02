import React from 'react';
import { FlexWidget, TextWidget, SvgWidget, OverlapWidget } from 'react-native-android-widget';
import {
  PALACE_COLORS as C,
  PALACE_FONTS as F,
  archCardSvg,
  palaceBackgroundSvg,
  palacePrayerIconSvg,
  pureGoldDomeEmblemSvg,
} from './masraPalaceTheme';
import type { MasraPalaceViewModel } from './MasraPalaceWidgetModel';

// ==========================================
// 2×2 "next prayer" widget — a compact "Emerald Palace"
// ==========================================
// Same background, gold, fonts and arch card as the 4×2 widget
// (MasraPalaceWidget.tsx), stacked vertically for a square:
//   identity (emblem + name) → arch card (badge, prayer icon and name,
//   HH:MM countdown, adhan time) → city name.
// Between adhan and iqama the card switches to "it is now time for …" with
// the iqama countdown.
//
// Sizes are on a 170-wide grid multiplied by s = min(width/170, height/designHeight),
// keeping proportions from a small 2×2 (~110dp) to a tall one (Samsung ~181×261).
// The card text follows the app's font size (textScale); above 1 the identity
// row is hidden so the extra size goes to the prayer card.

const APP_NAME = 'مسرى المسلم';
const REF_WIDTH = 170;
const DEFAULT_SIZE = 150;

/** Design height: paddings (24) + identity row (≈39, hidden for large text) + card (≈120·t) + city (≈17). */
const designHeightFor = (t: number) => 24 + (t > 1 ? 0 : 39) + 120 * t + 17;

export type MasraPalaceMiniWidgetProps = {
  model: MasraPalaceViewModel;
  widgetWidth?: number;
  widgetHeight?: number;
  /** Text scale from the app's font size (1 = default). */
  textScale?: number;
};

export function MasraPalaceMiniWidget({ model, widgetWidth, widgetHeight, textScale = 1 }: MasraPalaceMiniWidgetProps) {
  const width = widgetWidth || DEFAULT_SIZE;
  const height = widgetHeight || DEFAULT_SIZE;
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
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 13 * s,
          paddingBottom: 11 * s,
        }}
      >
        {/* Identity: emblem to the left of the name (manual RTL); hidden for large text */}
        {t <= 1 && (
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FlexWidget
              style={{
                width: 20 * s,
                height: 20 * s,
                borderRadius: 10 * s,
                borderWidth: 1,
                borderColor: C.goldMetallic,
                backgroundColor: C.emblemRingBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 5 * s,
              }}
            >
              <SvgWidget svg={pureGoldDomeEmblemSvg()} style={{ width: 14 * s, height: 14 * s }} />
            </FlexWidget>
            <TextWidget
              text={APP_NAME}
              maxLines={1}
              style={{
                fontFamily: F.calligraphy,
                fontSize: 14 * s,
                color: C.goldBright,
                textShadowColor: '#000000',
                textShadowRadius: 3,
                textShadowOffset: { width: 0, height: 1 },
              }}
            />
          </FlexWidget>
        )}

        <MiniArchCard model={model} s={s} t={t} />

        <TextWidget
          text={model.cityLabel}
          maxLines={1}
          truncate="END"
          style={{ fontFamily: F.label, fontSize: 9 * s, color: C.ivory200, textAlign: 'center' }}
        />
      </FlexWidget>
    </OverlapWidget>
  );
}

function MiniArchCard({ model, s, t }: { model: MasraPalaceViewModel; s: number; t: number }) {
  const iqama = model.iqama;
  const next = model.next;

  // During iqama the card shows the current prayer and the iqama countdown; otherwise the next prayer
  const badge = iqama ? 'حان الآن وقت' : next?.isTomorrow ? 'أقرب صلاة • غداً' : 'أقرب صلاة';
  const iconKey = iqama?.key ?? next?.key;
  const label = iqama?.label ?? next?.label ?? '—';
  const hours = iqama?.remainingHours ?? next?.remainingHours ?? '--';
  const minutes = iqama?.remainingMinutes ?? next?.remainingMinutes ?? '--';
  const footer = iqama ? `الإقامة ${iqama.time}` : next ? `الأذان ${next.time}` : '';

  const cardWidth = 146 * s;
  const cardHeight = 120 * t * s;

  return (
    <OverlapWidget style={{ width: cardWidth, height: cardHeight }}>
      <SvgWidget
        svg={archCardSvg(cardWidth, cardHeight, 26 * s, 12 * s)}
        style={{ width: 'match_parent', height: 'match_parent' }}
      />
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FlexWidget
          style={{
            backgroundGradient: { from: C.goldDeep, to: C.goldBright, orientation: 'LEFT_RIGHT' },
            borderRadius: 6 * s,
            paddingHorizontal: 8 * s,
          }}
        >
          <TextWidget text={badge} style={{ fontFamily: F.label, fontSize: 8 * t * s, color: C.emerald950, textAlign: 'center' }} />
        </FlexWidget>

        {/* Prayer icon to the left of its name */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!!iconKey && (
            <SvgWidget
              svg={palacePrayerIconSvg(iconKey, C.goldBright)}
              style={{ width: 16 * t * s, height: 16 * t * s, marginRight: 5 * s }}
            />
          )}
          <TextWidget
            text={label}
            style={{
              fontFamily: F.calligraphy,
              fontSize: 22 * t * s,
              color: C.ivory100,
              textShadowColor: '#000000',
              textShadowRadius: 3,
              textShadowOffset: { width: 0, height: 1 },
            }}
          />
        </FlexWidget>

        {/* HH : MM countdown — redrawn every minute by masra-widget-clock */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MiniTimeBox value={hours} s={s * t} />
          <TextWidget text=":" style={{ fontFamily: F.timer, fontSize: 12 * t * s, color: C.goldBright, marginHorizontal: 4 * s }} />
          <MiniTimeBox value={minutes} s={s * t} />
        </FlexWidget>

        {/* Adhan / iqama time — large and bold for readability */}
        <TextWidget
          text={footer}
          style={{ fontFamily: F.label, fontSize: 11.5 * t * s, color: C.goldBright, textAlign: 'center', marginTop: 2 * s }}
        />
      </FlexWidget>
    </OverlapWidget>
  );
}

function MiniTimeBox({ value, s }: { value: string; s: number }) {
  return (
    <FlexWidget
      style={{
        width: 25 * s,
        height: 22 * s,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.timeBoxBg,
        borderWidth: 1,
        borderColor: C.timeBoxBorder,
        borderRadius: 3 * s,
      }}
    >
      <TextWidget text={value} style={{ fontFamily: F.timer, fontSize: 13.5 * s, color: C.goldLight, textAlign: 'center' }} />
    </FlexWidget>
  );
}
