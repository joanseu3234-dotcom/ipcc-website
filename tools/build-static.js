// 部署建置：依 content-data.js 預先產生每個專案服務的靜態頁、sitemap.xml、llms.txt
// Vercel 每次部署（含後台「發布上線」）都會自動執行：npm run build
// 本機測試：node tools/build-static.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const Story = require(path.join(ROOT, 'service-story.js'));
const SITE = Story.SITE;
const esc = Story.esc;
const arr = Story.arr;

global.localStorage = { getItem: () => null, setItem() {} };
global.window = {};
new Function('window', 'localStorage', fs.readFileSync(path.join(ROOT, 'content-data.js'), 'utf8'))(global.window, global.localStorage);
const d = window.IPCC_CONTENT_DATA;

const all = arr(d.ipcc_services);
const services = all.filter((s) => s.published && s.slug && /^[a-z0-9-]+$/.test(s.slug)).sort((a, b) => (a.order || 0) - (b.order || 0));
const insights = arr(d.ipcc_insights).filter((a) => a.published && a.slug);

const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const storyShell = read('service-story.html');
const detailShell = read('service-detail.html');
const footerList = services.map((s) => `          <li><a href="/services/${esc(s.slug)}">${esc(s.title)}</a></li>`).join('\n');

function fillFooter(html) {
  return html.replace(/(<ul id="footerSvcList">)(<!--ST:FOOTER-->)?[\s\S]*?(<\/ul>)/, `$1\n${footerList}\n        $3`);
}

function buildStory(svc) {
  const out = Story.render(svc, all);
  let h = storyShell
    .replace(/<!--ST:HEAD-->[\s\S]*?<!--\/ST:HEAD-->/, Story.headTags(svc))
    .replace('<!--ST:ATTR-->', ` data-prerendered="1" style="${out.style}"`)
    .replace('<!--ST:MAIN-->', out.html);
  return fillFooter(h);
}

// 標準版型：沿用 service-detail.html，把 SEO 標籤與主要文字直接寫進 HTML（JS 執行後仍會照常渲染）
function buildStandard(svc) {
  let h = detailShell;
  const head = Story.headTags(svc)
    .replace('<title>', '<title id="pageTitle">')
    .replace('<meta name="description"', '<meta name="description" id="pageDesc"');
  h = h.replace(/<title id="pageTitle">[\s\S]*?<\/title>\s*<meta name="description" id="pageDesc"[^>]*>/, head.trim());
  const set = (id, inner) => { h = h.replace(new RegExp(`(id="${id}"[^>]*>)(</)`), `$1${inner}$2`); };
  const show = (id) => { h = h.replace(new RegExp(`id="${id}" style="display:none;"`), `id="${id}"`); };
  set('heroBreadcrumb', esc(svc.title));
  set('heroNum', esc(svc.num));
  set('heroIcon', esc(svc.icon));
  set('heroTitle', esc(svc.hero_title || svc.title));
  set('heroSub', esc(svc.hero_subtitle || svc.desc));
  show('svcHero');
  if (svc.content) {
    set('contentHeading', esc(svc.title));
    set('contentText', esc(svc.content).replace(/\n/g, '<br>'));
    show('svcContentSection');
  }
  const faq = arr(svc.faq);
  if (faq.length) {
    set('faqList', faq.map((f, i) => `<div class="faq-item" id="faq${i}"><button class="faq-q" onclick="toggleFaq(${i})">${esc(f.q)}</button><div class="faq-a"><div class="faq-a-inner">${esc(f.a)}</div></div></div>`).join(''));
    show('faqSection');
  }
  return fillFooter(h);
}

function buildCustom(svc) {
  const p = String(svc.custom_path || '').replace(/^\/+|\/+$/g, '');
  if (!p || p.includes('..')) return null;
  const f = path.join(ROOT, p, 'index.html');
  if (!fs.existsSync(f)) { console.warn(`⚠ ${svc.slug}：找不到自訂頁面 ${p}/index.html，改用標準版型`); return null; }
  return fs.readFileSync(f, 'utf8');
}

const outDir = path.join(ROOT, 'services');
fs.rmSync(outDir, { recursive: true, force: true });
const summary = [];
for (const svc of services) {
  let html = null, mode = svc.layout || 'standard';
  if (mode === 'custom') html = buildCustom(svc);
  if (!html && mode === 'story') html = buildStory(svc);
  if (!html) { mode = mode === 'custom' ? 'standard(備援)' : 'standard'; html = buildStandard(svc); }
  fs.mkdirSync(path.join(outDir, svc.slug), { recursive: true });
  fs.writeFileSync(path.join(outDir, svc.slug, 'index.html'), html);
  summary.push(`${svc.slug}:${mode}`);
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const pages = [
  ['/', '1.0', 'weekly'], ['/services.html', '0.9', 'weekly'],
  ...services.map((s) => ['/services/' + s.slug, '0.9', 'monthly']),
  ['/about.html', '0.7', 'monthly'], ['/about-vision.html', '0.5', 'yearly'], ['/about-security.html', '0.5', 'yearly'],
  ['/about-awards.html', '0.5', 'monthly'], ['/about-future.html', '0.5', 'yearly'],
  ['/cases.html', '0.7', 'monthly'], ['/cases-cx.html', '0.6', 'monthly'], ['/cases-training.html', '0.6', 'monthly'],
  ['/news.html', '0.6', 'weekly'], ['/insights.html', '0.7', 'weekly'],
  ...insights.map((a) => ['/insights/' + a.slug, '0.6', 'monthly']),
  ['/contact.html', '0.6', 'yearly'],
];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + pages.map(([p, pr, cf]) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n') + '\n</urlset>\n');

// llms.txt（給 ChatGPT、Claude、Perplexity 等 AI 搜尋讀的網站摘要）
const one = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const svcBlock = services.map((s) => {
  const faq = arr(s.faq).filter((f) => f && f.q && f.a).slice(0, 4).map((f) => `  - 問：${one(f.q)} 答：${one(f.a)}`).join('\n');
  return `### [${s.title}](${SITE}/services/${s.slug})\n\n${one(s.seo_desc || s.desc)}\n${arr(s.tags).length ? `\n關鍵字：${arr(s.tags).join('、')}\n` : ''}${faq ? `\n${faq}\n` : ''}`;
}).join('\n');
fs.writeFileSync(path.join(ROOT, 'llms.txt'), `# IPCC 東州集團（東州互聯網實業／顯榮國際）

> 東州集團深耕台灣客服產業近三十年，提供智能客服中心營運（客服委外）、多渠道顧客互動、AI Agent 建置與維運、AI 數據標註、客服數據分析，以及 AI 教育訓練與 AI 情境對練服務。據點：新北三重、台中。免付費專線 0800-666-080。

## 專案服務

${svcBlock}
## 產業洞察

${insights.map((a) => `- [${one(a.title)}](${SITE}/insights/${a.slug})`).join('\n')}

## 聯絡

- 官網留言：${SITE}/contact.html
- LINE 官方帳號：https://lin.ee/rp9TNMU
- 免付費專線：0800-666-080
`);

console.log(`✓ 服務頁 ${services.length} 個（${summary.join('、')}）；sitemap ${pages.length} 個網址；llms.txt 已更新`);
