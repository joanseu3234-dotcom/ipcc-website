// IPCC Admin Panel - Shared Utilities
// =====================================

// --- Auth ---
function requireLogin() {
  if (!sessionStorage.getItem("ipcc_admin_logged")) {
    window.location.href = "index.html";
  }
}

function logout() {
  sessionStorage.removeItem("ipcc_admin_logged");
  window.location.href = "index.html";
}

// --- Sidebar ---
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  if (sidebar) sidebar.classList.toggle("open");
  if (overlay) overlay.classList.toggle("open");
}

// --- News CRUD ---
function getNews() {
  try {
    return JSON.parse(localStorage.getItem("ipcc_news") || "[]");
  } catch (e) {
    return [];
  }
}

function saveNews(arr) {
  localStorage.setItem("ipcc_news", JSON.stringify(arr));
}

// --- Cases CRUD ---
function getCases() {
  try {
    return JSON.parse(localStorage.getItem("ipcc_cases") || "[]");
  } catch (e) {
    return [];
  }
}

function saveCases(arr) {
  localStorage.setItem("ipcc_cases", JSON.stringify(arr));
}

// --- Utilities ---
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(ts) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return y + "." + m;
}
// --- Services CRUD ---
function getServices() {
  try {
    const s = JSON.parse(localStorage.getItem('ipcc_services') || 'null');
    if (s) return s;
  } catch(e) {}
  // Default 3 services
  return [
    {id:'svc-1',num:'Service 01',icon:'📞',title:'客服委外',desc:'整合多渠道客服，建立穩定高效的服務體系。從電話、文字到社群平台，一站式外包解決方案，讓您專注核心業務。',tags:['電話','文字','電商','社群'],link:'services.html',order:0,published:true},
    {id:'svc-2',num:'Service 02',icon:'🎓',title:'客服服務訓練',desc:'打造專業客服團隊，提升服務品質與應對能力。從接待禮儀到危機處理，建立一致且高品質的服務標準。',tags:['接待禮儀','客訴處理','客製化課程'],link:'services-training.html',order:1,published:true},
    {id:'svc-3',num:'Service 03',icon:'💻',title:'資訊服務',desc:'提供客服建置、委外與技術人力整合方案。結合專業技術支援，協助政府單位穩定運作與優化服務品質。',tags:['客服建置','專案委外','技術支援'],link:'services-it.html',order:2,published:true}
  ];
}
function saveServices(arr) { localStorage.setItem('ipcc_services', JSON.stringify(arr)); }

// --- About CRUD ---
function getAboutData(key) {
  try { return JSON.parse(localStorage.getItem('ipcc_about_' + key) || 'null'); } catch(e) { return null; }
}
function saveAboutData(key, data) { localStorage.setItem('ipcc_about_' + key, JSON.stringify(data)); }

// --- Home CRUD ---
function getHomeData() {
  try {
    const h = JSON.parse(localStorage.getItem('ipcc_home') || 'null');
    if (h) return h;
  } catch(e) {}
  return {
    heroBadge: '東州互聯網 ✕ 顯榮國際 — 深耕台灣客服產業三十年',
    heroTitle1: '客戶每一則訊息',
    heroTitle2: '都值得被認真對待',
    heroSubtitle: '我們相信，卓越的服務不只是回答問題——\n而是在每一次對話中，為品牌建立信任、為企業創造價值。',
    featuredNews: {news:[], award:[], podcast:[]}
  };
}
function saveHomeData(data) { localStorage.setItem('ipcc_home', JSON.stringify(data)); }


// ===================================================
// USERS & PERMISSIONS SYSTEM
// ===================================================
const SUPER_ADMIN_ID = 'admin-root';

function getUsers() {
  try {
    const u = JSON.parse(localStorage.getItem('ipcc_users') || 'null');
    if (u && u.length > 0) return u;
  } catch(e) {}
  // 使用已部署的用戶設定（跨電腦共用），優先於預設值
  if (window.IPCC_USERS_CONFIG && window.IPCC_USERS_CONFIG.length > 0) {
    return window.IPCC_USERS_CONFIG;
  }
  // 預設超級管理員
  return [{
    id: SUPER_ADMIN_ID,
    username: 'admin',
    password: 'ipcc2024',
    displayName: '超級管理員',
    isSuper: true,
    permissions: { home:true, about:true, services:true, news:true, cases:true, settings:true, users:true, contacts:true },
    createdAt: Date.now(),
    lastLogin: null
  }];
}

function saveUsers(arr) {
  localStorage.setItem('ipcc_users', JSON.stringify(arr));
}

function getCurrentUser() {
  try {
    const uid = sessionStorage.getItem('ipcc_current_uid');
    if (!uid) return null;
    return getUsers().find(function(u){ return u.id === uid; }) || null;
  } catch(e) { return null; }
}

function hasPermission(perm, user) {
  const u = user || getCurrentUser();
  if (!u) return false;
  if (u.isSuper) return true;
  return !!(u.permissions && u.permissions[perm]);
}

// 頁面 → 所需權限對應表
var PAGE_PERMS = {
  'home-manage.html': 'home',
  'about-manage.html': 'about',
  'services-manage.html': 'services',
  'news-manage.html': 'news',
  'cases-manage.html': 'cases',
  'settings.html': 'settings',
  'users-manage.html': 'users'
};

function initAdminUI() {
  var user = getCurrentUser();
  if (!user) return;

  // 更新頂欄顯示名稱
  var userEl = document.querySelector('.topbar-user');
  if (userEl) userEl.textContent = (user.displayName || user.username);

  // 根據權限顯示/隱藏側欄項目
  document.querySelectorAll('.nav-item[data-perm]').forEach(function(el) {
    var perm = el.getAttribute('data-perm');
    el.style.display = hasPermission(perm, user) ? '' : 'none';
  });

  // 檢查目前頁面的存取權限
  var page = window.location.pathname.split('/').pop() || 'dashboard.html';
  var requiredPerm = PAGE_PERMS[page];
  if (requiredPerm && !hasPermission(requiredPerm, user)) {
    alert('您沒有存取此頁面的權限');
    window.location.href = 'dashboard.html';
  }
}

// 覆寫 logout，同時清除目前使用者
var _origLogout = logout;
logout = function() {
  sessionStorage.removeItem('ipcc_current_uid');
  _origLogout();
};


// --- Contacts ---
function getContacts() {
  try { return JSON.parse(localStorage.getItem('ipcc_contacts') || '[]'); } catch(e) { return []; }
}
function saveContacts(arr) { localStorage.setItem('ipcc_contacts', JSON.stringify(arr)); }

// 加入 contacts 到權限對照
if (typeof PAGE_PERMS !== 'undefined') { PAGE_PERMS['contacts-manage.html'] = 'contacts'; }


// ===================================================
// 發布上線 — 推送 content-data.js 到 GitHub，觸發 Zeabur 重新部署
// ===================================================

// 產生 content-data.js 的完整內容
function generateContentData() {
  var ts = Date.now();
  var published = new Date().toLocaleString('zh-TW', {timeZone:'Asia/Taipei', hour12:false});
  var data = { __ts: ts, __published: published };
  // 收集 localStorage 中所有 ipcc_ 內容（排除帳號與時間戳）
  Object.keys(localStorage).forEach(function(key) {
    if (key.indexOf('ipcc_') === 0 && key !== 'ipcc_users' && key !== 'ipcc_deploy_ts') {
      try { data[key] = JSON.parse(localStorage.getItem(key)); } catch(e) {}
    }
  });
  // content-data.js 本體：儲存資料 + 自動同步邏輯
  return '// IPCC 內容資料 — 由後台管理系統自動產生，請勿手動修改\n'
    + '// 最後發布：' + published + '\n\n'
    + 'window.IPCC_CONTENT_DATA = ' + JSON.stringify(data, null, 2) + ';\n\n'
    + '// 自動將已部署的內容同步到此瀏覽器的 localStorage\n'
    + '(function(){\n'
    + '  if (!window.IPCC_CONTENT_DATA) return;\n'
    + '  var deployTs = window.IPCC_CONTENT_DATA.__ts || 0;\n'
    + '  var localTs = parseInt(localStorage.getItem(\'ipcc_deploy_ts\') || \'0\');\n'
    + '  if (deployTs > localTs) {\n'
    + '    Object.keys(window.IPCC_CONTENT_DATA).forEach(function(key) {\n'
    + '      if (key.indexOf(\'ipcc_\') === 0) {\n'
    + '        localStorage.setItem(key, JSON.stringify(window.IPCC_CONTENT_DATA[key]));\n'
    + '      }\n'
    + '    });\n'
    + '    localStorage.setItem(\'ipcc_deploy_ts\', String(deployTs));\n'
    + '  }\n'
    + '})();\n';
}

// 寫入 content-data.js 到本機資料夾
function makeUsersConfigContent(users) {
  var frontendUrl = window.IPCC_FRONTEND_URL || 'https://ipcc.zeabur.app';
  // 嵌入部署設定（非敏感資訊），讓任何電腦打開後台都能自動讀到
  var zeaburHook = localStorage.getItem('ipcc_zeabur_hook') || (window.IPCC_ZEABUR_HOOK || '');
  var ghRepo     = localStorage.getItem('ipcc_github_repo')   || (window.IPCC_GITHUB_REPO || '');
  var ghBranch   = localStorage.getItem('ipcc_github_branch') || (window.IPCC_GITHUB_BRANCH || 'main');
  var lines = [
    '// IPCC 後台用戶設定',
    '// 此檔案由後台帳號管理自動產生，請勿手動修改',
    '',
    "window.IPCC_FRONTEND_URL = '" + frontendUrl + "';"
  ];
  if (ghRepo)     lines.push("window.IPCC_GITHUB_REPO   = '" + ghRepo + "';");
  if (ghBranch)   lines.push("window.IPCC_GITHUB_BRANCH = '" + ghBranch + "';");
  if (zeaburHook) lines.push("window.IPCC_ZEABUR_HOOK   = '" + zeaburHook.replace(/'/g,"\\'") + "';");
  lines.push('');
  lines.push('window.IPCC_USERS_CONFIG = ' + JSON.stringify(users, null, 2) + ';');
  return lines.join('\n') + '\n';
}

// 主發布函式（點「🚀 發布上線」時呼叫）
async function publishToLive() {
  var token  = localStorage.getItem('ipcc_github_token');
  var repo   = localStorage.getItem('ipcc_github_repo') || (window.IPCC_GITHUB_REPO || '');

  // GitHub 未設定 → 引導去設定頁
  if (!token || !repo) {
    if (confirm('尚未設定一鍵部署。\n\n點「確定」前往「系統設定」完成設定\n（只需設定一次，之後每台電腦都能直接按火箭發布）')) {
      window.location.href = 'settings.html';
    }
    return;
  }

  var btn = document.getElementById('ipcc-publish-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ 發布中...'; }

  var contentJs = generateContentData();
  showPublishToast('⏳ 正在推送到 GitHub...', 'pending', true);

  var result = await _tryGitHubDeploy(contentJs);

  if (btn) { btn.disabled = false; _updatePublishBtn(); }

  if (result === true) {
    var ts = new Date().toLocaleString('zh-TW', {timeZone:'Asia/Taipei', hour12:false});
    showPublishToast('✅ 發布完成！\nGitHub 已更新，官網約 2 分鐘後自動生效\n時間：' + ts, 'success');
  } else if (result === false) {
    showPublishToast('❌ GitHub 推送失敗\n請到「系統設定」確認 Token 是否有效（可點「測試 GitHub 連線」）', '');
  } else {
    showPublishToast('⚠️ GitHub 設定不完整，請到「系統設定」補填 Repository 或 Token', '');
  }
}

// ── GitHub API：推檔案到 GitHub ──
async function _ghPushFile(repo, branch, token, filePath, fileContent) {
  var apiUrl = 'https://api.github.com/repos/' + repo + '/contents/' + filePath;
  var headers = {
    'Authorization': 'token ' + token,
    'Accept':        'application/vnd.github.v3+json',
    'Content-Type':  'application/json'
  };
  var sha = null;
  try {
    var headRes = await fetch(apiUrl + '?ref=' + branch, { headers: headers });
    if (headRes.ok) { var info = await headRes.json(); sha = info.sha; }
  } catch(e) {}
  var b64 = btoa(unescape(encodeURIComponent(fileContent)));
  var ts  = new Date().toISOString().slice(0, 16).replace('T', ' ');
  var body = { message: 'content: update ' + filePath + ' via admin ' + ts, content: b64, branch: branch };
  if (sha) body.sha = sha;
  var res = await fetch(apiUrl, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
  return res.ok;
}

// ── Zeabur Deploy Hook：推送後觸發重新部署 ──
// 回傳：true=成功，false=失敗，null=未設定
async function _triggerZeaburDeploy() {
  var hookUrl = localStorage.getItem('ipcc_zeabur_hook') || (window.IPCC_ZEABUR_HOOK || '');
  if (!hookUrl) return null;
  try {
    var res = await fetch(hookUrl, { method: 'POST' });
    // Zeabur hook 成功通常回 200/204
    return res.ok || res.status === 200 || res.status === 204;
  } catch(e) {
    return false;
  }
}

// ── 主流程：推 content-data.js + users-config.js 到 GitHub，再觸發 Zeabur ──
// 回傳：true=成功，false=失敗，null=未設定（GitHub token/repo 未填）
async function _tryGitHubDeploy(content) {
  var token  = localStorage.getItem('ipcc_github_token');
  var repo   = localStorage.getItem('ipcc_github_repo')   || (window.IPCC_GITHUB_REPO || '');
  var branch = localStorage.getItem('ipcc_github_branch') || (window.IPCC_GITHUB_BRANCH || 'main');
  if (!token || !repo) return null;

  try {
    // 1. 推 content-data.js
    var ok = await _ghPushFile(repo, branch, token, 'content-data.js', content);
    if (!ok) return false;

    // 2. 同時推 admin/users-config.js（嵌入 hook URL 與 repo，讓其他電腦自動讀到）
    try {
      var usersJs = makeUsersConfigContent(getUsers());
      await _ghPushFile(repo, branch, token, 'admin/users-config.js', usersJs);
    } catch(e) { /* 非致命，繼續 */ }

    // 3. 觸發 Zeabur 重新部署
    var zeaburResult = await _triggerZeaburDeploy();
    // zeaburResult = null 表示未設定 hook，不影響成功狀態

    return true;
  } catch(e) {
    return false;
  }
}

function _updatePublishBtn() {
  var btn = document.getElementById('ipcc-publish-btn');
  if (!btn) return;
  var hasToken = !!localStorage.getItem('ipcc_github_token');
  var hasRepo  = !!(localStorage.getItem('ipcc_github_repo') || window.IPCC_GITHUB_REPO);
  var hasHook  = !!(localStorage.getItem('ipcc_zeabur_hook') || window.IPCC_ZEABUR_HOOK);

  if (hasToken && hasRepo) {
    btn.textContent = '🚀 發布上線';
    btn.style.background = 'linear-gradient(135deg,#CE0000,#8B0000)';
    btn.title = '推送內容到 GitHub，約 2 分鐘後官網自動更新';
  } else {
    btn.textContent = '⚙️ 設定一鍵部署';
    btn.style.background = 'linear-gradient(135deg,#D97706,#92400E)';
    btn.title = '點此進入系統設定，完成 GitHub 設定後即可一鍵發布';
  }
}

function showPublishToast(msg, type, persistent) {
  var el = document.getElementById('ipcc-publish-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ipcc-publish-toast';
    el.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);'
      + 'background:#1E2A5E;color:#fff;padding:14px 24px;border-radius:12px;'
      + 'font-size:0.88rem;max-width:520px;text-align:center;z-index:99999;'
      + 'box-shadow:0 4px 24px rgba(0,0,0,0.25);line-height:1.7;white-space:pre-line;';
    document.body.appendChild(el);
  }
  if (type === 'success') el.style.background = '#15803D';
  else if (type === 'pending') el.style.background = '#B45309';
  else el.style.background = '#1E2A5E';
  el.textContent = msg;
  el.style.display = 'block'; el.style.opacity = '1';
  clearTimeout(el._t);
  if (!persistent) {
    el._t = setTimeout(function(){ el.style.opacity='0'; setTimeout(function(){ el.style.display='none'; },400); }, 8000);
  }
}

// 偵測是否從本機 file:// 開啟 → 顯示警告橫幅
(function checkFileProtocol() {
  if (window.location.protocol !== 'file:') return;
  function injectBanner() {
    if (document.getElementById('ipcc-file-warning')) return;
    var bar = document.createElement('div');
    bar.id = 'ipcc-file-warning';
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;'
      + 'background:#DC2626;color:#fff;padding:10px 20px;'
      + 'font-size:0.85rem;font-weight:600;text-align:center;line-height:1.5;'
      + 'box-shadow:0 2px 8px rgba(0,0,0,0.4);';
    bar.innerHTML = '⚠️ 你正在從本機直接開啟後台，儲存的資料<b>不會同步</b>到官網。'
      + '　請改由 <a href="https://ipcc.zeabur.app/admin/" target="_blank"'
      + ' style="color:#FDE68A;text-decoration:underline;">https://ipcc.zeabur.app/admin/</a> 開啟後台。';
    document.body.insertBefore(bar, document.body.firstChild);
    // 推高 admin-layout 以免被遮住
    var layout = document.querySelector('.admin-layout');
    if (layout) layout.style.marginTop = '44px';
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBanner);
  } else {
    injectBanner();
  }
})();

// 自動在 sidebar footer 注入「發布上線」按鈕
(function injectPublishBtn() {
  function doInject() {
    var footer = document.querySelector('.sidebar-footer');
    if (!footer || document.getElementById('ipcc-publish-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'ipcc-publish-btn';
    btn.style.cssText = 'width:100%;padding:10px;background:linear-gradient(135deg,#D97706,#92400E);'
      + 'color:#fff;border:none;border-radius:8px;font-size:0.88rem;font-weight:700;'
      + 'cursor:pointer;margin-top:10px;font-family:inherit;transition:opacity 0.2s;';
    btn.onmouseover = function(){ this.style.opacity='0.85'; };
    btn.onmouseout  = function(){ this.style.opacity='1'; };
    btn.onclick = function(){ publishToLive(); };
    footer.appendChild(btn);
    // 根據 GitHub 設定狀態更新按鈕外觀
    _updatePublishBtn();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doInject);
  } else {
    doInject();
  }
})();
