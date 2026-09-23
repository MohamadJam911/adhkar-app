import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect, Circle, G } from 'react-native-svg';
import type { QuranVerseItem } from '../data/quranVersesData';
import { formatArabicNumbers, toEasternArabicNumerals } from '../utils/formatters';

const extractAyahNumber = (reference: string): string => {
  if (!reference) return '';
  const match = String(reference).match(/(\d+|[٠-٩]+)/g);
  if (match && match.length > 0) {
    return formatArabicNumbers(match[match.length - 1]);
  }
  return '';
};

// ==========================================
// 🖼️ مكونات تصدير البطاقات كصور عالية الدقة (1080px)
// ==========================================
const QuranSharePage = ({ verse, fontsLoaded }: { verse: QuranVerseItem; fontsLoaded: boolean }) => {
  const quranNativeFont = Platform.OS === 'ios' ? 'AmiriQuran-Regular' : 'Amiri Quran';

  if (!fontsLoaded) {
    return (
      <View style={{ width: 1080, padding: 60, backgroundColor: '#FAF5EC', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 36, color: '#6F4E37', fontWeight: 'bold' }}>جاري تجهيز الآية...</Text>
      </View>
    );
  }

  const ayahLength = (verse.ayah || '').length;
  let ayahFontSize = 50;
  let ayahLineHeight = Platform.OS === 'android' ? 130 : 118;

  if (ayahLength < 70) {
    ayahFontSize = 60;
    ayahLineHeight = Platform.OS === 'android' ? 150 : 132;
  } else if (ayahLength > 180 && ayahLength <= 320) {
    ayahFontSize = 44;
    ayahLineHeight = Platform.OS === 'android' ? 112 : 102;
  } else if (ayahLength > 320) {
    ayahFontSize = 38;
    ayahLineHeight = Platform.OS === 'android' ? 98 : 90;
  }

  const rawNum = extractAyahNumber(verse.reference);
  const easternAyahNum = toEasternArabicNumerals(rawNum);

  return (
    <View style={{ width: 1080, backgroundColor: '#FAF5EC', padding: 45, alignItems: 'center' }}>
      <View style={{ width: '100%', borderWidth: 4, borderColor: '#8A5E33', borderRadius: 28, padding: 14, backgroundColor: '#FAF5EC' }}>
        <View style={{ width: '100%', borderWidth: 1.8, borderColor: '#C8A875', borderRadius: 20, paddingHorizontal: 45, paddingVertical: 40, alignItems: 'center' }}>

          <View style={{ width: 920, height: 110, justifyContent: 'center', alignItems: 'center', marginBottom: 25 }}>
            <Svg width="920" height="110" viewBox="0 0 920 110" style={StyleSheet.absoluteFill}>
              <Rect x="2" y="2" width="916" height="106" rx="14" fill="#F4E9D5" stroke="#8A5E33" strokeWidth="3" />
              <Rect x="8" y="8" width="904" height="94" rx="10" fill="none" stroke="#C8A875" strokeWidth="1.5" />
              <G transform="translate(15, 10)">
                <Path d="M 0 45 C 30 10, 50 10, 80 45 C 50 80, 30 80, 0 45 Z" fill="#EBD9BD" stroke="#8A5E33" strokeWidth="2" />
                <Circle cx="40" cy="45" r="14" fill="#F4E9D5" stroke="#8A5E33" strokeWidth="1.8" />
                <Circle cx="40" cy="45" r="5" fill="#8A5E33" />
              </G>
              <G transform="translate(785, 10)">
                <Path d="M 120 45 C 90 10, 70 10, 40 45 C 70 80, 90 80, 120 45 Z" fill="#EBD9BD" stroke="#8A5E33" strokeWidth="2" />
                <Circle cx="80" cy="45" r="14" fill="#F4E9D5" stroke="#8A5E33" strokeWidth="1.8" />
                <Circle cx="80" cy="45" r="5" fill="#8A5E33" />
              </G>
              <Path d="M 140 22 L 780 22 M 140 88 L 780 88" stroke="#8A5E33" strokeWidth="1.5" />
            </Svg>

            <Text style={{ fontFamily: quranNativeFont, fontSize: 44, color: '#2C1B0D', textAlign: 'center', fontWeight: 'bold', includeFontPadding: false, textAlignVertical: 'center', marginTop: Platform.OS === 'android' ? -4 : -5 }}>
              {verse.surah}
            </Text>
          </View>

          <View style={{ marginVertical: 12 }}>
            <Text style={{ fontFamily: quranNativeFont, fontSize: 48, color: '#6A4825', textAlign: 'center' }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
          </View>

          <View style={{ width: 180, height: 2, backgroundColor: '#C8A875', marginVertical: 18 }} />

          <View style={{ width: '100%', marginVertical: 18, paddingHorizontal: 35 }}>
            <Text style={{ fontFamily: quranNativeFont, fontSize: ayahFontSize, lineHeight: ayahLineHeight, color: '#1E160E', textAlign: 'center', writingDirection: 'rtl' }}>
              {verse.ayah}
              {easternAyahNum ? <Text style={{ color: '#8A5E33', fontSize: ayahFontSize * 0.9 }}>{` ﴿${easternAyahNum}﴾`}</Text> : ''}
            </Text>
          </View>

          {verse.meaning ? (
            <View style={{ width: '100%', backgroundColor: '#F3E9D7', borderWidth: 1.5, borderColor: '#C8A875', borderRadius: 18, paddingVertical: 24, paddingHorizontal: 28, marginTop: 30 }}>
              <Text style={{ fontSize: 28, color: '#6E4E29', fontWeight: 'bold', textAlign: 'right', marginBottom: 10 }}>التفسير الميسّر:</Text>
              <Text style={{ fontSize: 32, color: '#33261A', lineHeight: 52, textAlign: 'right', writingDirection: 'rtl', fontWeight: '500' }}>{verse.meaning}</Text>
            </View>
          ) : null}

          <View style={{ width: '60%', height: 1.5, backgroundColor: '#C8A875', marginTop: 35, marginBottom: 16 }} />
          <Text style={{ fontSize: 22, color: '#8A7457', fontWeight: 'bold', textAlign: 'center' }}>تطبيق مسرى المسلم • علمٌ يُنتفع به</Text>
        </View>
      </View>
    </View>
  );
};

const HadithSharePage = ({ hadith }: { hadith: any }) => (
  <View style={{ width: 1080, backgroundColor: '#FAF5EC', padding: 45, alignItems: 'center' }}>
    <View style={{ width: '100%', borderWidth: 4, borderColor: '#8A5E33', borderRadius: 28, padding: 14, backgroundColor: '#FAF5EC' }}>
      <View style={{ width: '100%', borderWidth: 1.8, borderColor: '#C8A875', borderRadius: 20, paddingHorizontal: 45, paddingVertical: 40, alignItems: 'center' }}>

        <View style={{ width: 920, height: 95, justifyContent: 'center', alignItems: 'center', marginBottom: 25 }}>
          <Svg width="920" height="95" viewBox="0 0 920 95" style={StyleSheet.absoluteFill}>
            <Rect x="2" y="2" width="916" height="91" rx="14" fill="#F4E9D5" stroke="#8A5E33" strokeWidth="3" />
            <Rect x="8" y="8" width="904" height="79" rx="10" fill="none" stroke="#C8A875" strokeWidth="1.5" />
          </Svg>
          <Text style={{ fontSize: 36, color: '#2C1B0D', textAlign: 'center', fontWeight: 'bold' }}>
            حديث نبوي شريف
          </Text>
        </View>

        <Text style={{ fontSize: 32, color: '#8A5E33', fontWeight: 'bold', marginBottom: 15 }}>
          قال رسول الله ﷺ:
        </Text>

        <View style={{ width: '100%', marginVertical: 15, paddingHorizontal: 25 }}>
          <Text style={{ fontSize: 42, lineHeight: 74, color: '#1E160E', textAlign: 'center', writingDirection: 'rtl', fontWeight: '600' }}>
            «{hadith.hadith}»
          </Text>
        </View>

        <Text style={{ fontSize: 30, color: '#8A5E33', fontWeight: 'bold', marginVertical: 12 }}>
          {hadith.reference}
        </Text>

        {hadith.explanation ? (
          <View style={{ width: '100%', backgroundColor: '#F3E9D7', borderWidth: 1.5, borderColor: '#C8A875', borderRadius: 18, paddingVertical: 22, paddingHorizontal: 28, marginTop: 20 }}>
            <Text style={{ fontSize: 26, color: '#6E4E29', fontWeight: 'bold', textAlign: 'right', marginBottom: 8 }}>
              الشرح والفائدة:
            </Text>
            <Text style={{ fontSize: 30, color: '#33261A', lineHeight: 48, textAlign: 'right', writingDirection: 'rtl' }}>
              {hadith.explanation}
            </Text>
          </View>
        ) : null}

        <View style={{ width: '60%', height: 1.5, backgroundColor: '#C8A875', marginTop: 35, marginBottom: 16 }} />
        <Text style={{ fontSize: 22, color: '#8A7457', fontWeight: 'bold', textAlign: 'center' }}>
          تطبيق مسرى المسلم • علمٌ يُنتفع به
        </Text>
      </View>
    </View>
  </View>
);

const PrayerSharePage = ({ timings, locationName, gregorianDate, hijriDate, duhaTimes, nightInfo }: any) => (
  <View style={{ width: 1080, backgroundColor: '#F7F0E3', padding: 50, alignItems: 'center' }}>
    <View style={{ width: '100%', borderWidth: 5, borderColor: '#A47A45', borderRadius: 24, padding: 20 }}>
      <View style={{ borderWidth: 2, borderColor: '#C8A875', borderRadius: 16, padding: 35, alignItems: 'center' }}>
        <Text style={{ fontSize: 32, color: '#80613B', fontWeight: 'bold', marginBottom: 10 }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        <Text style={{ fontSize: 44, color: '#63492C', fontWeight: 'bold', marginVertical: 8 }}>مواقيت الصلاة وفق التقويم الدهري</Text>
        <Text style={{ fontSize: 28, color: '#A47A45', fontWeight: 'bold', marginBottom: 20 }}>{locationName}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', paddingBottom: 15, borderBottomWidth: 2, borderColor: '#C8A875' }}>
          <Text style={{ fontSize: 24, color: '#63492C' }}>{gregorianDate}</Text>
          <Text style={{ fontSize: 24, color: '#80613B', fontWeight: 'bold' }}>{hijriDate}</Text>
        </View>

        <View style={{ width: '90%', marginVertical: 30 }}>
          {[
            { name: 'صلاة الفجر', time: timings?.Fajr },
            { name: 'الشروق', time: timings?.Sunrise },
            { name: 'صلاة الظهر', time: timings?.Dhuhr },
            { name: 'صلاة العصر', time: timings?.Asr },
            { name: 'صلاة المغرب', time: timings?.Maghrib },
            { name: 'صلاة العشاء', time: timings?.Isha },
          ].map((p, idx) => (
            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: 'rgba(200,168,117,0.4)' }}>
              <Text style={{ fontSize: 34, color: '#63492C', fontWeight: 'bold' }}>{formatArabicNumbers(p.time)}</Text>
              <Text style={{ fontSize: 32, color: '#241C14', fontWeight: '600' }}>{p.name}</Text>
            </View>
          ))}
        </View>

        <View style={{ width: '90%', backgroundColor: 'rgba(212,163,115,0.18)', borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: '#A47A45', marginBottom: 25 }}>
          <Text style={{ fontSize: 25, color: '#80613B', fontWeight: 'bold', textAlign: 'center' }}>صلاة الضحى: من {duhaTimes?.start} إلى {duhaTimes?.end}</Text>
          <Text style={{ fontSize: 25, color: '#80613B', fontWeight: 'bold', textAlign: 'center', marginTop: 8 }}>الثلث الأخير من الليل يبدأ الساعة: {nightInfo?.start}</Text>
        </View>

        <Text style={{ fontSize: 22, color: '#A28A6B', textAlign: 'center' }}>تطبيق مسرى المسلم • علمٌ يُنتفع به</Text>
      </View>
    </View>
  </View>
);

const MonthlyImsakiyaSharePage = ({ daysList, locationName, monthTitle }: any) => (
  <View style={{ width: 1080, backgroundColor: '#FAF5EC', padding: 35, alignItems: 'center' }}>
    <View style={{ width: '100%', borderWidth: 4, borderColor: '#8A5E33', borderRadius: 24, padding: 16, backgroundColor: '#FAF5EC' }}>
      <View style={{ width: '100%', borderWidth: 1.8, borderColor: '#C8A875', borderRadius: 18, padding: 25, alignItems: 'center' }}>
        <Text style={{ fontSize: 30, color: '#80613B', fontWeight: 'bold', marginBottom: 6 }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        <Text style={{ fontSize: 42, color: '#5A3D22', fontWeight: 'bold', marginBottom: 6 }}>إمساكية مواقيت الصلاة (التقويم الدهري)</Text>
        <Text style={{ fontSize: 28, color: '#A47A45', fontWeight: 'bold', marginBottom: 15 }}>{locationName} • شهر {monthTitle}</Text>

        <View style={{ flexDirection: 'row', width: '100%', backgroundColor: '#EAD9C2', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#C8A875' }}>
          <Text style={{ flex: 1.2, textAlign: 'center', fontWeight: 'bold', fontSize: 22, color: '#4A321B' }}>اليوم</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 22, color: '#4A321B' }}>الفجر</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 22, color: '#4A321B' }}>الشروق</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 22, color: '#4A321B' }}>الظهر</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 22, color: '#4A321B' }}>العصر</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 22, color: '#4A321B' }}>المغرب</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 22, color: '#4A321B' }}>العشاء</Text>
        </View>

        {daysList.map((row: any, idx: number) => (
          <View key={idx} style={{ flexDirection: 'row', width: '100%', paddingVertical: 7, backgroundColor: idx % 2 === 0 ? '#FAF5EC' : '#F4EADA', borderBottomWidth: 0.8, borderColor: 'rgba(200,168,117,0.4)' }}>
            <Text style={{ flex: 1.2, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#6A4825' }}>{row.dayLabel}</Text>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, color: '#2C1E14' }}>{formatArabicNumbers(row.Fajr)}</Text>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, color: '#6A5645' }}>{formatArabicNumbers(row.Sunrise)}</Text>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, color: '#2C1E14' }}>{formatArabicNumbers(row.Dhuhr)}</Text>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, color: '#2C1E14' }}>{formatArabicNumbers(row.Asr)}</Text>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#8A5E33' }}>{formatArabicNumbers(row.Maghrib)}</Text>
            <Text style={{ flex: 1, textAlign: 'center', fontSize: 20, color: '#2C1E14' }}>{formatArabicNumbers(row.Isha)}</Text>
          </View>
        ))}

        <View style={{ width: '60%', height: 1.5, backgroundColor: '#C8A875', marginTop: 22, marginBottom: 10 }} />
        <Text style={{ fontSize: 20, color: '#8A7457', fontWeight: 'bold', textAlign: 'center' }}>تطبيق مسرى المسلم • علمٌ يُنتفع به</Text>
      </View>
    </View>
  </View>
);


export {
  extractAyahNumber,
  QuranSharePage,
  HadithSharePage,
  PrayerSharePage,
  MonthlyImsakiyaSharePage,
};
