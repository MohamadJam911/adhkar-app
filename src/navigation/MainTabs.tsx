import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { HeritageIcons } from '../components/HeritageIcons';
import { HomeScreen } from '../screens/HomeScreen';
import { SebhaScreen } from '../screens/SebhaScreen';
import { PrayerTimesScreen } from '../screens/PrayerTimesScreen';
import { LibraryStack } from './LibraryStack';

const Tab = createBottomTabNavigator();

function MainTabs({ hapticEnabled, fontSize, setHapticEnabled, setFontSize }: any) {
  const { isDarkMode } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="الرئيسية"
      screenOptions={({ navigation }: any) => ({
        headerStyle: { backgroundColor: isDarkMode ? '#1E1B18' : '#FBF9F5' },
        headerTintColor: isDarkMode ? '#D4A373' : '#6F4E37',
        // العنوان بالنص حتى ما يتصادم مع أيقونة الإعدادات يسار (أندرويد
        // افتراضياً بيحط العنوان يسار)
        headerTitleAlign: 'center',
        // الإعدادات يسار الشريط
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('الإعدادات')}
            activeOpacity={0.7}
            style={{ marginLeft: 15, padding: 2 }}
            accessibilityRole="button"
            accessibilityLabel="الإعدادات"
          >
            <HeritageIcons.Gear size={22} color={isDarkMode ? '#D4A373' : '#6F4E37'} />
          </TouchableOpacity>
        ),
        // الإحصائيات يمين الشريط
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('StatsScreen')}
            activeOpacity={0.7}
            style={{ marginRight: 15, padding: 2 }}
            accessibilityRole="button"
            accessibilityLabel="الإحصائيات"
            accessibilityHint="يعرض إحصائيات الأذكار والصلوات"
          >
            <HeritageIcons.Chart size={22} color={isDarkMode ? '#D4A373' : '#6F4E37'} />
          </TouchableOpacity>
        ),
        tabBarStyle: { 
          backgroundColor: isDarkMode ? '#1E1B18' : '#FBF9F5', 
          borderTopColor: isDarkMode ? '#3A322A' : '#E6DCB8', 
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#D4A373',
        tabBarInactiveTintColor: isDarkMode ? '#8C7A6B' : '#8C7A6B',
        // خلفية منطقة الشاشة بين التابات — تفادي أي ومضة رمادية افتراضية
        // (نفس سبب التعديل على screenBgColor فوق بالـ App()).
        sceneContainerStyle: { backgroundColor: isDarkMode ? '#14110E' : '#F9F4EC' },
      })}
    >
      <Tab.Screen 
        name="السبحة" 
        options={{ 
          title: 'السبحة', 
          tabBarIcon: ({ color }) => <HeritageIcons.Rosary size={22} color={color} /> 
        }}
      >
        {(props) => <SebhaScreen hapticEnabled={hapticEnabled} fontSize={fontSize} />}
      </Tab.Screen>

      <Tab.Screen 
        name="الأذكار" 
        options={{ 
          title: 'الأذكار', 
          tabBarIcon: ({ color }) => <HeritageIcons.QuranBook size={22} color={color} /> 
        }}
      >
        {(props) => <LibraryStack hapticEnabled={hapticEnabled} fontSize={fontSize} />}
      </Tab.Screen>

      <Tab.Screen 
        name="الصلاة والقبلة" 
        options={{ 
          title: 'الصلاة والقبلة', 
          tabBarLabel: 'المواقيت', 
          tabBarIcon: ({ color }) => <HeritageIcons.Clock size={22} color={color} /> 
        }}
      >
        {(props) => <PrayerTimesScreen fontSize={fontSize} hapticEnabled={hapticEnabled} />}
      </Tab.Screen>

      <Tab.Screen 
        name="الرئيسية" 
        options={{ 
          title: 'الرئيسية', 
          tabBarIcon: ({ color }) => <HeritageIcons.Home size={22} color={color} /> 
        }}
      >
        {(props) => <HomeScreen {...props} hapticEnabled={hapticEnabled} fontSize={fontSize} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}


export { MainTabs };
