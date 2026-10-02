# مسرى المسلم — Masra Al-Muslim

A daily Islamic companion app for Android and iPhone: morning and evening adhkar, prayer times from the Palestinian **Dahri calendar** (and astronomical calculation everywhere else), Qibla direction, a digital misbaha, and selected Quran verses, hadiths and the Names of Allah — with home-screen widgets on both platforms.

تطبيق يومي يجمع أذكار الصباح والمساء، مواقيت الصلاة حسب **التقويم الدهري** (وبالحساب الفلكي خارج فلسطين)، اتجاه القبلة، السبحة الرقمية، وآيات وأحاديث مختارة وأسماء الله الحسنى — مع ويدجتس للشاشة الرئيسية على أندرويد والآيفون.

Built with **Expo (SDK 57)** and **React Native**, written in **TypeScript**.

---

## Features

| | |
|---|---|
| **Adhkar library** | Morning, evening and other adhkar, with daily progress tracking and statistics |
| **Prayer times** | Dahri calendar for Palestine and its surroundings (per-town offsets, converted to the device clock); astronomical calculation ([adhan](https://github.com/batoulapps/adhan-js)) everywhere else, with the method used in the user's country (Umm al-Qura, Egyptian, ISNA, Karachi + Hanafi Asr, …). GPS or a chosen city, monthly Imsakiya, shareable as an image |
| **Qibla** | Compass using device heading (falls back to magnetometer + accelerometer) |
| **Digital misbaha** | 33 / 100 / free targets; 33 animated beads light up per tap, with a gold pulse at the start of each new round |
| **Daily content** | A Quran verse with tafsir, a sahih hadith with explanation, and one of the 99 Names of Allah (fully vocalised) — verse and hadith shareable as text or image cards |
| **Notifications** | Prayer times and adhkar reminders, scheduled per day from the Dahri times (5 days ahead on iOS, 14 on Android) and refreshed on every launch |
| **Home-screen widgets** | Android: a 2×2 next-prayer widget and a 4×2 full-times widget, refreshed every minute. iPhone: small and medium WidgetKit widgets with a live, second-by-second countdown |
| **Themes** | Light and dark mode, adjustable font size, optional haptics |

---

## Getting started

Requirements: Node.js 20+, npm, and an [Expo](https://expo.dev) account for builds.

```bash
npm install
npx expo start
```

> **Note:** the app uses native modules (widgets, notifications, sensors), so it needs a **development build** or a full build — most features do not work in Expo Go.

---

## Building

The native `android/` and `ios/` folders are generated (not committed). EAS runs `expo prebuild` automatically in the cloud.

**Android** — local build (on Linux/WSL):

```bash
export ORG_GRADLE_PROJECT_reactNativeArchitectures=arm64-v8a   # faster, ~42 MB APK
eas build --platform android --profile preview --local
```

**iPhone / iPad** — cloud build (an Apple Developer account is required; register test devices first):

```bash
eas device:create
eas build --platform ios --profile preview
```

| Profile | Use |
|---|---|
| `preview` | Internal testing (Android APK / iOS ad-hoc), update channel `preview` |
| `production` | Store builds, update channel `production` |

### Over-the-air updates

Changes to JavaScript/TypeScript only (screens, text, data, designs) can be shipped without a rebuild. Each build listens to the channel of its profile, so publish to the matching branch:

```bash
eas update --branch preview      # test builds (preview profile)
eas update --branch production   # store builds (production profile)
```

A **new build** is required after changing `app.json`, adding or removing native packages, or editing `modules/` or `targets/`.

---

## Releasing to the stores

Store builds use the `production` profile (auto-incremented build numbers). Build Android **without** the arm64-only variable so the bundle supports every device:

```bash
eas build --platform android --profile production   # .aab for Google Play
eas build --platform ios --profile production
eas submit --platform ios                          # uploads to App Store Connect / TestFlight
```

- Listing text, keywords, privacy and rating answers: [`store/listing.md`](store/listing.md)
- Public privacy policy page: [`docs/privacy-policy.html`](docs/privacy-policy.html), generated from the in-app text with `node scripts/build-policy-page.js`. Publish it with **GitHub → Settings → Pages → Branch `main`, folder `/docs`** (free Pages requires a public repository; otherwise host the file anywhere public).
- After the app is created in App Store Connect, set `IOS_APP_STORE_ID` in `src/utils/rateApp.ts` so «قيّم الآن» opens the App Store page.
- Google Play: new personal developer accounts must run a closed test with at least 12 testers for 14 days before production access.

---

## Project structure

```
App.tsx, index.ts                 App root; Android widget task registration
app.json, eas.json                Expo and EAS configuration
src/
  screens/                        Home, Prayer times & Qibla, Adhkar library, Misbaha, Stats, Settings, About…
  components/                     Decorative ornaments, animated misbaha counter, share cards, backgrounds
  data/                           Adhkar, Dahri prayer-time table, verses, hadiths, Names of Allah
  services/
    notificationService.ts        Day-by-day notification scheduling
    PrayerTimesProvider.ts        Resolves the saved location and computes times for any day (widgets, notifications)
  utils/
    prayerTimesEngine.ts          Dahri table vs. astronomical calculation, per-country method
    …                             Prayer status, formatters (Hijri dates), rating, stats
  theme/                          Colours, styles, background option switch
  widgets/
    masraPalace/                  Android widgets (design, model, Dahri time provider, controller)
    ios/IosWidgetBridge.ts        Sends 14 days of prayer times to the iPhone widget
modules/masra-widget-clock/       Local Expo module (Kotlin): exact per-minute Android widget refresh
targets/widget/                   iPhone WidgetKit extension (SwiftUI), linked by @bacons/apple-targets
scripts/gold-palette.js           Switch the app's gold colour and restore the saved one
assets/                           Icons, splash, fonts (incl. widget fonts)
```

### How prayer times are computed

`src/utils/prayerTimesEngine.ts` is the single source of truth used by the screen, both widgets and the notifications:

- **Within ~60 km of a Dahri reference town** (Palestine and its immediate surroundings) the times come from the Dahri table, shifted by the town's offset and converted from Palestine standard time (UTC+2) to the device clock — so summer time, and neighbours on a different clock such as Jordan, are handled automatically.
- **Everywhere else** they are calculated astronomically with *adhan*, using the method of the user's country (from reverse geocoding; Muslim World League by default) and the recommended high-latitude rule. The screen and share cards then read «حساب فلكي» with the method's name instead of «التقويم الدهري».

### How the widgets get their data

- **Android:** the widgets compute their own times with the same engine for the saved city or last GPS position, so they stay correct with the app closed. The `masra-widget-clock` module redraws them at the start of every minute (exact alarms; falls back to a short window if exact alarms are not allowed).
- **iPhone:** the app writes 14 days of times into a shared App Group (`group.com.mohamad.masra`); the SwiftUI widget builds a timeline with an entry at every adhan and iqama, and iOS ticks the countdown live.

---

## Customisation switches

| What | Where | Options |
|---|---|---|
| Screen background | `src/theme/backgroundStyle.ts` | `'classic'`, `'courtyard'` (current), `'girih'` |
| App gold colour | `node scripts/gold-palette.js` | `apply` (richer gold), `revert` (original `#D4A373`), `status` |

---

## Licence

Developed by **Mohamad Jammal**. Copyright © 2026 — **all rights reserved**, see [LICENSE](LICENSE). Third-party libraries remain under their own licences.
