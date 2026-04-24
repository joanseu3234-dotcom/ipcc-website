// IPCC Admin Panel - Shared Utilities
// =====================================

// 若 localStorage 沒有文章資料或 Token，自動從 content-data.js 還原
(function() {
  var needLoad = !localStorage.getItem('ipcc_news') && !localStorage.getItem('ipcc_cases');
  var needToken = !localStorage.getItem('ipcc_github_token');
  if (needLoad || needToken) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '../content-data.js', false); // 同步載入
      xhr.send();
      if (xhr.status === 200) {
        new Function(xhr.responseText)();
      }
    } catch(e) {}
  }
})();

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

// --- Contact Config (0800 / LINE / 1111) ---
function getContactConfig() {
  // 優先讀 localStorage（本機瀏覽器已儲存的值）
  try {
    var c = JSON.parse(localStorage.getItem('ipcc_contact_config') || 'null');
    if (c) return c;
  } catch(e) {}
  // 次優先讀靜態部署檔 contact-config.js（跨瀏覽器、跨裝置）
  if (window.IPCC_CONTACT_CONFIG) return window.IPCC_CONTACT_CONFIG;
  return {
    phone0800: '0800-666-080',
    phoneHours: '週一至週五 09:00 - 18:00',
    lineUrl: '',
    lineQrImage: '',
    recruitUrl: 'https://www.1111.com.tw/corp/8563'
  };
}
function saveContactConfig(obj) {
  localStorage.setItem('ipcc_contact_config', JSON.stringify(obj));
  // 同步更新靜態設定檔（需本機 deploy-server.js 運行中）
  fetch('http://localhost:9393/save-contact-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  }).catch(function() {}); // 若 server 未啟動，靜默略過
}

// 加入 contacts / contact-config 到權限對照
if (typeof PAGE_PERMS !== 'undefined') {
  PAGE_PERMS['contacts-manage.html'] = 'contacts';
  PAGE_PERMS['contact-config.html'] = 'settings';
}


// ===================================================
// IndexedDB helpers（共用，供發布與帳號同步使用）
// ===================================================
function _openAdminIDB() {
  return new Promise(function(resolve, reject) {
    var req = indexedDB.open('ipcc_admin_fs', 1);
    req.onupgradeneeded = function(e) { e.target.result.createObjectStore('handles'); };
    req.onsuccess = function(e) { resolve(e.target.result); };
    req.onerror = function() { reject(); };
  });
}
function _idbGet(db, key) {
  return new Promise(function(resolve) {
    var req = db.transaction('handles','readonly').objectStore('handles').get(key);
    req.onsuccess = function() { resolve(req.result||null); };
    req.onerror = function() { resolve(null); };
  });
}
function _idbSet(db, key, val) {
  return new Promise(function(resolve) {
    var tx = db.transaction('handles','readwrite');
    tx.objectStore('handles').put(val, key);
    tx.oncomplete = resolve; tx.onerror = resolve;
  });
}

// ===================================================
// 發布上線 — 真正將內容寫入 content-data.js
// ===================================================
// 產生 content-data.js 的完整內容
function generateContentData() {
  var ts = Date.now();
  var published = new Date().toLocaleString('zh-TW', {timeZone:'Asia/Taipei', hour12:false});
  var data = { __ts: ts, __published: published };
  // 敏感 key 不納入（避免推送到 GitHub 觸發 Secret Scanning）
  var SKIP = { ipcc_users: 1, ipcc_deploy_ts: 1, ipcc_github_token: 1, ipcc_admin_password: 1, ipcc_admin_username: 1 };
  Object.keys(localStorage).forEach(function(key) {
    if (key.indexOf('ipcc_') === 0 && !SKIP[key]) {
      var raw = localStorage.getItem(key);
      try { data[key] = JSON.parse(raw); } catch(e) { data[key] = raw; }
    }
  });

  return '// IPCC 內容資料 — 由後台管理系統自動產生，請勿手動修改\n'
    + '// 最後發布：' + published + '\n\n'
    + 'window.IPCC_CONTENT_DATA = ' + JSON.stringify(data, null, 2) + ';\n\n'
    + '(function(){\n'
    + '  if (!window.IPCC_CONTENT_DATA) return;\n'
    + '  var deployTs = window.IPCC_CONTENT_DATA.__ts || 0;\n'
    + '  var localTs = parseInt(localStorage.getItem(\'ipcc_deploy_ts\') || \'0\');\n'
    + '  if (deployTs > localTs) {\n'
    + '    Object.keys(window.IPCC_CONTENT_DATA).forEach(function(key) {\n'
    + '      if (key.indexOf(\'ipcc_\') === 0) {\n'
    + '        var v = window.IPCC_CONTENT_DATA[key];\n'
    + '        localStorage.setItem(key, typeof v === "string" ? v : JSON.stringify(v));\n'
    + '      }\n'
    + '    });\n'
    + '    localStorage.setItem(\'ipcc_deploy_ts\', String(deployTs));\n'
    + '  }\n'
    + '})();\n';
}

function makeUsersConfigContent(users) {
  var frontendUrl = window.IPCC_FRONTEND_URL || 'https://ipcc.zeabur.app';
  var repo   = window.IPCC_GITHUB_REPO   || '';
  var branch = window.IPCC_GITHUB_BRANCH || 'main';
  return '// IPCC 後台用戶設定\n// 此檔案由後台帳號管理自動產生，請勿手動修改\n\n'
    + "window.IPCC_FRONTEND_URL  = '" + frontendUrl + "';\n"
    + "window.IPCC_GITHUB_REPO   = '" + repo   + "';\n"
    + "window.IPCC_GITHUB_BRANCH = '" + branch + "';\n\n"
    + 'window.IPCC_USERS_CONFIG = ' + JSON.stringify(users, null, 2) + ';\n';
}

function makeContactConfigContent(cfg) {
  return '// IPCC 聯絡資訊設定（靜態預設值）\n'
    + '// 此檔案由後台「聯絡資訊設定」頁面儲存時自動更新\n\n'
    + 'window.IPCC_CONTACT_CONFIG = ' + JSON.stringify(cfg, null, 2) + ';\n';
}

// ── GitHub API 發布核心 ─────────────────────────────
async function _githubUpdateFile(token, repo, branch, path, content, commitMsg) {
  var apiUrl = 'https://api.github.com/repos/' + repo + '/contents/' + path;
  var headers = {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json'
  };
  // 取得現有檔案的 SHA（更新時需要）
  var sha = null;
  try {
    var r = await fetch(apiUrl + '?ref=' + branch, { headers: headers });
    if (r.ok) { var d = await r.json(); sha = d.sha; }
  } catch(e) {}

  var body = {
    message: commitMsg,
    content: btoa(unescape(encodeURIComponent(content))),
    branch: branch
  };
  if (sha) body.sha = sha;

  var res = await fetch(apiUrl, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    var err = await res.json().catch(function(){ return {}; });
    throw new Error((err.message || res.status) + ' (' + path + ')');
  }
}

// 主發布函式（點「🚀 發布上線」時呼叫）
async function publishToLive() {
  var token  = (window.IPCC_GITHUB_TOKEN || localStorage.getItem('ipcc_github_token') || '').trim();
  var repo   = (window.IPCC_GITHUB_REPO   || '').trim();
  var branch = (window.IPCC_GITHUB_BRANCH || 'main').trim();

  // 尚未設定 Token → 引導到系統設定
  if (!token || !repo) {
    showPublishToast('請先到「⚙️ 系統設定」填入 GitHub Token，才能一鍵發布。', 'warn');
    setTimeout(function(){ location.href = 'settings.html'; }, 2000);
    return;
  }

  showPublishToast('⏳ 正在發布，請稍候...', '');

  var ts = new Date().toLocaleString('zh-TW', {timeZone:'Asia/Taipei', hour12:false});
  var commitMsg = '🔄 後台發布：' + ts;

  try {
    // 1. content-data.js（所有文章/案例/首頁內容）
    await _githubUpdateFile(token, repo, branch, 'content-data.js', generateContentData(), commitMsg);

    // 2. admin/users-config.js（帳號）
    await _githubUpdateFile(token, repo, branch, 'admin/users-config.js', makeUsersConfigContent(getUsers()), commitMsg);

    // 3. contact-config.js（聯絡資訊）
    var contactCfg = getContactConfig();
    await _githubUpdateFile(token, repo, branch, 'contact-config.js', makeContactConfigContent(contactCfg), commitMsg);

    showPublishToast('✅ 發布成功！Zeabur 正在自動部署，約 1-2 分鐘後前台即更新。\n發布時間：' + ts, 'success');
  } catch(e) {
    showPublishToast('❌ 發布失敗：' + e.message + '\n請確認 GitHub Token 是否正確或已過期。', 'error');
  }
}

function _updatePublishBtn() {
  var btn = document.getElementById('ipcc-publish-btn');
  if (!btn) return;
  var token = (window.IPCC_GITHUB_TOKEN || localStorage.getItem('ipcc_github_token') || '').trim();
  if (token) {
    btn.textContent = '🚀 發布上線';
    btn.style.background = 'linear-gradient(135deg,#CE0000,#8B0000)';
    btn.title = '一鍵推送到 GitHub，Zeabur 自動部署';
  } else {
    btn.textContent = '⚙️ 設定後可一鍵發布';
    btn.style.background = 'linear-gradient(135deg,#D97706,#92400E)';
    btn.title = '請先到系統設定填入 GitHub Token';
  }
}

function showPublishToast(msg, type) {
  var el = document.getElementById('ipcc-publish-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ipcc-publish-toast';
    el.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);'
      + 'color:#fff;padding:14px 24px;border-radius:12px;white-space:pre-line;'
      + 'font-size:0.88rem;max-width:520px;text-align:center;z-index:99999;'
      + 'box-shadow:0 4px 24px rgba(0,0,0,0.25);line-height:1.6;';
    document.body.appendChild(el);
  }
  var bg = { success: '#15803D', error: '#B91C1C', warn: '#D97706' };
  el.style.background = bg[type] || '#1E2A5E';
  el.textContent = msg;
  el.style.display = 'block'; el.style.opacity = '1';
  clearTimeout(el._t);
  var delay = (type === 'success' || !type) ? 7000 : 10000;
  el._t = setTimeout(function(){ el.style.opacity='0'; setTimeout(function(){ el.style.display='none'; },400); }, delay);
}

// 自動在 sidebar footer 注入「發布上線」按鈕
(function injectPublishBtn() {
  function doInject() {
    var footer = document.querySelector('.sidebar-footer');
    if (!footer || document.getElementById('ipcc-publish-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'ipcc-publish-btn';
    btn.textContent = '🔗 設定發布資料夾';
    btn.style.cssText = 'width:100%;padding:10px;background:linear-gradient(135deg,#D97706,#92400E);'
      + 'color:#fff;border:none;border-radius:8px;font-size:0.88rem;font-weight:700;'
      + 'cursor:pointer;margin-top:10px;font-family:inherit;transition:opacity 0.2s;';
    btn.onmouseover = function(){ this.style.opacity='0.85'; };
    btn.onmouseout  = function(){ this.style.opacity='1'; };
    btn.onclick = function(){ publishToLive(); };
    footer.appendChild(btn);
    _updatePublishBtn();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doInject);
  } else {
    doInject();
  }
})();
