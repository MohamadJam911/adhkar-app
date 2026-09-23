import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './App';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

registerRootComponent(App);

// بيسجل المعالج المسؤول عن رسم ويدجت "الصلاة القادمة" على الشاشة
// الرئيسية لأندرويد، حتى لو التطبيق نفسه مسكّر تماماً (WIDGET_ADDED
// و WIDGET_UPDATE الدوري بيشتغلوا بدون ما يكون التطبيق مفتوح).
registerWidgetTaskHandler(widgetTaskHandler);