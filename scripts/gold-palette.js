#!/usr/bin/env node
// ==========================================
// 🎨 مبدّل لون الذهبي بشاشات التطبيق — مع حفظ اللون القديم
// ==========================================
// الاستخدام (من مجلد adhkar-app):
//   node scripts/gold-palette.js apply    ← الذهبي الغني الجديد (الحالي)
//   node scripts/gold-palette.js revert   ← يرجّع الذهبي الرملي القديم بالضبط
//   node scripts/gold-palette.js status   ← أي لون مستخدم حالياً
//
// بيبدّل كل صيغ اللون: ‎#RRGGBB، ‎#RRGGBBAA (مع الشفافية)، وrgba(r, g, b, a)،
// بكل ملفات src/ وApp.tsx — ما عدا الويدجتس (src/widgets و targets/) لأنها
// عندها لوحة ألوان خاصة فيها (masraPalaceTheme.ts / MasraWidgetViews.swift).
// الألوان الجديدة ما كانت مستخدمة بأي مكان قبل التبديل، فالرجوع دقيق ١٠٠٪.
// بعد أي تبديل: `eas update` بيكفي (مش لازم build).

const fs = require('fs');
const path = require('path');

// 💾 اللون المحفوظ (القديم) ← اللون الجديد
const PALETTE = [
  {
    name: 'الذهبي الأساسي (نصوص، أيقونات، أزرار، حدود)',
    old: { hex: 'D4A373', rgb: [212, 163, 115] }, // ذهبي رملي فاتح — كان بيبين مايل للأصفر بالوضع الداكن
    new: { hex: 'C99A42', rgb: [201, 154, 66] }, // ذهبي عتيق غني
  },
  {
    name: 'الذهبي الفاتح (لمسات مضيئة)',
    old: { hex: 'E5B279', rgb: [229, 178, 121] },
    new: { hex: 'D9AE55', rgb: [217, 174, 85] },
  },
];

const ROOT = path.resolve(__dirname, '..');
const EXCLUDED_DIRS = [path.join(ROOT, 'src', 'widgets')];

function listFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (EXCLUDED_DIRS.some((ex) => full.startsWith(ex))) continue;
    if (entry.isDirectory()) listFiles(full, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function swap(text, from, to) {
  let count = 0;
  // #RRGGBB و#RRGGBBAA (الشفافية بتضل متل ما هي)
  const hexRe = new RegExp(`#${from.hex}(?=[0-9A-Fa-f]{2}\\b|\\b)`, 'gi');
  text = text.replace(hexRe, () => {
    count++;
    return `#${to.hex}`;
  });
  // rgba(r, g, b, a) / rgb(r, g, b) — منحافظ على نفس المسافات
  const [r, g, b] = from.rgb;
  const rgbRe = new RegExp(`(rgba?\\(\\s*)${r}(\\s*,\\s*)${g}(\\s*,\\s*)${b}(?=\\s*[,)])`, 'g');
  text = text.replace(rgbRe, (_m, a, s1, s2) => {
    count++;
    return `${a}${to.rgb[0]}${s1}${to.rgb[1]}${s2}${to.rgb[2]}`;
  });
  return { text, count };
}

function run(mode) {
  const files = [...listFiles(path.join(ROOT, 'src')), path.join(ROOT, 'App.tsx')];

  if (mode === 'status') {
    for (const p of PALETTE) {
      let oldN = 0;
      let newN = 0;
      for (const f of files) {
        const t = fs.readFileSync(f, 'utf8');
        oldN += swap(t, p.old, p.new).count;
        newN += swap(t, p.new, p.old).count;
      }
      console.log(`${p.name}: القديم #${p.old.hex} × ${oldN} | الجديد #${p.new.hex} × ${newN}`);
    }
    return;
  }

  let total = 0;
  for (const f of files) {
    let text = fs.readFileSync(f, 'utf8');
    let fileCount = 0;
    for (const p of PALETTE) {
      const [from, to] = mode === 'apply' ? [p.old, p.new] : [p.new, p.old];
      const res = swap(text, from, to);
      text = res.text;
      fileCount += res.count;
    }
    if (fileCount > 0) {
      fs.writeFileSync(f, text, 'utf8');
      console.log(`  ${path.relative(ROOT, f)}: ${fileCount}`);
      total += fileCount;
    }
  }
  console.log(`${mode === 'apply' ? 'طُبّق الذهبي الجديد' : 'رجع الذهبي القديم'} — ${total} تبديل`);
}

const mode = process.argv[2];
if (!['apply', 'revert', 'status'].includes(mode)) {
  console.log('الاستخدام: node scripts/gold-palette.js apply | revert | status');
  process.exit(1);
}
run(mode);
