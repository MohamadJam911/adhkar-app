import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { PrayerWidget } from './PrayerWidget';
import { AllPrayerTimesWidget } from './AllPrayerTimesWidget';
import { getPrayerStatus, formatArabicNumbers, PrayerTimings } from './widgetStatus';

// نفس المفتاح اللي بيستخدمه src/utils/prayerLogic.tsx لتخزين آخر مواقيت
// صلاة محسوبة (شوف updateAndroidWidget هناك)
export const WIDGET_TIMINGS_STORAGE_KEY = '@widget_prayer_timings';

// أسماء الويدجتس المسجّلة بـ app.json (لازم تطابق حقل "name" بكل عنصر
// جوا مصفوفة widgets هناك بالضبط)
const WIDGET_NAME_NEXT = 'PrayerWidget';
const WIDGET_NAME_ALL = 'AllPrayerTimesWidget';

// هاي الدالة بتشتغل بشكل "headless" (بدون ما يكون التطبيق مفتوح أصلاً)،
// وبتنفذ لما: المستخدم يضيف أي ويدجت من ويدجتس التطبيق لأول مرة
// (WIDGET_ADDED)، أو لما نظام أندرويد يعمل تحديث دوري له (WIDGET_UPDATE،
// كل نص ساعة تقريباً كحد أدنى)، أو لما المستخدم يغيّر حجمه (WIDGET_RESIZED)
// — وهون بالذات منستفيد من الحجم الجديد لإعادة رسم PrayerWidget بتصميم
// مصغّر أو موسّع حسب الحجم اللي اختاره المستخدم فعلياً — أو لما يضغط عليه
// (WIDGET_CLICK).
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetName } = props.widgetInfo;
  if (widgetName !== WIDGET_NAME_NEXT && widgetName !== WIDGET_NAME_ALL) return;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    case 'WIDGET_CLICK': {
      // clickAction="OPEN_APP" على الويدجتس بيفتح التطبيق تلقائياً وقت
      // الضغط، ما في داعي لأي منطق إضافي بحالة WIDGET_CLICK — بس منعيد رسم
      // آخر حالة معروفة احتياطاً.
      props.renderWidget(await buildWidgetElement(widgetName, props));
      break;
    }
    case 'WIDGET_DELETED':
    default:
      break;
  }
}

async function buildWidgetElement(widgetName: string, props: WidgetTaskHandlerProps) {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_TIMINGS_STORAGE_KEY);
    const timings: PrayerTimings | null = raw ? JSON.parse(raw) : null;
    const status = timings ? getPrayerStatus(timings) : null;

    if (widgetName === WIDGET_NAME_ALL) {
      return React.createElement(AllPrayerTimesWidget, {
        timings: timings || undefined,
        activeName: status?.name,
        nextPrayerTime: status ? formatArabicNumbers(status.time) : undefined,
        countdown: status?.countdown,
      });
    }

    if (!status) {
      return React.createElement(PrayerWidget, {
        nextPrayerName: '',
        nextPrayerTime: '',
        widgetWidth: props.widgetInfo.width,
        widgetHeight: props.widgetInfo.height,
      });
    }

    return React.createElement(PrayerWidget, {
      nextPrayerName: status.name,
      nextPrayerTime: formatArabicNumbers(status.time),
      countdown: status.countdown,
      isIqama: status.isIqama,
      widgetWidth: props.widgetInfo.width,
      widgetHeight: props.widgetInfo.height,
    });
  } catch (e) {
    if (widgetName === WIDGET_NAME_ALL) {
      return React.createElement(AllPrayerTimesWidget, {});
    }
    return React.createElement(PrayerWidget, { nextPrayerName: '', nextPrayerTime: '' });
  }
}