import React from 'react';
import { FlexWidget, TextWidget, SvgWidget, OverlapWidget } from 'react-native-android-widget';
import { WIDGET_COLORS as COLORS, CRESCENT_STAR_SVG, WIDGET_BACKGROUND_SVG } from './widgetTheme';

// ==========================================
// 📱 ويدجت الشاشة الرئيسية: الصلاة القادمة
// ==========================================
// ملاحظة: هاي المكتبة (react-native-android-widget) بتدعم مجموعة محدودة
// من خصائص الستايل تشبه React Native، مش كل شي. FlexWidget بيعتمد فليكس
// بوكس، وTextWidget بياخد النص بخاصية text مش children. OverlapWidget
// بيسمح بتكديس عناصر فوق بعض (متل FrameLayout بأندرويد) — نستخدمه هون
// لعرض خلفية الزخرفة الإسلامية (WIDGET_BACKGROUND_SVG) خلف طبقة المحتوى
// النصي مباشرة.

export type PrayerWidgetProps = {
  /** اسم الصلاة القادمة (أو الحالية وقت الإقامة)، مثلاً "الفجر" */
  nextPrayerName: string;
  /** وقت الصلاة بصيغة نص جاهزة للعرض (أرقام غربية أو شرقية حسب المستدعي) */
  nextPrayerTime: string;
  /** نص العدّ التنازلي الجاهز للعرض، مثلاً "متبقي ساعة و 10 دقائق" */
  countdown?: string;
  /** true لما يكون الوقت الحالي هو وقت إقامة الصلاة فعلياً (مش قبلها) */
  isIqama?: boolean;
  /** عرض/ارتفاع الويدجت الحالي بالـ dp — بتوصل من widgetTaskHandler وقت
   * الإضافة أو تغيير الحجم أو التحديث الدوري، ونستخدمها لاختيار تصميم
   * "مصغّر" أو "موسّع" تلقائياً حسب الحجم اللي اختاره المستخدم فعلياً. */
  widgetWidth?: number;
  widgetHeight?: number;
};

export function PrayerWidget({
  nextPrayerName,
  nextPrayerTime,
  countdown,
  isIqama,
  widgetWidth,
  widgetHeight,
}: PrayerWidgetProps) {
  const hasData = !!nextPrayerName;

  // الحجم الافتراضي للويدجت صار 2×2 خلية (حوالي 110dp×110dp) بدل 4×2
  // القديم الكبير. بهاد الحجم أو أصغر منعرض تصميم مصغّر (الاسم والوقت بس)،
  // ولو المستخدم كبّر الويدجت من الشاشة الرئيسية (resizeMode بيسمحله يوصل
  // لأي حجم يريده بحرية كاملة) منعرض تلقائياً التصميم الموسّع بكل التفاصيل
  // (العنوان، الفاصل الزخرفي، العد التنازلي).
  const isCompact = (widgetHeight ?? 110) < 140 || (widgetWidth ?? 110) < 150;

  return (
    <OverlapWidget style={{ height: 'match_parent', width: 'match_parent', borderRadius: 20, overflow: 'hidden' }}>
      {/* الطبقة الخلفية: الزخرفة الإسلامية (نقش هندسي + نجمات الزوايا)،
          نفس هوية خلفية التطبيق الأصلية */}
      <SvgWidget svg={WIDGET_BACKGROUND_SVG} style={{ width: 'match_parent', height: 'match_parent' }} />

      {/* طبقة المحتوى: فوق الخلفية مباشرة، بدون أي لون خلفية خاص فيها
          (شفافة) حتى تبين الزخرفة تحتها بوضوح */}
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isCompact ? 10 : 14,
        }}
      >
        {hasData ? (
          <FlexWidget
            style={{
              width: 'match_parent',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <SvgWidget
                svg={CRESCENT_STAR_SVG}
                style={{ width: isCompact ? 12 : 14, height: isCompact ? 12 : 14, marginRight: 4 }}
              />
              {!isCompact && (
                <TextWidget
                  text={isIqama ? 'حان الآن وقت' : 'الصلاة القادمة'}
                  style={{
                    fontSize: 13,
                    color: COLORS.gold,
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                />
              )}
            </FlexWidget>

            {!isCompact && (
              <FlexWidget
                style={{
                  height: 1,
                  width: 40,
                  marginTop: 5,
                  marginBottom: 3,
                  borderTopWidth: 1,
                  borderStyle: 'dotted',
                  borderColor: COLORS.goldDivider,
                }}
              />
            )}

            <FlexWidget style={{ height: isCompact ? 3 : 5, width: 'wrap_content' }} />

            <TextWidget
              text={nextPrayerName}
              style={{
                fontSize: isCompact ? 18 : 26,
                color: COLORS.textPrimary,
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            />

            <TextWidget
              text={nextPrayerTime}
              style={{
                fontSize: isCompact ? 13 : 16,
                color: COLORS.textSecondary,
                textAlign: 'center',
                marginTop: 2,
              }}
            />

            {!isCompact && !!countdown && (
              <FlexWidget
                style={{
                  marginTop: 8,
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: COLORS.goldSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TextWidget
                  text={countdown}
                  style={{
                    fontSize: 12,
                    color: COLORS.gold,
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                />
              </FlexWidget>
            )}
          </FlexWidget>
        ) : (
          <FlexWidget
            style={{
              width: 'match_parent',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SvgWidget svg={CRESCENT_STAR_SVG} style={{ width: isCompact ? 14 : 16, height: isCompact ? 14 : 16, marginBottom: 4 }} />
            {!isCompact && (
              <TextWidget
                text="مسرى المسلم"
                style={{
                  fontSize: 15,
                  color: COLORS.gold,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              />
            )}
            <TextWidget
              text={isCompact ? 'افتح التطبيق' : (countdown || 'اضغط لفتح التطبيق وعرض مواقيت الصلاة')}
              style={{
                fontSize: isCompact ? 11 : 12,
                color: COLORS.textSecondary,
                textAlign: 'center',
                marginTop: 4,
              }}
            />
          </FlexWidget>
        )}
      </FlexWidget>
    </OverlapWidget>
  );
}
