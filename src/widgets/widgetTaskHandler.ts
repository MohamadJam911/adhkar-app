import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { MasraPalaceWidgetController } from './masraPalace';

// هاي الدالة بتشتغل بشكل "headless" (بدون ما يكون التطبيق مفتوح أصلاً)،
// وبتنفذ لما: المستخدم يضيف ويدجت من ويدجتس التطبيق (WIDGET_ADDED)، أو
// لما يصير تحديث (WIDGET_UPDATE — كل دقيقة عبر منبّه masra-widget-clock،
// أو كل نص ساعة من أندرويد كاحتياط)، أو لما المستخدم يغيّر حجمه
// (WIDGET_RESIZED)، أو لما يضغط عليه (WIDGET_CLICK).
//
// الويدجتين (الـ4×2 "MasraPalaceWidget" والـ2×2 "PrayerWidget") بيحسبوا
// مواقيتهم بنفسهم من جدول DAHRI_TIMES — شوف src/widgets/masraPalace.
// أندرويد بس: على الآيفون الويدجتس مكتوبة بـSwift (targets/widget).
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetName } = props.widgetInfo;
  if (!MasraPalaceWidgetController.handles(widgetName)) return;

  if (props.widgetAction === 'WIDGET_DELETED') {
    // منعيد الحجز (أو منلغيه إذا ما ضل ولا نسخة على الشاشة) — الموديول
    // الأصلي بيرجع "no-widgets" وبيلغي المنبّه لحاله بهالحالة.
    MasraPalaceWidgetController.rescheduleOrCancel(widgetName);
    return;
  }

  // clickAction="OPEN_APP" بيفتح التطبيق تلقائياً وقت الضغط — منعيد
  // الرسم بكل الحالات (إضافة، تحديث، تغيير حجم، ضغط).
  props.renderWidget(await MasraPalaceWidgetController.buildElement(null, props.widgetInfo, widgetName));
}
