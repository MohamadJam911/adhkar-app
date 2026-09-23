// ==========================================
// 📱 منطق حساب حالة الصلاة القادمة لأجل الويدجت (Android Home Screen Widget)
// ==========================================
// ملاحظة مهمة: هاد الملف نسخة مستقلة عن نفس المنطق الموجود جوا App.tsx
// (دالتي formatArabicNumbers و getPrayerStatus). السبب إنه معالج الويدجت
// (widgetTaskHandler) بيشتغل بشكل "headless" خارج شجرة الـ React الحية
// للتطبيق (ممكن يشتغل والتطبيق مسكّر تماماً)، فما بنقدر نستورد هاي الدوال
// من App.tsx مباشرة بأمان. لأنها دوال حسابية بحتة (pure) وما بتتغير كثير،
// خليناها بملف مشترك صغير هون يقدر يستخدمه الملفين، وضل نفس المنطق بالظبط
// المستخدم بصفحة مواقيت الصلاة، حتى ما يصير فرق (drift) بين اللي بيظهر
// بالتطبيق واللي بيظهر بالويدجت.

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
