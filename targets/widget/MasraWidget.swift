import WidgetKit
import SwiftUI
import CoreText

// ==========================================
// 🍎 ويدجت "مسرى المسلم" للآيفون (WidgetKit)
// ==========================================
// نسخة iOS من ويدجتس أندرويد (src/widgets/masraPalace):
//   • الحجم الصغير  (systemSmall)  = ويدجت الـ2×2 "الصلاة القادمة"
//   • الحجم المتوسط (systemMedium) = ويدجت الـ4×2 "القصر الزمردي"
// التطبيق بيكتب مواقيت ١٤ يوم (التقويم الدهري) بمخزن الـApp Group المشترك
// (src/widgets/ios/IosWidgetBridge.ts)، والويدجت بيبني منها جدولاً زمنياً:
// مدخل عند كل أذان وكل إقامة، فبيتبدّل بالثانية الصحيحة بدون ما التطبيق
// يشتغل، والعدّاد التنازلي بيتكّ بالثواني لحاله (Text timerInterval).

// لازم يتطابقوا مع IosWidgetBridge.ts وapp.json
enum MasraShared {
    static let appGroup = "group.com.mohamad.masra"
    static let storageKey = "masra.widget.schedule"
    static let kind = "MasraPrayerWidget"
}

// MARK: - الصلوات

enum PrayerKey: String, CaseIterable {
    case fajr = "Fajr", dhuhr = "Dhuhr", asr = "Asr", maghrib = "Maghrib", isha = "Isha"

    var label: String {
        switch self {
        case .fajr: return "الفجر"
        case .dhuhr: return "الظهر"
        case .asr: return "العصر"
        case .maghrib: return "المغرب"
        case .isha: return "العشاء"
        }
    }

    /// أيقونات SF Symbols بنفس معنى أيقونات أندرويد
    var symbol: String {
        switch self {
        case .fajr: return "sunrise"
        case .dhuhr: return "sun.max"
        case .asr: return "sun.min"
        case .maghrib: return "sunset"
        case .isha: return "moon.stars"
        }
    }

    /// دقائق ما بين الأذان والإقامة (احتياط لو ما وصلت من التطبيق)
    var defaultIqamaMinutes: Int {
        switch self {
        case .fajr: return 20
        case .maghrib: return 10
        default: return 15
        }
    }
}

// MARK: - البيانات المشتركة من التطبيق

struct ScheduleDay: Decodable {
    let d: String
    let Fajr: String
    let Sunrise: String
    let Dhuhr: String
    let Asr: String
    let Maghrib: String
    let Isha: String

    func time(_ key: PrayerKey) -> String {
        switch key {
        case .fajr: return Fajr
        case .dhuhr: return Dhuhr
        case .asr: return Asr
        case .maghrib: return Maghrib
        case .isha: return Isha
        }
    }
}

struct SchedulePayload: Decodable {
    let v: Int
    let city: String
    let iqama: [String: Int]
    let days: [ScheduleDay]

    static func load() -> SchedulePayload? {
        guard
            let json = UserDefaults(suiteName: MasraShared.appGroup)?.string(forKey: MasraShared.storageKey),
            let data = json.data(using: .utf8)
        else { return nil }
        return try? JSONDecoder().decode(SchedulePayload.self, from: data)
    }

    func day(_ key: String) -> ScheduleDay? {
        days.first { $0.d == key }
    }

    func iqamaMinutes(_ key: PrayerKey) -> Int {
        iqama[key.rawValue] ?? key.defaultIqamaMinutes
    }
}

// MARK: - التواريخ
// ميلادي دايماً بغض النظر عن تقويم الجهاز — المواقيت مخزّنة بتواريخ
// ميلادية ("2026-09-25")، ولو المستخدم مفعّل التقويم الهجري أو البوذي
// بالإعدادات، Calendar.current كان رح يفسّر السنة غلط.

enum MasraDates {
    static func gregorian() -> Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone.current
        return calendar
    }

    static func dayKey(_ date: Date) -> String {
        let c = gregorian().dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }

    static func date(day: String, time: String) -> Date? {
        let d = day.split(separator: "-").compactMap { Int($0) }
        let t = time.split(separator: ":").compactMap { Int($0) }
        guard d.count == 3, t.count == 2 else { return nil }
        var c = DateComponents()
        c.year = d[0]; c.month = d[1]; c.day = d[2]
        c.hour = t[0]; c.minute = t[1]; c.second = 0
        return gregorian().date(from: c)
    }

    static func hhmm(_ date: Date) -> String {
        let c = gregorian().dateComponents([.hour, .minute], from: date)
        return String(format: "%02d:%02d", c.hour ?? 0, c.minute ?? 0)
    }

    static func addDays(_ n: Int, to date: Date) -> Date {
        gregorian().date(byAdding: .day, value: n, to: date) ?? date.addingTimeInterval(Double(n) * 86_400)
    }

    /// "١٤ ربيع الآخر ١٤٤٨ هـ" — تقويم أم القرى بالعربي (أرقام عربية هندية)
    static func hijri(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .islamicUmmAlQura)
        formatter.locale = Locale(identifier: "ar")
        formatter.dateFormat = "d MMMM y"
        return formatter.string(from: date) + " هـ"
    }
}

// MARK: - حالة الويدجت بلحظة معيّنة

struct PrayerCell {
    let key: PrayerKey
    let time: String
    let isNext: Bool
}

struct NextPrayer {
    let key: PrayerKey
    let date: Date
    let time: String
    let isTomorrow: Bool
}

struct IqamaWindow {
    let key: PrayerKey
    let date: Date
    let time: String
}

struct WidgetState {
    let city: String
    let cells: [PrayerCell]
    let next: NextPrayer
    let iqama: IqamaWindow?

    /// نفس منطق MasraPalaceWidgetModel.ts: الصلاة القادمة من اليوم، وبعد
    /// العشاء فجر بكرا (مع صف بكرا كامل)، ونافذة الإقامة بين الأذان والإقامة.
    static func compute(_ payload: SchedulePayload, at now: Date) -> WidgetState? {
        guard let today = payload.day(MasraDates.dayKey(now)) else { return nil }
        let tomorrow = payload.day(MasraDates.dayKey(MasraDates.addDays(1, to: now)))

        var iqama: IqamaWindow?
        for key in PrayerKey.allCases {
            guard let adhan = MasraDates.date(day: today.d, time: today.time(key)) else { continue }
            let iqamaAt = adhan.addingTimeInterval(Double(payload.iqamaMinutes(key)) * 60)
            if now >= adhan && now < iqamaAt {
                iqama = IqamaWindow(key: key, date: iqamaAt, time: MasraDates.hhmm(iqamaAt))
            }
        }

        var next: NextPrayer?
        var row = today
        for key in PrayerKey.allCases {
            if let adhan = MasraDates.date(day: today.d, time: today.time(key)), adhan > now {
                next = NextPrayer(key: key, date: adhan, time: today.time(key), isTomorrow: false)
                break
            }
        }
        if next == nil, let tomorrow, let fajr = MasraDates.date(day: tomorrow.d, time: tomorrow.Fajr) {
            next = NextPrayer(key: .fajr, date: fajr, time: tomorrow.Fajr, isTomorrow: true)
            row = tomorrow
        }
        guard let next else { return nil }

        let cells = PrayerKey.allCases.map { PrayerCell(key: $0, time: row.time($0), isNext: $0 == next.key) }
        return WidgetState(city: payload.city, cells: cells, next: next, iqama: iqama)
    }

    static let placeholder: WidgetState = {
        let now = Date()
        let times = ["05:08", "12:30", "15:56", "18:38", "19:53"]
        let cells = zip(PrayerKey.allCases, times).map { PrayerCell(key: $0, time: $1, isNext: $0 == .maghrib) }
        return WidgetState(
            city: "القدس الشريف",
            cells: cells,
            next: NextPrayer(key: .maghrib, date: now.addingTimeInterval(4_260), time: "18:38", isTomorrow: false),
            iqama: nil
        )
    }()
}

// MARK: - الجدول الزمني

struct MasraEntry: TimelineEntry {
    let date: Date
    /// nil = التطبيق لسا ما كتب مواقيت (أو خلصت الـ١٤ يوم)
    let state: WidgetState?
}

struct MasraProvider: TimelineProvider {
    func placeholder(in context: Context) -> MasraEntry {
        MasraEntry(date: Date(), state: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (MasraEntry) -> Void) {
        let now = Date()
        if context.isPreview {
            completion(MasraEntry(date: now, state: .placeholder))
            return
        }
        let state = SchedulePayload.load().flatMap { WidgetState.compute($0, at: now) }
        completion(MasraEntry(date: now, state: state ?? .placeholder))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<MasraEntry>) -> Void) {
        let now = Date()
        guard let payload = SchedulePayload.load() else {
            // لسا ما في بيانات: منرجع نشيّك كل ساعة لحد ما المستخدم يفتح التطبيق
            let entry = MasraEntry(date: now, state: nil)
            completion(Timeline(entries: [entry], policy: .after(now.addingTimeInterval(3_600))))
            return
        }

        // لحظات التبدّل خلال اليومين الجايين: كل أذان، كل إقامة، ونص الليل
        // (التاريخ الهجري واليوم الجديد). كل مدخل بيحسب حالته من جديد.
        var boundaries: [Date] = []
        for offset in 0...2 {
            let dayDate = MasraDates.addDays(offset, to: now)
            guard let day = payload.day(MasraDates.dayKey(dayDate)) else { continue }
            if let midnight = MasraDates.date(day: day.d, time: "00:00") { boundaries.append(midnight) }
            for key in PrayerKey.allCases {
                guard let adhan = MasraDates.date(day: day.d, time: day.time(key)) else { continue }
                boundaries.append(adhan)
                boundaries.append(adhan.addingTimeInterval(Double(payload.iqamaMinutes(key)) * 60))
            }
        }
        let upcoming = Array(Set(boundaries.filter { $0 > now }).sorted().prefix(36))

        let entries = ([now] + upcoming).map { MasraEntry(date: $0, state: WidgetState.compute(payload, at: $0)) }
        let refresh = upcoming.last ?? now.addingTimeInterval(3_600)
        completion(Timeline(entries: entries, policy: .after(refresh)))
    }
}

// MARK: - الخطوط
// منسجّل خطوط assets/ وقت التشغيل (بدل UIAppFonts) حتى ما يهمّ إذا Xcode
// نسخها لجذر الحزمة أو لمجلد assets فرعي.

enum MasraFonts {
    private static let registered: Void = {
        for name in ["WidgetAmiriBold", "WidgetCairoBold", "WidgetCairoSemiBold", "WidgetCinzelBold"] {
            let url = Bundle.main.url(forResource: name, withExtension: "ttf")
                ?? Bundle.main.url(forResource: name, withExtension: "ttf", subdirectory: "assets")
            if let url {
                _ = CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
            }
        }
    }()

    static func ensureRegistered() { _ = registered }

    static func amiri(_ size: CGFloat) -> Font { .custom("Amiri-Bold", size: size) }
    static func cairo(_ size: CGFloat) -> Font { .custom("Cairo-Bold", size: size) }
    static func cairoSemi(_ size: CGFloat) -> Font { .custom("Cairo-SemiBold", size: size) }
    static func cinzel(_ size: CGFloat) -> Font { .custom("Cinzel-Bold", size: size) }
}

// MARK: - الويدجت

struct MasraWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: MasraEntry

    init(entry: MasraEntry) {
        MasraFonts.ensureRegistered()
        self.entry = entry
    }

    var body: some View {
        Group {
            if let state = entry.state {
                switch family {
                case .systemMedium:
                    MediumPalaceLayout(state: state, now: entry.date)
                default:
                    SmallPalaceLayout(state: state, now: entry.date)
                }
            } else {
                EmptyPalaceLayout()
            }
        }
        .environment(\.layoutDirection, .rightToLeft)
        .containerBackground(for: .widget) {
            PalaceBackground()
        }
    }
}

struct MasraPrayerWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: MasraShared.kind, provider: MasraProvider()) { entry in
            MasraWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("مسرى المسلم")
        .description("الصلاة القادمة مع عدّاد تنازلي مباشر ومواقيت اليوم من التقويم الدهري")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

@main
struct MasraWidgetBundle: WidgetBundle {
    var body: some Widget {
        MasraPrayerWidget()
    }
}
