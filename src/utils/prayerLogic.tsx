import React from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MasraPalaceWidgetController } from '../widgets/masraPalace';
import { IosWidgetBridge } from '../widgets/ios/IosWidgetBridge';
import { formatArabicNumbers } from './formatters';
import type { QadaItem } from '../types';

// ==========================================
// 🛠️ دوال مساعدة لحساب الوقت، الإقامة، والسنن
// ==========================================
const getCountdownText = (targetTimeStr: string) => {
  if (!targetTimeStr) return '';
  const now = new Date();
  const [targetHours, targetMins] = targetTimeStr.split(':').map(Number);

  const target = new Date();
  target.setHours(targetHours, targetMins, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours > 0) return `متبقي ${formatArabicNumbers(hours)}س و ${formatArabicNumbers(mins)}د`;
  return `متبقي ${formatArabicNumbers(mins)}د`;
};

const getDuhaTimes = (sunriseStr: string, dhuhrStr: string) => {
  if (!sunriseStr || !dhuhrStr) return { start: '--:--', end: '--:--', rawStart: 0, rawEnd: 0 };
  const [sH, sM] = sunriseStr.split(':').map(Number);
  const [dH, dM] = dhuhrStr.split(':').map(Number);

  const startTotal = sH * 60 + sM + 15;
  const endTotal = dH * 60 + dM - 15;

  const startH = String(Math.floor(startTotal / 60)).padStart(2, '0');
  const startM = String(startTotal % 60).padStart(2, '0');
  const endH = String(Math.floor(endTotal / 60)).padStart(2, '0');
  const endM = String(endTotal % 60).padStart(2, '0');

  return {
    start: formatArabicNumbers(`${startH}:${startM}`),
    end: formatArabicNumbers(`${endH}:${endM}`),
    rawStart: startTotal,
    rawEnd: endTotal,
  };
};

const getPrayerStatus = (timings: any) => {
  if (!timings) return null;

  const prayers = [
    { name: 'الفجر', timeStr: timings.Fajr, iqamaMins: 20 },
    { name: 'الظهر', timeStr: timings.Dhuhr, iqamaMins: 15 },
    { name: 'العصر', timeStr: timings.Asr, iqamaMins: 15 },
    { name: 'المغرب', timeStr: timings.Maghrib, iqamaMins: 10 },
    { name: 'العشاء', timeStr: timings.Isha, iqamaMins: 15 },
  ];

  const now = new Date();

  for (const p of prayers) {
    const [h, m] = p.timeStr.split(':').map(Number);
    const pTime = new Date();
    pTime.setHours(h, m, 0, 0);
    const iqamaTime = new Date(pTime.getTime() + p.iqamaMins * 60 * 1000);

    if (now.getTime() >= pTime.getTime() && now.getTime() < iqamaTime.getTime()) {
      const diffSec = Math.floor((iqamaTime.getTime() - now.getTime()) / 1000);
      const remM = Math.floor(diffSec / 60);
      const remS = diffSec % 60;
      return {
        isIqama: true,
        name: p.name,
        time: p.timeStr,
        title: `حان الآن وقت صلاة ${p.name}`,
        countdown: `الإقامة بعد: ${formatArabicNumbers(remM)} دقيقة و ${formatArabicNumbers(remS)} ثانية`,
        silentNote: 'فضلاً، اجعل هاتفك على الوضع الصامت في المسجد',
      };
    }
  }

  for (const p of prayers) {
    const [h, m] = p.timeStr.split(':').map(Number);
    const pDate = new Date();
    pDate.setHours(h, m, 0, 0);

    if (pDate.getTime() > now.getTime()) {
      const diffMs = pDate.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      const countdown = hours > 0
        ? `متبقي ${formatArabicNumbers(hours)} ساعة و ${formatArabicNumbers(mins)} دقيقة`
        : `متبقي ${formatArabicNumbers(mins)} دقيقة`;

      return {
        isIqama: false,
        name: p.name,
        time: p.timeStr,
        title: `الصلاة القادمة: ${p.name} • ${formatArabicNumbers(p.timeStr)}`,
        countdown,
        silentNote: null,
      };
    }
  }

  return {
    isIqama: false,
    name: 'الفجر',
    time: timings.Fajr,
    title: `الصلاة القادمة: الفجر • ${formatArabicNumbers(timings.Fajr)}`,
    countdown: 'غداً بمشيئة الله',
    silentNote: null,
  };
};

const calculateLastThirdOfNight = (maghribStr: string, fajrStr: string) => {
  if (!maghribStr || !fajrStr) return { start: '--:--', remaining: '--' };

  const [mHours, mMins] = maghribStr.split(':').map(Number);
  const [fHours, fMins] = fajrStr.split(':').map(Number);

  const now = new Date();
  const maghribDate = new Date();
  maghribDate.setHours(mHours, mMins, 0, 0);

  const fajrDate = new Date();
  fajrDate.setHours(fHours, fMins, 0, 0);
  if (fajrDate <= maghribDate) fajrDate.setDate(fajrDate.getDate() + 1);

  if (now.getHours() < fHours) {
    maghribDate.setDate(maghribDate.getDate() - 1);
    fajrDate.setDate(fajrDate.getDate() - 1);
  }

  const nightDurationMs = fajrDate.getTime() - maghribDate.getTime();
  const thirdMs = nightDurationMs / 3;
  const lastThirdStartDate = new Date(fajrDate.getTime() - thirdMs);

  const startH = String(lastThirdStartDate.getHours()).padStart(2, '0');
  const startM = String(lastThirdStartDate.getMinutes()).padStart(2, '0');
  const startStr = `${startH}:${startM}`;

  let remaining = '';
  if (now.getTime() < lastThirdStartDate.getTime()) {
    const diffMs = lastThirdStartDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    remaining = `يبدأ بعد ${h > 0 ? `${formatArabicNumbers(h)}س و ` : ''}${formatArabicNumbers(m)}د`;
  } else if (now.getTime() >= lastThirdStartDate.getTime() && now.getTime() < fajrDate.getTime()) {
    remaining = 'الثلث الأخير الآن • أقبل على الدعاء';
  } else {
    remaining = 'انتهى بدخول وقت الفجر';
  }

  return { start: formatArabicNumbers(startStr), remaining };
};

// ==========================================
// 🧭 لون "مطابقة اتجاه القبلة" — درجة خضراء هادئة تتماشى مع الألوان
// التراثية الدافئة للتطبيق (بدل الأخضر الفاقع الذي كان مستخدماً سابقاً)
// ==========================================
const QIBLA_ALIGNED_COLOR = '#6E8B57';
const QIBLA_ALIGNED_TINT_18 = 'rgba(110, 139, 87, 0.18)';
const QIBLA_ALIGNED_TINT_12 = 'rgba(110, 139, 87, 0.12)';
const QIBLA_ALIGNED_TINT_60 = 'rgba(110, 139, 87, 0.6)';

// ==========================================
// 📌 خوارزمية قضاء الصلوات التلقائية
// ==========================================
const FARD_PRAYERS_LIST = [
  { key: 'fajr', name: 'صلاة الفجر' },
  { key: 'dhuhr', name: 'صلاة الظهر' },
  { key: 'asr', name: 'صلاة العصر' },
  { key: 'maghrib', name: 'صلاة المغرب' },
  { key: 'isha', name: 'صلاة العشاء' },
];

const ARABIC_DAYS_LIST = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const syncUncheckedPrayersToQada = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const lastCheckedDateStr = await AsyncStorage.getItem('@last_qada_sync_date');
    if (!lastCheckedDateStr) {
      await AsyncStorage.setItem('@last_qada_sync_date', todayStr);
      return;
    }

    if (lastCheckedDateStr === todayStr) return;

    const currentQadaRaw = await AsyncStorage.getItem('@user_qada_list');
    let qadaList: QadaItem[] = currentQadaRaw ? JSON.parse(currentQadaRaw) : [];

    let checkDate = new Date(lastCheckedDateStr);
    while (checkDate.toISOString().split('T')[0] < todayStr) {
      const dateKey = checkDate.toISOString().split('T')[0];
      const savedTrackerRaw = await AsyncStorage.getItem(`@prayer_tracker_${dateKey}`);

      if (savedTrackerRaw) {
        const completedMap = JSON.parse(savedTrackerRaw);
        const dayName = ARABIC_DAYS_LIST[checkDate.getDay()];

        for (const fard of FARD_PRAYERS_LIST) {
          if (!completedMap[fard.key]) {
            const exists = qadaList.some(item => item.dateStr === dateKey && item.prayerKey === fard.key);
            if (!exists) {
              qadaList.push({
                id: `${dateKey}_${fard.key}`,
                prayerKey: fard.key,
                prayerName: fard.name,
                dateStr: dateKey,
                dayName,
              });
            }
          }
        }
      }

      checkDate.setDate(checkDate.getDate() + 1);
    }

    await AsyncStorage.setItem('@user_qada_list', JSON.stringify(qadaList));
    await AsyncStorage.setItem('@last_qada_sync_date', todayStr);
  } catch (e) {
    console.warn('Qada sync error:', e);
  }
};

// ==========================================
// 📱 تحديث ويدجتس الشاشة الرئيسية (أندرويد + آيفون)
// ==========================================
const WIDGET_TIMINGS_STORAGE_KEY = '@widget_prayer_timings';

/**
 * بيحدّث ويدجتس الشاشة الرئيسية على المنصّتين. timings اختيارية: لما تنعطى
 * (مواقيت اليوم من شاشة المواقيت) منحفظها ومنستخدمها لتحديد المدينة؛
 * بدونها (مثلاً عند فتح التطبيق) الويدجت بيحسب من المدينة المحفوظة.
 */
const updateHomeScreenWidgets = (timings?: any) => {
  if (Platform.OS === 'android') {
    // منخزّن آخر مواقيت محسوبة حتى معالج الويدجت (widgetTaskHandler)
    // يقدر يستنتج المدينة وقت التحديث الدوري والتطبيق مسكّر.
    if (timings) {
      AsyncStorage.setItem(WIDGET_TIMINGS_STORAGE_KEY, JSON.stringify(timings)).catch(() => {});
    }
    // منمرّر المواقيت مباشرة (بدل ما يقراها من التخزين) لأنه الحفظ فوق
    // مش مستنّى (fire-and-forget) — حتى ما يصير سباق بين الكتابة والقراءة.
    // بيحدّث ويدجتس "القصر الزمردي" الاثنين: الـ4×2 والـ2×2 (PrayerWidget).
    MasraPalaceWidgetController.requestUpdate(timings);
  } else if (Platform.OS === 'ios') {
    // بيكتب مواقيت ١٤ يوم لويدجت WidgetKit (targets/widget) وبيعيد تحميله
    IosWidgetBridge.sync(timings);
  }
};

/** @deprecated الاسم القديم — صار بيحدّث الآيفون كمان. استخدم updateHomeScreenWidgets. */
const updateAndroidWidget = (_status: any, timings?: any) => updateHomeScreenWidgets(timings);


export {
  getCountdownText,
  getDuhaTimes,
  getPrayerStatus,
  calculateLastThirdOfNight,
  updateAndroidWidget,
  updateHomeScreenWidgets,
  QIBLA_ALIGNED_COLOR,
  QIBLA_ALIGNED_TINT_18,
  QIBLA_ALIGNED_TINT_12,
  QIBLA_ALIGNED_TINT_60,
  FARD_PRAYERS_LIST,
  ARABIC_DAYS_LIST,
};
