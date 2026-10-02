import React from 'react';
import { FlexWidget, TextWidget, SvgWidget, OverlapWidget } from 'react-native-android-widget';
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
// "Emerald Palace" widget (4×2)
// ==========================================
// Layout on a 400×200 reference grid: the "next prayer" arch card on the
// left, the identity (app name in Amiri + Dome of the Rock emblem) on the
// right, and the five prayers below. Every size is in grid units multiplied
// by s = min(width/400, height/200), so the design keeps its proportions at
// any widget size and never overflows, even on the smallest launchers (~110dp).
//
// Library constraints:
//  • no React.Fragment; alignItems without stretch.
//  • rows are not mirrored for RTL automatically — every row is ordered by hand.

const APP_NAME = 'مسرى المسلم';
const REF_WIDTH = 400;
// Real design height in grid units (16 top padding + 118 arch card + ≈78
// prayer row + 18 bottom padding). Cairo and Amiri have tall line boxes
// (≈1.9× and ≈2.7× the font size), so the large text is budgeted here and s
// is computed from this height to avoid overflow.
const REF_HEIGHT = 234; // includes a small safety margin

type ModelProps = {
  model: MasraPalaceViewModel;
};

type ScaledProps = ModelProps & { s: number };

// Real widget size (dp) as reported by Android — needed so the background
// is drawn at the widget's aspect ratio and covers it fully (see
// palaceBackgroundSvg), and to compute the scale factor s.
export type MasraPalaceWidgetProps = ModelProps & {
  widgetWidth?: number;
  widgetHeight?: number;
};

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 160;

export function MasraPalaceWidget({ model, widgetWidth, widgetHeight }: MasraPalaceWidgetProps) {
  const width = widgetWidth || DEFAULT_WIDTH;
  const height = widgetHeight || DEFAULT_HEIGHT;
  const s = Math.min(width / REF_WIDTH, height / REF_HEIGHT);

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
          paddingBottom: 18 * s,
          paddingHorizontal: 20 * s,
        }}
      >
        {/* ===== Top row: arch card on the left, identity on the right (manual RTL) ===== */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-start', width: 'match_parent' }}>
          <FlexWidget style={{ marginLeft: 7 * s }}>
            <NextPrayerArchCard model={model} s={s} />
          </FlexWidget>
          <FlexWidget style={{ flex: 1 }} />
          <FlexWidget style={{ marginRight: 13 * s }}>
            <BrandBlock model={model} s={s} />
          </FlexWidget>
        </FlexWidget>

        {/* ===== Five prayers — Fajr on the far right ===== */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', width: 'match_parent' }}>
          {[...model.prayers].reverse().map((p) => (
            <PrayerCell key={p.key} prayer={p} s={s} />
          ))}
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}

// App name in Amiri + emblem in a gold circle, a star divider, and a
// "city • Hijri date" line
function BrandBlock({ model, s }: ScaledProps) {
  const emblem = 28 * s;
  // The column takes the width of its widest line (name + emblem); it is not
  // fixed so Amiri never wraps, and the divider and line below stretch with it.
  return (
    <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <FlexWidget
          style={{
            width: emblem,
            height: emblem,
            borderRadius: emblem / 2,
            borderWidth: 1,
            borderColor: C.goldMetallic,
            backgroundColor: C.emblemRingBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8 * s,
          }}
        >
          <SvgWidget svg={pureGoldDomeEmblemSvg()} style={{ width: emblem * 0.72, height: emblem * 0.72 }} />
        </FlexWidget>
        <TextWidget
          text={APP_NAME}
          maxLines={1}
          style={{
            fontFamily: F.calligraphy,
            fontSize: 20 * s,
            color: C.goldBright,
            textAlign: 'right',
            textShadowColor: '#000000',
            textShadowRadius: 3,
            textShadowOffset: { width: 0, height: 1 },
          }}
        />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', width: 'match_parent', marginTop: 3 * s }}>
        <FlexWidget style={{ flex: 1, height: 1, backgroundColor: C.goldDivider }} />
        <SvgWidget svg={dividerStarSvg(C.goldBright)} style={{ width: 8 * s, height: 8 * s, marginHorizontal: 4 * s }} />
        <FlexWidget style={{ flex: 1, height: 1, backgroundColor: C.goldDivider }} />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 * s }}>
        <TextWidget text={model.hijriDate} maxLines={1} style={{ fontFamily: F.body, fontSize: 7.5 * s, color: C.ivory300 }} />
        <TextWidget text="  •  " style={{ fontFamily: F.body, fontSize: 7.5 * s, color: C.goldDeep }} />
        <TextWidget
          text={model.cityLabel}
          maxLines={1}
          truncate="END"
          style={{ fontFamily: F.label, fontSize: 8 * s, color: C.ivory100, textAlign: 'right' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

// "Next prayer" card — an Islamic arch (large top radii, smaller bottom ones)
function NextPrayerArchCard({ model, s }: ScaledProps) {
  const next = model.next;
  const badge = next?.isTomorrow ? 'أقرب صلاة • غداً' : 'أقرب صلاة';

  // Fixed height (not wrap_content) because the SVG arch needs its size up
  // front: 118 units = card content (badge ≈16 + prayer name ≈66 with the
  // tall Amiri font + countdown 24) + 6 units of margin above and below.
  const cardWidth = 150 * s;
  const cardHeight = 118 * s;

  return (
    <OverlapWidget style={{ width: cardWidth, height: cardHeight }}>
      <SvgWidget
        svg={archCardSvg(cardWidth, cardHeight, 24 * s, 12 * s)}
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
          <TextWidget
            text={badge}
            style={{ fontFamily: F.label, fontSize: 8.5 * s, color: C.emerald950, textAlign: 'center' }}
          />
        </FlexWidget>

        <TextWidget
          text={next?.label || '—'}
          style={{
            fontFamily: F.calligraphy,
            fontSize: 24 * s,
            color: C.ivory100,
            textAlign: 'center',
            textShadowColor: '#000000',
            textShadowRadius: 3,
            textShadowOffset: { width: 0, height: 1 },
          }}
        />

        {/* HH : MM countdown — redrawn every minute by masra-widget-clock */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TimeBox value={next?.remainingHours || '--'} s={s} />
          <TextWidget text=":" style={{ fontFamily: F.timer, fontSize: 14 * s, color: C.goldBright, marginHorizontal: 4 * s }} />
          <TimeBox value={next?.remainingMinutes || '--'} s={s} />
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}

function TimeBox({ value, s }: { value: string; s: number }) {
  return (
    <FlexWidget
      style={{
        width: 29 * s,
        height: 24 * s,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.timeBoxBg,
        borderWidth: 1,
        borderColor: C.timeBoxBorder,
        borderRadius: 3 * s,
      }}
    >
      <TextWidget text={value} style={{ fontFamily: F.timer, fontSize: 15 * s, color: C.goldLight, textAlign: 'center' }} />
    </FlexWidget>
  );
}

function PrayerCell({ prayer, s }: { prayer: PalacePrayerCell; s: number }) {
  const active = prayer.isNext;
  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 3 * s,
        paddingVertical: 3 * s,
        borderRadius: 8 * s,
        borderWidth: active ? 1.5 : 1,
        borderColor: active ? C.activeCellBorder : C.inactiveCellBorder,
        backgroundColor: active ? C.activeCellBg : C.inactiveCellBorder,
      }}
    >
      <SvgWidget
        svg={palacePrayerIconSvg(prayer.key, active ? C.goldBright : C.ivory300)}
        style={{ width: 13 * s, height: 13 * s, marginBottom: 1 * s }}
      />
      {/* Large, bold names and times for easy reading */}
      <TextWidget
        text={prayer.label}
        style={{ fontFamily: F.label, fontSize: 16 * s, color: active ? C.goldBright : C.ivory100, textAlign: 'center' }}
      />
      <TextWidget
        text={prayer.time}
        style={{ fontFamily: F.label, fontSize: 15 * s, color: active ? C.ivory50 : C.ivory200, textAlign: 'center' }}
      />
    </FlexWidget>
  );
}
