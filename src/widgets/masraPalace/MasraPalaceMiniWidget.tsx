import React from 'react';
import { FlexWidget, SvgWidget, OverlapWidget } from 'react-native-android-widget';
import { AmiriText, CountdownStrip, DomeEmblem, GoldBadge, Label } from './MasraPalaceWidget';
import { PALACE_COLORS as C, PALACE_FONTS as F, archCardSvg, palaceBackgroundSvg, palacePrayerIconSvg } from './masraPalaceTheme';
import type { MasraPalaceViewModel } from './MasraPalaceWidgetModel';

// ==========================================
// 2×2 "next prayer" widget — a port of the small iPhone widget
// ==========================================
// Same layout and numbers as SmallPalaceLayout in
// targets/widget/MasraWidgetViews.swift: identity (name + emblem) → arch card
// (badge, prayer name and icon, countdown strip, adhan time) → city.
// Between adhan and iqama the card shows "حان الآن وقت …" with the iqama
// countdown.
//
// Sizes are on a 170-wide grid multiplied by s = min(width/170, height/designHeight).
// `t` (the widget text size from Settings) scales every text, icon and the
// card together, so the proportions stay the same at every size.

const APP_NAME = 'مسرى المسلم';
const REF_WIDTH = 170;
const DEFAULT_SIZE = 150;

/** Text heights at t = 1 (grid units) that grow with t: card text 101, identity 25, city 17. */
const designHeightFor = (t: number) => 190 + 143 * (t - 1);

export type MasraPalaceMiniWidgetProps = {
  model: MasraPalaceViewModel;
  widgetWidth?: number;
  widgetHeight?: number;
  /** Text scale from the widget text size setting (1 = default). */
  textScale?: number;
};

export function MasraPalaceMiniWidget({ model, widgetWidth, widgetHeight, textScale = 1 }: MasraPalaceMiniWidgetProps) {
  const width = widgetWidth || DEFAULT_SIZE;
  const height = widgetHeight || DEFAULT_SIZE;
  const t = textScale;
  const s = Math.min(width / REF_WIDTH, height / designHeightFor(t));
  const u = s * t;

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
          paddingBottom: 10 * s,
        }}
      >
        {/* Identity: emblem to the left of the name (manual RTL) */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <DomeEmblem size={20 * u} />
          <FlexWidget style={{ width: 5 * u }} />
          <AmiriText text={APP_NAME} size={14 * u} color={C.goldBright} />
        </FlexWidget>

        <MiniArchCard model={model} s={s} t={t} />

        <Label text={model.cityLabel} style={{ fontFamily: F.label, fontSize: 9 * u, color: C.ivory200, textAlign: 'center' }} />
      </FlexWidget>
    </OverlapWidget>
  );
}

function MiniArchCard({ model, s, t }: { model: MasraPalaceViewModel; s: number; t: number }) {
  const u = s * t;
  const iqama = model.iqama;
  const next = model.next;

  // During iqama the card shows the current prayer and the iqama countdown; otherwise the next prayer
  const badge = iqama ? 'حان الآن وقت' : next?.isTomorrow ? 'أقرب صلاة • غداً' : 'أقرب صلاة';
  const iconKey = iqama?.key ?? next?.key;
  const label = iqama?.label ?? next?.label ?? '—';
  const hours = iqama?.remainingHours ?? next?.remainingHours;
  const minutes = iqama?.remainingMinutes ?? next?.remainingMinutes;
  const footer = iqama ? `الإقامة ${iqama.time}` : next ? `الأذان ${next.time}` : '';

  const cardWidth = 146 * u;
  const cardHeight = (116 + 101 * (t - 1)) * s;

  return (
    <OverlapWidget style={{ width: cardWidth, height: cardHeight }}>
      <SvgWidget svg={archCardSvg(cardWidth, cardHeight, 26 * s, 12 * s)} style={{ width: 'match_parent', height: 'match_parent' }} />
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
        <GoldBadge text={badge} size={8 * u} />
        <FlexWidget style={{ height: 3 * u }} />

        {/* Prayer icon to the left of its name */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!!iconKey && (
            <SvgWidget svg={palacePrayerIconSvg(iconKey, C.goldBright)} style={{ width: 13 * u, height: 13 * u, marginRight: 5 * u }} />
          )}
          <AmiriText text={label} size={22 * u} color={C.ivory100} />
        </FlexWidget>
        <FlexWidget style={{ height: 3 * u }} />

        {/* Redrawn every minute by masra-widget-clock */}
        <CountdownStrip hours={hours} minutes={minutes} size={14 * u} s={s} />
        <FlexWidget style={{ height: 3 * u }} />

        <Label text={footer} style={{ fontFamily: F.label, fontSize: 11.5 * u, color: C.goldBright, textAlign: 'center' }} />
      </FlexWidget>
    </OverlapWidget>
  );
}
