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
// Arabic names for reverse-geocoded places (city / country)
// ==========================================
// Reverse geocoding usually returns English names regardless of the app
// language, and there is no offline way to translate every place. So a
// dictionary covers Palestine, neighbouring countries and common
// destinations; if the city is unknown, only the Arabic country name is shown
// rather than mixing English into Arabic text.
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
  'tel aviv': 'تل أبيب', 'tel aviv-yafo': 'يافا (تل أبيب)', 'tel aviv-jaffa': 'يافا (تل أبيب)',
  'eilat': 'أم الرشراش (إيلات)', 'mitzpe ramon': 'متسبيه رامون',
  'netanya': 'نتانيا', 'herzliya': 'هرتسليا', 'hadera': 'الخضيرة', 'nahariya': 'نهاريا',
  'afula': 'العفولة', 'karmiel': 'كرمئيل', 'yokneam': 'يوكنعام', 'yokneam illit': 'يوكنعام',
  'nof hagalil': 'نوف هجليل', "ma'alot-tarshiha": 'معالوت ترشيحا', 'kiryat shmona': 'كريات شمونة (الخالصة)',
  'petah tikva': 'بيتح تكفا (ملبّس)', 'petah tiqwa': 'بيتح تكفا (ملبّس)', 'rishon lezion': 'ريشون لتسيون',
  'rishon leziyyon': 'ريشون لتسيون', 'holon': 'حولون', 'bat yam': 'بات يام', 'ramat gan': 'رمات غان',
  'bnei brak': 'بني براك', 'rehovot': 'رحوفوت', 'kfar saba': 'كفار سابا', "ra'anana": 'رعنانا', 'raanana': 'رعنانا',
  'modiin': 'موديعين', "modi'in-maccabim-re'ut": 'موديعين', 'beit shemesh': 'بيت شيمش',
  'sderot': 'سديروت', 'ofakim': 'أوفاكيم', 'kiryat gat': 'كريات غات', 'dimona': 'ديمونا', 'arad': 'عراد',
  'kfar kassem': 'كفر قاسم', 'kafr kasim': 'كفر قاسم',
  'amman': 'عمّان', 'irbid': 'إربد', 'zarqa': 'الزرقاء',
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
  "Ma'ale Iron ": 'طلعة عارة', 'maale iron': 'طلعة عارة', "ma'ale iron": 'طلعة عارة',
  'safad': 'صفد', 'safed': 'صفد', 'tsfat': 'صفد',
  'tiberias': 'طبريا', 'tabariyya': 'طبريا', 'tveria': 'طبريا',
  'beisan': 'بيسان', 'baysan': 'بيسان', 'beit shean': 'بيسان', 'bet shean': 'بيسان',
  'al-lydd': 'اللد', 'al-lidd': 'اللد', 'lod': 'اللد', 'lydda': 'اللد',
  'ar-ramla': 'الرملة', 'ramla': 'الرملة', 'ramleh': 'الرملة',
  'beersheba': 'بئر السبع', 'beer sheva': 'بئر السبع', 'beer-sheva': 'بئر السبع', "bi'r as-saba": 'بئر السبع', 'bir al-saba': 'بئر السبع',
  'ashkelon': 'المجدل (عسقلان)', 'asqalan': 'عسقلان', 'al-majdal': 'المجدل', 'majdal asqalan': 'المجدل عسقلان',
  'ashdod': 'أسدود', 'isdud': 'أسدود', 'esdud': 'أسدود',
  'caesarea': 'قيسارية', 'qisarya': 'قيسارية', 'qaysariyya': 'قيسارية',

  // Gaza Strip
  'khan yunis': 'خان يونس', 'khan younis': 'خان يونس',
  'rafah': 'رفح',
  'deir al-balah': 'دير البلح',
  'jabalia': 'جباليا', 'jabalya': 'جباليا',
  'beit lahia': 'بيت لاهيا', 'beit lahiya': 'بيت لاهيا',
  'beit hanoun': 'بيت حانون',
  'bani suheila': 'بني سهيلا',
  'abasan al-kabira': 'عبسان الكبيرة', 'abasan': 'عبسان',
  'khuzaa': 'خزاعة', "khuza'a": 'خزاعة',
  'al-qarara': 'القرارة', 'qarara': 'القرارة',
  'al-zawayda': 'الزوايدة', 'az-zawayda': 'الزوايدة',
  'al-bureij': 'البريج', 'bureij': 'البريج',
  'al-maghazi': 'المغازي', 'maghazi': 'المغازي',
  'al-nuseirat': 'النصيرات', 'nuseirat': 'النصيرات',

  // West Bank cities, towns and villages, and the Jerusalem area
  'al-bireh': 'البيرة', 'el-bireh': 'البيرة',
  'beitunia': 'بيتونيا', 'bitunya': 'بيتونيا',
  'birzeit': 'بيرزيت', 'bir zeit': 'بيرزيت',
  'rawabi': 'روابي',
  'silwad': 'سلواد',
  'sinjil': 'سنجل',
  'turmus ayya': 'ترمسعيا',
  'nilin': 'نعلين', "ni'lin": 'نعلين',
  'bilin': 'بلعين', "bil'in": 'بلعين',
  'beit jala': 'بيت جالا',
  'beit sahour': 'بيت ساحور',
  'al-khader': 'الخضر',
  'tuqu': 'تقوع', "tuqu'": 'تقوع',
  'zaatara': 'زعترة',
  'halhul': 'حلحول',
  'dura': 'دورا',
  'yatta': 'يطا',
  'ad-dhahiriya': 'الظاهرية', 'al-dahiriya': 'الظاهرية',
  'bani naim': 'بني نعيم', "bani na'im": 'بني نعيم',
  'beit ummar': 'بيت أمر',
  'idhna': 'إذنا',
  'tarqumiya': 'ترقوميا',
  'sair': 'سعير', "sa'ir": 'سعير',
  'surif': 'صوريف',
  'huwara': 'حوارة', 'huwwara': 'حوارة',
  'beita': 'بيتا',
  'beit furik': 'بيت فوريك',
  'aqraba': 'عقربا',
  'sebastia': 'سبسطية', 'sabastiya': 'سبسطية',
  'asira ash-shamaliya': 'عصيرة الشمالية',
  'qabalan': 'قبلان',
  'qabatiya': 'قباطية', 'qabatiyeh': 'قباطية',
  'yabad': 'يعبد', "ya'bad": 'يعبد',
  'silat al-harithiya': 'سيلة الحارثية',
  'silat ad-dhahr': 'سيلة الظهر',
  'burqin': 'برقين',
  'al-yamun': 'اليامون', 'el-yamun': 'اليامون',
  'meithalun': 'ميثلون',
  'zababdeh': 'الزبابدة', 'az-zababida': 'الزبابدة',
  'anabta': 'عنبتا',
  'deir al-ghusun': 'دير الغصون',
  'attil': 'عتيل',
  'zeita': 'زيتا',
  'qaffin': 'قفين',
  'bala': 'بلعا', "bal'a": 'بلعا',
  'azzun': 'عزون',
  'habla': 'حبلة', 'hableh': 'حبلة',
  'kafr thulth': 'كفر ثلث',
  'jayyus': 'جيوس',
  'bidya': 'بديا',
  'qarawat bani hassan': 'قراوة بني حسان',
  'kafr ad-dik': 'كفر الديك',
  'deir istiya': 'دير استيا',
  'bruqin': 'بروقين',
  'tammun': 'طمون',
  'aqqaba': 'عقابا',
  'tayasir': 'تياسير',
  'bardala': 'بردلة',
  'al-auja': 'العوجا',
  'al-jiftlik': 'الجفتلك', 'jiftlik': 'الجفتلك',
  'abu dis': 'أبو ديس',
  'al-eizariya': 'العيزرية', 'al-azariya': 'العيزرية',
  'al-ram': 'الرام', 'ar-ram': 'الرام',
  'beit hanina': 'بيت حنينا',
  'shuafat': 'شعفاط', "shu'fat": 'شعفاط',
  'silwan': 'سلوان',
  'al-issawiya': 'العيساوية',
  'jabal al-mukabbir': 'جبل المكبر',
  'sur baher': 'صور باهر',
  'anata': 'عناتا',
  'hizma': 'حزما',
  'qalandia': 'قلنديا',
  'kafr aqab': 'كفر عقب', "kafr 'aqab": 'كفر عقب',
  'biddu': 'بدو',
  'qatanna': 'قطنة',

  // Towns in the Triangle and Wadi Ara
  'jaljulia': 'جلجولية', 'jaljulya': 'جلجولية',
  'kafr bara': 'كفر برا',
  'zemer': 'زيمر',
  'musmus': 'مُصمُص',
  'musheirifa': 'مشيرفة',
  'zalafa': 'زلفة',
  'salim': 'سالم',
  'al-bayada': 'البياضة', 'bayada': 'البياضة',
  'muawiya': 'معاوية', "mu'awiya": 'معاوية',
  'bartaa': 'برطعة', "barta'a": 'برطعة',
  'meiser': 'ميسر',
  'ein al-sahla': 'عين السهلة',
  'khor saqr': 'خور صقر',

  // Galilee, coast and Carmel
  'fureidis': 'الفريديس', 'al-fureidis': 'الفريديس',
  'kafr yasif': 'كفر ياسيف',
  'abu snan': 'أبو سنان',
  'jadeidi-makr': 'الجديدة المكر', 'jadeida': 'الجديدة', 'al-makr': 'المكر',
  'kabul': 'كابول',
  'ibillin': 'إعبلين', "i'billin": 'إعبلين',
  'bir al-maksur': 'بئر المكسور',
  'zarzir': 'بيت زرزير', 'beit zarzir': 'بيت زرزير',
  'reineh': 'الرينة', 'ar-reineh': 'الرينة',
  'mashhad': 'المشهد', 'al-mashhad': 'المشهد',
  'yafa an-naseriyye': 'يافة الناصرة', 'yafa an-nasira': 'يافة الناصرة',
  'iksal': 'إكسال',
  'dabburiya': 'دبورية', 'dabburiyya': 'دبورية',
  'ein mahil': 'عين ماهل',
  'turan': 'طرعان', "tur'an": 'طرعان',
  'bueina nujeidat': 'بعينة نجيدات', "bu'eina nujeidat": 'بعينة نجيدات',
  'shibli': 'الشبلي - أم الغنم', 'ash-shibli': 'الشبلي',
  'deir hanna': 'دير حنا',
  'eilabun': 'عيلبون',
  'biina': 'البعنة', "bi'ina": 'البعنة',
  'nahf': 'نحف',
  'rameh': 'الرامة', 'al-rameh': 'الرامة',
  'beit jann': 'بيت جن',
  'hurfeish': 'حرفيش',
  'fassuta': 'فسوطة',
  'meeliya': 'معليا', "mi'ilya": 'معليا',
  'tarshiha': 'ترشيحا',
  'jish': 'الجش', 'al-jish': 'الجش',
  'yanuh-jat': 'يانوح جث', 'yanuh': 'يانوح',
  'kisra-sumei': 'كسرى كفر سميع', 'kisra': 'كسرى',
  'julis': 'جولس',
  'yirka': 'يركا',
  'abu ghosh': 'أبو غوش',
  'ein rafa': 'عين رافة',
  'ein naqquba': 'عين نقوبا',

  // Naqab (Negev)
  'tel as-sabi': 'تل السبع', 'tel sheva': 'تل السبع',
  'shaqib al-salam': 'شقيب السلام', 'segev shalom': 'شقيب السلام',
  'ararat an-naqab': 'عرعرة النقب', "ar'arat an-naqab": 'عرعرة النقب',
  'kuseife': 'كسيفة', 'kseife': 'كسيفة',
  'hura': 'حورة',
  'lakiya': 'اللقية',
  'drijat': 'الدريجات',
  'umm batin': 'أم بطين',

  // Main depopulated and historical Palestinian villages
  'saffuriya': 'صفورية',
  'hittin': 'حطين',
  'lubya': 'لوبيا',
  'malul': 'معلول', "ma'lul": 'معلول',
  'al-mujaydil': 'المجيدل',
  'tantura': 'الطنطورة',
  'ayn hawd': 'عين حوض', 'ein hod': 'عين حوض',
  'ijzim': 'إجزم',
  'tirat carmel': 'طيرة الكرمل', 'tirat al-karmel': 'طيرة الكرمل',
  'balad al-sheikh': 'بلد الشيخ',
  'al-ghabisiyya': 'الغبسية',
  'kuwaykat': 'كويكات',
  'miar': 'ميعار', "mi'ar": 'ميعار',
  'al-birwa': 'البروة', 'al-birweh': 'البروة',
  'iqrit': 'إقرث',
  'kafr birim': 'كفر برعم', "kafr bir'im": 'كفر برعم',
  'lifta': 'لفتا',
  'deir yassin': 'دير ياسين',
  'ein karem': 'عين كارم', 'ein kerem': 'عين كارم',
  'al-qastal': 'القسطل',
  'suba': 'صوبا',
  'bayt nattif': 'بيت نتيف',
  'zakariyya': 'زكريا',
  'iraq al-manshiyya': 'عراق المنشية',
  'al-faluja': 'الفالوجة', 'faluja': 'الفالوجة',
  'al-dawayima': 'الدوايمة',
  'bayt daras': 'بيت دراس',
  'hamama': 'حمامة',
  'barbara': 'بربرة',
  'hirbiya': 'هربيا',
  'simsim': 'سمسم',
  'burayr': 'برير',
  'huj': 'هوج',
};

const getArabicLocationLabel = (reverseResult: any): string => {
  if (!reverseResult) return 'موقعك الحالي';

  // On Android, reverse geocoding sometimes returns an empty "city" even for
  // a known location (iOS usually fills it), so subregion, district and name
  // are tried before falling back to the country alone.
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

  // A city name that is not in the dictionary (a less common place): show it
  // as is (usually English) with the country, so users still see their real city.
  if (rawCity && arabicCountry) return `${rawCity} / ${arabicCountry}`;
  if (rawCity) return rawCity;
  if (arabicCountry) return arabicCountry;

  // Neither city nor country: a generic phrase instead of mixed foreign text
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
