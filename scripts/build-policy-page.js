#!/usr/bin/env node
// ==========================================
// 📄 صفحة سياسة الخصوصية وبنود الاستخدام العامة (للمتاجر)
// ==========================================
// بيولّد docs/privacy-policy.html من نفس النص المعروض جوا التطبيق
// (src/data/privacyPolicy.ts و src/data/termsOfService.ts) — فالصفحة
// العامة والتطبيق ما بيختلفوا أبداً. شغّله بعد أي تعديل على النصين:
//   node scripts/build-policy-page.js
// المجلد docs/ جاهز لـGitHub Pages (Settings → Pages → Branch: main، Folder: /docs).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readTemplate(file, name) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const m = src.match(new RegExp(`export const ${name}\\s*=\\s*\`([\\s\\S]*?)\`;?`));
  if (!m) throw new Error(`لم أجد ${name} في ${file}`);
  return m[1].trim();
}

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// نص عادي → HTML: "1. عنوان" = عنوان فرعي، "* بند" = قائمة، والباقي فقرات
function toHtml(text) {
  const out = [];
  let list = [];
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((li) => `<li>${li}</li>`).join('')}</ul>`);
      list = [];
    }
  };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (/^[*•-]\s+/.test(line)) {
      list.push(escapeHtml(line.replace(/^[*•-]\s+/, '')));
      continue;
    }
    flushList();
    if (/^\d+[.)]\s+/.test(line) && line.length < 90) out.push(`<h3>${escapeHtml(line)}</h3>`);
    else if (/^آخر تحديث/.test(line)) out.push(`<p class="updated">${escapeHtml(line)}</p>`);
    else out.push(`<p>${escapeHtml(line)}</p>`);
  }
  flushList();
  return out.join('\n');
}

const privacy = toHtml(readTemplate('src/data/privacyPolicy.ts', 'PRIVACY_POLICY_TEXT'));
const terms = toHtml(readTemplate('src/data/termsOfService.ts', 'TERMS_OF_SERVICE_TEXT'));

const page = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>مسرى المسلم — سياسة الخصوصية وبنود الاستخدام</title>
<meta name="description" content="سياسة الخصوصية وبنود الاستخدام لتطبيق مسرى المسلم">
<style>
  :root { --bg: #F9F4EC; --card: #FFFFFF; --text: #332922; --sub: #7A6B5D; --gold: #9E6D3B; --line: #D4A37366; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #14110E; --card: #28231F; --text: #F4EADF; --sub: #B5A290; --gold: #D4A373; --line: #D4A37355; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 17px/1.9 "Segoe UI", Tahoma, "Noto Naskh Arabic", sans-serif; overflow-wrap: anywhere; }
  html, body { overflow-x: hidden; }
  main { max-width: 760px; margin: 0 auto; padding: 32px 18px 64px; }
  header { text-align: center; margin-bottom: 28px; }
  header h1 { color: var(--gold); margin: 0 0 4px; font-size: 30px; }
  header p { color: var(--sub); margin: 0; }
  nav { text-align: center; margin-bottom: 20px; }
  nav a { color: var(--gold); margin: 0 10px; font-weight: 600; }
  section { background: var(--card); border: 1.5px solid var(--line); border-radius: 22px; padding: 22px 24px; margin-bottom: 22px; }
  h2 { color: var(--gold); margin-top: 0; }
  h3 { color: var(--gold); font-size: 18px; margin: 22px 0 6px; }
  .updated { color: var(--sub); font-size: 15px; }
  ul { padding-inline-start: 22px; }
  footer { text-align: center; color: var(--sub); font-size: 14px; }
  a { color: var(--gold); }
</style>
</head>
<body>
<main>
  <header>
    <h1>مسرى المسلم</h1>
    <p>Masra Al-Muslim</p>
  </header>
  <nav><a href="#privacy">سياسة الخصوصية</a> • <a href="#terms">بنود الاستخدام</a></nav>
  <section id="privacy">
    <h2>سياسة الخصوصية</h2>
${privacy}
  </section>
  <section id="terms">
    <h2>بنود الاستخدام</h2>
${terms}
  </section>
  <footer>
    للتواصل: <a href="mailto:masra.al.rasul.app@gmail.com">masra.al.rasul.app@gmail.com</a><br>
    © ${new Date().getFullYear()} Mohamad Jammal
  </footer>
</main>
</body>
</html>
`;

const outDir = path.join(ROOT, 'docs');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'privacy-policy.html'), page, 'utf8');
// صفحة رئيسية بسيطة بتحوّل لسياسة الخصوصية (رابط أقصر للمتاجر)
fs.writeFileSync(
  path.join(outDir, 'index.html'),
  '<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=privacy-policy.html"><title>مسرى المسلم</title><a href="privacy-policy.html">سياسة الخصوصية</a>\n',
  'utf8'
);
console.log('تم: docs/privacy-policy.html و docs/index.html');
