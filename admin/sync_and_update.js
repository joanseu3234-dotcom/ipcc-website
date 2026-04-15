/**
 * sync_and_update.js
 * 1. 更新 style.css — 讓 .case-logo / .news-card-img / .news-full-img 支援 <img>
 * 2. 在 cases.html / cases-training.html / cases-gov.html 加入動態載入腳本
 * 3. 同步 IPCCOWB → IPCC（排除 admin/）
 */
const fs   = require('fs');
const path = require('path');

const SRC  = 'C:/Users/Joan/Desktop/IPCCOWB';
const DEST = 'C:/Users/Joan/Desktop/IPCC';

// ── 工具 ─────────────────────────────────────────
function readFile(p)      { return fs.readFileSync(p, 'utf8'); }
function writeFile(p, c)  { fs.writeFileSync(p, c, 'utf8'); console.log('✓ wrote', path.basename(p)); }

// ─────────────────────────────────────────────────
// 1. style.css — 加入圖片支援規則
// ─────────────────────────────────────────────────
let css = readFile(SRC + '/style.css');

const IMG_CSS = `
/* ━━━━━━━━━━━━━━━━━━━━━
   圖片容器支援（img 取代 emoji）
━━━━━━━━━━━━━━━━━━━━━ */
/* 首頁 / 消息列表 卡片圖 */
.news-card-img { overflow: hidden; }
.news-card-img img { width:100%; height:100%; object-fit:cover; display:block; }

/* 消息詳細頁左側圖 */
.news-full-img { overflow: hidden; padding: 0; }
.news-full-img img { width:100%; height:100%; object-fit:cover; display:block; border-radius: var(--radius); }

/* 成功案例 logo 區 */
.case-logo { overflow: hidden; flex-shrink: 0; }
.case-logo img { width:100%; height:100%; object-fit:cover; display:block; border-radius: 10px; }
`;

if (!css.includes('圖片容器支援')) {
  // 在檔案末尾 (最後一個 @media 之後) 加入
  css = css.trimEnd() + '\n' + IMG_CSS + '\n';
  writeFile(SRC + '/style.css', css);
} else {
  console.log('~ style.css 圖片規則已存在，略過');
}

// ─────────────────────────────────────────────────
// 2. 動態案例載入腳本 helper
// ─────────────────────────────────────────────────
function makeCasesScript(caseType) {
  return `
<script>
/* 動態載入成功案例（後台管理資料） */
(function () {
  try {
    var all = JSON.parse(localStorage.getItem('ipcc_cases') || '[]');
    var items = all.filter(function (c) { return c.published && c.caseType === '${caseType}'; });
    if (items.length === 0) return;
    items.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    var grid = document.querySelector('.case-grid');
    if (!grid) return;
    grid.innerHTML = items.map(function (c) {
      var logoHtml = c.image
        ? '<img src="' + c.image + '" alt="' + (c.client || '') + '">'
        : (c.emoji || '🏆');
      var resultsHtml = (c.results || []).map(function (r) {
        return '<div class="case-result">'
          + '<span class="case-result-num" style="color:var(--orange);">' + (r.value || '') + '</span>'
          + '<div class="case-result-label">' + (r.label || '') + '</div>'
          + '</div>';
      }).join('');
      return '<div class="case-card">'
        + '<div class="case-card-header">'
        + '<div class="case-logo">' + logoHtml + '</div>'
        + '<div>'
        + '<div class="case-category">' + (c.category || '') + '</div>'
        + '<div class="case-client">' + (c.client || '') + '</div>'
        + '</div></div>'
        + '<div class="case-card-body">'
        + (c.challenge ? '<div class="case-challenge-label">面臨挑戰</div><p>' + c.challenge + '</p>' : '')
        + (c.solution
            ? '<div style="margin-bottom:16px;font-size:0.82rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;">我們的解決方案</div><p>' + c.solution + '</p>'
            : '')
        + (resultsHtml ? '<div class="case-results">' + resultsHtml + '</div>' : '')
        + '</div></div>';
    }).join('');
  } catch (e) { /* 保留靜態內容 */ }
})();
</script>`;
}

// ─────────────────────────────────────────────────
// 3. 更新三個案例頁面
// ─────────────────────────────────────────────────
[
  { file: 'cases.html',          type: 'outsource' },
  { file: 'cases-training.html', type: 'training'  },
  { file: 'cases-gov.html',      type: 'it'        },
].forEach(function ({ file, type }) {
  let html = readFile(SRC + '/' + file);
  const marker = '/* DYNAMIC_CASES_' + type.toUpperCase() + ' */';
  if (html.includes(marker)) {
    console.log('~ ' + file + ' 動態腳本已存在，略過');
    return;
  }
  const script = makeCasesScript(type).replace('(function ()', '/* ' + marker + ' */\n(function ()');
  // 插入在 </body> 之前
  html = html.replace('</body>', script + '\n</body>');
  writeFile(SRC + '/' + file, html);
});

// ─────────────────────────────────────────────────
// 4. 確認 news 頁面已有動態腳本（補齊 news-media / news-event）
//    這兩頁的靜態圖也加上 CSS class 讓 img 可填滿
// ─────────────────────────────────────────────────
['news-media.html', 'news-event.html'].forEach(function (file) {
  let html = readFile(SRC + '/' + file);
  // 靜態卡片的 news-full-img 已是 div+emoji — CSS 已更新，不需再改 HTML
  // 確認動態腳本已存在
  if (!html.includes('ipcc_news')) {
    console.warn('⚠ ' + file + ' 缺少動態腳本，請手動確認');
  } else {
    console.log('~ ' + file + ' 動態腳本已存在 ✓');
  }
});

// ─────────────────────────────────────────────────
// 5. 同步 IPCCOWB → IPCC（HTML + CSS，排除 admin/）
// ─────────────────────────────────────────────────
const SKIP = new Set(['admin', 'node_modules', '.git', 'sync-to-ipccowb.bat', 'claude官網code內容1.xlsx', 'excel_content.txt', 'CLAUDE.md']);
const EXT  = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico']);

function syncDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  entries.forEach(function (e) {
    if (SKIP.has(e.name)) return;
    const sp = src + '/' + e.name;
    const dp = dest + '/' + e.name;
    if (e.isDirectory()) {
      if (!fs.existsSync(dp)) fs.mkdirSync(dp, { recursive: true });
      syncDir(sp, dp);
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (!EXT.has(ext)) return;
      fs.copyFileSync(sp, dp);
      console.log('  sync', e.name);
    }
  });
}

console.log('\n── 同步 IPCCOWB → IPCC ──');
syncDir(SRC, DEST);
console.log('\n✅ 全部完成！');
