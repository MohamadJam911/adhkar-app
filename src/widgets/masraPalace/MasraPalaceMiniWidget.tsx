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
// 📱 ويدجت 2×2 "الصلاة القادمة" — نسخة مصغّرة من "القصر الزمردي"
// ==========================================
// نفس الخلفية والذهبي والخطوط وبطاقة القوس تبع ويدجت الـ4×2
// (MasraPalaceWidget.tsx)، بس مرتّبة عمودياً لمربّع:
//   الهوية (شعار + الاسم) ← بطاقة القوس (الشارة، أيقونة واسم الصلاة،
//   العدّاد HH:MM، وقت الأذان) ← اسم المدينة.
// وبين الأذان والإقامة البطاقة بتتحوّل لـ"حان الآن وقت …" مع عدّاد
// الإقامة (نفس ميزة الويدجت الصغير القديم).
//
// المقاسات بوحدات شبكة 170×200 مضروبة بـs = min(عرض/170، ارتفاع/200) —
// بتحافظ على النسب من 2×2 صغير (~110dp) لـ2×2 طويل (سامسونج ~181×261).

const APP_NAME = 'مسرى المسلم';
const REF_WIDTH = 170;
const REF_HEIGHT = 200;
const DEFAULT_SIZE = 150;

export type MasraPalaceMiniWidgetProps = {
  model: MasraPalaceViewModel;
  widgetWidth?: number;
  widgetHeight?: number;
};

export function MasraPalaceMiniWidget({ model, widgetWidth, widgetHeight }: MasraPalaceMiniWidgetProps) {
  const width = widgetWidth || DEFAULT_SIZE;
  const height = widgetHeight || DEFAULT_SIZE;
  const s = Math.min(width / REF_WIDTH, height / REF_HEIGHT);

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
        {/* الهوية: الشعار يسار الاسم (ترتيب RTL يدوي) */}
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

        <MiniArchCard model={model} s={s} />

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

function MiniArchCard({ model, s }: { model: MasraPalaceViewModel; s: number }) {
  const iqama = model.iqama;
  const next = model.next;

  // وقت الإقامة: البطاقة بتعرض الصلاة الحالية وعدّاد الإقامة؛ غير هيك الصلاة القادمة وعدّادها
  const badge = iqama ? 'حان الآن وقت' : next?.isTomorrow ? 'أقرب صلاة • غداً' : 'أقرب صلاة';
  const iconKey = iqama?.key ?? next?.key;
  const label = iqama?.label ?? next?.label ?? '—';
  const hours = iqama?.remainingHours ?? next?.remainingHours ?? '--';
  const minutes = iqama?.remainingMinutes ?? next?.remainingMinutes ?? '--';
  const footer = iqama ? `الإقامة ${iqama.time}` : next ? `الأذان ${next.time}` : '';

  const cardWidth = 146 * s;
  const cardHeight = 120 * s;

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
          <TextWidget text={badge} style={{ fontFamily: F.label, fontSize: 8 * s, color: C.emerald950, textAlign: 'center' }} />
        </FlexWidget>

        {/* أيقونة الصلاة يسار اسمها */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!!iconKey && (
            <SvgWidget
              svg={palacePrayerIconSvg(iconKey, C.goldBright)}
              style={{ width: 16 * s, height: 16 * s, marginRight: 5 * s }}
            />
          )}
          <TextWidget
            text={label}
            style={{
              fontFamily: F.calligraphy,
              fontSize: 22 * s,
              color: C.ivory100,
              textShadowColor: '#000000',
              textShadowRadius: 3,
              textShadowOffset: { width: 0, height: 1 },
            }}
          />
        </FlexWidget>

        {/* العدّاد HH : MM — بيتحدّث كل دقيقة عبر masra-widget-clock */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MiniTimeBox value={hours} s={s} />
          <TextWidget text=":" style={{ fontFamily: F.timer, fontSize: 12 * s, color: C.goldBright, marginHorizontal: 4 * s }} />
          <MiniTimeBox value={minutes} s={s} />
        </FlexWidget>

        {/* وقت الأذان/الإقامة — كبير وعريض لسهولة القراءة */}
        <TextWidget
          text={footer}
          style={{ fontFamily: F.label, fontSize: 11.5 * s, color: C.goldBright, textAlign: 'center', marginTop: 2 * s }}
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
