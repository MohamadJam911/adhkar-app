import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================
// Daily usage statistics (tasbih / adhkar / verses / prayers)
// ==========================================
// Shared helper used by several screens to count each kind of activity for the current day.
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
