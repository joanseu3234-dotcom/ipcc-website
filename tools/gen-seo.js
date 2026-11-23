// 產生 sitemap.xml 與 llms.txt（依 content-data.js 的服務與洞察文章）
// 用法：node tools/gen-seo.js   （後台發布新服務／文章後重跑一次並 commit）
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.phonecenter.com.tw';

global.localStorage = { getItem: () => null, setItem() {} };
global.window = {};
eval(fs.readFileSync(path.join(ROOT, 'content-data.js'), 'utf8'));
const d = window.IPCC_CONTENT_DATA;
const asArr = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? (() => { try { return JSON.parse(v); } catch (e) { return []; } })() : []);

const services = asArr(d.ipcc_services).filter((s) => s.published && s.slug).sort((a, b) => (a.order || 0) - (b.order || 0));
const insights = asArr(d.ipcc_insights).filter((a) => a.published && a.slug);
const today = new Date().toISOString().slice(0, 10);

const pages = [
  ['/', '1.0', 'weekly'],
  ['/services.html', '0.9', 'weekly'],
  ...services.map((s) => ['/services/' + s.slug, '0.9', 'monthly']),
  ['/about.html', '0.7', 'monthly'],
  ['/about-vision.html', '0.5', 'yearly'],
  ['/about-security.html', '0.5', 'yearly'],
  ['/about-awards.html', '0.5', 'monthly'],
  ['/about-future.html', '0.5', 'yearly'],
  ['/cases.html', '0.7', 'monthly'],
  ['/cases-cx.html', '0.6', 'monthly'],
  ['/cases-training.html', '0.6', 'monthly'],
  ['/news.html', '0.6', 'weekly'],
  ['/insights.html', '0.7', 'weekly'],
  ...insights.map((a) => ['/insights/' + a.slug, '0.6', 'monthly']),
  ['/contact.html', '0.6', 'yearly'],
];
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + pages.map(([p, pr, cf]) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n')
  + '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);

const llms = `# IPCC 東州集團（顯榮國際）

> 東州集團深耕台灣客服產業近三十年，提供智能客服中心營運（客服委外）、多渠道顧客互動、AI Agent 建置與維運、AI 數據標註、客服數據分析，以及 AI 教育訓練與 AI 情境對練服務。免付費專線 0800-666-080。

## 專案服務

${services.map((s) => `- [${s.title}](${SITE}/services/${s.slug})：${s.desc || ''}`).join('\n')}

## AI 教育訓練重點

- 由 AI 扮演真實客戶，依考核重點即時提醒與評分，讓客服專員上線前先練過。
- 將品質稽核發現的問題轉成練習情境：稽核發現問題 → 轉成練習情境 → 專員先練 → 上線服務。
- 提供客服培訓課程製作、新人訓練與 AI 情境對練，開放免費試用（洽 0800-666-080 或官網留言）。
- 介紹頁：${SITE}/services/ai-training

## 產業洞察

${insights.map((a) => `- [${a.title}](${SITE}/insights/${a.slug})`).join('\n')}

## 聯絡

- 官網留言：${SITE}/contact.html
- LINE 官方帳號：https://lin.ee/rp9TNMU
- 免付費專線：0800-666-080
`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms);
console.log(`sitemap.xml：${pages.length} 個網址；llms.txt：${services.length} 項服務、${insights.length} 篇洞察`);
