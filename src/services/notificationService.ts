import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

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

const getRandomMsg = (arr: any[]) => {
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

const addMinutesToTimeObj = (
  hours: number,
  minutes: number,
  minutesToAdd: number
) => {
  let totalMins = hours * 60 + minutes + minutesToAdd;

  totalMins = (totalMins + 1440) % 1440;

  return {
    hours: Math.floor(totalMins / 60),
    minutes: totalMins % 60,
  };
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

export const scheduleAppNotifications = async (timings: {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}) => {
  try {
    await setupAndroidNotificationChannels();

    // حذف الجدولة القديمة قبل إنشاء الجدولة الجديدة
    await Notifications.cancelAllScheduledNotificationsAsync();

    const { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
      return;
    }

    if (!timings) {
      return;
    }

    // ==========================================
    // 🌅 1. أذكار الصباح
    // الفجر + 20 دقيقة
    // ==========================================

    const fajr = parseTimeString(timings.Fajr);

    const morningTime = addMinutesToTimeObj(
      fajr.hours,
      fajr.minutes,
      20
    );

    const morningMsg = getRandomMsg(MORNING_MESSAGES);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: morningMsg.t,
        body: morningMsg.b,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: morningTime.hours,
        minute: morningTime.minutes,
        channelId: 'adhkar',
      },
    });

    // ==========================================
    // 🌙 2. أذكار المساء
    // المغرب - 20 دقيقة
    // ==========================================

    const maghrib = parseTimeString(timings.Maghrib);

    const eveningTime = addMinutesToTimeObj(
      maghrib.hours,
      maghrib.minutes,
      -20
    );

    const eveningMsg = getRandomMsg(EVENING_MESSAGES);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: eveningMsg.t,
        body: eveningMsg.b,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: eveningTime.hours,
        minute: eveningTime.minutes,
        channelId: 'adhkar',
      },
    });

    // ==========================================
    // 🕌 3. إشعار وقت الصلاة فقط
    // ==========================================

    const prayers = [
      { name: 'الفجر', time: timings.Fajr },
      { name: 'الظهر', time: timings.Dhuhr },
      { name: 'العصر', time: timings.Asr },
      { name: 'المغرب', time: timings.Maghrib },
      { name: 'العشاء', time: timings.Isha },
    ];

    for (const prayer of prayers) {
      const pTime = parseTimeString(prayer.time);

      const prayerMsg = getRandomMsg(PRAYER_MESSAGES);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: prayerMsg.t.replace('[الصلاة]', prayer.name),
          body: prayerMsg.b.replace('[الصلاة]', prayer.name),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: pTime.hours,
          minute: pTime.minutes,
          channelId: 'prayers',
        },
      });
    }

    // ==========================================
    // ⏰ 4. تذكير استعداد واحد فقط في اليوم
    //
    // نستخدم الظهر والعصر بشكل متناوب
    // لتجنب كثرة الإشعارات.
    // ==========================================

    const dhuhr = parseTimeString(timings.Dhuhr);

    const preDhuhrTime = addMinutesToTimeObj(
      dhuhr.hours,
      dhuhr.minutes,
      -15
    );

    const prePrayerMsg = getRandomMsg(PRE_PRAYER_MESSAGES);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: prePrayerMsg.t,
        body: prePrayerMsg.b,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: preDhuhrTime.hours,
        minute: preDhuhrTime.minutes,
        channelId: 'adhkar',
      },
    });

    // ==========================================
    // 📿 5. أذكار بعد العشاء
    // بعد العشاء بـ 15 دقيقة
    //
    // بدلاً من إشعار بعد كل صلاة،
    // نكتفي بإشعار واحد حتى لا يصبح التطبيق مزعجًا.
    // ==========================================

    const isha = parseTimeString(timings.Isha);

    const postIshaTime = addMinutesToTimeObj(
      isha.hours,
      isha.minutes,
      15
    );

    const postPrayerMsg = getRandomMsg(POST_PRAYER_MESSAGES);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: postPrayerMsg.t.replace('[الصلاة]', 'العشاء'),
        body: postPrayerMsg.b.replace('[الصلاة]', 'العشاء'),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: postIshaTime.hours,
        minute: postIshaTime.minutes,
        channelId: 'adhkar',
      },
    });

    // ==========================================
    // 😴 6. أذكار النوم والوتر
    // بعد العشاء بـ 90 دقيقة
    // ==========================================

    const sleepTime = addMinutesToTimeObj(
      isha.hours,
      isha.minutes,
      90
    );

    const sleepMsg = getRandomMsg(SLEEP_MESSAGES);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: sleepMsg.t,
        body: sleepMsg.b,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: sleepTime.hours,
        minute: sleepTime.minutes,
        channelId: 'adhkar',
      },
    });

    // ==========================================
    // ✨ 7. تذكير يومي عشوائي
    //
    // بعد الشروق بـ 3 ساعات
    // حتى لا يتداخل مع أذكار الصباح.
    // ==========================================

    const sunrise = parseTimeString(timings.Sunrise);

    const randomTime = addMinutesToTimeObj(
      sunrise.hours,
      sunrise.minutes,
      180
    );

    const randomMsg = getRandomMsg(RANDOM_MESSAGES);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: randomMsg.t,
        body: randomMsg.b,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: randomTime.hours,
        minute: randomTime.minutes,
        channelId: 'adhkar',
      },
    });

    // ==========================================
    // 🕌 8. إشعار الجمعة
    // الجمعة الساعة 9:30 صباحًا
    // ==========================================

    const fridayMorningMsg = getRandomMsg(
      FRIDAY_MORNING_MESSAGES
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: fridayMorningMsg.t,
        body: fridayMorningMsg.b,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 6,
        hour: 9,
        minute: 30,
        channelId: 'adhkar',
      },
    });

    // ==========================================
    // 🤲 9. الجمعة - قبل المغرب بـ 45 دقيقة
    // ==========================================

    const fridayIstejabaTime = addMinutesToTimeObj(
      maghrib.hours,
      maghrib.minutes,
      -45
    );

    const fridayIstejabaMsg = getRandomMsg(
      FRIDAY_ISTEJABA_MESSAGES
    );

    await Notifications.scheduleNotificationAsync({
      content: {
        title: fridayIstejabaMsg.t,
        body: fridayIstejabaMsg.b,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 6,
        hour: fridayIstejabaTime.hours,
        minute: fridayIstejabaTime.minutes,
        channelId: 'adhkar',
      },
    });

  } catch (error) {
    console.error(
      'خطأ في جدولة الإشعارات:',
      error
    );
  }
};