# Store listing — مسرى المسلم

Draft text and answers for App Store Connect and Google Play Console. Character limits are checked; edit freely.

---

## Names

| Field | Text | Limit |
|---|---|---|
| App name (both stores) | مسرى المسلم | 30 |
| App Store subtitle | أذكار ومواقيت الصلاة والقبلة | 30 |
| Google Play short description | أذكار الصباح والمساء ومواقيت الصلاة بالتقويم الدهري والقبلة والسبحة | 80 |

**Apple keywords** (100 characters, comma-separated, no spaces after commas):

```
أذكار,أذان,مواقيت,الصلاة,قبلة,سبحة,تسبيح,قرآن,حديث,أسماء الله,إمساكية,القدس,فلسطين,دعاء,رمضان
```

**Categories:** Apple — Lifestyle (secondary: Reference). Google — Lifestyle.

---

## Full description (Arabic)

رفيقك اليومي لذكر الله، بتصميم تراثي أنيق بالأخضر والذهبي.

🕌 مواقيت الصلاة
• مواقيت دقيقة حسب التقويم الدهري لمدن فلسطين، مع مراعاة فرق كل مدينة والتوقيت الصيفي
• تحديد موقعك تلقائياً أو اختيار مدينتك
• إمساكية الشهر كاملة، ومشاركة مواقيت اليوم كصورة
• عدّاد للصلاة القادمة ووقت الإقامة

🧭 اتجاه القبلة
• بوصلة ثابتة ودقيقة، مع إرشاد لجهة الدوران واهتزاز خفيف عند المحاذاة

📿 الأذكار والسبحة
• أذكار الصباح والمساء وغيرها، مع متابعة يومية لما أتممته
• سبحة رقمية بـ٣٣ حبّة تضيء مع كل تسبيحة، ونبضة ذهبية عند إتمام كل دورة
• أهداف ٣٣ و١٠٠ أو تسبيح حر

📖 من كتاب الله وسنة نبيه ﷺ
• آية كل يوم مع التفسير الميسّر
• حديث نبوي صحيح مع الشرح والفائدة
• أسماء الله الحسنى كاملة مشكولة مع معانيها
• مشاركة الآيات والأحاديث كبطاقات جميلة

🔔 تذكيرات
• تنبيهات بمواقيت الصلاة وأذكار الصباح والمساء والنوم، بمواعيد دقيقة لكل يوم

📱 ويدجت للشاشة الرئيسية
• الصلاة القادمة مع عدّاد تنازلي مباشر ومواقيت اليوم كاملة، على أندرويد والآيفون

📊 إحصائياتك
• حصاد الأسبوع، الأوسمة والإنجازات، وسجل الصلوات الفائتة والقضاء

🔒 خصوصيتك محفوظة
• بدون حساب أو تسجيل دخول، بدون إعلانات، وبدون جمع أي بيانات — كل شيء يبقى على جهازك

الوضع الفاتح والداكن، وتكبير الخط لراحة القراءة.

---

## Full description (English)

Your daily companion for the remembrance of Allah, in an elegant green-and-gold heritage design.

• Prayer times from the Palestinian Dahri calendar, adjusted per city and for summer time; GPS or a chosen city; monthly Imsakiya; next-prayer and iqama countdown
• A stable, accurate Qibla compass with haptic guidance
• Morning and evening adhkar with daily progress tracking
• A digital misbaha with 33 beads that light up as you count, and targets of 33, 100 or free counting
• A daily Quran verse with tafsir, a sahih hadith with explanation, and all 99 Names of Allah, fully vocalised — shareable as beautiful cards
• Precise daily reminders for prayers and adhkar
• Home-screen widgets with a live countdown, on Android and iPhone
• Weekly summary, achievements and a missed-prayers (qada) tracker
• No account, no ads, no data collection — everything stays on your device
• Light and dark mode, adjustable text size

---

## Links

| Field | Value |
|---|---|
| Privacy policy URL | `https://mohamadjam911.github.io/adhkar-app/privacy-policy.html` (after enabling GitHub Pages — see README) |
| Support URL / email | masra.al.rasul.app@gmail.com |
| Copyright (Apple) | 2026 Mohamad Jammal |

---

## Privacy questionnaires

**Apple — App Privacy:** *Data Not Collected.*
Location is used on-device only (prayer times, Qibla) and is never sent anywhere, so Apple does not count it as "collected". No tracking.

**Google — Data safety:**
- Does the app collect or share user data? **No.**
- Location permission is used only on the device to calculate prayer times and the Qibla; it is not transmitted.
- No account creation. Data is not encrypted in transit because none is transmitted. Users can clear all app data by uninstalling.

---

## Content rating

Both questionnaires: no violence, sexual content, gambling, drugs, user-generated content, chat, purchases or ads → rated **4+ (Apple) / Everyone (Google)**. Category of content: religious / reference.

---

## Notes for App Review (Apple) / testing instructions (Google)

```
No login or account is required — all features are available immediately.

Location permission is optional and used only on the device to calculate
prayer times and the Qibla direction. If declined, the app uses Jerusalem
or a city the user picks from the list (Prayer Times tab → "تغيير البلد").

Notifications are local reminders for prayer times and adhkar; there are no
push notifications from a server.

The home-screen widget ("مسرى المسلم", small and medium) shows the next prayer
with a live countdown.

The app is in Arabic.
```

---

## Screenshots to capture

Take them in **dark mode** with a city selected (e.g. القدس الشريف):

1. Home — Basmala banner, clock, verse of the day
2. Prayer times + Qibla compass (aligned)
3. Misbaha mid-count (beads partly lit)
4. Adhkar library
5. Names of Allah list
6. Home-screen widgets (small + medium)
7. Statistics — weekly summary and achievements

Sizes: iPhone 6.9" **1320×2868**, iPad 13" **2064×2752** (required — iPad support is on), Google phone screenshots (any 16:9–9:16), plus a Google **feature graphic 1024×500**.
