// iPhone widget (WidgetKit), generated into the Xcode project by @bacons/apple-targets
// during `npx expo prebuild` / EAS Build. The Swift code lives in this folder and
// the fonts in assets/ (added to the target's resources automatically).
/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'MasraWidget',
  displayName: 'مسرى المسلم',
  icon: '../../assets/icon.png',
  // containerBackground / contentMarginsDisabled (edge-to-edge background) — iOS 17+
  deploymentTarget: '17.0',
  colors: {
    $widgetBackground: '#12241F',
    $accent: '#D4A373',
  },
  entitlements: {
    // Same App Group as the app (app.json) — the widget reads the prayer times from it
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
});
