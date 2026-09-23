// ==========================================
// 🎨 لوحة الألوان والزخارف المشتركة بين كل ويدجتس الشاشة الرئيسية
// ==========================================
// ملف مشترك حتى كل الويدجتس (الحالية والمستقبلية) تستخدم نفس هوية
// الألوان والزخرفة بدل ما يتكرر نفس التعريف بكل ملف على حدة.

// "as const" لازمة هون: مكتبة الويدجت (react-native-android-widget) بتوقّع
// نوع ColorProp (نص hex بصيغة `#...` أو نص rgba بالضبط)، مش أي string عام.
// بدون as const، تايبسكريبت بيوسّع كل قيمة لنوع string العام فيصير فيه خطأ
// "string is not assignable to ColorProp" وقت استخدامها بخاصية
// backgroundColor/color/borderColor.
export const WIDGET_COLORS = {
  background: '#12241F',
  card: '#1B342C',
  gold: '#D4A373',
  goldSoft: 'rgba(212, 163, 115, 0.35)',
  goldFaint: 'rgba(212, 163, 115, 0.18)',
  goldDivider: 'rgba(212, 163, 115, 0.45)',
  textPrimary: '#F5F1EA',
  textSecondary: '#B9C7C1',
} as const;

// هلال + نجمة صغيرة بلون ذهبي — رمزية إسلامية مبسّطة تناسب حجم الويدجت
// الصغير (خصوصاً بالوضع المصغّر 2×2). ممرَّرة كنص SVG خام مباشرة لخاصية
// `svg` بمكوّن SvgWidget من المكتبة، بدون الحاجة لأي ملف صورة إضافي
// بالمشروع أو خط أيقونات مخصص.
export const CRESCENT_STAR_SVG = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M15.2 3.3a8.2 8.2 0 1 0 5.1 7.6A6.6 6.6 0 0 1 15.2 3.3z" fill="#D4A373"/>
  <path d="M19.3 2.8l0.55 1.3 1.3 0.55-1.3 0.55-0.55 1.3-0.55-1.3-1.3-0.55 1.3-0.55z" fill="#D4A373"/>
</svg>
`.trim();

// ==========================================
// 🕌 خلفية زخرفية كاملة للويدجتس — نفس هوية الزخرفة المستخدمة بخلفية
// التطبيق الأصلية (ExactImagePatternWall جوا src/components/Decorative.tsx):
// نقش هندسي إسلامي متكرر (معين + دائرة + خطوط قطرية) بشفافية ذهبية خفيفة
// فوق خلفية خضراء داكنة، بالإضافة لأربع نجمات ثمانية الرؤوس (طراز عثماني)
// بزوايا البطاقة — أكبر وأوضح بالأعلى، أخف بالأسفل، تماماً متل
// OttomanHeaderOrnament بالصفحة الرئيسية. الكل مرسوم كـSVG خام واحد
// (viewBox نسبي 300×300 مع preserveAspectRatio="none" حتى يغطي أي أبعاد
// ويدجت فعلية بدون فراغات، بغض النظر عن الحجم اللي اختاره المستخدم)،
// ومعروض كطبقة خلفية عبر OverlapWidget خلف محتوى الويدجت الفعلي (النصوص
// والأيقونات)، فما بيأثر إطلاقاً على وضوح القراءة.
export const WIDGET_BACKGROUND_SVG = `
<svg viewBox="0 0 300 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <pattern id="islamicPattern" width="46" height="46" patternUnits="userSpaceOnUse">
      <path d="M23 0 L46 23 L23 46 L0 23 Z" fill="none" stroke="rgba(212,163,115,0.17)" stroke-width="1.1"/>
      <circle cx="23" cy="23" r="9.5" fill="none" stroke="rgba(212,163,115,0.17)" stroke-width="1.1"/>
      <path d="M0 0 L46 46 M46 0 L0 46" stroke="rgba(212,163,115,0.1)" stroke-width="0.55"/>
    </pattern>
    <path id="ottomanStar8" d="M0,-1 L0.161,-0.388 L0.707,-0.707 L0.388,-0.161 L1,0 L0.388,0.161 L0.707,0.707 L0.161,0.388 L0,1 L-0.161,0.388 L-0.707,0.707 L-0.388,0.161 L-1,0 L-0.388,-0.161 L-0.707,-0.707 L-0.161,-0.388 Z"/>
  </defs>
  <rect x="0" y="0" width="300" height="300" rx="22" fill="#12241F"/>
  <rect x="0" y="0" width="300" height="300" rx="22" fill="url(#islamicPattern)"/>
  <use href="#ottomanStar8" xlink:href="#ottomanStar8" transform="translate(28,28) scale(16)" fill="#D4A373" opacity="0.3"/>
  <use href="#ottomanStar8" xlink:href="#ottomanStar8" transform="translate(272,28) scale(16)" fill="#D4A373" opacity="0.3"/>
  <use href="#ottomanStar8" xlink:href="#ottomanStar8" transform="translate(28,272) scale(11)" fill="#D4A373" opacity="0.18"/>
  <use href="#ottomanStar8" xlink:href="#ottomanStar8" transform="translate(272,272) scale(11)" fill="#D4A373" opacity="0.18"/>
</svg>
`.trim();

// ==========================================
// ✨ لوحة الألوان "الفاخرة" — ذهبي لامع + عاجي، بس بنفس الأخضر الأساسي
// المستخدم فعلياً بأيقونة التطبيق وشاشة البداية (adaptiveIcon.backgroundColor
// و splash.backgroundColor بـ app.json، ونفس WIDGET_COLORS.background/card
// أعلاه) بدل الأخضر الزمردي العام من مواصفة التصميم الأولية — حتى يكون
// في تطابق كامل بهوية اللون الأخضر بين الويدجت وباقي هوية التطبيق البصرية.
// ==========================================
export const PREMIUM_COLORS = {
  background: '#12241F',
  backgroundSecondary: '#1B342C',
  gold: '#C9A227',
  goldBright: '#E0B83F',
  ivory: '#F4EBD0',
  goldFaint: 'rgba(201, 162, 39, 0.16)',
  goldDivider: 'rgba(201, 162, 39, 0.4)',
  goldBorder: 'rgba(201, 162, 39, 0.55)',
  ivoryFaint: 'rgba(244, 235, 208, 0.65)',
} as const;

// خلفية زخرفية "فاخرة": نفس فكرة النقش الهندسي المتكرر، بس بألوان
// PREMIUM_COLORS، مع إضافة إطار ذهبي رفيع محيط بكامل الويدجت (طلب صريح
// بالتصميم: "thin gold geometric border") ونجمات ثمانية الرؤوس أعلى/أسفل
// أكبر وأسطع بالزوايا العلوية.
export const PREMIUM_BACKGROUND_SVG = `
<svg viewBox="0 0 300 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <pattern id="premiumPattern" width="46" height="46" patternUnits="userSpaceOnUse">
      <path d="M23 0 L46 23 L23 46 L0 23 Z" fill="none" stroke="rgba(201,162,39,0.14)" stroke-width="1"/>
      <circle cx="23" cy="23" r="9.5" fill="none" stroke="rgba(201,162,39,0.14)" stroke-width="1"/>
      <path d="M0 0 L46 46 M46 0 L0 46" stroke="rgba(201,162,39,0.08)" stroke-width="0.5"/>
    </pattern>
    <path id="premiumStar8" d="M0,-1 L0.161,-0.388 L0.707,-0.707 L0.388,-0.161 L1,0 L0.388,0.161 L0.707,0.707 L0.161,0.388 L0,1 L-0.161,0.388 L-0.707,0.707 L-0.388,0.161 L-1,0 L-0.388,-0.161 L-0.707,-0.707 L-0.161,-0.388 Z"/>
  </defs>
  <rect x="0" y="0" width="300" height="300" rx="24" fill="#12241F"/>
  <rect x="0" y="0" width="300" height="300" rx="24" fill="url(#premiumPattern)"/>
  <rect x="2.5" y="2.5" width="295" height="295" rx="22" fill="none" stroke="#C9A227" stroke-width="1.6" opacity="0.6"/>
  <use href="#premiumStar8" xlink:href="#premiumStar8" transform="translate(22,22) scale(13)" fill="#E0B83F" opacity="0.42"/>
  <use href="#premiumStar8" xlink:href="#premiumStar8" transform="translate(278,22) scale(13)" fill="#E0B83F" opacity="0.42"/>
  <use href="#premiumStar8" xlink:href="#premiumStar8" transform="translate(150,290) scale(8)" fill="#C9A227" opacity="0.3"/>
</svg>
`.trim();

// أيقونة صغيرة مميّزة لكل صلاة (هلال الفجر، شمس الظهر بأشعة كاملة، شمس
// العصر المائلة، غروب المغرب فوق الأفق، هلال+نجمة العشاء) — بيتم توليدها
// بدالة عشان نقدر نلوّنها ديناميكياً (ذهبي فاقع للصلاة القادمة/الحالية،
// عاجي خافت للباقي)، لأن SvgWidget بيتوقع نص SVG جاهز مش CSS variable
// زي currentColor.
export type PrayerIconKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export function prayerIconSvg(key: PrayerIconKey, color: string): string {
  switch (key) {
    case 'Fajr':
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.2 3.3a8.2 8.2 0 1 0 5.1 7.6A6.6 6.6 0 0 1 15.2 3.3z" fill="${color}"/></svg>`;
    case 'Dhuhr':
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4.6" fill="${color}"/><g stroke="${color}" stroke-width="1.6" stroke-linecap="round"><path d="M12 2.2v2.6M12 19.2v2.6M2.2 12h2.6M19.2 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M5.4 18.6l1.8-1.8M16.8 7.2l1.8-1.8"/></g></svg>`;
    case 'Asr':
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="13" r="4.2" fill="${color}"/><g stroke="${color}" stroke-width="1.4" stroke-linecap="round"><path d="M12 5.2v2M4.6 13h2M17.4 13h2M7.4 8.4l1.4 1.4M15.2 9.8l1.4-1.4"/></g><path d="M4 19h16" stroke="${color}" stroke-width="1.3" stroke-linecap="round" opacity="0.55"/></svg>`;
    case 'Maghrib':
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 14a6 6 0 0 1 12 0z" fill="${color}"/><path d="M3.4 14h17.2" stroke="${color}" stroke-width="1.4" stroke-linecap="round"/><path d="M5.2 17.4h13.6M7 20h10" stroke="${color}" stroke-width="1.1" stroke-linecap="round" opacity="0.55"/></svg>`;
    case 'Isha':
      return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.8 3.6a7.6 7.6 0 1 0 4.9 7.1A6.1 6.1 0 0 1 14.8 3.6z" fill="${color}"/><path d="M19.4 3.2l0.5 1.2 1.2 0.5-1.2 0.5-0.5 1.2-0.5-1.2-1.2-0.5 1.2-0.5z" fill="${color}"/></svg>`;
    default:
      return '';
  }
}

// فاصل صغير جداً على شكل نجمة ثمانية الرؤوس، بيتحط بين أعمدة الصلوات
// الخمسة بالصف الأفقي (طلب صريح بالتصميم: "tiny 8-point Islamic star
// separators")
export function starSeparatorSvg(color: string, opacity = 0.55): string {
  return `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10,1 L11.6,7.4 L18,9 L11.6,10.6 L10,17 L8.4,10.6 L2,9 L8.4,7.4 Z" fill="${color}" opacity="${opacity}"/></svg>`;
}

// ==========================================
// 🕌 خلفية "دقيقة" مستوحاة من الصورة المرجعية: خط ذهبي رفيع محيط واحد
// فقط (بدل الإطار السميك المزدوج)، بدون نقش هندسي مزدحم (خلفية شبه
// صافية، بالكاد فيها ملمس خفيف جداً)، ومعينة زخرفية صغيرة بأعلى ووسط
// أسفل البطاقة (تذكير بسيط بسلسلة المعينات المعلّقة بالصورة المرجعية،
// بس جوا حدود الويدجت لأنه ما فينا نرسم خارج حدوده).
export const REFINED_BACKGROUND_SVG = `
<svg viewBox="0 0 300 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="tinyDiamond8" d="M0,-1 L0.161,-0.388 L0.707,-0.707 L0.388,-0.161 L1,0 L0.388,0.161 L0.707,0.707 L0.161,0.388 L0,1 L-0.161,0.388 L-0.707,0.707 L-0.388,0.161 L-1,0 L-0.388,-0.161 L-0.707,-0.707 L-0.161,-0.388 Z"/>
  </defs>
  <rect x="0" y="0" width="300" height="300" rx="18" fill="#12241F"/>
  <rect x="2" y="2" width="296" height="296" rx="16" fill="none" stroke="#C9A227" stroke-width="1.1" opacity="0.75"/>
  <use href="#tinyDiamond8" transform="translate(150,10) scale(5)" fill="#C9A227" opacity="0.55"/>
  <use href="#tinyDiamond8" transform="translate(150,290) scale(5)" fill="#C9A227" opacity="0.55"/>
</svg>
`.trim();

// أيقونة شارة صغيرة على شكل قبة/مئذنة مبسّطة (رمزية للمسجد)، تستخدم
// بشارة "أقرب صلاة" أعلى الويدجت — نفس فكرة أيقونة القبة الصغيرة
// بالصورة المرجعية، برسم خطي بسيط بدل صورة فعلية.
export function mosqueDomeIconSvg(color: string): string {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3.5c-1.6 0-2.9 1.3-2.9 3 0 1 .5 1.9 1.3 2.5H9.6c-2 0-3.6 1.6-3.6 3.6V15h12.6v-2.4c0-2-1.6-3.6-3.6-3.6h-.8c.8-.6 1.3-1.5 1.3-2.5 0-1.7-1.3-3-2.9-3z" fill="${color}"/>
    <rect x="5.4" y="15" width="13.2" height="1.6" rx="0.5" fill="${color}"/>
    <rect x="6.6" y="16.9" width="10.8" height="2" rx="0.5" fill="${color}" opacity="0.85"/>
    <path d="M12 1.6l0.6 1.3 1.3 0.2-1 0.9 0.25 1.3L12 4.7l-1.15 0.6L11.1 4l-1-0.9 1.3-0.2z" fill="${color}"/>
  </svg>`.trim();
}

// ==========================================
// 🕌 خلفية "القوس الفاخر" — أقرب محاولة لروح الصورة المرجعية ضمن حدود
// SVG المرسوم يدوياً (بدون أي ملف صورة/رسمة فوتوغرافية حقيقية، لأنه هاد
// مش ممكن بمكتبة الويدجت):
//  • إطار ذهبي رفيع واحد محيط بكامل البطاقة (زي REFINED_BACKGROUND_SVG)
//  • "سلسلة" معينات صغيرة (٣ معينات متدرجة الحجم بخط واصل رفيع) أعلى
//    ووسط أسفل البطاقة — بدل معين واحد بس — تقريباً لنفس فكرة السلسلة
//    الزخرفية (medallion chain) اللي بالصورة المرجعية.
//  • ظل خفيف جداً (شفافية ٥٪) لهيكل قبة+مئذنتين مبسّط بمنتصف الخلفية،
//    كـ"وشم" خلفي (watermark) موحي بقبة الصخرة بدون ما ينافس النصوص
//    بالوضوح — أقصى ما ممكن نقدّمه من "استيحاء" حقيقي بدون ملف صورة.
export const PREMIUM_ARCH_BACKGROUND_SVG = `
<svg viewBox="0 0 300 300" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="archBgDiamond" d="M0,-1 L0.161,-0.388 L0.707,-0.707 L0.388,-0.161 L1,0 L0.388,0.161 L0.707,0.707 L0.161,0.388 L0,1 L-0.161,0.388 L-0.707,0.707 L-0.388,0.161 L-1,0 L-0.388,-0.161 L-0.707,-0.707 L-0.161,-0.388 Z"/>
  </defs>
  <rect x="0" y="0" width="300" height="300" rx="18" fill="#12241F"/>

  <g opacity="0.055" fill="#C9A227">
    <rect x="40" y="168" width="220" height="2" rx="1"/>
    <path d="M50,168 L50,150 A10,10 0 0 1 70,150 L70,168 Z"/>
    <path d="M84,168 L84,150 A10,10 0 0 1 104,150 L104,168 Z"/>
    <path d="M140,168 L140,144 A15,15 0 0 1 170,144 L170,168 Z"/>
    <path d="M196,168 L196,150 A10,10 0 0 1 216,150 L216,168 Z"/>
    <path d="M230,168 L230,150 A10,10 0 0 1 250,150 L250,168 Z"/>
    <rect x="125" y="96" width="50" height="52"/>
    <circle cx="150" cy="96" r="32"/>
    <rect x="148" y="55" width="4" height="18"/>
    <circle cx="150" cy="52" r="5"/>
    <rect x="96" y="62" width="8" height="86"/>
    <circle cx="100" cy="58" r="6"/>
    <rect x="196" y="62" width="8" height="86"/>
    <circle cx="200" cy="58" r="6"/>
  </g>

  <rect x="2" y="2" width="296" height="296" rx="16" fill="none" stroke="#C9A227" stroke-width="1.1" opacity="0.75"/>

  <path d="M115,11 L185,11" stroke="#C9A227" stroke-width="0.6" opacity="0.4"/>
  <use href="#archBgDiamond" transform="translate(130,11) scale(2.6)" fill="#C9A227" opacity="0.4"/>
  <use href="#archBgDiamond" transform="translate(150,10) scale(5)" fill="#C9A227" opacity="0.6"/>
  <use href="#archBgDiamond" transform="translate(170,11) scale(2.6)" fill="#C9A227" opacity="0.4"/>

  <path d="M115,289 L185,289" stroke="#C9A227" stroke-width="0.6" opacity="0.4"/>
  <use href="#archBgDiamond" transform="translate(130,289) scale(2.6)" fill="#C9A227" opacity="0.4"/>
  <use href="#archBgDiamond" transform="translate(150,290) scale(5)" fill="#C9A227" opacity="0.6"/>
  <use href="#archBgDiamond" transform="translate(170,289) scale(2.6)" fill="#C9A227" opacity="0.4"/>
</svg>
`.trim();

// قوس مدبّب رفيع (نفس هندسة القوس الإسلامي/المحراب بالصورة المرجعية:
// خطين رأسيين قصار يلتقوا بقوسين دائريين بنقطة مدببة بالأعلى) — يترسم
// كطبقة خلف محتوى الصلاة النشطة بس (عبر OverlapWidget) حتى يعطيها هالة
// قوس حقيقية بدل مجرد زوايا مدوّرة. خط بدون تعبئة (أو تعبئة خفيفة جداً
// اختيارية) حتى يضل خفيف وأنيق زي الصورة المرجعية بالضبط.
export function archOutlineSvg(color: string, fillColor: string = 'none'): string {
  return `<svg viewBox="0 0 100 140" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8,138 L8,58 A42,42 0 0 1 50,16 A42,42 0 0 1 92,58 L92,138"
      fill="${fillColor}" stroke="${color}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`.trim();
}

// ==========================================
// ✨ خلفية "التمويج الذهبي" — مستوحاة من الصورة المرجعية الجديدة (بطاقة
// أفقية 4×2 بخلفية متدرّجة ناعمة "موجية"/mesh-gradient)، بس بدل التدرّج
// البنفسجي بالصورة الأصلية، استخدمنا تمويج بلون ذهبي شفاف جداً (نفس
// PREMIUM_COLORS.gold/goldBright) فوق الأخضر الداكن الأساسي لهوية
// التطبيق (#12241F) — تناسق مباشر بين الأخضر الداكن والذهبي اللامع
// زي ما طلب المستخدم بالضبط، بدل أي أصفر فاقع.
// التمويج نفسه عبارة عن عدة بيضاوات (ellipse) متراكبة بشفافية خفيفة
// جداً (٦-١٠٪) بأحجام وموديع مختلفة، تعطي إحساس تدرّج ناعم "موجي" بدون
// الحاجة لأي فلتر ضبابي (blur) — مو مدعوم أصلاً بمحرّك رسم الويدجت.
// viewBox بأبعاد 400×200 نسبةً لشكل الويدجت الجديد الأفقي (4 عرض × 2
// ارتفاع)، مع preserveAspectRatio="none" حتى يتمطّط تلقائياً لأي حجم
// فعلي يختاره المستخدم بدون فراغات.
export const GOLD_WAVE_BACKGROUND_SVG = `
<svg viewBox="0 0 400 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="400" height="200" rx="20" fill="#12241F"/>
  <ellipse cx="40" cy="8" rx="175" ry="115" fill="#E0B83F" opacity="0.26"/>
  <ellipse cx="362" cy="-5" rx="155" ry="100" fill="#F2CB4E" opacity="0.22"/>
  <ellipse cx="200" cy="212" rx="265" ry="90" fill="#C9A227" opacity="0.20"/>
  <ellipse cx="398" cy="192" rx="135" ry="78" fill="#E0B83F" opacity="0.18"/>
  <ellipse cx="2" cy="196" rx="125" ry="72" fill="#C9A227" opacity="0.16"/>
  <ellipse cx="200" cy="96" rx="95" ry="48" fill="#F2CB4E" opacity="0.05"/>
  <rect x="2" y="2" width="396" height="196" rx="18" fill="none" stroke="#E0B83F" stroke-width="1.6" opacity="0.85"/>
</svg>
`.trim();

// أيقونة شعار التطبيق المصغّرة (هلال+نجمة داخل دائرة محدّدة بخط ذهبي
// رفيع) — تتحط بزاوية اليسار العلوية جنب اسم التطبيق، بنفس روح شعار
// الصورة المرجعية (أيقونة صغيرة + اسم المسجد/التطبيق) بس بهوية بصرية
// خاصة بتطبيقنا (هلال+نجمة، نفس أيقونة CRESCENT_STAR_SVG أعلاه) بدل
// أيقونة القبة (المستخدمة هي لشارة "الصلاة القادمة" بدل هيك).
export function appLogoIconSvg(color: string): string {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.2 3.3a8.2 8.2 0 1 0 5.1 7.6A6.6 6.6 0 0 1 15.2 3.3z" fill="${color}"/>
    <path d="M19.3 2.8l0.55 1.3 1.3 0.55-1.3 0.55-0.55 1.3-0.55-1.3-1.3-0.55 1.3-0.55z" fill="${color}"/>
  </svg>`.trim();
}

// ==========================================
// 🖼️ النسخة "البسيطة" — طبق الأصل عن أول صورة مرجعية اختارها المستخدم
// صراحة من بين ٣ صور (بعد ما رفض تصميم القوس الفاخر وتصميم "الإسراء"):
// خلفية خضراء داكنة صافية شبه فاضية، إطار ذهبي رفيع واحد فقط، ٤ نجمات
// ثمانية الرؤوس صغيرة بالزوايا الأربعة تماماً فوق الإطار، ونقش هندسي
// خافت جداً (٥٪ شفافية) محصور بالزاوية العلوية اليسرى بس — مو نقش
// متكرر يغطي كامل الخلفية زي المحاولات السابقة. هاي النسخة هي الأبسط
// والأوضح قراءة بالحجم الفعلي الصغير للويدجت (تقريباً 2.5×1.3 إنش على
// الموبايل)، ولهيك اختارها المستخدم من بين الثلاث صور.
export const SIMPLE_BORDER_BACKGROUND_SVG = `
<svg viewBox="0 0 400 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="simpleCornerStar8" d="M0,-1 L0.161,-0.388 L0.707,-0.707 L0.388,-0.161 L1,0 L0.388,0.161 L0.707,0.707 L0.161,0.388 L0,1 L-0.161,0.388 L-0.707,0.707 L-0.388,0.161 L-1,0 L-0.388,-0.161 L-0.707,-0.707 L-0.161,-0.388 Z"/>
  </defs>
  <rect x="0" y="0" width="400" height="200" rx="20" fill="#0F3B2E"/>
  <g opacity="0.05" stroke="#C9A227" stroke-width="0.8" fill="none">
    <path d="M14 8 L14 45 M14 8 L51 8"/>
    <circle cx="14" cy="8" r="30"/>
    <circle cx="14" cy="8" r="20"/>
    <path d="M0 22 L28 -6 M0 -6 L28 22"/>
  </g>
  <rect x="3" y="3" width="394" height="194" rx="17" fill="none" stroke="#C9A227" stroke-width="1.6" opacity="0.85"/>
  <use href="#simpleCornerStar8" transform="translate(14,14) scale(6)" fill="#E0B83F" opacity="0.9"/>
  <use href="#simpleCornerStar8" transform="translate(386,14) scale(6)" fill="#E0B83F" opacity="0.9"/>
  <use href="#simpleCornerStar8" transform="translate(14,186) scale(6)" fill="#E0B83F" opacity="0.9"/>
  <use href="#simpleCornerStar8" transform="translate(386,186) scale(6)" fill="#E0B83F" opacity="0.9"/>
</svg>
`.trim();

// أيقونة دبّوس موقع صغيرة (خط خارجي رفيع + نقطة معبّأة بالنص) — تتحط
// بمنتصف صف الرأس بالنسخة البسيطة، زي الصورة المرجعية الأولى بالضبط
// (أيقونة موقع لحالها بدون اسم مدينة مكتوب، حفاظاً على البساطة والوضوح
// بالحجم الصغير).
export function locationPinIconSvg(color: string): string {
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="12" cy="9" r="2.4" fill="${color}"/>
  </svg>`.trim();
}

// ==========================================
// 💎 النسخة "الفاخرة v6" — استجابة لطلب صريح ومفصّل بمواصفات تقنية
// (إطار ذهبي مزدوج، أربع زخارف أرابيسك بالزوايا، وشم خفي لمسجد
// بالخلفية، بطاقة "أقرب صلاة" على شكل قوس إسلامي، صف الصلوات جوا
// حاوية منفصلة). هاي الخلفية والقوس والحاوية آمنين ١٠٠٪ من ناحية
// overflow لأنهم مجرد SVG زخرفي بيتمطّط تلقائياً لحجم أي حاوية تحطه
// فيها (via preserveAspectRatio="none" + width/height:'match_parent')
// — ما بيضيفوا ولا بكسل ارتفاع/عرض فعلي حقيقي، فمستحيل يسببوا نفس
// مشكلة الفيضان (overflow) يلي صارت مرتين بالنسخ السابقة.
//
// ⚠️ بالمقابل: PRAYER_ARCH_CARD_SVG وBOTTOM_PRAYERS_CONTAINER_SVG
// مصمّمين للاستخدام جوا OverlapWidget متداخل بدون width/height صريح
// (يعتمد على افتراض إنه المكتبة بتعمل "wrap content" تلقائياً حسب
// أكبر عنصر داخلها، زي FrameLayout الأصلي بأندرويد) — هاد الافتراض
// معقول جداً بس ما انفحص فعلياً على جهاز حقيقي بعد. لهيك الملف
// AllPrayerTimesWidget.tsx الحالي **ما بيستخدمهم فعلياً** — بيستخدم
// بدلاً عنهم نفس أسلوب الحدود العادي (borderWidth/borderRadius على
// FlexWidget) يلي انفحص وشتغل فعلياً على الجهاز مرتين قبل هيك بدون أي
// مشكلة. هاي الثوابت موجودة هون جاهزة كخيار تجربة لاحقة (بعد ما نتأكد
// إنه النسخة الآمنة الحالية شغالة تمام)، مو مدمجة بالتصميم النهائي حتى
// ما نرجع لنفس مشكلة الفيضان لثالث مرة بافتراض غير مختبر.

export const LUXURY_PRAYER_BG_SVG = `
<svg viewBox="0 0 400 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="luxuryStar8" d="M0,-1 L0.161,-0.388 L0.707,-0.707 L0.388,-0.161 L1,0 L0.388,0.161 L0.707,0.707 L0.161,0.388 L0,1 L-0.161,0.388 L-0.707,0.707 L-0.388,0.161 L-1,0 L-0.388,-0.161 L-0.707,-0.707 L-0.161,-0.388 Z"/>
  </defs>
  <rect x="0" y="0" width="400" height="200" rx="20" fill="#0B3026"/>

  <g opacity="0.05" fill="#C9A227">
    <rect x="150" y="118" width="100" height="2" rx="1"/>
    <path d="M160,118 L160,100 A9,9 0 0 1 178,100 L178,118 Z"/>
    <path d="M182,118 L182,94 A18,18 0 0 1 218,94 L218,118 Z"/>
    <path d="M222,118 L222,100 A9,9 0 0 1 240,100 L240,118 Z"/>
    <rect x="197" y="70" width="3" height="14"/>
    <circle cx="198.5" cy="67" r="4"/>
    <rect x="165" y="76" width="6" height="42"/>
    <circle cx="168" cy="73" r="4.5"/>
    <rect x="229" y="76" width="6" height="42"/>
    <circle cx="232" cy="73" r="4.5"/>
  </g>

  <rect x="3" y="3" width="394" height="194" rx="17" fill="none" stroke="#C9A227" stroke-width="1.8" opacity="0.9"/>
  <rect x="7" y="7" width="386" height="186" rx="14" fill="none" stroke="#C9A227" stroke-width="0.8" opacity="0.45"/>

  <use href="#luxuryStar8" transform="translate(16,16) scale(7)" fill="#E0B83F" opacity="0.9"/>
  <use href="#luxuryStar8" transform="translate(28,16) scale(3)" fill="#C9A227" opacity="0.5"/>
  <use href="#luxuryStar8" transform="translate(16,28) scale(3)" fill="#C9A227" opacity="0.5"/>

  <use href="#luxuryStar8" transform="translate(384,16) scale(7)" fill="#E0B83F" opacity="0.9"/>
  <use href="#luxuryStar8" transform="translate(372,16) scale(3)" fill="#C9A227" opacity="0.5"/>
  <use href="#luxuryStar8" transform="translate(384,28) scale(3)" fill="#C9A227" opacity="0.5"/>

  <use href="#luxuryStar8" transform="translate(16,184) scale(7)" fill="#E0B83F" opacity="0.9"/>
  <use href="#luxuryStar8" transform="translate(28,184) scale(3)" fill="#C9A227" opacity="0.5"/>
  <use href="#luxuryStar8" transform="translate(16,172) scale(3)" fill="#C9A227" opacity="0.5"/>

  <use href="#luxuryStar8" transform="translate(384,184) scale(7)" fill="#E0B83F" opacity="0.9"/>
  <use href="#luxuryStar8" transform="translate(372,184) scale(3)" fill="#C9A227" opacity="0.5"/>
  <use href="#luxuryStar8" transform="translate(384,172) scale(3)" fill="#C9A227" opacity="0.5"/>
</svg>
`.trim();

// قوس إسلامي مسطّح (مناسب لصندوق عريض-قصير زي بطاقة "أقرب صلاة") —
// viewBox نسبي 200×100 مع preserveAspectRatio="none" حتى يتمطّط لأي
// حجم فعلي. جاهز للاستخدام جوا OverlapWidget متداخل بدون width/height
// صريح (تجربة مستقبلية — شوف الملاحظة أعلاه).
export const PRAYER_ARCH_CARD_SVG = `
<svg viewBox="0 0 200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8,96 L8,45 Q8,15 55,10 Q100,2 145,10 Q192,15 192,45 L192,96 Q192,100 186,100 L14,100 Q8,100 8,96 Z"
    fill="#0B3026" stroke="#C9A227" stroke-width="1.8" stroke-linejoin="round"/>
</svg>
`.trim();

// حاوية خفيفة (خلفية شبه شفافة + حد  ذهبي رفيع) لصف الصلوات الخمس —
// viewBox نسبي 400×90، جاهزة لنفس أسلوب OverlapWidget المتداخل.
export const BOTTOM_PRAYERS_CONTAINER_SVG = `
<svg viewBox="0 0 400 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="398" height="88" rx="12" fill="#0F2E24" fill-opacity="0.5" stroke="#C9A227" stroke-width="1" stroke-opacity="0.55"/>
</svg>
`.trim();