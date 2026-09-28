// ويدجت الآيفون (WidgetKit) — بيتولّد لمشروع Xcode عبر @bacons/apple-targets
// وقت `npx expo prebuild` / EAS Build. الكود بـSwift بنفس المجلد، والخطوط
// بـassets/ (بتنضاف كموارد للـtarget تلقائياً).
/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'MasraWidget',
  displayName: 'مسرى المسلم',
  icon: '../../assets/icon.png',
  // containerBackground / contentMarginsDisabled (خلفية لآخر الحواف) — iOS 17+
  deploymentTarget: '17.0',
  colors: {
    $widgetBackground: '#12241F',
    $accent: '#D4A373',
  },
  entitlements: {
    // نفس الـApp Group تبع التطبيق (app.json) — منه بيقرا الويدجت المواقيت
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
});
