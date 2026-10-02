import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './App';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

registerRootComponent(App);

// Registers the handler that renders the Android home-screen widgets, even when
// the app is closed (WIDGET_ADDED and WIDGET_UPDATE run without the app open).
// Android only — the iPhone widget is written in Swift (targets/widget) and gets
// its data through src/widgets/ios/IosWidgetBridge.ts.
if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}
