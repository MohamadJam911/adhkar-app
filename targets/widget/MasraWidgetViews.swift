import WidgetKit
import SwiftUI

// ==========================================
// iPhone widget design — same identity as Android's masraPalaceTheme.ts
// ==========================================
// Same colours (app green #12241F, app gold #D4A373), fonts (Amiri / Cairo /
// Cinzel) and elements: double gold frame, corner ornaments, frame stars,
// geometric pattern, mosque silhouette and the arch card with a bright gold
// border. The one difference: instead of HH:MM boxes, the countdown ticks
// every second (iOS updates it without redrawing the widget).

// MARK: - Colours

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: opacity
        )
    }
}

enum Palace {
    static let goldHighlight = Color(hex: 0xF4E0C2)
    static let goldLight = Color(hex: 0xE5B279)
    static let gold = Color(hex: 0xD4A373)
    static let goldMetallic = Color(hex: 0xA47A45)
    static let goldDeep = Color(hex: 0x8A5E33)
    static let goldDark = Color(hex: 0x4A321B)

    static let greenBase = Color(hex: 0x12241F)
    static let greenCard = Color(hex: 0x1B342C)
    static let greenDeep = Color(hex: 0x0B1714)
    static let silhouette = Color(hex: 0x07100E)

    static let ivory = Color(hex: 0xF4EADF)
    static let ivory200 = Color(hex: 0xE8DCCB)
    static let ivory300 = Color(hex: 0xC9B8A3)
    static let white = Color.white

    static let shine = LinearGradient(
        colors: [goldHighlight, gold, goldDeep, gold, goldHighlight],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    static let badge = LinearGradient(colors: [goldDeep, gold], startPoint: .leading, endPoint: .trailing)
}

// MARK: - Shapes in fixed unit coordinates (same numbers as the original SVG paths)

/// A shape drawn in a unit×unit box and stretched to any size, so the
/// Android SVG paths can be reused with their literal numbers.
struct UnitShape: Shape {
    let unit: CGFloat
    let build: @Sendable (inout Path) -> Void

    func path(in rect: CGRect) -> Path {
        var p = Path()
        build(&p)
        let transform = CGAffineTransform(a: rect.width / unit, b: 0, c: 0, d: rect.height / unit, tx: rect.minX, ty: rect.minY)
        return p.applying(transform)
    }
}

private func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x, y: y) }

/// Rub el Hizb star (viewBox 24)
let rubElHizb = UnitShape(unit: 24) { p in
    let points: [(CGFloat, CGFloat)] = [
        (12, 2), (14.8, 6.6), (20, 6.6), (17.2, 11.2), (20, 15.8), (14.8, 15.8),
        (12, 20.4), (9.2, 15.8), (4, 15.8), (6.8, 11.2), (4, 6.6), (9.2, 6.6),
    ]
    p.move(to: pt(points[0].0, points[0].1))
    for (x, y) in points.dropFirst() { p.addLine(to: pt(x, y)) }
    p.closeSubpath()
}

/// Five-point divider star (viewBox 24)
let dividerStar = UnitShape(unit: 24) { p in
    let points: [(CGFloat, CGFloat)] = [
        (12, 2), (14, 9), (21, 9), (15, 14), (18, 21), (12, 17), (6, 21), (9, 14), (3, 9), (10, 9),
    ]
    p.move(to: pt(points[0].0, points[0].1))
    for (x, y) in points.dropFirst() { p.addLine(to: pt(x, y)) }
    p.closeSubpath()
}

/// Arch card: large top corners, smaller bottom ones (same as Android's archPath)
struct ArchShape: Shape {
    var top: CGFloat
    var bottom: CGFloat
    var inset: CGFloat = 0

    func path(in rect: CGRect) -> Path {
        let r = rect.insetBy(dx: inset, dy: inset)
        let t = max(top - inset, 1)
        let b = max(bottom - inset, 1)
        var p = Path()
        p.move(to: pt(r.minX, r.maxY - b))
        p.addLine(to: pt(r.minX, r.minY + t))
        p.addQuadCurve(to: pt(r.minX + t, r.minY), control: pt(r.minX, r.minY))
        p.addLine(to: pt(r.maxX - t, r.minY))
        p.addQuadCurve(to: pt(r.maxX, r.minY + t), control: pt(r.maxX, r.minY))
        p.addLine(to: pt(r.maxX, r.maxY - b))
        p.addQuadCurve(to: pt(r.maxX - b, r.maxY), control: pt(r.maxX, r.maxY))
        p.addLine(to: pt(r.minX + b, r.maxY))
        p.addQuadCurve(to: pt(r.minX, r.maxY - b), control: pt(r.minX, r.maxY))
        p.closeSubpath()
        return p
    }
}

/// Repeating arabesque pattern (45pt tile = the 120px tile × 0.375)
struct ArabesquePattern: Shape {
    func path(in rect: CGRect) -> Path {
        let s: CGFloat = 0.375
        var tile = Path()
        let star1: [(CGFloat, CGFloat)] = [(60, 10), (75, 35), (105, 35), (85, 55), (95, 85), (60, 70), (25, 85), (35, 55), (15, 35), (45, 35)]
        let star2: [(CGFloat, CGFloat)] = [(60, 110), (75, 85), (105, 85), (85, 65), (95, 35), (60, 50), (25, 35), (35, 65), (15, 85), (45, 85)]
        for star in [star1, star2] {
            tile.move(to: pt(star[0].0 * s, star[0].1 * s))
            for (x, y) in star.dropFirst() { tile.addLine(to: pt(x * s, y * s)) }
            tile.closeSubpath()
        }
        for radius in [28.0, 52.0] as [CGFloat] {
            tile.addEllipse(in: CGRect(x: (60 - radius) * s, y: (60 - radius) * s, width: radius * 2 * s, height: radius * 2 * s))
        }

        var p = Path()
        var y: CGFloat = 0
        while y < rect.height {
            var x: CGFloat = 0
            while x < rect.width {
                p.addPath(tile, transform: CGAffineTransform(translationX: rect.minX + x, y: rect.minY + y))
                x += 45
            }
            y += 45
        }
        return p
    }
}

/// Mosque silhouette (500×150 box, drawing between x=115 and 385)
struct MosqueSilhouette: Shape {
    func path(in rect: CGRect) -> Path {
        let s = min(rect.width * 0.8 / 290, rect.height * 0.62 / 150)
        var p = Path()
        // Main dome and the two side domes
        for (x0, x1, top) in [(200.0, 300.0, 70.0), (140.0, 205.0, 100.0), (295.0, 360.0, 100.0)] as [(CGFloat, CGFloat, CGFloat)] {
            p.move(to: pt(x0, 150))
            p.addCurve(to: pt(x1, 150), control1: pt(x0, top), control2: pt(x1, top))
            p.closeSubpath()
        }
        // Minarets
        for x in [115.0, 371.0] as [CGFloat] {
            p.move(to: pt(x, 150))
            p.addLine(to: pt(x, 45))
            p.addLine(to: pt(x + 7, 35))
            p.addLine(to: pt(x + 14, 45))
            p.addLine(to: pt(x + 14, 150))
            p.closeSubpath()
        }
        let transform = CGAffineTransform(a: s, b: 0, c: 0, d: s, tx: rect.midX - 250 * s, ty: rect.maxY - 150 * s)
        return p.applying(transform)
    }
}

// MARK: - Full background

struct CornerOrnament: View {
    var body: some View {
        ZStack {
            UnitShape(unit: 40) { p in
                p.move(to: pt(0, 0)); p.addLine(to: pt(20, 0))
                p.addCurve(to: pt(0, 20), control1: pt(20, 10), control2: pt(10, 20)); p.closeSubpath()
            }
            .fill(Palace.goldMetallic.opacity(0.3))
            UnitShape(unit: 40) { p in
                p.move(to: pt(2, 2)); p.addLine(to: pt(35, 2))
                p.addCurve(to: pt(2, 18), control1: pt(30, 12), control2: pt(20, 18)); p.closeSubpath()
            }
            .stroke(Palace.goldMetallic.opacity(0.9), lineWidth: 1)
            UnitShape(unit: 40) { p in p.addEllipse(in: CGRect(x: 6.5, y: 6.5, width: 5, height: 5)) }
                .fill(Palace.gold)
        }
        .frame(width: 24, height: 24)
    }
}

struct FrameStar: View {
    var body: some View {
        ZStack {
            Rectangle().fill(Palace.greenCard).frame(width: 20, height: 6)
            rubElHizb.fill(Palace.gold).frame(width: 13, height: 13)
        }
    }
}

struct PalaceBackground: View {
    var body: some View {
        GeometryReader { geo in
            ZStack {
                RadialGradient(
                    colors: [Palace.greenCard, Palace.greenBase, Palace.greenDeep],
                    center: .top,
                    startRadius: 0,
                    endRadius: max(geo.size.width, geo.size.height) * 1.05
                )
                ArabesquePattern().stroke(Palace.gold.opacity(0.16), lineWidth: 0.9)
                MosqueSilhouette().fill(Palace.silhouette.opacity(0.9))
                MosqueSilhouette().stroke(Palace.gold.opacity(0.3), lineWidth: 1.2)

                RoundedRectangle(cornerRadius: 18).inset(by: 4).stroke(Palace.gold.opacity(0.85), lineWidth: 1.4)
                RoundedRectangle(cornerRadius: 15).inset(by: 7.5).stroke(Palace.gold.opacity(0.4), lineWidth: 0.7)

                VStack {
                    HStack {
                        CornerOrnament()
                        Spacer()
                        CornerOrnament().scaleEffect(x: -1, y: 1)
                    }
                    Spacer()
                    HStack {
                        CornerOrnament().scaleEffect(x: 1, y: -1)
                        Spacer()
                        CornerOrnament().scaleEffect(x: -1, y: -1)
                    }
                }
                .padding(4)

                // Two stars breaking the frame line (y=4) at the top and bottom centre:
                // the star (13pt tall) is centred at 6.5, so it is shifted by 2.5
                VStack {
                    FrameStar().offset(y: -2.5)
                    Spacer()
                    FrameStar().offset(y: 2.5)
                }
            }
        }
        // Purely decorative — must not mirror in RTL
        .environment(\.layoutDirection, .leftToRight)
    }
}

// MARK: - Shared elements

struct DomeEmblem: View {
    let size: CGFloat

    var body: some View {
        ZStack {
            Circle().fill(Palace.gold.opacity(0.12))
            Circle().stroke(Palace.goldMetallic, lineWidth: 1)
            ZStack {
                UnitShape(unit: 64) { p in p.addEllipse(in: CGRect(x: 30.2, y: 3.6, width: 3.6, height: 3.6)) }
                    .fill(Palace.goldHighlight)
                UnitShape(unit: 64) { p in p.move(to: pt(32, 8)); p.addLine(to: pt(32, 14)) }
                    .stroke(Palace.goldHighlight, lineWidth: 0.6)
                UnitShape(unit: 64) { p in
                    p.move(to: pt(22, 28))
                    p.addCurve(to: pt(32, 14), control1: pt(22, 17), control2: pt(26, 14))
                    p.addCurve(to: pt(42, 28), control1: pt(38, 14), control2: pt(42, 17))
                    p.closeSubpath()
                }
                .fill(LinearGradient(colors: [Palace.goldHighlight, Palace.gold, Palace.goldDeep], startPoint: .topLeading, endPoint: .bottomTrailing))
                UnitShape(unit: 64) { p in p.addRect(CGRect(x: 20, y: 28, width: 24, height: 6)) }
                    .fill(Palace.goldMetallic)
                UnitShape(unit: 64) { p in
                    p.move(to: pt(12, 34)); p.addLine(to: pt(52, 34)); p.addLine(to: pt(50, 49)); p.addLine(to: pt(14, 49)); p.closeSubpath()
                }
                .fill(Palace.greenBase)
                UnitShape(unit: 64) { p in
                    p.move(to: pt(12, 34)); p.addLine(to: pt(52, 34)); p.addLine(to: pt(50, 49)); p.addLine(to: pt(14, 49)); p.closeSubpath()
                    for x in [17.0, 23.0, 29.0, 35.0, 41.0, 47.0] as [CGFloat] {
                        p.move(to: pt(x, 49)); p.addLine(to: pt(x, 40))
                        p.addQuadCurve(to: pt(x + 2, 40), control: pt(x + 1, 37.5)); p.addLine(to: pt(x + 2, 49))
                    }
                }
                .stroke(Palace.gold, lineWidth: 0.5)
                UnitShape(unit: 64) { p in p.addRect(CGRect(x: 10, y: 49, width: 44, height: 3)) }
                    .fill(Palace.goldMetallic)
            }
            .padding(size * 0.14)
        }
        .frame(width: size, height: size)
    }
}

struct ArchCard<Content: View>: View {
    let width: CGFloat
    let height: CGFloat
    let top: CGFloat
    let bottom: CGFloat
    @ViewBuilder let content: () -> Content

    var body: some View {
        ZStack {
            ArchShape(top: top, bottom: bottom, inset: 1.1)
                .fill(LinearGradient(colors: [Palace.greenBase, Palace.greenDeep], startPoint: .top, endPoint: .bottom))
            ArchShape(top: top, bottom: bottom, inset: 1.1)
                .fill(LinearGradient(colors: [Palace.goldHighlight.opacity(0.14), .clear], startPoint: .top, endPoint: UnitPoint(x: 0.5, y: 0.45)))
            ArchShape(top: top, bottom: bottom, inset: 1.1)
                .stroke(Palace.shine, lineWidth: 2.2)
            ArchShape(top: top, bottom: bottom, inset: 4.2)
                .stroke(Palace.gold.opacity(0.5), lineWidth: 0.7)
            content()
        }
        .frame(width: width, height: height)
    }
}

struct GoldBadge: View {
    let text: String
    let size: CGFloat

    var body: some View {
        Text(text)
            .font(MasraFonts.cairo(size))
            .foregroundColor(Palace.greenDeep)
            .lineLimit(1)
            .padding(.horizontal, size)
            .padding(.vertical, size * 0.12)
            .background(Capsule().fill(Palace.badge))
    }
}

/// Live countdown that ticks every second on its own ("1:11:32")
struct LiveCountdown: View {
    let now: Date
    let target: Date
    let size: CGFloat

    var body: some View {
        Text(timerInterval: now...max(now, target), countsDown: true)
            .font(MasraFonts.cinzel(size))
            .monospacedDigit()
            .multilineTextAlignment(.center)
            .foregroundColor(Palace.goldLight)
            .lineLimit(1)
            .minimumScaleFactor(0.6)
            .padding(.horizontal, size * 0.5)
            .padding(.vertical, size * 0.18)
            .background(
                RoundedRectangle(cornerRadius: size * 0.25)
                    .fill(Color.black.opacity(0.35))
                    .overlay(RoundedRectangle(cornerRadius: size * 0.25).stroke(Palace.gold.opacity(0.45), lineWidth: 1))
            )
            .environment(\.layoutDirection, .leftToRight)
    }
}

// MARK: - Small size (= the Android 2×2 widget)

struct SmallPalaceLayout: View {
    let state: WidgetState
    let now: Date

    var body: some View {
        GeometryReader { geo in
            // `t` (the widget text size from Settings) scales every text, icon and
            // the card together; the design height grows with it, so the layout
            // keeps the same proportions at every size.
            let t = state.textScale
            let s = min(geo.size.width / 170, geo.size.height / (190 + 143 * (t - 1)))
            let u = s * t
            let iqama = state.iqama
            let key = iqama?.key ?? state.next.key
            let target = iqama?.date ?? state.next.date
            let badge = iqama != nil ? "حان الآن وقت" : (state.next.isTomorrow ? "أقرب صلاة • غداً" : "أقرب صلاة")
            let footer = iqama.map { "الإقامة \($0.time)" } ?? "الأذان \(state.next.time)"

            VStack(spacing: 0) {
                HStack(spacing: 5 * u) {
                    Text("مسرى المسلم")
                        .font(MasraFonts.amiri(14 * u))
                        .foregroundColor(Palace.gold)
                        .shadow(color: .black, radius: 2, y: 1)
                    DomeEmblem(size: 20 * u)
                }

                Spacer(minLength: 2)

                ArchCard(width: 146 * u, height: (116 + 101 * (t - 1)) * s, top: 26 * s, bottom: 12 * s) {
                    VStack(spacing: 3 * u) {
                        GoldBadge(text: badge, size: 8 * u)
                        HStack(spacing: 5 * u) {
                            Text(key.label)
                                .font(MasraFonts.amiri(22 * u))
                                .foregroundColor(Palace.ivory)
                                .shadow(color: .black, radius: 2, y: 1)
                            Image(systemName: key.symbol)
                                .font(.system(size: 13 * u, weight: .semibold))
                                .foregroundColor(Palace.gold)
                        }
                        LiveCountdown(now: now, target: target, size: 14 * u)
                        Text(footer)
                            .font(MasraFonts.cairo(11.5 * u))
                            .foregroundColor(Palace.gold)
                            .environment(\.layoutDirection, .rightToLeft)
                    }
                }

                Spacer(minLength: 2)

                Text(state.city)
                    .font(MasraFonts.cairo(9 * u))
                    .foregroundColor(Palace.ivory200)
                    .lineLimit(1)
            }
            .padding(.top, 13 * s)
            .padding(.bottom, 10 * s)
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}

// MARK: - Medium size (= the Android 4×2 "Emerald Palace" widget)

struct MediumPalaceLayout: View {
    let state: WidgetState
    let now: Date

    var body: some View {
        GeometryReader { geo in
            // `t` scales every text, icon and the card together (see SmallPalaceLayout).
            let t = state.textScale
            let s = min(geo.size.width / 400, geo.size.height / (190 + 133 * (t - 1)))
            let u = s * t

            VStack(spacing: 0) {
                // RTL: the first HStack item is on the right — identity on the right, card on the left
                HStack(alignment: .top, spacing: 0) {
                    VStack(alignment: .leading, spacing: 4 * u) {
                        HStack(spacing: 8 * u) {
                            Text("مسرى المسلم")
                                .font(MasraFonts.amiri(20 * u))
                                .foregroundColor(Palace.gold)
                                .shadow(color: .black, radius: 2, y: 1)
                            DomeEmblem(size: 28 * u)
                        }
                        HStack(spacing: 4 * u) {
                            Rectangle().fill(Palace.gold.opacity(0.5)).frame(height: 1)
                            dividerStar.fill(Palace.gold).frame(width: 8 * u, height: 8 * u)
                            Rectangle().fill(Palace.gold.opacity(0.5)).frame(height: 1)
                        }
                        .frame(width: 150 * u)
                        HStack(spacing: 4 * u) {
                            Text(state.city)
                                .font(MasraFonts.cairo(8.5 * u))
                                .foregroundColor(Palace.ivory)
                                .lineLimit(1)
                            Text("•").font(MasraFonts.cairoSemi(8 * u)).foregroundColor(Palace.goldDeep)
                            Text(MasraDates.hijri(now))
                                .font(MasraFonts.cairoSemi(8 * u))
                                .foregroundColor(Palace.ivory300)
                                .lineLimit(1)
                        }
                    }
                    .padding(.trailing, 0)

                    Spacer(minLength: 8 * s)

                    ArchCard(width: 135 * u, height: (86 + 70 * (t - 1)) * s, top: 24 * s, bottom: 12 * s) {
                        VStack(spacing: 3 * u) {
                            GoldBadge(text: state.next.isTomorrow ? "أقرب صلاة • غداً" : "أقرب صلاة", size: 7 * u)
                            Text(state.next.key.label)
                                .font(MasraFonts.amiri(19 * u))
                                .foregroundColor(Palace.ivory)
                                .shadow(color: .black, radius: 2, y: 1)
                            LiveCountdown(now: now, target: state.next.date, size: 12.5 * u)
                        }
                    }
                }
                .padding(.horizontal, 22 * s)

                Spacer(minLength: 4 * s)

                // RTL: Fajr (first item) ends up on the far right
                HStack(spacing: 6 * s) {
                    ForEach(state.cells, id: \.key) { cell in
                        PrayerCellView(cell: cell, s: s, t: t)
                    }
                }
                .padding(.horizontal, 20 * s)
            }
            .padding(.top, 16 * s)
            .padding(.bottom, 14 * s)
            .frame(width: geo.size.width, height: geo.size.height)
        }
    }
}

struct PrayerCellView: View {
    let cell: PrayerCell
    let s: CGFloat
    var t: CGFloat = 1

    var body: some View {
        VStack(spacing: 1 * s) {
            Image(systemName: cell.key.symbol)
                .font(.system(size: 14 * s * t, weight: .medium))
                .foregroundColor(cell.isNext ? Palace.gold : Palace.ivory300)
            Text(cell.key.label)
                .font(MasraFonts.cairo(13 * s * t))
                .foregroundColor(cell.isNext ? Palace.gold : Palace.ivory)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(cell.time)
                .font(MasraFonts.cairo(11.5 * s * t))
                .foregroundColor(cell.isNext ? Palace.white : Palace.ivory200)
                .environment(\.layoutDirection, .leftToRight)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 5 * s)
        .background(
            RoundedRectangle(cornerRadius: 8 * s)
                .fill(cell.isNext ? Palace.gold.opacity(0.16) : Color.clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 8 * s)
                        .stroke(cell.isNext ? Palace.gold.opacity(0.85) : Color.clear, lineWidth: 1.5)
                )
        )
    }
}

// MARK: - Before the app is first opened

struct EmptyPalaceLayout: View {
    var body: some View {
        VStack(spacing: 8) {
            DomeEmblem(size: 30)
            Text("مسرى المسلم")
                .font(MasraFonts.amiri(18))
                .foregroundColor(Palace.gold)
            Text("افتح التطبيق لعرض مواقيت الصلاة")
                .font(MasraFonts.cairo(11))
                .foregroundColor(Palace.ivory200)
                .multilineTextAlignment(.center)
        }
        .padding(16)
    }
}
