#!/usr/bin/env node
// ==========================================
// Switches the app's gold colour, keeping the original recoverable
// ==========================================
// Usage (from the adhkar-app folder):
//   node scripts/gold-palette.js apply    ← richer antique gold
//   node scripts/gold-palette.js revert   ← restores the original sand gold exactly (current)
//   node scripts/gold-palette.js status   ← which colour is in use
//
// Replaces every form of the colour (#RRGGBB, #RRGGBBAA, rgba(r, g, b, a)) in
// src/ and App.tsx — except the widgets (src/widgets and targets/), which have
// their own palettes. The new colour is used nowhere else, so revert is exact.
// After switching, an `eas update` is enough (no new build).

const fs = require('fs');
const path = require('path');

// Saved (original) colour ← new colour
const PALETTE = [
  {
    name: 'الذهبي الأساسي (نصوص، أيقونات، أزرار، حدود)',
    old: { hex: 'D4A373', rgb: [212, 163, 115] },  // light sand gold — the original
    new: { hex: 'C99A42', rgb: [201, 154, 66] },  // richer antique gold
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
  // #RRGGBB and #RRGGBBAA (alpha kept as is)
  const hexRe = new RegExp(`#${from.hex}(?=[0-9A-Fa-f]{2}\\b|\\b)`, 'gi');
  text = text.replace(hexRe, () => {
    count++;
    return `#${to.hex}`;
  });
  // rgba(r, g, b, a) / rgb(r, g, b) — spacing preserved
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
