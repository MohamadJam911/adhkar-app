import AsyncStorage from '@react-native-async-storage/async-storage';

export type QadaItem = {
  id: string;
  prayerKey: string;
  prayerName: string;
  dateStr: string;
  dayName: string;
};

const FARD_PRAYERS = [
  { key: 'fajr', name: 'صلاة الفجر' },
  { key: 'dhuhr', name: 'صلاة الظهر' },
  { key: 'asr', name: 'صلاة العصر' },
  { key: 'maghrib', name: 'صلاة المغرب' },
  { key: 'isha', name: 'صلاة العشاء' },
];

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const syncUncheckedPrayersToQada = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // جلب آخر تاريخ تم فحصه
    const lastCheckedDateStr = await AsyncStorage.getItem('@last_qada_sync_date');
    if (!lastCheckedDateStr) {
      // أول تشغيل: نبدأ الفحص من تاريخ اليوم فقط
      await AsyncStorage.setItem('@last_qada_sync_date', todayStr);
      return;
    }

    if (lastCheckedDateStr === todayStr) return; // تم الفحص اليوم بالفعل

    // جلب قائمة القضاء الحالية
    const currentQadaRaw = await AsyncStorage.getItem('@user_qada_list');
    let qadaList: QadaItem[] = currentQadaRaw ? JSON.parse(currentQadaRaw) : [];

    // فحص الأيام المحصورة بين آخر فحص والأمس (بحد أقصى 7 أيام للخلف)
    let checkDate = new Date(lastCheckedDateStr);
    while (checkDate.toISOString().split('T')[0] < todayStr) {
      const dateKey = checkDate.toISOString().split('T')[0];
      const savedTrackerRaw = await AsyncStorage.getItem(`@prayer_tracker_${dateKey}`);
      
      // إذا فتح التطبيق في ذلك اليوم وسجل بياناته
      if (savedTrackerRaw) {
        const completedMap = JSON.parse(savedTrackerRaw);
        const dayName = ARABIC_DAYS[checkDate.getDay()];

        for (const fard of FARD_PRAYERS) {
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