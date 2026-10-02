import React, { useState, useEffect, useContext } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../theme/ThemeContext';
import { heritageDarkTheme, heritageLightTheme } from '../theme/colorThemes';
import { styles } from '../theme/styles';
import { HeritageIcons } from '../components/HeritageIcons';
import { ExactImagePatternWall, HeritageArchBanner, TitleFlourish, useBackgroundScroll } from '../components/Decorative';
import { DhikrPulseCard } from '../components/DhikrPulseCard';
import { formatArabicNumbers } from '../utils/formatters';
import { logStat } from '../utils/statsLogger';
import type { Dhikr } from '../types';
import adhkarData from '../data/adhkar.json';

function LibraryScreen({ navigation, hapticEnabled, fontSize, route }: any) {
  const { isDarkMode } = useContext(ThemeContext);
  const themeColors = isDarkMode ? heritageDarkTheme : heritageLightTheme;

  const [expandedSection, setExpandedSection] = useState<string | null>(route?.params?.initialExpand || null);
  const [sectionData, setSectionData] = useState<{ [key: string]: Dhikr[] }>({});

  useEffect(() => {
    if (route?.params?.initialExpand) {
      setExpandedSection(route.params.initialExpand);
    }
  }, [route?.params?.initialExpand, route?.params?.timestamp]);

  const sectionsList = [
    { key: 'morning', title: 'أذكار الصباح', subtitle: 'ابدأ يومك بذكر الله', icon: HeritageIcons.Sun },
    { key: 'evening', title: 'أذكار المساء', subtitle: 'حصّن نفسك بأذكار المساء', icon: HeritageIcons.Crescent },
    { key: 'prayer', title: 'أذكار ما بعد الصلاة', subtitle: 'من السنن والأذكار الواردة بعد الصلوات', icon: HeritageIcons.Mosque },
    { key: 'sleep', title: 'أذكار النوم', subtitle: 'اختم يومك بذكر الله', icon: HeritageIcons.Crescent },
    { key: 'waking', title: 'أذكار الاستيقاظ', subtitle: 'ابدأ يومك بحمد الله وذكره', icon: HeritageIcons.Sunrise },
    { key: 'home', title: 'أذكار المنزل', subtitle: 'أذكار الدخول والخروج وحفظ البيت', icon: HeritageIcons.Door },
  ];

  useEffect(() => {
    (async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      let initialMap: { [key: string]: Dhikr[] } = {};

      for (const sec of sectionsList) {
        const storageKey = `@adhkar_progress_${sec.key}`;
        const dateKey = `@adhkar_date_${sec.key}`;
        const raw = adhkarData[sec.key as keyof typeof adhkarData] || [];

        try {
          const lastSavedDate = await AsyncStorage.getItem(dateKey);
          if (lastSavedDate !== todayStr) {
            initialMap[sec.key] = raw;
            await AsyncStorage.setItem(storageKey, JSON.stringify(raw));
            await AsyncStorage.setItem(dateKey, todayStr);
          } else {
            const savedData = await AsyncStorage.getItem(storageKey);
            initialMap[sec.key] = savedData ? JSON.parse(savedData) : raw;
          }
        } catch (e) {
          initialMap[sec.key] = raw;
        }
      }
      setSectionData(initialMap);
    })();
  }, []);

  const toggleSection = (key: string) => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection(prev => (prev === key ? null : key));
  };

  const handleDecrementCount = async (sectionKey: string, dhikrId: string) => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await logStat('dhikr', 1);

    const currentList = sectionData[sectionKey] || [];
    const updated = currentList.map(item => {
      if (item.id === dhikrId && item.count > 0) {
        return { ...item, count: item.count - 1 };
      }
      return item;
    });

    setSectionData(prev => ({ ...prev, [sectionKey]: updated }));
    const todayStr = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`@adhkar_progress_${sectionKey}`, JSON.stringify(updated));
    await AsyncStorage.setItem(`@adhkar_date_${sectionKey}`, todayStr);
  };

  const resetSection = async (sectionKey: string) => {
    if (hapticEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const original = adhkarData[sectionKey as keyof typeof adhkarData] || [];
    setSectionData(prev => ({ ...prev, [sectionKey]: original }));
    const todayStr = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`@adhkar_progress_${sectionKey}`, JSON.stringify(original));
    await AsyncStorage.setItem(`@adhkar_date_${sectionKey}`, todayStr);
  };

  // Parallax: moves the background pattern with scrolling (background option 'girih')
  const bgScroll = useBackgroundScroll();

  return (
    <ExactImagePatternWall isDarkMode={isDarkMode}>
      <Animated.ScrollView entering={FadeIn.duration(400)} contentContainerStyle={{ padding: 15 }} onScroll={bgScroll} scrollEventThrottle={16}>
        <HeritageArchBanner title="مكتبة الأذكار" textColor={themeColors.text.color} isDarkMode={isDarkMode} />

        <View style={styles.menuContainer}>
          {sectionsList.map((sec) => {
            const isExpanded = expandedSection === sec.key;
            const items = sectionData[sec.key] || [];
            const completedCount = items.filter(i => i.count === 0).length;
            const totalCount = items.length;
            const isAllDone = totalCount > 0 && completedCount === totalCount;
            const IconComponent = sec.icon;

            return (
              <View key={sec.key} style={[styles.menuCard, themeColors.card, isExpanded && { borderColor: '#D4A373', borderWidth: 2 }]}>
                {/* Reversed row: arrow and counter badge on the left, title and description on the right */}
                <TouchableOpacity
                  onPress={() => toggleSection(sec.key)}
                  activeOpacity={0.8}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
                    <Text style={{ fontSize: 20, color: '#D4A373', fontWeight: 'bold' }}>
                      {isExpanded ? '⌃' : '⌄'}
                    </Text>
                    <View style={styles.trackerBadgeMini}>
                      <Text style={styles.trackerBadgeMiniText}>
                        {formatArabicNumbers(completedCount)} / {formatArabicNumbers(totalCount)}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <Text style={[styles.menuTitle, themeColors.text, { fontSize: fontSize + 1, marginBottom: 0 }]}>
                        {sec.title}
                      </Text>
                      <IconComponent size={20} color="#D4A373" />
                    </View>
                    <TitleFlourish />
                    <Text style={[styles.menuSubtitle, themeColors.subText, { fontSize: fontSize - 3, marginTop: 4, textAlign: 'right' }]}>
                      {sec.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(150)} style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(212,163,115,0.2)', paddingTop: 15 }}>
                    {isAllDone ? (
                      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <HeritageIcons.IslamicStar size={36} color="#D4A373" />
                        <Text style={[themeColors.text, { fontSize: fontSize, fontWeight: 'bold', marginVertical: 6 }]}>تقبّل الله طاعتك 🌿</Text>
                        <TouchableOpacity style={[styles.resetButton, themeColors.circleBtn, { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 }]} onPress={() => resetSection(sec.key)}>
                          <Text style={[styles.resetButtonText, themeColors.circleText, { fontSize: fontSize - 3 }]}>إعادة الورد</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        {items.map((dhikr) => {
                          if (dhikr.count === 0) return null;
                          return (
                            <DhikrPulseCard
                              key={dhikr.id}
                              dhikr={dhikr}
                              isDarkMode={isDarkMode}
                              themeColors={themeColors}
                              fontSize={fontSize}
                              onPress={() => handleDecrementCount(sec.key, dhikr.id)}
                            />
                          );
                        })}
                      </>
                    )}
                  </Animated.View>
                )}
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </ExactImagePatternWall>
  );
}


export { LibraryScreen };
