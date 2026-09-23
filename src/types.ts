// ==========================================
// 🧾 أنواع بيانات مشتركة بين ملفات التطبيق
// ==========================================

export type Dhikr = {
  id: string;
  text: string;
  count: number;
  reward?: string;
};

export type QadaItem = {
  id: string;
  prayerKey: string;
  prayerName: string;
  dateStr: string;
  dayName: string;
};