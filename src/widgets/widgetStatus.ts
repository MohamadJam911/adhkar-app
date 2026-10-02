// ==========================================
// Next-prayer status shared by the app and the widgets
// ==========================================
// The widget task handler runs headless, outside the app's React tree (even
// with the app closed), so these pure helpers live in a small shared module
// instead of a screen. The Prayer Times screen uses the same logic, so the
// app and the widgets never drift apart.

export type PrayerTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export type PrayerStatus = {
  isIqama: boolean;
  name: string;
  time: string;
  title: string;
  countdown: string;
  silentNote: string | null;
};

export const formatArabicNumbers = (text: string | number): string => {
  if (text === null || text === undefined) return '';
  const str = String(text);
  const hindiToWestern: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  return str.replace(/[٠-٩]/g, (match) => hindiToWestern[match] || match);
};

export const getPrayerStatus = (timings: PrayerTimings | null | undefined): PrayerStatus | null => {
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
    if (!p.timeStr) continue;
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
    if (!p.timeStr) continue;
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
