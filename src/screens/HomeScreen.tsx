import React, { useState, useEffect, useRef, useContext } from 'react';
import Animated from 'react-native-reanimated';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Modal, Share, Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ThemeContext } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { HeritageIcons } from '../components/HeritageIcons';
import { ExactImagePatternWall, HeritageArchBanner, CardMotif, MotifOnLine, GoldenDivider, HeaderLanternOrnament, OttomanFlourishDivider, ThemedCheckbox, useBackgroundScroll } from '../components/Decorative';
import { QuranSharePage, HadithSharePage } from '../components/SharePages';
import { MisbahaCounter } from '../components/MisbahaCounter';
import { formatArabicNumbers, toEasternArabicNumerals, getSafeHijriDate } from '../utils/formatters';
import { logStat } from '../utils/statsLogger';
import { ALLAH_NAMES } from '../data/allahNamesData';
import { QURAN_VERSES_DATA } from '../data/quranVersesData';
import { HADITHS_DATA } from '../data/hadithsData';

// --- 1. HOME SCREEN ---
function HomeScreen({ navigation, hapticEnabled, fontSize }: { navigation: any, hapticEnabled: boolean, fontSize: number }) {
  const { isDarkMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  const [currentTime, setCurrentTime] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [tasbeehCount, setTasbeehCount] = useState(0);

  const [nameIndex, setNameIndex] = useState(() => Math.floor(Math.random() * ALLAH_NAMES.length));
  const [verseIndex, setVerseIndex] = useState(() => Math.floor(Math.random() * QURAN_VERSES_DATA.length));
  const [hadithIndex, setHadithIndex] = useState(() => Math.floor(Math.random() * HADITHS_DATA.length));
  // بيتحكم بعرض نص الحديث كامل أو مختصر بـ"عرض المزيد" — بيترجع لوضعه المختصر
  // تلقائياً كل ما ينتقل المستخدم لحديث جديد (بدالة handleNextHadith تحت).
  const [hadithExpanded, setHadithExpanded] = useState(false);
  // عدد أسطر نص الحديث الفعلي بعد أول عرض كامل له (نقيسه عبر onTextLayout)؛
  // null يعني لسا ما انقاس. لو تجاوز 4 أسطر منعرضه مختصر لأول 3 أسطر بس
  // مع زر "عرض المزيد"، ولو 4 أسطر أو أقل منعرضه كامل دايماً بدون زر.
  const [hadithLineCount, setHadithLineCount] = useState<number | null>(null);

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [hadithShareModalVisible, setHadithShareModalVisible] = useState(false);

  const [fridayTasks, setFridayTasks] = useState<{ [key: string]: boolean }>({});
  const isFriday = new Date().getDay() === 5;
  const currentHour = new Date().getHours();
  const isIstejabaHour = isFriday && currentHour >= 16 && currentHour <= 19;

  const shareCardRef = useRef<View>(null);
  const hadithCardRef = useRef<View>(null);

  const [fontsLoaded] = useFonts({
    'Amiri Quran': require('../../assets/fonts/AmiriQuran-Regular.ttf'),
    'AmiriQuran-Regular': require('../../assets/fonts/AmiriQuran-Regular.ttf'),
  });

  const quranFontFamily = fontsLoaded ? (Platform.OS === 'ios' ? 'AmiriQuran-Regular' : 'Amiri Quran') : undefined;

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(formatArabicNumbers(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })));
      setGregorianDate(formatArabicNumbers(now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })));
      setHijriDate(formatArabicNumbers(getSafeHijriDate(now)));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isFriday) {
      (async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        try {
          const saved = await AsyncStorage.getItem(`@friday_checklist_${todayStr}`);
          if (saved) setFridayTasks(JSON.parse(saved));
        } catch (e) {}
      })();
    }
  }, [isFriday]);

  const toggleFridayTask = async (taskKey: string) => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...fridayTasks, [taskKey]: !fridayTasks[taskKey] };
    setFridayTasks(updated);
    const todayStr = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`@friday_checklist_${todayStr}`, JSON.stringify(updated));
  };

  const handleQuickTasbeeh = async () => {
    const next = tasbeehCount + 1;
    setTasbeehCount(next);
    if (hapticEnabled) {
      if (next % 33 === 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (next > 1 && next % 33 === 1) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await logStat('tasbeeh', 1);
  };

  const handleNextAllahName = () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNameIndex((prev) => (prev + 1) % ALLAH_NAMES.length);
  };

  const handleNextVerse = async () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVerseIndex((prev) => (prev + 1) % QURAN_VERSES_DATA.length);
    await logStat('ayah', 1);
  };

  const handleNextHadith = async () => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHadithIndex((prev) => (prev + 1) % HADITHS_DATA.length);
    setHadithExpanded(false);
    setHadithLineCount(null);
    await logStat('dhikr', 1);
  };

  // إعادة قياس عدد أسطر الحديث لو تغيّر حجم الخط من الإعدادات، لأن ده بيأثر
  // على التفاف النص وعدد الأسطر الفعلي.
  useEffect(() => {
    setHadithLineCount(null);
  }, [fontSize]);

  const currentVerse = QURAN_VERSES_DATA[verseIndex];
  const currentHadith = HADITHS_DATA[hadithIndex];
  const isLongHadith = hadithLineCount !== null && hadithLineCount > 4;

  const shareAsText = async () => {
    const shareMessage = `آية من كتاب الله:\n\n${currentVerse.ayah}\n${currentVerse.reference}\n\nالتفسير الميسّر: ${currentVerse.meaning}\n\n[مشارك من تطبيق مسرى المسلم]`;
    try {
      await Share.share({ message: shareMessage });
    } catch (e) {
      Alert.alert('خطأ', 'تعذرت عملية المشاركة.');
    }
  };

  const shareAsImageCard = async () => {
    if (!fontsLoaded) {
      Alert.alert('يرجى الانتظار', 'جاري تجهيز خط القرآن الكريم.');
      return;
    }

    let uri: string | null = null;
    try {
      if (!shareCardRef.current) return;
      await new Promise(resolve => setTimeout(resolve, 300));
      await new Promise(requestAnimationFrame);

      uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { dialogTitle: 'مشاركة آية من القرآن الكريم', mimeType: 'image/png', UTI: 'public.png' });
    } catch (error) {
      Alert.alert('خطأ', 'فشل إنشاء صورة الآية.');
    } finally {
      if (uri) {
        try { releaseCapture(uri); } catch (e) {}
      }
    }
  };

  const shareHadithAsText = async () => {
    const shareMessage = `حديث نبوي شريف:\n\nقال رسول الله ﷺ: «${currentHadith.hadith}»\n${currentHadith.reference}\n\nالشرح والفائدة: ${currentHadith.explanation}\n\n[مشارك من تطبيق مسرى المسلم]`;
    try {
      await Share.share({ message: shareMessage });
    } catch (e) {
      Alert.alert('خطأ', 'تعذرت عملية المشاركة.');
    }
  };

  const shareHadithAsImageCard = async () => {
    let uri: string | null = null;
    try {
      if (!hadithCardRef.current) return;
      await new Promise(resolve => setTimeout(resolve, 300));
      await new Promise(requestAnimationFrame);

      uri = await captureRef(hadithCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { dialogTitle: 'مشاركة حديث نبوي شريف', mimeType: 'image/png', UTI: 'public.png' });
    } catch (error) {
      Alert.alert('خطأ', 'فشل إنشاء صورة الحديث.');
    } finally {
      if (uri) {
        try { releaseCapture(uri); } catch (e) {}
      }
    }
  };

  const closeModalThenShare = (action: () => void, modalSetter: (val: boolean) => void) => {
    modalSetter(false);
    setTimeout(action, 400);
  };

  const openEmail = () => {
    Linking.openURL(`mailto:masra.al.rasul.app@gmail.com?subject=${encodeURIComponent('تواصل من مستخدم تطبيق مسرى المسلم')}`);
  };

  const fridaySunanList = [
    { key: 'kahf', label: 'قراءة سورة الكهف (نور ما بين الجمعتين)' },
    { key: 'ghusl', label: 'الغسل والتطيّب ولبس أحسن الثياب' },
    { key: 'siwak', label: 'استعمال السواك والتنظف' },
    { key: 'early', label: 'التبكير إلى صلاة الجمعة والإنصات للخطبة' },
    { key: 'salawat', label: 'الإكثار من الصلاة والسلام على رسول الله ﷺ' },
    { key: 'dua', label: 'تحري ساعة الاستجابة بعد العصر' },
  ];

  // parallax: بيحرّك نقش الخلفية مع التمرير (خيار الخلفية ٣)
  const bgScroll = useBackgroundScroll();

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* رندر خارج الشاشة بـ left: -9999 لمنع حجب اللمس نهائياً على أندرويد */}
      <View style={{ position: 'absolute', left: -9999, top: 0, width: 1080, opacity: 0 }} pointerEvents="none" collapsable={false}>
        <View ref={shareCardRef} collapsable={false} key={`verse-card-${verseIndex}`}>
          <QuranSharePage verse={currentVerse} fontsLoaded={fontsLoaded} />
        </View>
      </View>

      <View style={{ position: 'absolute', left: -9999, top: 0, width: 1080, opacity: 0 }} pointerEvents="none" collapsable={false}>
        <View ref={hadithCardRef} collapsable={false} key={`hadith-card-${hadithIndex}`}>
          <HadithSharePage hadith={currentHadith} />
        </View>
      </View>

      <Animated.ScrollView contentContainerStyle={{ padding: 15 }} onScroll={bgScroll} scrollEventThrottle={16}>
        <HeritageArchBanner title="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" textColor={themeColors.text.color} isDarkMode={isDarkMode} />

        <View style={[styles.mainHeaderCard, themeColors.card]}>
          <HeaderLanternOrnament />
          <Text style={[styles.clockText, themeColors.text, { fontSize: fontSize + 12 }]}>{currentTime}</Text>
          <OttomanFlourishDivider />
          <Text style={[styles.dateText, themeColors.subText, { fontSize: fontSize - 2 }]}>{gregorianDate}</Text>
          <Text style={[styles.hijriText, themeColors.accentText, { fontSize: fontSize - 2 }]}>{hijriDate}</Text>
        </View>

        {isFriday && (
          <View style={[styles.verseCard, themeColors.card, { borderColor: '#D4A373', borderWidth: 1.8, marginBottom: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={styles.trackerBadgeMini}>
                <Text style={styles.trackerBadgeMiniText}>
                  {formatArabicNumbers(Object.values(fridayTasks).filter(Boolean).length)} / {formatArabicNumbers(fridaySunanList.length)} ✓
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.verseBadgeTitle, themeColors.accentText, { fontSize: fontSize, marginBottom: 0 }]}>
                  نفحات الجمعة المباركة
                </Text>
                <HeritageIcons.Mosque size={20} color="#D4A373" />
              </View>
            </View>

            {isIstejabaHour && (
              <View style={{ backgroundColor: 'rgba(212,163,115,0.22)', padding: 10, borderRadius: 12, marginVertical: 8, borderWidth: 1, borderColor: '#D4A373' }}>
                <Text style={{ color: '#D4A373', fontWeight: 'bold', fontSize: fontSize - 4, textAlign: 'center' }}>
                  ساعة الاستجابة الآن • أقبل على الدعاء
                </Text>
              </View>
            )}

            <View style={{ marginTop: 6 }}>
              {fridaySunanList.map((item) => {
                const done = !!fridayTasks[item.key];
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => toggleFridayTask(item.key)}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.8, borderColor: 'rgba(212,163,115,0.15)' }}
                    activeOpacity={0.7}
                  >
                    <ThemedCheckbox checked={done} accentColor={themeColors.accentText.color} />
                    <Text style={[themeColors.text, { fontSize: fontSize - 4, textAlign: 'right', flex: 1, marginLeft: 10, textDecorationLine: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* بطاقة الآية — زر المشاركة على اليسار والعنوان على اليمين */}
        <TouchableOpacity style={[styles.verseCard, themeColors.card, { paddingVertical: 14, paddingHorizontal: 16 }]} onPress={handleNextVerse} activeOpacity={0.85}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); setShareModalVisible(true); }}
              style={styles.shareBtnEnhanced}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="مشاركة الآية"
            >
              <HeritageIcons.Share size={18} color="#D4A373" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <HeritageIcons.QuranBook size={18} color="#D4A373" />
              <Text style={[styles.verseBadgeTitle, themeColors.accentText, { fontSize: fontSize - 2, marginBottom: 0 }]}>بلغوا عني ولو آية</Text>
            </View>
          </View>

          <Text
            key={fontsLoaded ? 'verse-loaded' : 'verse-loading'}
            style={[
              styles.verseText,
              themeColors.text,
              {
                fontSize: fontSize + 4,
                lineHeight: Platform.OS === 'android' ? (fontSize + 4) * 2.3 : (fontSize + 4) * 1.8,
                textAlign: 'center',
                fontFamily: quranFontFamily,
                writingDirection: 'rtl',
                marginVertical: 2,
              },
            ]}
          >
            {currentVerse.ayah}
          </Text>

          <Text style={[styles.verseRef, themeColors.accentText, { fontSize: fontSize - 2, textAlign: 'center', fontWeight: 'bold', marginVertical: 4 }]}>
            {toEasternArabicNumerals(currentVerse.reference)}
          </Text>

          {/* فاصل بين نص الآية والتفسير */}
          <GoldenDivider style={{ width: '70%', alignSelf: 'center', marginTop: 2, marginBottom: 6 }} />

          <Text style={[styles.verseMeaning, themeColors.subText, { fontSize: fontSize - 3, textAlign: 'right', marginTop: 2 }]}>
            التفسير الميسّر: {currentVerse.meaning}
          </Text>

          <MotifOnLine variant="quran" style={{ marginTop: 8, marginBottom: 6 }} />
          <Text style={[styles.tapHintText, themeColors.accentText, { fontSize: fontSize - 6, textAlign: 'center' }]}>
            (اضغط لآية أخرى)
          </Text>
        </TouchableOpacity>

        {/* بطاقة الحديث النبوي — زر المشاركة على اليسار والعنوان على اليمين */}
        <TouchableOpacity style={[styles.verseCard, themeColors.card, { paddingVertical: 14, paddingHorizontal: 16 }]} onPress={handleNextHadith} activeOpacity={0.85}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); setHadithShareModalVisible(true); }}
              style={styles.shareBtnEnhanced}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="مشاركة الحديث"
            >
              <HeritageIcons.Share size={18} color="#D4A373" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <HeritageIcons.Qalam size={18} color="#D4A373" />
              <Text style={[styles.verseBadgeTitle, themeColors.accentText, { fontSize: fontSize - 2, marginBottom: 0 }]}>
                حديث نبوي صحيح
              </Text>
            </View>
          </View>

          <Text
            onTextLayout={(e) => {
              if (hadithLineCount === null) setHadithLineCount(e.nativeEvent.lines.length);
            }}
            numberOfLines={isLongHadith && !hadithExpanded ? 3 : undefined}
            ellipsizeMode="tail"
            style={[
              styles.verseText,
              themeColors.text,
              {
                fontSize: fontSize + 2,
                lineHeight: (fontSize + 2) * 1.8,
                textAlign: 'center',
                writingDirection: 'rtl',
                marginVertical: 2,
                fontWeight: '600',
              },
            ]}
          >
            {currentHadith.hadith}
          </Text>

          {isLongHadith && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); setHadithExpanded((prev) => !prev); }}
              activeOpacity={0.7}
              style={{ alignSelf: 'center', marginBottom: 4 }}
            >
              <Text style={{ color: '#D4A373', fontWeight: 'bold', fontSize: fontSize - 5 }}>
                {hadithExpanded ? 'عرض أقل ▴' : 'عرض المزيد ▾'}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.verseRef, themeColors.accentText, { fontSize: fontSize - 2, textAlign: 'center', fontWeight: 'bold', marginVertical: 4 }]}>
            {currentHadith.reference}
          </Text>

          {/* فاصل بين نص الحديث والشرح */}
          <GoldenDivider style={{ width: '70%', alignSelf: 'center', marginTop: 2, marginBottom: 6 }} />

          <Text style={[styles.verseMeaning, themeColors.subText, { fontSize: fontSize - 3, textAlign: 'right', marginTop: 2 }]}>
            الشرح والفائدة: {currentHadith.explanation}
          </Text>

          <MotifOnLine variant="hadith" style={{ marginTop: 8, marginBottom: 6 }} />
          <Text style={[styles.tapHintText, themeColors.accentText, { fontSize: fontSize - 6, textAlign: 'center' }]}>
            (اضغط لحديث آخر)
          </Text>
        </TouchableOpacity>

        {/* نافذة مشاركة الآية (مصحح ليقوم بالوظيفة الصحيحة لكل زر) */}
        <Modal visible={shareModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, themeColors.card]}>
              <Text style={[styles.modalTitle, themeColors.text, { fontSize: fontSize + 2 }]}>اختر طريقة المشاركة</Text>
              <Text style={[themeColors.subText, { textAlign: 'center', marginBottom: 25, fontSize: fontSize - 4 }]}>كيف ترغب في مشاركة هذه الآية الكريمة؟</Text>

              <TouchableOpacity style={styles.shareOptionBtn} onPress={() => closeModalThenShare(shareAsImageCard, setShareModalVisible)} activeOpacity={0.8}>
                <Text style={styles.shareOptionBtnText}>مشاركة كبطاقة (صورة)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareOptionBtn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#D4A373', marginTop: 12 }]}
                onPress={() => closeModalThenShare(shareAsText, setShareModalVisible)}
                activeOpacity={0.8}
              >
                <Text style={[styles.shareOptionBtnText, themeColors.text]}>مشاركة كنص عادي</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.closeModalBtn, { marginTop: 20 }]} onPress={() => setShareModalVisible(false)}>
                <Text style={styles.closeModalBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* نافذة مشاركة الحديث (مصحح ليقوم بالوظيفة الصحيحة لكل زر) */}
        <Modal visible={hadithShareModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, themeColors.card]}>
              <Text style={[styles.modalTitle, themeColors.text, { fontSize: fontSize + 2 }]}>مشاركة الحديث النبوي</Text>
              <Text style={[themeColors.subText, { textAlign: 'center', marginBottom: 25, fontSize: fontSize - 4 }]}>اختر صيغة مشاركة الحديث الشريف:</Text>

              <TouchableOpacity style={styles.shareOptionBtn} onPress={() => closeModalThenShare(shareHadithAsImageCard, setHadithShareModalVisible)} activeOpacity={0.8}>
                <Text style={styles.shareOptionBtnText}>مشاركة كبطاقة (صورة)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareOptionBtn, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#D4A373', marginTop: 12 }]}
                onPress={() => closeModalThenShare(shareHadithAsText, setHadithShareModalVisible)}
                activeOpacity={0.8}
              >
                <Text style={[styles.shareOptionBtnText, themeColors.text]}>مشاركة كنص عادي</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.closeModalBtn, { marginTop: 20 }]} onPress={() => setHadithShareModalVisible(false)}>
                <Text style={styles.closeModalBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        <View style={[styles.tasbeehCard, themeColors.card]}>
          <CardMotif variant="dhikr" />
          <Text style={[styles.tasbeehTitle, themeColors.accentText, { fontSize: fontSize }]}>الذكر السريع</Text>
          <Text style={[styles.tasbeehWords, themeColors.subText, { fontSize: fontSize - 3 }]}>استغفر الله • لا إله إلا الله • الحمد لله</Text>

          <MisbahaCounter
            count={tasbeehCount}
            size={fontSize * 6}
            isDarkMode={isDarkMode}
            onPress={handleQuickTasbeeh}
            accessibilityLabel="عداد الذكر السريع"
            accessibilityHint="اضغط لزيادة العداد بواحد"
          >
            <Text style={[styles.tasbeehNumber, themeColors.circleText, { fontSize: fontSize + 14 }]}>{formatArabicNumbers(tasbeehCount)}</Text>
            <Text style={[styles.tasbeehTapLabel, themeColors.circleSubText, { fontSize: fontSize - 7 }]}>اضغط للذكر</Text>
          </MisbahaCounter>

          {tasbeehCount > 0 && (
            <TouchableOpacity onPress={() => setTasbeehCount(0)} style={styles.resetTasbeehBtn}>
              <Text style={[styles.resetTasbeehText, { fontSize: fontSize - 3 }]}>تصفير العداد</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={[styles.nameCard, themeColors.card]} onPress={handleNextAllahName} activeOpacity={0.85}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Text style={[styles.nameCardHeader, themeColors.accentText, { fontSize: fontSize - 2, marginBottom: 0 }]}>
              من أسماء الله الحسنى
            </Text>
          </View>
          {/* ارتفاع سطر كافي للتشكيل المتراكب (شدّة+فتحة فوق، كسرة تحت) حتى ما ينقصّ */}
          <Text
            style={[
              styles.allahName,
              themeColors.text,
              { fontSize: fontSize + 6, lineHeight: (fontSize + 6) * 1.9, paddingVertical: 2, marginBottom: 0, textAlign: 'center' },
            ]}
          >
            {ALLAH_NAMES[nameIndex].name}
          </Text>
          <Text style={[styles.allahMeaning, themeColors.subText, { fontSize: fontSize - 2, marginTop: 2 }]}>
            {ALLAH_NAMES[nameIndex].meaning}
          </Text>
          <GoldenDivider style={{ marginTop: 8 }} />
          <View style={styles.nameCardFooter}>
            <Text style={[styles.tapHintText, themeColors.accentText, { fontSize: fontSize - 6 }]}>
              (اضغط لرؤية اسم آخر)
            </Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('الأذكار', { screen: 'AllahNamesList', params: { hapticEnabled, fontSize } });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.allNamesLinkText, { fontSize: fontSize - 5 }]}>عرض القائمة الكاملة ←</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* أزرار أذكار الصباح والمساء والتسبيح الحر */}
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={[styles.gridItem, themeColors.card]}
            onPress={() => {
              if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('الأذكار', {
                screen: 'LibraryMain',
                params: { hapticEnabled, fontSize, initialExpand: 'morning', timestamp: Date.now() }
              });
            }}
          >
            <HeritageIcons.Sun size={32} color="#D4A373" />
            <Text style={[styles.gridTitle, themeColors.text, { fontSize: fontSize - 1, marginTop: 8 }]}>أذكار الصباح</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridItem, themeColors.card]}
            onPress={() => {
              if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('الأذكار', {
                screen: 'LibraryMain',
                params: { hapticEnabled, fontSize, initialExpand: 'evening', timestamp: Date.now() }
              });
            }}
          >
            <HeritageIcons.Crescent size={32} color="#D4A373" />
            <Text style={[styles.gridTitle, themeColors.text, { fontSize: fontSize - 1, marginTop: 8 }]}>أذكار المساء</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridItem, themeColors.card]}
            onPress={() => navigation.navigate('السبحة')}
          >
            <HeritageIcons.Rosary size={32} color="#D4A373" />
            <Text style={[styles.gridTitle, themeColors.text, { fontSize: fontSize - 1, marginTop: 8 }]}>التسبيح الحر</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridItem, themeColors.card]}
            onPress={openEmail}
          >
            <HeritageIcons.Chat size={32} color="#D4A373" />
            <Text style={[styles.gridTitle, themeColors.text, { fontSize: fontSize - 1, marginTop: 8 }]}>تواصل معنا</Text>
          </TouchableOpacity>
        </View>

      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}

export { HomeScreen };
