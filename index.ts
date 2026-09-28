import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './App';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

registerRootComponent(App);

// بيسجل المعالج المسؤول عن رسم ويدجتس الشاشة الرئيسية لأندرويد، حتى لو
// التطبيق نفسه مسكّر تماماً (WIDGET_ADDED و WIDGET_UPDATE بيشتغلوا بدون ما
// يكون التطبيق مفتوح). أندرويد بس — ويدجت الآيفون مكتوب بـSwift
// (targets/widget) وبياخد بياناته عبر src/widgets/ios/IosWidgetBridge.ts.
if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}
