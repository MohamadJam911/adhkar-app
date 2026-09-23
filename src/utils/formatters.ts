import umalqura from '@umalqura/core';

const formatArabicNumbers = (text: string | number) => {
  if (text === null || text === undefined) return '';
  const str = String(text);
  const hindiToWestern: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return str.replace(/[٠-٩]/g, (match) => hindiToWestern[match] || match);
};

const toEasternArabicNumerals = (text: string | number) => {
  if (!text) return '';
  const westernToHindi: { [key: string]: string } = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };
  return String(text).replace(/[0-9]/g, (match) => westernToHindi[match] || match);
};

// ==========================================
// 🌍 ترجمة اسم الموقع الجغرافي (المدينة/الدولة) إلى العربية
// ==========================================
// ملاحظة هامة: خدمة تحديد الموقع العكسي (reverse geocoding) في الجهاز تُعيد
// الأسماء غالباً بالإنجليزية بغض النظر عن لغة التطبيق، ولا توجد وسيلة أوفلاين
// لضمان ترجمة كل مكان في العالم. لذلك نعتمد قاموساً يغطي فلسطين والدول
// المجاورة والوجهات الأكثر شيوعاً بين المستخدمين، ونعرض اسم الدولة العربي
// فقط إن لم نجد اسم المدينة (بدل عرض نص إنجليزي مختلط مع العربي). يمكن
// توسيع هذين القاموسين بسهولة لاحقاً حسب ملاحظات المستخدمين الفعليين.
const ARABIC_COUNTRY_NAMES: { [isoCode: string]: string } = {
  PS: 'فلسطين', IL: 'فلسطين', JO: 'الأردن', EG: 'مصر', SA: 'السعودية',
  AE: 'الإمارات', QA: 'قطر', KW: 'الكويت', BH: 'البحرين', OM: 'عُمان',
  YE: 'اليمن', LB: 'لبنان', SY: 'سوريا', IQ: 'العراق', SD: 'السودان',
  LY: 'ليبيا', TN: 'تونس', DZ: 'الجزائر', MA: 'المغرب', MR: 'موريتانيا',
  SO: 'الصومال', DJ: 'جيبوتي', KM: 'جزر القمر', TR: 'تركيا', IR: 'إيران',
  PK: 'باكستان', AF: 'أفغانستان', IN: 'الهند', BD: 'بنغلاديش',
  MY: 'ماليزيا', ID: 'إندونيسيا', SG: 'سنغافورة', US: 'الولايات المتحدة',
  GB: 'المملكة المتحدة', FR: 'فرنسا', DE: 'ألمانيا', CA: 'كندا',
  AU: 'أستراليا', NL: 'هولندا', SE: 'السويد', ES: 'إسبانيا', IT: 'إيطاليا',
};

const ARABIC_CITY_NAMES: { [englishName: string]: string } = {
  'jerusalem': 'القدس', 'al quds': 'القدس', 'ramallah': 'رام الله',
  'nablus': 'نابلس', 'hebron': 'الخليل', 'bethlehem': 'بيت لحم',
  'gaza': 'غزة', 'gaza city': 'غزة', 'jenin': 'جنين', 'tulkarm': 'طولكرم',
  'qalqilya': 'قلقيلية', 'qalqiliya': 'قلقيلية', 'salfit': 'سلفيت',
  'tubas': 'طوباس', 'jericho': 'أريحا', 'nazareth': 'الناصرة',
  'haifa': 'حيفا', 'jaffa': 'يافا', 'acre': 'عكا', 'akko': 'عكا',
  'tel aviv': 'تل أبيب', 'amman': 'عمّان', 'irbid': 'إربد', 'zarqa': 'الزرقاء',
  'cairo': 'القاهرة', 'alexandria': 'الإسكندرية', 'damascus': 'دمشق',
  'aleppo': 'حلب', 'beirut': 'بيروت', 'baghdad': 'بغداد', 'riyadh': 'الرياض',
  'jeddah': 'جدة', 'mecca': 'مكة المكرمة', 'makkah': 'مكة المكرمة',
  'medina': 'المدينة المنورة', 'madinah': 'المدينة المنورة', 'dammam': 'الدمام',
  'dubai': 'دبي', 'abu dhabi': 'أبوظبي', 'sharjah': 'الشارقة',
  'doha': 'الدوحة', 'kuwait city': 'مدينة الكويت', 'manama': 'المنامة',
  'muscat': 'مسقط', 'sanaa': 'صنعاء', 'khartoum': 'الخرطوم',
  'rabat': 'الرباط', 'casablanca': 'الدار البيضاء', 'algiers': 'الجزائر العاصمة',
  'tunis': 'تونس العاصمة', 'tripoli': 'طرابلس', 'istanbul': 'إسطنبول',
  'ankara': 'أنقرة', 'izmir': 'إزمير', 'london': 'لندن', 'paris': 'باريس',
  'new york': 'نيويورك', 'toronto': 'تورونتو', 'sydney': 'سيدني',
  // بلدات عربية داخل الخط الأخضر (المثلث ووادي عارة والجليل)
  'arara': 'عرعرة', "ar'ara": 'عرعرة', 'umm al-fahm': 'أم الفحم', 'umm el-fahm': 'أم الفحم',
  'baqa al-gharbiyye': 'باقة الغربية', 'baqa al-gharbiyya': 'باقة الغربية',
  'kafr qara': 'كفر قرع', "kafr qare'": 'كفر قرع', 'jatt': 'جت',
  'kafr qasim': 'كفر قاسم', 'kafr qassem': 'كفر قاسم', 'taybeh': 'الطيبة', 'tayibe': 'الطيبة',
  'tira': 'الطيرة', 'at-tira': 'الطيرة', 'qalansawe': 'قلنسوة', 'qalansuwa': 'قلنسوة',
  'sakhnin': 'سخنين', 'shefa-amr': 'شفاعمرو', "shfar'am": 'شفاعمرو',
  'rahat': 'رهط', 'tamra': 'طمرة', 'kafr kanna': 'كفركنا', 'baqa': 'باقة الغربية',
  'daliyat al-karmel': 'دالية الكرمل', 'isfiya': 'عسفيا', 'maghar': 'المغار',
  'kafr manda': 'كفر مندا', 'sajur': 'ساجور', 'arraba': 'عرابة',
  'deir al-asad': 'دير الأسد', 'majd al-krum': 'مجد الكروم', 'jisr az-zarqa': 'جسر الزرقاء',
};

const getArabicLocationLabel = (reverseResult: any): string => {
  if (!reverseResult) return 'موقعك الحالي';

  // على أندرويد، خدمة تحديد الموقع العكسي بترجع أحياناً حقل "city" فاضي حتى
  // لو الموقع معروف (عكس آيفون يلي بيرجعه أغلب الأحيان) — لهيك منجرب كمان
  // "subregion" و"district" و"name" كبدائل قبل ما نستسلم ونعرض اسم الدولة بس.
  const rawCity = (
    reverseResult.city ||
    reverseResult.subregion ||
    reverseResult.district ||
    reverseResult.name ||
    ''
  ).trim();
  const isoCode = (reverseResult.isoCountryCode || '').toUpperCase();

  const arabicCountry = ARABIC_COUNTRY_NAMES[isoCode] || null;
  const arabicCity = rawCity ? ARABIC_CITY_NAMES[rawCity.toLowerCase()] || null : null;

  if (arabicCity && arabicCountry) return `${arabicCity} / ${arabicCountry}`;
  if (arabicCity) return arabicCity;

  // لقينا اسم مدينة بس مش موجود بقاموس الترجمة عنّا (مكان أقل شيوعاً) — أفضل
  // نعرضه زي ما هو (بالإنجليزي غالباً) مع اسم الدولة، من إننا نتجاهله كلياً
  // ونعرض اسم الدولة بس، لأنه هيك المستخدم بيضل عارف مدينته الفعلية.
  if (rawCity && arabicCountry) return `${rawCity} / ${arabicCountry}`;
  if (rawCity) return rawCity;
  if (arabicCountry) return arabicCountry;

  // لم نجد ولا اسم مدينة ولا اسم دولة: نعرض عبارة عامة بدل نص أجنبي مختلط
  return 'موقعك الحالي';
};

const HIJRI_MONTH_NAMES = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

const getSafeHijriDate = (date = new Date()) => {
  try {
    const u = umalqura(date);
    const day = u.hd;
    const monthName = HIJRI_MONTH_NAMES[u.hm - 1];
    const year = u.hy;
    return formatArabicNumbers(`${day} ${monthName} ${year} هـ`);
  } catch (e) {
    return '';
  }
};


export {
  formatArabicNumbers,
  toEasternArabicNumerals,
  getArabicLocationLabel,
  getSafeHijriDate,
};
