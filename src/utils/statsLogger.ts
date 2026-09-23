import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================
// 📊 تسجيل إحصائيات الاستخدام اليومية (تسبيح / أذكار / آيات / صلوات)
// ==========================================
// دالة مشتركة تستخدمها عدة شاشات (الرئيسية، الإحصائيات، الأذكار، السبحة،
// مواقيت الصلاة) لتسجيل عدد مرات كل نوع نشاط باليوم الحالي.
async function logStat(key: 'tasbeeh' | 'dhikr' | 'ayah' | 'prayer', countToAdd = 1) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const storageKey = `@stats_${todayStr}`;
    const dataStr = await AsyncStorage.getItem(storageKey);
    let dayData = dataStr ? JSON.parse(dataStr) : { tasbeeh: 0, dhikr: 0, ayah: 0, prayer: 0 };
    dayData[key] = Math.max(0, (dayData[key] || 0) + countToAdd);
    await AsyncStorage.setItem(storageKey, JSON.stringify(dayData));
  } catch (e) {}
}

export { logStat };
