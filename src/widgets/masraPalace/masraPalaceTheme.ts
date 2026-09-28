// ==========================================
// 🎨 هوية ويدجت "مسرى المسلم — القصر الزمردي" (MasraPalaceWidget)
// ==========================================
// نفس هوية ألوان التطبيق كله: الأخضر الداكن ‎#12241F (أيقونة التطبيق، شاشة
// البداية، الويدجتس القديمة) مع ‎#1B342C للبطاقات، والذهبي ‎#D4A373 (اللون
// الذهبي الأساسي بكل شاشات التطبيق) مع درجاته الموجودة أصلاً بالمشروع
// (‎#E5B279 أفتح، ‎#A47A45 / ‎#8A5E33 أغمق). الذهبي القديم (‎#D4AF37) كان
// بارد ومايل للأصفر مقارنة بباقي التطبيق.
// "as const" لازمة حتى تايبسكريبت يقبلها كـColorProp (شوف widgetTheme.ts).

// الذهبيات بمكان واحد — كل الـSVG تحت بياخد منها بدل ما نكرر أكواد hex
const GOLD = {
  highlight: '#F4E0C2', // لمعة (أفتح نقطة بالشعار وحافة البطاقة)
  light: '#E5B279', // نصوص ذهبية فاتحة (أرقام العدّاد)
  pure: '#D4A373', // ذهبي التطبيق الأساسي
  metallic: '#A47A45', // حدود وإطارات
  deep: '#8A5E33', // ظلال وتدرّجات
  dark: '#4A321B',
} as const;

// أخضر التطبيق
const GREEN = {
  base: '#12241F',
  card: '#1B342C',
  deep: '#0B1714', // أطراف الخلفية وقلب بطاقة الصلاة القادمة
  silhouette: '#07100E', // ظل المسجد
} as const;

export const PALACE_COLORS = {
  emerald950: GREEN.deep,
  base: GREEN.base,
  card: GREEN.card,

  goldLight: GOLD.light,
  goldBright: GOLD.pure,
  goldMetallic: GOLD.metallic,
  goldDeep: GOLD.deep,
  goldDark: GOLD.dark,

  ivory50: '#FFFFFF',
  ivory100: '#F4EADF', // نفس لون النص الأساسي بالتطبيق
  ivory200: '#E8DCCB',
  ivory300: '#C9B8A3',

  goldDivider: 'rgba(212, 163, 115, 0.5)',
  activeCellBg: 'rgba(212, 163, 115, 0.16)',
  activeCellBorder: 'rgba(212, 163, 115, 0.85)',
  inactiveCellBorder: 'rgba(0, 0, 0, 0)',
  timeBoxBg: 'rgba(0, 0, 0, 0.35)',
  timeBoxBorder: 'rgba(212, 163, 115, 0.45)',
  emblemRingBg: 'rgba(212, 163, 115, 0.12)',
} as const;

// زخرفة الزاوية من ملف الـHTML (viewBox 0-40) — مرسومة مرة وحدة ومنعكسة
// رياضياً (scale سالب) لكل زاوية بدل ما نكتب أربع نسخ يدوياً.
function cornerOrnament(transform: string): string {
  return `<g transform="${transform}">
    <path d="M0,0 L20,0 C20,10 10,20 0,20 Z" fill="${GOLD.metallic}" opacity="0.3"/>
    <path d="M2,2 L35,2 C30,12 20,18 2,18 Z" fill="none" stroke="${GOLD.metallic}" stroke-width="1.5" opacity="0.9"/>
    <circle cx="9" cy="9" r="2.5" fill="${GOLD.pure}"/>
  </g>`;
}

// نجمة ربع الحزب (Rub el Hizb) من ملف الـHTML — viewBox 0-24.
const RUB_EL_HIZB_PATH =
  'M12 2L14.8 6.6L20 6.6L17.2 11.2L20 15.8L14.8 15.8L12 20.4L9.2 15.8L4 15.8L6.8 11.2L4 6.6L9.2 6.6Z';

// نجمة صغيرة "بتكسر" خط الإطار بالنص (نفس تقنية bg-emerald-950 px-1.5
// بالـCSS): مستطيل بلون الخلفية فوق الخط، والنجمة فوقه.
function frameStar(cx: number, cy: number, cutColor: string): string {
  return `<rect x="${cx - 10}" y="${cy - 3}" width="20" height="6" fill="${cutColor}"/>
  <g transform="translate(${cx - 6.6},${cy - 6.2}) scale(0.55)">
    <path d="${RUB_EL_HIZB_PATH}" fill="${GOLD.pure}"/>
    <circle cx="12" cy="11.2" r="1.5" fill="${GREEN.base}"/>
  </g>`;
}

const round = (n: number) => Math.round(n * 10) / 10;

// ==========================================
// 🕌 الخلفية الكاملة — طبقة SVG وحدة بتجمع طبقات الـHTML الثلاث:
//  ١) تدرّج زمردي شعاعي من الأعلى (radial-gradient ellipse_at_top)
//  ٢) نقش أرابيسك هندسي خافت (نفس بلاطة الـ120px من الـHTML، مصغّرة)
//  ٣) ظل قبة ومئذنتين بأسفل النص (نفس مسارات الـHTML)
// + الإطار الذهبي المزدوج، زخارف الزوايا الأربع، ونجمتي أعلى/أسفل الإطار.
//
// ⚠️ ليش دالة بالأبعاد مش ثابت؟ المكتبة بترسم الـSVG عبر AndroidSVG
// (svg.renderToPicture()) — وإذا الـ<svg> ما فيه width/height، AndroidSVG
// بيفترض مربّع 512×512 وبيتجاهل preserveAspectRatio، فالخلفية كانت
// تطلع مربّع صغير بنص الويدجت. هون منرسمها بأبعاد الويدجت الفعلية (dp)
// حتى تغطي كل الويدجت بالضبط، وكمان كل الزخارف (الزوايا، النجوم، القبة)
// بتضل بنسبها الصحيحة بدل ما تنمطّ مع حجم الويدجت.
// ==========================================
export function palaceBackgroundSvg(width: number, height: number): string {
  const W = Math.max(120, Math.round(width));
  const H = Math.max(80, Math.round(height));
  const cut = GREEN.card;

  // ظل القبة: مسارات الـHTML الأصلية بمقياس موحّد، بأسفل النص — كبير
  // وواضح. الرسمة الفعلية بتحتل بس x من 115 لـ385 (≈290 وحدة مع هامش) من
  // صندوق الـ500، فمنكبّر على أساس هالعرض (لحد ٨٠٪ من الويدجت) مش الصندوق
  // كله، ومنوسّطها على x=250. غامق مع خط ذهبي خفيف حتى يبان.
  const mosqueScale = Math.min((W * 0.8) / 290, (H * 0.62) / 150);
  const mosqueX = round(W / 2 - 250 * mosqueScale);
  const mosqueY = round(H - 150 * mosqueScale);
  const mosqueStroke = round(1.2 / mosqueScale);

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="palaceEmeraldGlow" cx="${W / 2}" cy="0" r="${round(Math.max(W, H) * 1.05)}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${GREEN.card}"/>
      <stop offset="0.55" stop-color="${GREEN.base}"/>
      <stop offset="1" stop-color="${GREEN.deep}"/>
    </radialGradient>
    <pattern id="palaceArabesque" width="45" height="45" patternUnits="userSpaceOnUse">
      <g transform="scale(0.375)" fill="none" stroke="${GOLD.pure}" stroke-width="2.4">
        <polygon points="60,10 75,35 105,35 85,55 95,85 60,70 25,85 35,55 15,35 45,35"/>
        <polygon points="60,110 75,85 105,85 85,65 95,35 60,50 25,35 35,65 15,85 45,85"/>
        <circle cx="60" cy="60" r="28"/>
        <circle cx="60" cy="60" r="52"/>
      </g>
    </pattern>
  </defs>

  <rect x="0" y="0" width="${W}" height="${H}" rx="22" fill="url(#palaceEmeraldGlow)"/>
  <rect x="0" y="0" width="${W}" height="${H}" rx="22" fill="url(#palaceArabesque)" opacity="0.16"/>

  <g transform="translate(${mosqueX},${mosqueY}) scale(${round(mosqueScale * 1000) / 1000})" fill="${GREEN.silhouette}" fill-opacity="0.9" stroke="${GOLD.pure}" stroke-opacity="0.3" stroke-width="${mosqueStroke}">
    <path d="M 200 150 C 200 70, 300 70, 300 150 Z"/>
    <path d="M 140 150 C 140 100, 205 100, 205 150 Z"/>
    <path d="M 295 150 C 295 100, 360 100, 360 150 Z"/>
    <path d="M 115 150 L 115 45 L 122 35 L 129 45 L 129 150 Z"/>
    <path d="M 371 150 L 371 45 L 378 35 L 385 45 L 385 150 Z"/>
  </g>

  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="18" fill="none" stroke="${GOLD.pure}" stroke-width="1.4" opacity="0.85"/>
  <rect x="7.5" y="7.5" width="${W - 15}" height="${H - 15}" rx="15" fill="none" stroke="${GOLD.pure}" stroke-width="0.7" opacity="0.4"/>

  ${cornerOrnament('translate(4,4) scale(0.6)')}
  ${cornerOrnament(`translate(${W - 4},4) scale(-0.6,0.6)`)}
  ${cornerOrnament(`translate(4,${H - 4}) scale(0.6,-0.6)`)}
  ${cornerOrnament(`translate(${W - 4},${H - 4}) scale(-0.6,-0.6)`)}

  ${frameStar(W / 2, 4, cut)}
  ${frameStar(W / 2, H - 4, cut)}
</svg>
`.trim();
}

// ==========================================
// 🔤 خطوط الويدجت — ملفات TTF بـassets/fonts/widget، مضمّنة بالـAPK عبر
// إعدادات expo-font بـapp.json. مكتبة الويدجت بتدوّر بـassets/fonts/ على
// ملف اسمه بيبدأ بـfontFamily، فالاسم هون = اسم الملف بدون الامتداد.
// (إذا الخط مش موجود — مثلاً تحديث JS على نسخة قديمة — بترجع لخط النظام.)
// ==========================================
export const PALACE_FONTS = {
  calligraphy: 'WidgetAmiriBold', // "مسرى المسلم" واسم الصلاة القادمة
  label: 'WidgetCairoBold', // أسماء الصلوات، الشارة، المدينة
  body: 'WidgetCairoSemiBold', // الأوقات والتاريخ
  timer: 'WidgetCinzelBold', // أرقام العدّاد
} as const;

// أيقونات الصلوات الخطّية — مسارات ملف الـHTML المرجعي حرفياً (بما فيها
// هلال العشاء المفرّغ)، بلون ديناميكي لأنه SvgWidget بده لون صريح.
export type PalacePrayerIconKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export function palacePrayerIconSvg(key: PalacePrayerIconKey, color: string): string {
  const open = `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">`;
  switch (key) {
    case 'Fajr':
      return `${open}<path d="M4 22H24"/><path d="M7 18C7 14.134 10.134 11 14 11C17.866 11 21 14.134 21 18"/><line x1="14" y1="4" x2="14" y2="7"/><line x1="6.5" y1="7.5" x2="8.8" y2="9.8"/><line x1="21.5" y1="7.5" x2="19.2" y2="9.8"/></svg>`;
    case 'Dhuhr':
      return `${open}<circle cx="14" cy="14" r="5"/><line x1="14" y1="3" x2="14" y2="6"/><line x1="14" y1="22" x2="14" y2="25"/><line x1="3" y1="14" x2="6" y2="14"/><line x1="22" y1="14" x2="25" y2="14"/><line x1="6.2" y1="6.2" x2="8.3" y2="8.3"/><line x1="19.7" y1="19.7" x2="21.8" y2="21.8"/><line x1="6.2" y1="21.8" x2="8.3" y2="19.7"/><line x1="19.7" y1="8.3" x2="21.8" y2="6.2"/></svg>`;
    case 'Asr':
      return `${open}<circle cx="14" cy="14" r="4.5"/><path d="M4 23H24"/><line x1="14" y1="3" x2="14" y2="5.5"/><line x1="5.5" y1="10" x2="7.5" y2="11.5"/><line x1="22.5" y1="10" x2="20.5" y2="11.5"/></svg>`;
    case 'Maghrib':
      return `${open}<path d="M4 20H24"/><path d="M7 19C7 15.134 10.134 12 14 12C17.866 12 21 15.134 21 19"/><line x1="14" y1="19" x2="14" y2="7"/><path d="M11.5 9.5L14 7L16.5 9.5"/></svg>`;
    case 'Isha':
      return `${open}<path d="M19 14.5C18.8 19.5 14.5 23 9.5 22.5C7.2 22.2 5 21 3.5 19.3C5.5 19.8 8.5 19.2 10.5 17.5C13 15.3 13.5 11.5 12 8.5C11.5 7.5 10.5 6.7 9.5 6.2C14.5 5.5 19 9.5 19 14.5Z" fill="${color}" fill-opacity="0.1"/><circle cx="21" cy="7" r="1.5" fill="${color}" stroke="none"/></svg>`;
    default:
      return '';
  }
}

// بطاقة "أقرب صلاة" كقوس SVG: زوايا علوية كبيرة وسفلية أصغر، تدرّج أخضر
// وحدّ ذهبي. مرسومة SVG لأنه مكتبة الويدجت ما بترسم الحدّ (border) لما
// تختلف أنصاف أقطار الزوايا عن بعض. الأبعاد نفس أبعاد البطاقة بالضبط
// (width/height) حتى AndroidSVG يرسمها بنسبتها الصحيحة بدون تمطيط.
// مستطيل بزوايا علوية/سفلية مختلفة، مُزاح للداخل بمقدار inset
function archPath(w: number, h: number, rt: number, rb: number, inset: number): string {
  const i = inset;
  const t = Math.max(rt - i, 1);
  const b = Math.max(rb - i, 1);
  return [
    `M${i},${h - i - b}`,
    `L${i},${i + t}`,
    `Q${i},${i} ${i + t},${i}`,
    `L${w - i - t},${i}`,
    `Q${w - i},${i} ${w - i},${i + t}`,
    `L${w - i},${h - i - b}`,
    `Q${w - i},${h - i} ${w - i - b},${h - i}`,
    `L${i + b},${h - i}`,
    `Q${i},${h - i} ${i},${h - i - b}`,
    'Z',
  ].join(' ');
}

export function archCardSvg(width: number, height: number, topRadius: number, bottomRadius: number): string {
  const w = round(width);
  const h = round(height);
  const rt = round(topRadius);
  const rb = round(bottomRadius);
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="palaceArchFill" x1="0" y1="0" x2="0" y2="${h}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${GREEN.base}"/>
        <stop offset="1" stop-color="${GREEN.deep}"/>
      </linearGradient>
      <linearGradient id="palaceArchShine" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${GOLD.highlight}"/>
        <stop offset="0.3" stop-color="${GOLD.pure}"/>
        <stop offset="0.55" stop-color="${GOLD.deep}"/>
        <stop offset="0.8" stop-color="${GOLD.pure}"/>
        <stop offset="1" stop-color="${GOLD.highlight}"/>
      </linearGradient>
      <linearGradient id="palaceArchSheen" x1="0" y1="0" x2="0" y2="${round(h * 0.45)}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${GOLD.highlight}" stop-opacity="0.14"/>
        <stop offset="1" stop-color="${GOLD.highlight}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${archPath(w, h, rt, rb, 1.1)}" fill="url(#palaceArchFill)" stroke="url(#palaceArchShine)" stroke-width="2.2"/>
    <path d="${archPath(w, h, rt, rb, 1.1)}" fill="url(#palaceArchSheen)"/>
    <path d="${archPath(w, h, rt, rb, 4.2)}" fill="none" stroke="${GOLD.pure}" stroke-width="0.7" opacity="0.5"/>
  </svg>`;
}

// نجمة الفاصل الذهبي تحت اسم التطبيق (خماسية الرؤوس بالـHTML الأصلي).
export function dividerStarSvg(color: string): string {
  return `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,2 L14,9 L21,9 L15,14 L18,21 L12,17 L6,21 L9,14 L3,9 L10,9 Z" fill="${color}" opacity="0.9"/></svg>`;
}

// شعار قبة الصخرة — نفس رسمة domeOfRockEmblemSvg بـwidgetTheme.ts حرفياً،
// بس بدرجات الذهب الخالص (نسخة خاصة بهاد الويدجت حتى ما نعدّل على الملف
// المشترك مع الويدجتس القديمة).
export function pureGoldDomeEmblemSvg(): string {
  return `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="palacePureGoldDome" x1="22" y1="14" x2="42" y2="28" gradientUnits="userSpaceOnUse">
        <stop stop-color="${GOLD.highlight}"/>
        <stop offset="0.45" stop-color="${GOLD.pure}"/>
        <stop offset="0.9" stop-color="${GOLD.deep}"/>
      </linearGradient>
    </defs>
    <path d="M32 4 C32.8 4 33.5 4.5 33.5 5.2 C33 6.2 33 7.8 34.5 8.5 C32 8.5 31 7 31 5.2 C31 4.5 31.4 4 32 4 Z" fill="${GOLD.highlight}"/>
    <path d="M32 8 L32 14" stroke="${GOLD.highlight}" stroke-width="1.5"/>
    <path d="M22 28 C22 17 26 14 32 14 C38 14 42 17 42 28 Z" fill="url(#palacePureGoldDome)"/>
    <rect x="20" y="28" width="24" height="6" rx="1" fill="${GOLD.metallic}"/>
    <line x1="24" y1="28" x2="24" y2="34" stroke="${GOLD.dark}" stroke-width="0.8"/>
    <line x1="28" y1="28" x2="28" y2="34" stroke="${GOLD.dark}" stroke-width="0.8"/>
    <line x1="32" y1="28" x2="32" y2="34" stroke="${GOLD.dark}" stroke-width="0.8"/>
    <line x1="36" y1="28" x2="36" y2="34" stroke="${GOLD.dark}" stroke-width="0.8"/>
    <line x1="40" y1="28" x2="40" y2="34" stroke="${GOLD.dark}" stroke-width="0.8"/>
    <path d="M12 34 L52 34 L50 49 L14 49 Z" fill="#0B3026" stroke="${GOLD.pure}" stroke-width="1.2"/>
    <path d="M17 49 L17 40 C17 38 19 38 19 40 L19 49" fill="none" stroke="${GOLD.pure}" stroke-width="1"/>
    <path d="M23 49 L23 40 C23 38 25 38 25 40 L25 49" fill="none" stroke="${GOLD.pure}" stroke-width="1"/>
    <path d="M29 49 L29 39 C29 37 31 37 31 39 L31 49" fill="none" stroke="${GOLD.light}" stroke-width="1.2"/>
    <path d="M35 49 L35 39 C35 37 37 37 37 39 L37 49" fill="none" stroke="${GOLD.light}" stroke-width="1.2"/>
    <path d="M41 49 L41 40 C41 38 43 38 43 40 L43 49" fill="none" stroke="${GOLD.pure}" stroke-width="1"/>
    <path d="M47 49 L47 40 C47 38 49 38 49 40 L49 49" fill="none" stroke="${GOLD.pure}" stroke-width="1"/>
    <rect x="10" y="49" width="44" height="3" rx="0.5" fill="${GOLD.metallic}"/>
  </svg>`.trim();
}
