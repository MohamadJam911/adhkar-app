import React, { useState, useEffect, useContext } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { HeritageIcons } from '../components/HeritageIcons';
import { ExactImagePatternWall, HeritageArchBanner, SeniorBackArrow } from '../components/Decorative';
import { formatArabicNumbers } from '../utils/formatters';
import { syncUncheckedPrayersToQada } from '../utils/prayerLogic';
import { logStat } from '../utils/statsLogger';
import type { QadaItem } from '../types';

function StatsScreen({ navigation, route }: { navigation: any, route: any }) {
  const { fontSize } = route.params || { fontSize: 22 };
  const { isDarkMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;
  const [weekData, setWeekData] = useState<{ date: string; label: string; total: number; details: { tasbeeh: number; dhikr: number; ayah: number; prayer: number } }[]>([]);
  const [totalWeekCount, setTotalWeekCount] = useState(0);
  const [selectedDayModal, setSelectedDayModal] = useState<any>(null);
  const [qadaList, setQadaList] = useState<QadaItem[]>([]);

  const loadQadaData = async () => {
    await syncUncheckedPrayersToQada();
    const raw = await AsyncStorage.getItem('@user_qada_list');
    if (raw) setQadaList(JSON.parse(raw));
  };

  useEffect(() => {
    loadQadaData();
    (async () => {
      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const today = new Date();
      let calculatedDays = [];
      let grandTotal = 0;

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];

        const dataStr = await AsyncStorage.getItem(`@stats_${dateStr}`);
        const dayObj = dataStr ? JSON.parse(dataStr) : { tasbeeh: 0, dhikr: 0, ayah: 0, prayer: 0 };
        const daySum = (dayObj.tasbeeh || 0) + (dayObj.dhikr || 0) + (dayObj.ayah || 0) + (dayObj.prayer || 0);

        grandTotal += daySum;
        calculatedDays.push({ date: dayName, label: dateStr, total: daySum, details: dayObj });
      }

      setWeekData(calculatedDays);
      setTotalWeekCount(grandTotal);
    })();
  }, []);

  const markQadaAsDone = async (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = qadaList.filter(item => item.id !== id);
    setQadaList(updated);
    await AsyncStorage.setItem('@user_qada_list', JSON.stringify(updated));
    await logStat('prayer', 1);
  };

  const badges = [
    { title: 'الذاكر الشاكر', desc: 'أتممت أذكارًا عديدة في التطبيق', unlocked: totalWeekCount >= 50, icon: HeritageIcons.Rosary },
    { title: 'رفيق القرآن', desc: 'تدبّرت آياتٍ عديدة', unlocked: totalWeekCount >= 20, icon: HeritageIcons.QuranBook },
    { title: 'المحافظ على الصلاة', desc: 'سجّلت صلواتك ونوافلك في التطبيق', unlocked: totalWeekCount >= 10, icon: HeritageIcons.Mosque },
  ];

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }}>
        <SeniorBackArrow onPress={() => navigation.goBack()} isDarkMode={isDarkMode} />
        <HeritageArchBanner title="الملف الشخصي والإنجازات" textColor={themeColors.text.color} isDarkMode={isDarkMode} />

        <View style={[styles.mainHeaderCard, themeColors.card, { padding: 20 }]}>
          <HeritageIcons.Trophy size={40} color="#D4A373" />
          <Text style={[styles.allahName, themeColors.accentText, { fontSize: fontSize + 8, marginTop: 8 }]}>
            {formatArabicNumbers(totalWeekCount)}
          </Text>
          <Text style={[styles.dateText, themeColors.text, { fontSize: fontSize - 1, fontWeight: 'bold' }]}>
            إجمالي التفاعلات المسجّلة هذا الأسبوع
          </Text>
        </View>

        {/* بطاقة سجل قضاء الصلوات الفائتة */}
        <View style={[styles.verseCard, themeColors.card]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={styles.trackerBadgeMini}>
              <Text style={styles.trackerBadgeMiniText}>
                {formatArabicNumbers(qadaList.length)} صلاة فائتة
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.verseBadgeTitle, themeColors.accentText, { fontSize: fontSize - 2, marginBottom: 0 }]}>
                سجل الصلوات الفائتة والقضاء
              </Text>
              <HeritageIcons.Mosque size={20} color="#D4A373" />
            </View>
          </View>

          {qadaList.length === 0 ? (
            <Text style={[themeColors.subText, { textAlign: 'center', paddingVertical: 10, fontSize: fontSize - 4 }]}>
              ليس لديك أي صلوات فائتة مسجلة.
            </Text>
          ) : (
            qadaList.map((item) => (
              <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.8, borderColor: 'rgba(212,163,115,0.15)' }}>
                <TouchableOpacity
                  onPress={() => markQadaAsDone(item.id)}
                  style={[styles.checkSquareBtn, { backgroundColor: '#D4A373', width: 'auto', paddingHorizontal: 12, height: 28 }]}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#1E1B18', fontWeight: 'bold', fontSize: 12 }}>تم قضاؤها ✓</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[themeColors.text, { fontWeight: 'bold', fontSize: fontSize - 3 }]}>{item.prayerName}</Text>
                  <Text style={[themeColors.subText, { fontSize: fontSize - 6 }]}>{item.dayName} ({formatArabicNumbers(item.dateStr)})</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={[styles.verseCard, themeColors.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <HeritageIcons.Trophy size={20} color="#D4A373" />
            <Text style={[styles.verseBadgeTitle, themeColors.accentText, { fontSize: fontSize - 2, marginBottom: 0 }]}>
              الأوسمة والإنجازات
            </Text>
          </View>
          {badges.map((b, idx) => {
            const BadgeIcon = b.icon;
            return (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.8, borderColor: 'rgba(212,163,115,0.15)', opacity: b.unlocked ? 1 : 0.45 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: b.unlocked ? 'rgba(212,163,115,0.2)' : 'rgba(150,150,150,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                    <BadgeIcon size={20} color={b.unlocked ? '#D4A373' : '#8A7457'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[themeColors.text, { fontSize: fontSize - 2, fontWeight: 'bold' }]}>{b.title} {b.unlocked ? '✨' : '🔒'}</Text>
                    <Text style={[themeColors.subText, { fontSize: fontSize - 5 }]}>{b.desc}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.verseCard, themeColors.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 }}>
            <HeritageIcons.Chart size={20} color="#D4A373" />
            <Text style={[styles.verseBadgeTitle, themeColors.accentText, { fontSize: fontSize - 2, marginBottom: 0 }]}>
              حصاد الأسبوع
            </Text>
          </View>
          {weekData.map((item, index) => {
            const percentage = totalWeekCount > 0 ? Math.round((item.total / totalWeekCount) * 100) : 0;
            return (
              <TouchableOpacity
                key={index}
                style={{ marginBottom: 14, paddingVertical: 4 }}
                onPress={() => setSelectedDayModal(item)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[themeColors.text, { fontSize: fontSize - 2, fontWeight: 'bold' }]}>{item.date} ({formatArabicNumbers(item.label)})</Text>
                  <Text style={[themeColors.subText, { fontSize: fontSize - 3 }]}>
                    {formatArabicNumbers(item.total)} نشاطًا مسجلًا • {formatArabicNumbers(percentage)}%
                  </Text>
                </View>
                <View style={{ height: 10, backgroundColor: 'rgba(212,163,115,0.15)', borderRadius: 5, overflow: 'hidden' }}>
                  <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#D4A373', borderRadius: 5 }} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Modal visible={selectedDayModal !== null} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, themeColors.card]}>
              <Text style={[styles.modalTitle, themeColors.text, { fontSize: fontSize + 2 }]}>
                تفاصيل نشاط يوم {selectedDayModal?.date}
              </Text>
              <Text style={[themeColors.subText, { textAlign: 'center', marginBottom: 15, fontSize: fontSize - 4 }]}>
                {selectedDayModal?.label}
              </Text>

              <View style={{ width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(212,163,115,0.2)', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[themeColors.text, { fontSize: fontSize - 2 }]}>صلوات مسجّلة:</Text>
                <Text style={[themeColors.accentText, { fontSize: fontSize - 2, fontWeight: 'bold' }]}>{formatArabicNumbers(selectedDayModal?.details.prayer || 0)}</Text>
              </View>

              <View style={{ width: '100%', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(212,163,115,0.2)', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[themeColors.text, { fontSize: fontSize - 2 }]}>تسبيحات سريعة:</Text>
                <Text style={[themeColors.accentText, { fontSize: fontSize - 2, fontWeight: 'bold' }]}>{formatArabicNumbers(selectedDayModal?.details.tasbeeh || 0)}</Text>
              </View>

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedDayModal(null)}>
                <Text style={styles.closeModalBtnText}>إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}


export { StatsScreen };
