import React from 'react';
import { FlexWidget, TextWidget, SvgWidget, OverlapWidget } from 'react-native-android-widget';
import {
  PREMIUM_COLORS as COLORS,
  LUXURY_PRAYER_BG_SVG,
  locationPinIconSvg,
  mosqueDomeIconSvg,
  prayerIconSvg,
  starSeparatorSvg,
  type PrayerIconKey,
} from './widgetTheme';

// ========================================== 
// 📱 ويدجت الشاشة الرئيسية — النسخة "الفاخرة v6"
// ==========================================
// استجابة لمواصفات تقنية مفصّلة أرسلها المستخدم (إطار مزدوج، زخارف
// أرابيسك بالزوايا، وشم مسجد خفي، قوس إسلامي لبطاقة "أقرب صلاة"، حاوية
// منفصلة لصف الصلوات، تمييز ذهبي للصلاة النشطة، فواصل نجمية بين
// الأعمدة). كل عنصر منها موجود هون — ما عدا نقطتين تحديداً غيّرتهم
// عمداً، ومكتوب ليش تحت كل وحدة منهم بالتعليقات:
//
//  1) بطاقة "أقرب صلاة": مش قوس SVG كامل داخل OverlapWidget متداخل.
//     بدلها: صندوق FlexWidget عادي بحدّ ذهبي موحّد الزوايا (borderRadius
//     رقم واحد بس). السبب: هاي المكتبة (react-native-android-widget)
//     ما بتدعم borderRadius منفصل لكل زاوية (زي CSS الحقيقي) — فقط رقم
//     واحد موحّد، بالضبط متل ما alignItems ما بتدعم 'stretch' (خطأ
//     تايب حقيقي انصادفنا فيه قبل). ومحاولة عمل قوس بـOverlapWidget
//     متداخل بدون width/height صريح تعتمد على افتراض "wrap content"
//     غير مختبر على جهازك بعد — بالضبط نوع الافتراض غير المؤكد يلي
//     سبب مشكلتين فيضان (overflow) متتاليتين بالنسختين السابقتين. حتى
//     ما نرجع لنفس الغلطة لثالث مرة، القوس الحقيقي (PRAYER_ARCH_CARD_SVG)
//     موجود جاهز بـwidgetTheme.ts للتجربة بعدين، بس مش مستخدم هون.
//
//  2) صف الصلوات الخمس: محاط بحد FlexWidget عادي (borderWidth+
//     borderRadius+borderColor) بدل BOTTOM_PRAYERS_CONTAINER_SVG. نفس
//     السبب بالضبط: تقنية العنصر المتداخل غير المختبرة. أسلوب الحد
//     العادي هاد بالذات هو يلي انفحص فعلياً على جهازك مرتين (v4 وv5)
//     بدون ولا مشكلة overflow واحدة، فهو الأكيد.
//
// الخلفية الكاملة (LUXURY_PRAYER_BG_SVG) بالمقابل آمنة ١٠٠٪ ومستخدمة
// بالكامل زي ما هي: إطار ذهبي مزدوج + ٤ زخارف أرابيسك بالزوايا (نجمة
// كبيرة + نجمتين صغار مرافقتين لكل زاوية) + وشم مسجد خفي جداً (٥٪
// شفافية) بمنتصف الخلفية — لأنها مجرد رسمة SVG بتتمطّط تلقائياً لحجم
// الويدجت الفعلي (preserveAspectRatio="none" + match_parent)، فما
// فيها ولا بكسل محتوى حقيقي يقدر "يفيض" خارج حدودها.
//
// ⚠️ ملاحظات تقنية عامة محفوظة من تجارب سابقة على هاي المكتبة:
//  • RemoteViews (أندرويد) ما بتدعم overflow:'hidden' فعلياً — أي عنصر
//    أطول/أعرض من حاويته أو من صندوق الويدجت الحقيقي بيطلع فايض على
//    الشاشة الرئيسية مباشرة، بدون قص. لهيك كل الأحجام هون محافظ عليها
//    عمداً (خطوط وحشوات صغيرة) — نفس الدرس المستفاد من overflow حقيقي
//    صار مرتين على جهازك بالنسخ السابقة.
//  • ما في React.Fragment إطلاقاً بهاد الملف.
//  • alignItems بس center/flex-start/flex-end (مافي stretch).
//  • المكتبة ما بتعمل mirror تلقائي لـflexDirection:'row' حسب لغة
//    الجهاز — أول عنصر بالـJSX دايماً أقصى اليسار. لهيك رتّبنا صف
//    الرأس وصف الصلوات الخمس يدوياً حتى الفجر يطلع أقصى اليمين
//    (قراءة عربية RTL طبيعية).
//  • هاد تغيير بصري/JS بحت — ما لمسنا app.json، فبينشحن بـ`eas update`
//    بس، بدون بيلد جديد.

export type PrayerTimingsShape = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export type AllPrayerTimesWidgetProps = {
  timings?: PrayerTimingsShape | null;
  activeName?: string;
  /** @deprecated ما عاد يُعرض — الإقامة شيلت من النسخ السابقة */
  isIqama?: boolean;
  nextPrayerTime?: string;
  countdown?: string;
};

const APP_NAME = 'مسرى المسلم';
const CARD_DARK = '#0B3026';

// ترتيب دلالي طبيعي (فجر → عشاء) — بيترسم بالعكس بصف الصلوات الخمس
// (شوف .reverse() تحت) حتى الفجر يطلع أقصى اليمين بصرياً.
const FIVE_PRAYERS: { key: keyof PrayerTimingsShape; iconKey: PrayerIconKey; label: string }[] = [
  { key: 'Fajr', iconKey: 'Fajr', label: 'الفجر' },
  { key: 'Dhuhr', iconKey: 'Dhuhr', label: 'الظهر' },
  { key: 'Asr', iconKey: 'Asr', label: 'العصر' },
  { key: 'Maghrib', iconKey: 'Maghrib', label: 'المغرب' },
  { key: 'Isha', iconKey: 'Isha', label: 'العشاء' },
];

export function AllPrayerTimesWidget({ timings, activeName, nextPrayerTime }: AllPrayerTimesWidgetProps) {
  const nameToKey: Record<string, keyof PrayerTimingsShape> = {
    الفجر: 'Fajr',
    الظهر: 'Dhuhr',
    العصر: 'Asr',
    المغرب: 'Maghrib',
    العشاء: 'Isha',
  };
  const heroTime =
    nextPrayerTime || (timings && activeName && nameToKey[activeName] ? timings[nameToKey[activeName]] : '');

  // ===== صف الصلوات الخمس: مصفوفة عناصر مبنية يدوياً (بدل .map عادي)
  // حتى نقدر ندس فاصل نجمة صغيرة بين كل عمودين، بدون React.Fragment.
  const orderedPrayers = [...FIVE_PRAYERS].reverse();
  const prayerRowChildren: React.ReactNode[] = [];
  orderedPrayers.forEach((p, idx) => {
    if (idx > 0) {
      prayerRowChildren.push(
        <SvgWidget
          key={`sep-${p.key}`}
          svg={starSeparatorSvg(COLORS.gold, 0.6)}
          style={{ width: 7, height: 7 }}
        />
      );
    }
    const isActive = p.label === activeName;
    const time = timings ? timings[p.key] || '--:--' : '--:--';
    const tone = isActive ? COLORS.goldBright : COLORS.ivory;
    prayerRowChildren.push(
      <FlexWidget
        key={p.key}
        style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <SvgWidget svg={prayerIconSvg(p.iconKey, isActive ? COLORS.goldBright : COLORS.gold)} style={{ width: 11, height: 11 }} />
        <TextWidget
          text={p.label}
          style={{ fontSize: 8.5, color: tone, fontWeight: 'bold', textAlign: 'center', marginTop: 1 }}
        />
        <TextWidget text={time} style={{ fontSize: 12, color: tone, fontWeight: '600', textAlign: 'center' }} />
      </FlexWidget>
    );
  });

  return (
    <OverlapWidget style={{ height: 'match_parent', width: 'match_parent' }}>
      <SvgWidget svg={LUXURY_PRAYER_BG_SVG} style={{ width: 'match_parent', height: 'match_parent' }} />

      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 4,
        }}
      >
        {/* ===== ١) صف الرأس — ٣ مناطق متساوية (flex:1 لكل وحدة) حتى
            يطلع الدبّوس بالنص فعلياً، مش بس ملاصق لليسار ===== */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', width: 'match_parent' }}>
          <FlexWidget style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
            <SvgWidget svg={starSeparatorSvg(COLORS.gold, 0.8)} style={{ width: 10, height: 10 }} />
          </FlexWidget>

          <FlexWidget style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <SvgWidget svg={locationPinIconSvg(COLORS.gold)} style={{ width: 11, height: 11 }} />
          </FlexWidget>

          <FlexWidget style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <TextWidget
              text={APP_NAME}
              style={{ fontSize: 11, color: COLORS.goldBright, fontWeight: 'bold', textAlign: 'right', marginLeft: 5 }}
            />
            <FlexWidget
              style={{
                width: 17,
                height: 17,
                borderRadius: 9,
                borderWidth: 1,
                borderColor: COLORS.gold,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SvgWidget svg={mosqueDomeIconSvg(COLORS.gold)} style={{ width: 10, height: 10 }} />
            </FlexWidget>
          </FlexWidget>
        </FlexWidget>

        {/* ===== ٢) بطاقة "أقرب صلاة" — حدّ ذهبي موحّد الزوايا (شوف
            التعليق بأعلى الملف ليش مش قوس SVG حقيقي هالمرة) ===== */}
        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'center', width: 'match_parent' }}>
          <FlexWidget
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.gold,
              borderRadius: 12,
              paddingHorizontal: 18,
              paddingVertical: 3,
            }}
          >
            <FlexWidget
              style={{
                backgroundColor: COLORS.gold,
                borderRadius: 7,
                paddingHorizontal: 8,
                paddingVertical: 1,
                marginBottom: 2,
              }}
            >
              <TextWidget
                text="أقرب صلاة"
                style={{ fontSize: 8, color: CARD_DARK, fontWeight: 'bold', textAlign: 'center' }}
              />
            </FlexWidget>
            <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextWidget
                text={activeName || '—'}
                style={{ fontSize: 14, color: COLORS.ivory, fontWeight: 'bold', textAlign: 'center', marginLeft: 6 }}
              />
              <TextWidget
                text={heroTime || '--:--'}
                style={{ fontSize: 19, color: COLORS.goldBright, fontWeight: 'bold', textAlign: 'center' }}
              />
            </FlexWidget>
          </FlexWidget>
        </FlexWidget>

        {/* ===== ٣) خط فاصل رفيع + نجمة صغيرة بالمنتصف ===== */}
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', width: 'match_parent' }}>
          <FlexWidget style={{ flex: 1, height: 1, backgroundColor: COLORS.goldDivider }} />
          <SvgWidget
            svg={starSeparatorSvg(COLORS.goldBright, 0.85)}
            style={{ width: 8, height: 8, marginHorizontal: 5 }}
          />
          <FlexWidget style={{ flex: 1, height: 1, backgroundColor: COLORS.goldDivider }} />
        </FlexWidget>

        {/* ===== ٤) صف الصلوات الخمس — جوا حاوية بحدّ ذهبي خفيف (شوف
            التعليق بأعلى الملف ليش مش SVG منفصل)، فواصل نجمية بين كل
            عمودين، والصلاة النشطة مميّزة بالذهبي الفاقع بدل العاجي
            ===== */}
        <FlexWidget
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: 'match_parent',
            borderWidth: 1,
            borderColor: COLORS.goldDivider,
            borderRadius: 12,
            paddingHorizontal: 6,
            paddingVertical: 3,
          }}
        >
          {prayerRowChildren}
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}
