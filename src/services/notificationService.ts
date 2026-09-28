import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { DahriWidgetTimesProvider } from '../widgets/masraPalace/DahriWidgetTimesProvider';

// ==========================================
// 🔔 إعدادات الإشعارات
// ==========================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ==========================================
// 📚 رسائل أذكار الصباح
// ==========================================

const MORNING_MESSAGES = [
  {
    t: '🌅 أذكار الصباح',
    b: 'ابدأ يومك بذكر الله، واجعل أول ساعات يومك عامرة بالطاعة 🤍',
  },
  {
    t: 'صباح الخير والذكر 🌿',
    b: 'دقائق قليلة مع أذكار الصباح، وبداية أجمل ليومك بإذن الله.',
  },
  {
    t: '☀️ لا تنسَ أذكار الصباح',
    b: 'حصّن يومك بذكر الله، وابدأ صباحك بقلب مطمئن.',
  },
  {
    t: 'أصبحنا وأصبح الملك لله 🤍',
    b: 'اجعل ذكر الله أول ما يرافقك في يومك.',
  },
  {
    t: 'صباحك ذكر 🌅',
    b: 'افتح تطبيقك وخذ دقائقك مع أذكار الصباح.',
  },
  {
    t: 'لحظة مع الله 🤍',
    b: 'قبل أن تنشغل بيومك، لا تنسَ وردك من أذكار الصباح.',
  },
  {
    t: '🌿 وردك الصباحي',
    b: 'لا تجعل يومك يبدأ دون ذكر الله.',
  },
  {
    t: 'صباح مطمئن ☀️',
    b: 'ابدأ صباحك بالذكر، فبذكر الله تطمئن القلوب.',
  },
];

// ==========================================
// 🌙 رسائل أذكار المساء
// ==========================================

const EVENING_MESSAGES = [
  {
    t: '🌙 أذكار المساء',
    b: 'حان وقت أذكار المساء. اختم نهارك بذكر الله 🤍',
  },
  {
    t: 'مساؤك ذكر 🌿',
    b: 'قبل أن ينتهي يومك، خذ دقائقك مع أذكار المساء.',
  },
  {
    t: '🌙 لا تنسَ أذكار المساء',
    b: 'اجعل المساء فرصة للسكينة والذكر.',
  },
  {
    t: 'أمسينا وأمسى الملك لله 🤍',
    b: 'اختم يومك بذكر الله واستودعه ما تحب.',
  },
  {
    t: 'وقت الهدوء 🌙',
    b: 'اترك ضجيج اليوم لدقائق، واجعلها مع أذكار المساء.',
  },
  {
    t: 'مساء الخير والطمأنينة 🌿',
    b: 'وردك من أذكار المساء بانتظارك.',
  },
  {
    t: 'قبل أن ينتهي اليوم 🤍',
    b: 'لا تنسَ أن يكون لك نصيب من ذكر الله هذا المساء.',
  },
];

// ==========================================
// 🕌 رسائل وقت الصلاة
// ==========================================

const PRAYER_MESSAGES = [
  {
    t: '🕌 حان وقت صلاة [الصلاة]',
    b: 'أقم صلاتك، وجعلها الله قرة عين لك.',
  },
  {
    t: 'الله أكبر 🤍',
    b: 'حان وقت صلاة [الصلاة].',
  },
  {
    t: 'موعد الصلاة 🕌',
    b: 'حان الآن وقت صلاة [الصلاة].',
  },
  {
    t: '🌿 وقت الصلاة',
    b: 'اترك ما يشغلك قليلًا، وحان وقت صلاة [الصلاة].',
  },
  {
    t: '🤍 الصلاة أولًا',
    b: 'حان وقت صلاة [الصلاة]. نسأل الله القبول.',
  },
  {
    t: 'نداء الطمأنينة 🕌',
    b: 'حان وقت صلاة [الصلاة].',
  },
];

// ==========================================
// ⏰ رسائل الاستعداد للصلاة
// ==========================================

const PRE_PRAYER_MESSAGES = [
  {
    t: 'اقترب وقت الصلاة 🕌',
    b: 'بقي القليل على الصلاة، تهيأ لها بهدوء.',
  },
  {
    t: 'استعد للصلاة 🤍',
    b: 'وضوء وطمأنينة واستعداد للوقوف بين يدي الله.',
  },
  {
    t: '🌿 موعد قريب مع الصلاة',
    b: 'اقترب وقت الصلاة، فلا تدع الانشغال يأخذك عنها.',
  },
  {
    t: 'حان وقت الاستعداد 🕌',
    b: 'رتّب ما بيدك واستعد للصلاة.',
  },
];

// ==========================================
// 📿 رسائل بعد الصلاة
// ==========================================

const POST_PRAYER_MESSAGES = [
  {
    t: '📿 أذكار ما بعد الصلاة',
    b: 'قبل أن تنشغل بشيء آخر، خذ لحظتك مع أذكار ما بعد الصلاة.',
  },
  {
    t: 'لا تستعجل 🤍',
    b: 'ابقَ قليلًا بعد الصلاة وسبّح الله واحمده وكبّره.',
  },
  {
    t: '🌿 دقيقة من الذكر',
    b: 'اجعل بعد الصلاة نصيبًا من الذكر.',
  },
  {
    t: 'بعد صلاة [الصلاة] 🕌',
    b: 'لا تنسَ أذكار ما بعد الصلاة.',
  },
];

// ==========================================
// 😴 أذكار النوم والوتر
// ==========================================

const SLEEP_MESSAGES = [
  {
    t: '🌙 قبل أن تنام',
    b: 'لا تنسَ أذكار النوم. اختم يومك بذكر الله.',
  },
  {
    t: 'وقت السكينة 🤍',
    b: 'هدّئ يومك بأذكار النوم واجعل آخر لحظاتك مع الذكر.',
  },
  {
    t: '🌙 وردك قبل النوم',
    b: 'خذ دقائقك مع أذكار النوم قبل أن تغلق عينيك.',
  },
  {
    t: 'ليلة هادئة 🤍',
    b: 'اذكر الله قبل نومك، واستودع يومك لله.',
  },
  {
    t: 'لا تنسَ الوتر 🌙',
    b: 'إن لم تصلِّ الوتر بعد، فهذا وقت مناسب له.',
  },
  {
    t: '🌿 اختم يومك بالذكر',
    b: 'أذكار النوم والوتر بانتظارك.',
  },
];

// ==========================================
// ✨ تذكيرات يومية خفيفة
// ==========================================

const RANDOM_MESSAGES = [
  {
    t: '🤍 تذكير بسيط',
    b: 'خذ لحظة قصيرة لذكر الله.',
  },
  {
    t: '🌿 استراحة مع الذكر',
    b: 'اترك ما بيدك لدقيقة واذكر الله.',
  },
  {
    t: '📿 هل ذكرت الله اليوم؟',
    b: 'اجعل لسانك رطبًا بذكر الله.',
  },
  {
    t: 'سبحان الله 🤍',
    b: 'لحظة ذكر قد تكون أجمل لحظات يومك.',
  },
  {
    t: 'الحمد لله 🌿',
    b: 'توقف لحظة وتذكر نعم الله عليك.',
  },
  {
    t: 'الله أكبر 🤍',
    b: 'اذكر الله ولو بكلمات قليلة.',
  },
  {
    t: 'لا حول ولا قوة إلا بالله 🌿',
    b: 'رددها بقلب حاضر.',
  },
  {
    t: 'استغفر الله 🤍',
    b: 'اجعل لك في يومك نصيبًا من الاستغفار.',
  },
  {
    t: '✨ لحظة تدبّر',
    b: 'افتح القرآن واقرأ ولو بضع آيات.',
  },
  {
    t: 'اسم من أسماء الله الحسنى 🌿',
    b: 'تعلّم اليوم اسمًا من أسماء الله الحسنى وتدبّر معناه.',
  },
  {
    t: '🤲 دعوة من القلب',
    b: 'خذ لحظة وادعُ الله بما تتمنى.',
  },
  {
    t: '📖 مع القرآن',
    b: 'هل قرأت وردك اليوم؟ افتح المصحف ولو لدقائق.',
  },
];

// ==========================================
// 🕌 رسائل يوم الجمعة
// ==========================================

const FRIDAY_MORNING_MESSAGES = [
  {
    t: '🕌 جمعة مباركة',
    b: 'أكثر من الصلاة والسلام على النبي ﷺ في هذا اليوم.',
  },
  {
    t: '🌿 يوم الجمعة',
    b: 'لا تنسَ سورة الكهف والصلاة على النبي ﷺ.',
  },
  {
    t: '🤍 صباح الجمعة',
    b: 'اجعل يوم الجمعة يومًا عامرًا بالذكر والصلاة على النبي ﷺ.',
  },
  {
    t: '✨ عيد الأسبوع',
    b: 'اغتنم يوم الجمعة بالذكر والدعاء والصلاة على النبي ﷺ.',
  },
];

// ==========================================
// 🤲 ساعة الاستجابة يوم الجمعة
// ==========================================

const FRIDAY_ISTEJABA_MESSAGES = [
  {
    t: '🤲 ساعة دعاء',
    b: 'اقترب مغرب الجمعة، أكثر من الدعاء واسأل الله من فضله.',
  },
  {
    t: '🌿 لا تنسَ الدعاء',
    b: 'هذه لحظات مباركة، اغتنمها بالدعاء والرجاء.',
  },
  {
    t: '🤍 وقت الدعاء',
    b: 'قبل مغرب الجمعة، خذ لحظات هادئة وادعُ الله بما في قلبك.',
  },
];


// ==========================================
// 🛠️ دوال مساعدة
// ==========================================

type Message = { t: string; b: string };

type DayTimings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

const getRandomMsg = (arr: Message[]): Message => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const parseTimeString = (timeStr: string) => {
  if (!timeStr || !timeStr.includes(':')) {
    return { hours: 5, minutes: 0 };
  }

  const parts = timeStr.trim().split(':');

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  return {
    hours: isNaN(hours) ? 5 : hours,
    minutes: isNaN(minutes) ? 0 : minutes,
  };
};

/**
 * تاريخ فعلي = يوم معيّن + وقت "HH:MM" + إزاحة بالدقائق. new Date بيعالج
 * تخطّي نص الليل تلقائياً (مثلاً العشاء + ٩٠ دقيقة بيطلع باليوم التالي
 * بدل ما يلفّ على نفس اليوم متل الطريقة القديمة).
 */
const atTime = (day: Date, timeStr: string, offsetMinutes = 0): Date => {
  const { hours, minutes } = parseTimeString(timeStr);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes + offsetMinutes, 0, 0);
};

// ==========================================
// 📱 قنوات Android
// ==========================================

const setupAndroidNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayers', {
      name: 'مواقيت الصلاة',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 300, 200, 300],
      lightColor: '#D4A373',
    });

    await Notifications.setNotificationChannelAsync('adhkar', {
      name: 'الأذكار والتذكيرات',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      lightColor: '#D4A373',
    });
  }
};

// ==========================================
// 🔔 جدولة جميع إشعارات التطبيق
// ==========================================
//
// كل إشعار بينجدول بتاريخ ووقت محدّد لكل يوم (مش "يومياً بنفس الساعة")،
// محسوب من مواقيت التقويم الدهري لذلك اليوم بالذات — لأنه مواقيت الصلاة
// بتتحرّك تقريباً دقيقة كل يوم، والإشعار اليومي المتكرر كان بيبعد عن وقت
// الصلاة الحقيقي كل ما طوّل المستخدم بدون ما يفتح شاشة المواقيت.
//
// عدد الأيام محكوم بحدّ iOS: ٦٤ إشعار مجدول كحد أقصى للتطبيق، وعنا ١١
// إشعار باليوم (+٢ يوم الجمعة) → ٥ أيام = ٥٥ + ٢ = ٥٧. أندرويد ما عنده
// هالحد فمنجدول أسبوعين. ومع كل فتحة للتطبيق بتنعاد الجدولة من جديد،
// فالنافذة بتضل ماشية لقدّام.

const DAYS_AHEAD = Platform.OS === 'ios' ? 5 : 14;

type PlannedNotification = {
  date: Date;
  channelId: 'prayers' | 'adhkar';
  title: string;
  body: string;
};

/** كل إشعارات يوم واحد (بدون فلترة الماضي) */
const planDay = (day: Date, timings: DayTimings): PlannedNotification[] => {
  const planned: PlannedNotification[] = [];
  const add = (date: Date, channelId: PlannedNotification['channelId'], msg: Message, prayerName?: string) => {
    const fill = (text: string) => (prayerName ? text.replace('[الصلاة]', prayerName) : text);
    planned.push({ date, channelId, title: fill(msg.t), body: fill(msg.b) });
  };

  // 🌅 1. أذكار الصباح — الفجر + 20 دقيقة
  add(atTime(day, timings.Fajr, 20), 'adhkar', getRandomMsg(MORNING_MESSAGES));

  // 🌙 2. أذكار المساء — المغرب - 20 دقيقة
  add(atTime(day, timings.Maghrib, -20), 'adhkar', getRandomMsg(EVENING_MESSAGES));

  // 🕌 3. إشعار وقت كل صلاة
  const prayers = [
    { name: 'الفجر', time: timings.Fajr },
    { name: 'الظهر', time: timings.Dhuhr },
    { name: 'العصر', time: timings.Asr },
    { name: 'المغرب', time: timings.Maghrib },
    { name: 'العشاء', time: timings.Isha },
  ];
  for (const prayer of prayers) {
    add(atTime(day, prayer.time), 'prayers', getRandomMsg(PRAYER_MESSAGES), prayer.name);
  }

  // ⏰ 4. تذكير استعداد واحد فقط في اليوم — الظهر - 15 دقيقة
  add(atTime(day, timings.Dhuhr, -15), 'adhkar', getRandomMsg(PRE_PRAYER_MESSAGES));

  // 📿 5. أذكار بعد العشاء — بعد العشاء بـ 15 دقيقة
  // (بدلاً من إشعار بعد كل صلاة، نكتفي بإشعار واحد حتى لا يصبح التطبيق مزعجًا)
  add(atTime(day, timings.Isha, 15), 'adhkar', getRandomMsg(POST_PRAYER_MESSAGES), 'العشاء');

  // 😴 6. أذكار النوم والوتر — بعد العشاء بـ 90 دقيقة
  add(atTime(day, timings.Isha, 90), 'adhkar', getRandomMsg(SLEEP_MESSAGES));

  // ✨ 7. تذكير يومي عشوائي — بعد الشروق بـ 3 ساعات (حتى لا يتداخل مع أذكار الصباح)
  add(atTime(day, timings.Sunrise, 180), 'adhkar', getRandomMsg(RANDOM_MESSAGES));

  // الجمعة (getDay() === 5)
  if (day.getDay() === 5) {
    // 🕌 8. إشعار الجمعة — الساعة 9:30 صباحًا
    add(atTime(day, '09:30'), 'adhkar', getRandomMsg(FRIDAY_MORNING_MESSAGES));
    // 🤲 9. الجمعة — قبل المغرب بـ 45 دقيقة
    add(atTime(day, timings.Maghrib, -45), 'adhkar', getRandomMsg(FRIDAY_ISTEJABA_MESSAGES));
  }

  return planned;
};

const runScheduling = async (todayTimings?: DayTimings | null) => {
  await setupAndroidNotificationChannels();

  // حذف الجدولة القديمة قبل إنشاء الجدولة الجديدة
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  // نفس مزوّد المواقيت تبع الويدجتس: المدينة المحفوظة + الإزاحة الدهرية +
  // التوقيت الصيفي. المواقيت الممرّرة (من شاشة المواقيت) بتُستخدم لتحديد
  // المدينة إذا ما في مدينة محفوظة (GPS بدون حفظ).
  const provider = await DahriWidgetTimesProvider.load(todayTimings);
  const now = new Date();

  const planned: PlannedNotification[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 12);
    // اليوم: المواقيت الممرّرة من الشاشة إن وجدت (هي نفسها المعروضة للمستخدم)
    const timings = i === 0 && todayTimings ? todayTimings : provider.getTimingsFor(day);
    planned.push(...planDay(day, timings));
  }

  const upcoming = planned
    .filter((n) => n.date.getTime() > now.getTime() + 5_000)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const n of upcoming) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: n.title,
        body: n.body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: n.date,
        channelId: n.channelId,
      },
    });
  }
};

// استدعاءات متداخلة (فتح التطبيق + شاشة المواقيت بنفس اللحظة) بتنفّذ ورا
// بعض، حتى ما تتداخل cancelAll مع جدولة التانية وتطلع إشعارات مكررة.
let schedulingQueue: Promise<void> = Promise.resolve();

const enqueueScheduling = (todayTimings?: DayTimings | null): Promise<void> => {
  schedulingQueue = schedulingQueue
    .then(() => runScheduling(todayTimings))
    .catch((error) => {
      console.error('خطأ في جدولة الإشعارات:', error);
    });
  return schedulingQueue;
};

/** من شاشة المواقيت — مع مواقيت اليوم المحسوبة والمعروضة للمستخدم */
export const scheduleAppNotifications = (timings: DayTimings) => enqueueScheduling(timings);

/** مع كل فتحة للتطبيق — بيمدّ نافذة الإشعارات لقدّام من المدينة المحفوظة */
export const refreshAppNotifications = () => enqueueScheduling(null);
