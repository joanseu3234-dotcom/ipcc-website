// IPCC Admin Panel - Shared Utilities
// =====================================

// 密碼雜湊（SHA-256）— 避免明碼出現在公開的 users-config.js
// 注意：index.html 登入頁未載入 admin.js，內有一份完全相同的實作，修改時請同步兩邊
async function ipccHashPw(username, plain) {
  // 固定 salt（不混入帳號名稱，避免改帳號名後被鎖在外面）
  var msg = 'ipcc-admin::v1::' + String(plain);
  var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  var hex = Array.prototype.map.call(new Uint8Array(buf), function(b){ return ('0' + b.toString(16)).slice(-2); }).join('');
  return 'sha256$' + hex;
}
async function ipccVerifyPw(user, plain) {
  var stored = (user && user.password) || '';
  if (stored.indexOf('sha256$') === 0) {
    return (await ipccHashPw(user.username, plain)) === stored;
  }
  return stored === plain; // 舊明碼相容（升級期間仍可登入）
}
// 一次性遷移：把 localStorage 裡殘留的明碼密碼轉成雜湊，
// 確保下次「發布上線」不會又把明碼寫回公開的 users-config.js
(async function _migratePlaintextPasswords() {
  try {
    var raw = localStorage.getItem('ipcc_users');
    if (!raw) return;
    var users = JSON.parse(raw);
    if (!Array.isArray(users)) return;
    var changed = false;
    for (var i = 0; i < users.length; i++) {
      var pw = users[i] && users[i].password;
      if (pw && String(pw).indexOf('sha256$') !== 0) {
        users[i].password = await ipccHashPw(users[i].username, pw);
        changed = true;
      }
    }
    if (changed) localStorage.setItem('ipcc_users', JSON.stringify(users));
  } catch (e) {}
})();

// Token 讀寫 helper（localStorage + Cookie + users-config.js 三重備援）
function _encodeToken(t) {
  try { return btoa(unescape(encodeURIComponent(t))).split('').reverse().join(''); }
  catch(e) { return ''; }
}
function _decodeToken(s) {
  try { return decodeURIComponent(escape(atob(s.split('').reverse().join('')))); }
  catch(e) { return ''; }
}
function _getGhToken() {
  var t = (localStorage.getItem('ipcc_github_token') || '').trim();
  if (!t) {
    var m = document.cookie.match(/(?:^|;\s*)igt=([^;]+)/);
    if (m) {
      t = decodeURIComponent(m[1]).trim();
      if (t) localStorage.setItem('ipcc_github_token', t);
    }
  }
  // 從部署的 users-config.js 自動還原（任何裝置、任何瀏覽器皆有效）
  if (!t && window.IPCC_GH_TOKEN_E) {
    t = _decodeToken(window.IPCC_GH_TOKEN_E);
    if (t) _saveGhToken(t);
  }
  return t;
}
function _saveGhToken(val) {
  localStorage.setItem('ipcc_github_token', val);
  document.cookie = 'igt=' + encodeURIComponent(val) + '; max-age=31536000; path=/; SameSite=Strict';
}

// 發布金鑰：對應 Vercel 環境變數 PUBLISH_SECRET。只存在管理員本機瀏覽器，
// 不會寫進任何公開檔案。發布時送到 /api/publish 由伺服器驗證。
function _getPublishKey() {
  return (localStorage.getItem('ipcc_publish_key') || '').trim();
}
function _savePublishKey(val) {
  localStorage.setItem('ipcc_publish_key', (val || '').trim());
}

// 將字串用 gzip 壓縮後轉 base64（content-data.js 很大，壓縮後才不會超過伺服器上傳上限）
async function _gzipToBase64(str) {
  if (typeof CompressionStream === 'undefined') return null; // 舊瀏覽器不支援 → 回傳 null 走未壓縮路徑
  var input = new TextEncoder().encode(str);
  var stream = new Blob([input]).stream().pipeThrough(new CompressionStream('gzip'));
  var buf = new Uint8Array(await new Response(stream).arrayBuffer());
  var bin = '';
  var CHUNK = 0x8000;
  for (var i = 0; i < buf.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, buf.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

// 若 localStorage 沒有文章資料，自動從 content-data.js 還原初始資料
// 注意：不因 token 缺失而載入，避免覆蓋尚未發布的新資料
(function() {
  var needLoad = !localStorage.getItem('ipcc_news') && !localStorage.getItem('ipcc_cases');
  if (needLoad) {
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
  return [
    {
      id:'svc-1', num:'Service 01', icon:'🤖', title:'智能客服中心營運', slug:'smart-customer-service',
      desc:'整合 AI 技術與人力資源，建立高效能的智能客服中心，全天候穩定運作，大幅提升服務品質與效率。',
      tags:['AI客服','全天候服務','成本優化','品質管控'],
      hero_title:'智能客服中心營運', hero_subtitle:'整合 AI 與人力，打造永不休息的客服體系',
      content:'我們提供完整的智能客服中心營運服務，從系統建置、人員訓練到日常管理，協助企業建立穩定高效的客服基礎設施。透過 AI 輔助工具與專業人力的完美結合，確保每位客戶都能獲得即時、準確且友善的服務體驗。',
      pain_points:[
        {icon:'😤', desc:'客服人力成本高、人員流動率大'},
        {icon:'⏰', desc:'無法提供 24/7 全天候不間斷服務'},
        {icon:'📉', desc:'服務品質不穩定，難以有效管控'},
        {icon:'🔀', desc:'旺季需求暴增，人力無法即時調配'}
      ],
      features:[
        {icon:'🤖', title:'AI 輔助客服', desc:'整合智能問答系統，自動處理常見問題，提升回應效率'},
        {icon:'⏰', title:'24/7 全天候服務', desc:'不間斷的服務覆蓋，確保客戶隨時獲得協助'},
        {icon:'📊', title:'即時品質監控', desc:'完善的 QA 機制，確保服務品質穩定維持高水準'},
        {icon:'📈', title:'彈性人力調配', desc:'依業務量動態調整人力配置，有效控制成本'}
      ],
      industries:[
        {icon:'🛒', name:'電商零售'},{icon:'🏦', name:'金融保險'},
        {icon:'🏥', name:'醫療健康'},{icon:'📱', name:'科技軟體'},
        {icon:'🏛️', name:'政府機關'},{icon:'✈️', name:'旅遊觀光'}
      ],
      faq:[
        {q:'智能客服中心的建置週期大約多長？', a:'依企業規模與需求不同，一般從簽約到正式上線約需 4-8 週，包含需求訪談、系統設定、人員訓練與試運行等階段。'},
        {q:'AI 客服能處理多複雜的問題？', a:'我們的 AI 系統能處理 60-80% 的常規查詢，複雜或情緒性問題則即時轉接人工客服，確保每位客戶都獲得最佳服務。'},
        {q:'服務費用如何計算？', a:'依服務量、時段及功能模組彈性報價，歡迎聯繫我們的顧問進行免費評估。'}
      ],
      image:'', seo_title:'智能客服中心營運 — IPCC 東州集團',
      seo_desc:'IPCC 提供整合 AI 技術的智能客服中心營運服務，全天候穩定運作，協助企業提升服務品質並有效控制成本。',
      order:0, published:true
    },
    {
      id:'svc-2', num:'Service 02', icon:'💬', title:'多渠道顧客互動服務', slug:'multichannel-cx',
      desc:'整合電話、LINE、FB、IG、Email 等全渠道，統一管理所有顧客互動，讓每一個觸點都成為品牌加分的機會。',
      tags:['全渠道整合','LINE','社群媒體','即時回覆'],
      hero_title:'多渠道顧客互動服務', hero_subtitle:'一站式管理所有溝通渠道，讓品牌聲音無所不在',
      content:'在多元社群媒體時代，顧客透過各種平台與品牌互動。我們整合電話、LINE、Facebook、Instagram、Email 及線上聊天等渠道，建立統一的顧客服務中台，確保跨渠道的一致性體驗，讓您的品牌在每個接觸點都留下專業印象。',
      pain_points:[
        {icon:'📱', desc:'渠道分散，訊息容易漏接或延遲'},
        {icon:'🔄', desc:'客服需在多個系統間來回切換'},
        {icon:'😕', desc:'跨渠道服務體驗不一致，顧客感受落差'},
        {icon:'📊', desc:'缺乏統一的顧客互動紀錄與分析'}
      ],
      features:[
        {icon:'🔗', title:'全渠道整合', desc:'電話、社群、即時通訊一站式管理，消除溝通孤島'},
        {icon:'💬', title:'統一客服台', desc:'所有訊息集中處理，避免遺漏、提升回覆效率'},
        {icon:'🎯', title:'個性化互動', desc:'依顧客歷史紀錄提供客製化服務，增強品牌黏著度'},
        {icon:'📱', title:'行動優先設計', desc:'支援行動裝置管理，隨時隨地掌握顧客動態'}
      ],
      industries:[
        {icon:'🛍️', name:'品牌零售'},{icon:'🍽️', name:'餐飲連鎖'},
        {icon:'🏨', name:'飯店旅宿'},{icon:'📦', name:'物流電商'},
        {icon:'💄', name:'美容保健'},{icon:'🎓', name:'教育培訓'}
      ],
      faq:[
        {q:'可以整合哪些渠道？', a:'目前支援電話、LINE、Facebook Messenger、Instagram DM、Email、WhatsApp 及官網線上客服，並持續擴充新渠道。'},
        {q:'各渠道的訊息如何統一管理？', a:'透過我們的統一客服平台，所有渠道訊息匯流至同一個工作台，客服人員無需切換系統即可一次處理所有來訊。'},
        {q:'是否提供回應時效保證？', a:'依合約設定，我們可提供 SLA 保證，例如工作時段內 3 分鐘內回應等，確保服務品質穩定達標。'}
      ],
      image:'', seo_title:'多渠道顧客互動服務 — IPCC 東州集團',
      seo_desc:'IPCC 整合電話、LINE、FB、IG 等全渠道顧客互動服務，統一管理所有客戶溝通，提升品牌服務一致性。',
      order:1, published:true
    },
    {
      id:'svc-3', num:'Service 03', icon:'🏷️', title:'數據標註與資料結構化', slug:'data-annotation',
      desc:'提供專業的 AI 訓練資料標註服務，以及非結構化資料的整理與結構化處理，協助企業建立高品質資料資產。',
      tags:['AI訓練資料','資料標註','資料結構化','品質審核'],
      hero_title:'數據標註與資料結構化', hero_subtitle:'高品質訓練資料，是 AI 進化的核心動力',
      content:'人工智慧的發展根基在於高品質的訓練資料。我們提供精準的資料標註服務，涵蓋文字、圖像、語音等多種資料類型，並提供非結構化資料的整理與結構化服務。嚴格的品質審核機制確保每份資料的準確性，協助您的 AI 模型達到最佳訓練效果。',
      pain_points:[
        {icon:'⏳', desc:'標註工作耗時費力，產出效率低'},
        {icon:'❌', desc:'品質參差不齊，影響 AI 模型訓練效果'},
        {icon:'💸', desc:'自建標註團隊人力成本高昂'},
        {icon:'🔒', desc:'資料外洩風險難以有效控制'}
      ],
      features:[
        {icon:'✏️', title:'多類型標註', desc:'文字分類、情感分析、實體識別、圖像標記等全方位標註服務'},
        {icon:'✅', title:'雙重品質審核', desc:'標註員 + QA 審核員雙重把關，確保資料準確率達 98% 以上'},
        {icon:'⚡', title:'大批量處理', desc:'具備高效率批量處理能力，快速交付大規模標註需求'},
        {icon:'🔒', title:'資料安全保障', desc:'嚴格的資料保密協議，確保您的商業資料安全無虞'}
      ],
      industries:[
        {icon:'🤖', name:'AI/ML 開發'},{icon:'🏥', name:'醫療影像'},
        {icon:'🚗', name:'自動駕駛'},{icon:'🛡️', name:'資安領域'},
        {icon:'📰', name:'媒體內容'},{icon:'🏛️', name:'政府數位化'}
      ],
      faq:[
        {q:'你們能處理哪些類型的資料標註？', a:'我們支援文字標註（分類、情感、NER）、圖像標註（物件偵測、語意分割）、語音標註（轉錄、音頻分類）等多種類型。'},
        {q:'標註資料的品質如何保障？', a:'採用多層次品質審核：標註員完成後由 QA 抽查，再由資深審核員複核，整體準確率維持在 98% 以上。'},
        {q:'大批量任務的交付時間？', a:'依任務複雜度與資料量而定，一般 1 萬筆資料約 3-5 個工作日完成，大型專案可另行洽談進度規劃。'}
      ],
      image:'', seo_title:'數據標註與資料結構化 — IPCC 東州集團',
      seo_desc:'IPCC 提供專業 AI 訓練資料標註與資料結構化服務，雙重品質審核確保準確率，協助企業建立高品質資料資產。',
      order:2, published:true
    },
    {
      id:'svc-4', num:'Service 04', icon:'📊', title:'客服數據分析與營運優化', slug:'cx-data-analytics',
      desc:'深度分析客服運營數據，找出服務痛點與優化機會，透過數據驅動的洞察協助企業持續改善客服效能。',
      tags:['數據分析','KPI追蹤','服務優化','決策支援'],
      hero_title:'客服數據分析與營運優化', hero_subtitle:'讓數據說話，用洞察驅動服務卓越',
      content:'客服數據蘊藏著改善服務的關鍵線索。我們提供全方位的客服數據收集、分析與視覺化服務，從通話量趨勢、顧客滿意度到問題分類統計，幫助管理者即時掌握服務現況，識別改善機會，做出更精準的資源配置決策。',
      pain_points:[
        {icon:'🌑', desc:'客服數據龐大，無從有效分析'},
        {icon:'🎯', desc:'決策憑感覺，缺乏數據支撐'},
        {icon:'🐌', desc:'問題重複發生，始終找不到根因'},
        {icon:'📋', desc:'報表製作耗時，管理者資訊嚴重落後'}
      ],
      features:[
        {icon:'📉', title:'多維度數據分析', desc:'通話量、首次解決率、顧客滿意度等 KPI 全面追蹤'},
        {icon:'📊', title:'客製化報表', desc:'依管理需求設計週報、月報及即時儀表板，資訊一目瞭然'},
        {icon:'🔍', title:'問題根因分析', desc:'深度分析顧客投訴模式，找到系統性問題並提出改善建議'},
        {icon:'🎯', title:'優化行動方案', desc:'數據洞察轉化為具體改善措施，確保分析產生實際效益'}
      ],
      industries:[
        {icon:'📞', name:'客服中心'},{icon:'🛒', name:'電商零售'},
        {icon:'🏦', name:'金融服務'},{icon:'📡', name:'電信業者'},
        {icon:'🏥', name:'醫療產業'},{icon:'🏭', name:'製造業'}
      ],
      faq:[
        {q:'可以分析哪些類型的客服數據？', a:'包括電話錄音分析、工單資料、線上對話紀錄、客戶滿意度調查結果等，可整合多個來源進行綜合分析。'},
        {q:'多快能看到分析結果？', a:'導入後約 2-4 週即可建立基線數據並產出首份分析報告，後續每月定期提供深度報告。'},
        {q:'分析結果如何協助我們改善服務？', a:'我們不只提供數據，還會協助解讀並提出具體改善建議，並追蹤改善措施的實際成效。'}
      ],
      image:'', seo_title:'客服數據分析與營運優化 — IPCC 東州集團',
      seo_desc:'IPCC 提供深度客服數據分析服務，涵蓋 KPI 追蹤、問題根因分析與客製化報表，協助企業以數據驅動服務優化。',
      order:3, published:true
    },
    {
      id:'svc-5', num:'Service 05', icon:'🦾', title:'AI Agent 建置與維運', slug:'ai-agent-ops',
      desc:'為企業量身打造 AI Agent 解決方案，從需求分析、模型選型到系統整合與上線維運，全程專業陪伴。',
      tags:['AI Agent','LLM整合','自動化流程','企業AI'],
      hero_title:'AI Agent 建置與維運', hero_subtitle:'量身訂製的 AI 代理人，讓業務流程智慧化躍升',
      content:'AI Agent 是下一代企業自動化的核心。我們協助企業評估適合的 AI 應用場景，選擇最合適的大型語言模型（LLM），進行客製化開發與系統整合，並提供完整的上線後維運服務。無論是內部知識庫助理、自動化客服機器人還是業務流程自動化，我們都能提供端對端的解決方案。',
      pain_points:[
        {icon:'🤷', desc:'不知如何選擇適合的 AI 工具與模型'},
        {icon:'🔧', desc:'技術門檻高，內部缺乏 AI 專業人才'},
        {icon:'💰', desc:'嘗試導入成本高，難以評估實際 ROI'},
        {icon:'🔌', desc:'AI 系統難以與現有業務流程無縫整合'}
      ],
      features:[
        {icon:'🎯', title:'需求與場景評估', desc:'深入了解業務需求，找出最適合導入 AI Agent 的應用場景'},
        {icon:'🔧', title:'客製化開發', desc:'依企業需求開發專屬 AI Agent，整合現有系統與資料庫'},
        {icon:'🚀', title:'完整上線部署', desc:'從測試、優化到正式上線，確保系統穩定可靠'},
        {icon:'🛡️', title:'持續維運支援', desc:'上線後持續監控、優化模型表現，並提供技術支援'}
      ],
      industries:[
        {icon:'🏢', name:'企業客服'},{icon:'📚', name:'知識管理'},
        {icon:'💼', name:'業務自動化'},{icon:'🏦', name:'金融服務'},
        {icon:'🏥', name:'醫療照護'},{icon:'🏭', name:'製造供應鏈'}
      ],
      faq:[
        {q:'建置 AI Agent 需要準備什麼？', a:'主要需要清楚的業務需求描述、相關的知識文件或 FAQ，以及現有系統的 API 文件（若需要整合）。我們會全程協助您準備。'},
        {q:'AI Agent 的費用模式是什麼？', a:'通常分為一次性建置費用與月度維運費用兩部分，依功能複雜度與使用量而定，歡迎聯繫我們進行免費評估。'},
        {q:'AI Agent 建置好後還需要持續調整嗎？', a:'是的，AI 系統需要根據實際使用情況持續優化。我們提供定期的模型調校與效能報告，確保 Agent 的回應品質持續改善。'}
      ],
      image:'', seo_title:'AI Agent 建置與維運 — IPCC 東州集團',
      seo_desc:'IPCC 提供企業 AI Agent 端對端解決方案，從需求評估、客製化開發到上線維運，協助企業實現智慧化業務流程。',
      order:4, published:true
    }
  ];
}
function saveServices(arr) { localStorage.setItem('ipcc_services', JSON.stringify(arr)); }

// --- Insights CRUD ---
function getInsights() {
  try {
    var s = JSON.parse(localStorage.getItem('ipcc_insights') || 'null');
    if (s) return s;
  } catch(e) {}
  return [
    {
      id:'ins-1', slug:'ai-customer-service-trend-2026',
      title:'AI 客服 2026 趨勢：從自動回覆到情感智慧的進化',
      excerpt:'隨著大型語言模型持續成熟，AI 客服正從簡單的 FAQ 機器人演化為能夠理解語境、辨識情緒的智慧代理人。本文深度解析 2026 年客服產業最值得關注的五大 AI 趨勢。',
      category:'產業趨勢', tags:['AI客服','LLM','趨勢分析'],
      cover_image:'',
      content_markdown:'AI 客服技術的發展速度持續超越業界預期。從早期只能回答固定問題的規則式機器人，到如今能夠理解複雜語境、辨識情緒並給出個性化回應的 AI Agent，這場變革正深刻影響著每一個客服中心的日常運作。\n\n## 趨勢一：LLM 成為客服新標配\n\n2024 年以前，多數企業的 AI 客服仍依賴傳統 NLP 與意圖識別引擎。但隨著 GPT-4、Claude 等 LLM 的商業化落地，客服領域的 AI 應用正在經歷本質性升級。\n\n> 東州集團觀點：LLM 的導入不只是技術升級，更是客服中心整體運營邏輯的重構。IPCC 建議企業從最高頻的問題類型切入，逐步擴展 AI 覆蓋範圍，而非一次性大規模替換。\n\n## 趨勢二：情感智慧與同理心 AI\n\n下一代 AI 客服的核心競爭力，不再只是「正確回答問題」，而是能夠識別顧客的情緒狀態，並以適合的語氣和方式給出回應。',
      faq:[
        {q:'AI 客服是否會完全取代人工客服？', a:'短期內不會。AI 客服最大的優勢在於處理大量標準化請求，而複雜問題、情緒性投訴以及高價值客戶關係仍需要人工介入。最理想的模式是「AI + 人工」的混合協作。'},
        {q:'企業導入 AI 客服的最大挑戰是什麼？', a:'資料品質與系統整合是最常見的挑戰。AI 的表現高度依賴訓練資料的品質，加上需要與現有 CRM、工單系統等整合，導入過程需要充分規劃。'}
      ],
      related_slugs:['omnichannel-cx-best-practices'],
      published:true, publish_date:'2026-05-10', author:'IPCC 編輯部', is_featured:true, sort_order:0, order:0, seo_title:'', seo_description:'', og_image:''
    },
    {
      id:'ins-2', slug:'omnichannel-cx-best-practices',
      title:'全渠道客戶體驗：打破溝通孤島的七個最佳實踐',
      excerpt:'當顧客可以透過電話、LINE、Instagram、Email 同時聯繫品牌，如何確保跨渠道服務體驗的一致性，成為現代客服管理的核心課題。',
      category:'客服管理', tags:['全渠道','CX','客戶體驗'],
      cover_image:'',
      content_markdown:'根據研究，超過 60% 的消費者在與品牌互動時，會同時使用兩種以上的溝通渠道。然而，許多企業的客服系統仍是孤立的：電話客服不知道顧客在社群上發過什麼、LINE 客服看不到顧客過去的購買紀錄。\n\n## 實踐一：建立統一的顧客資料平台\n\n跨渠道一致性的基礎，是讓每位客服人員都能即時看到同一份顧客資料。統一客戶資料平台（CDP）是解決這個問題的關鍵基礎設施。\n\n## 實踐二：渠道切換的無縫銜接\n\n顧客從 LINE 轉到電話時，客服人員應已掌握對話歷史，不讓顧客重複陳述問題。這需要系統層面的整合，也需要客服人員的流程訓練。',
      faq:[
        {q:'全渠道整合需要多大的技術投入？', a:'這取決於現有系統的狀況。若已有基礎 CRM，整合成本相對可控；建議從使用量最高的兩個渠道開始，逐步擴展，避免一次性大規模投入的風險。'}
      ],
      related_slugs:['ai-customer-service-trend-2026','cx-data-analytics-kpi'],
      published:true, publish_date:'2026-04-28', author:'IPCC 編輯部', is_featured:false, sort_order:1, order:1, seo_title:'', seo_description:'', og_image:''
    },
    {
      id:'ins-3', slug:'cx-data-analytics-kpi',
      title:'客服數據分析入門：你必須追蹤的 8 個核心 KPI',
      excerpt:'數據是客服管理的羅盤。了解哪些指標真正重要、如何解讀這些數字，以及如何將分析結果轉化為具體改善行動。',
      category:'數據分析', tags:['KPI','數據分析','客服優化'],
      cover_image:'',
      content_markdown:'許多客服中心每天都在收集大量資料，但真正能從這些數字中找出改善機會的管理者並不多。問題不在於資料不夠，而在於不知道該看什麼、怎麼看。\n\n## 1. 首次解決率（FCR）\n\n首次解決率是衡量客服效率最核心的指標之一，代表顧客在第一次聯繫就獲得完整解決的比率。業界標竿約 70-75%，優秀的客服中心可達 80% 以上。\n\n## 2. 平均處理時間（AHT）\n\n平均處理時間包含通話時間與後續處理時間。降低 AHT 可提高效率，但不能以犧牲品質為代價。',
      faq:[
        {q:'什麼是 FCR（首次解決率）？', a:'首次解決率（First Contact Resolution）是指顧客在第一次聯繫時，問題就獲得完整解決的比率。這是衡量客服效率最重要的指標之一，業界平均值約為 70-75%。'},
        {q:'多久應該進行一次 KPI 檢視？', a:'建議每週進行短期指標（回應時間、通話量）的檢視，每月進行完整 KPI 分析，每季度進行深度趨勢分析與策略調整。'}
      ],
      related_slugs:['omnichannel-cx-best-practices'],
      published:true, publish_date:'2026-04-15', author:'IPCC 編輯部', is_featured:false, sort_order:2, order:2, seo_title:'', seo_description:'', og_image:''
    }
  ];
}
function saveInsights(arr) { localStorage.setItem('ipcc_insights', JSON.stringify(arr)); }

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
    password: 'sha256$363a7a620436351edbe6c1fdccc799b18de49f42c0f88ed37159ddd2f87d27a1', // admin / ipcc2024
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
  PAGE_PERMS['insights-manage.html'] = 'news';
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
  var SKIP = { ipcc_users: 1, ipcc_deploy_ts: 1, ipcc_github_token: 1, ipcc_admin_password: 1, ipcc_admin_username: 1, ipcc_contacts: 1 };
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
  var frontendUrl = window.IPCC_FRONTEND_URL || 'https://ipcc-website.vercel.app';
  var repo   = window.IPCC_GITHUB_REPO   || '';
  var branch = window.IPCC_GITHUB_BRANCH || 'main';
  // 注意：不再寫入任何 GitHub 金鑰（金鑰已移到伺服器端的 Vercel 環境變數）
  return '// IPCC 後台用戶設定\n// 此檔案由後台帳號管理自動產生，請勿手動修改\n\n'
    + "window.IPCC_FRONTEND_URL  = '" + frontendUrl + "';\n"
    + "window.IPCC_GITHUB_REPO   = '" + repo   + "';\n"
    + "window.IPCC_GITHUB_BRANCH = '" + branch + "';\n"
    + '\nwindow.IPCC_USERS_CONFIG = ' + JSON.stringify(users, null, 2) + ';\n';
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
// 不再於瀏覽器直接帶 GitHub 金鑰，改送到伺服器端 /api/publish 由伺服器推送。
async function publishToLive() {
  var key = _getPublishKey();

  // 尚未設定發布金鑰 → 引導到系統設定
  if (!key) {
    showPublishToast('請先到「⚙️ 系統設定」填入發布金鑰，才能一鍵發布。', 'warn');
    setTimeout(function(){ location.href = 'settings.html'; }, 2000);
    return;
  }

  showPublishToast('⏳ 正在發布，請稍候...', '');

  var ts = new Date().toLocaleString('zh-TW', {timeZone:'Asia/Taipei', hour12:false});
  var commitMsg = '🔄 後台發布：' + ts;

  var rawFiles = [
    { path: 'content-data.js',       content: generateContentData() },
    { path: 'admin/users-config.js', content: makeUsersConfigContent(getUsers()) },
    { path: 'contact-config.js',     content: makeContactConfigContent(getContactConfig()) }
  ];

  // 壓縮每個檔案內容（避免大檔超過伺服器上傳上限 413）
  var files = [];
  for (var i = 0; i < rawFiles.length; i++) {
    var gz = await _gzipToBase64(rawFiles[i].content);
    if (gz) {
      files.push({ path: rawFiles[i].path, contentGzipB64: gz });
    } else {
      files.push({ path: rawFiles[i].path, content: rawFiles[i].content });
    }
  }

  try {
    var res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: key, commitMsg: commitMsg, files: files })
    });
    var out = await res.json().catch(function(){ return {}; });
    if (!res.ok || !out.success) throw new Error(out.error || ('HTTP ' + res.status));

    showPublishToast('✅ 發布成功！Vercel 正在自動部署，約 10-30 秒後前台即更新。\n發布時間：' + ts, 'success');
  } catch(e) {
    showPublishToast('❌ 發布失敗：' + e.message + '\n請確認發布金鑰是否正確，或 Vercel 環境變數是否已設定。', 'error');
  }
}

function _updatePublishBtn() {
  var btn = document.getElementById('ipcc-publish-btn');
  if (!btn) return;
  var key = _getPublishKey();
  if (key) {
    btn.textContent = '🚀 發布上線';
    btn.style.background = 'linear-gradient(135deg,#CE0000,#8B0000)';
    btn.title = '一鍵發布（伺服器端推送，Vercel 自動部署）';
  } else {
    btn.textContent = '⚙️ 設定後可一鍵發布';
    btn.style.background = 'linear-gradient(135deg,#D97706,#92400E)';
    btn.title = '請先到系統設定填入發布金鑰';
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


// ===================================================
// 通訊網路動態背景
// ===================================================
function startNetBg() {
  if (document.getElementById('ipcc-net-bg')) return;
  if (window.innerWidth < 768) return; // 手機略過
  var canvas = document.createElement('canvas');
  canvas.id = 'ipcc-net-bg';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  var W, H;
  var N = 52, MAX_D = 135, SPD = 0.32;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  function rv(a, b) { return a + Math.random() * (b - a); }
  var nodes = [];
  for (var i = 0; i < N; i++) {
    nodes.push({ x: rv(0,W), y: rv(0,H), vx: rv(-SPD,SPD), vy: rv(-SPD,SPD), r: rv(1.5,3) });
  }

  var pulses = [];
  setInterval(function() {
    var ai = Math.floor(Math.random() * N), bi = Math.floor(Math.random() * N);
    if (ai === bi) return;
    var a = nodes[ai], b = nodes[bi];
    if (Math.hypot(a.x-b.x, a.y-b.y) < MAX_D) {
      pulses.push({ a:a, b:b, t:0, spd: rv(0.009,0.018) });
    }
  }, 650);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(function(n) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -12) n.x = W+12; else if (n.x > W+12) n.x = -12;
      if (n.y < -12) n.y = H+12; else if (n.y > H+12) n.y = -12;
    });
    // 連線
    for (var i = 0; i < N; i++) {
      for (var j = i+1; j < N; j++) {
        var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        var d = Math.sqrt(dx*dx + dy*dy);
        if (d < MAX_D) {
          ctx.globalAlpha = (1 - d/MAX_D) * 0.2;
          ctx.strokeStyle = '#00C8FF';
          ctx.lineWidth = 0.75;
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
    }
    // 節點
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = '#00C8FF';
    nodes.forEach(function(n) { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2); ctx.fill(); });
    // 脈衝信號
    ctx.globalAlpha = 1;
    pulses = pulses.filter(function(p) {
      p.t += p.spd;
      if (p.t > 1) return false;
      var px = p.a.x + (p.b.x - p.a.x) * p.t;
      var py = p.a.y + (p.b.y - p.a.y) * p.t;
      var g = ctx.createRadialGradient(px, py, 0, px, py, 8);
      g.addColorStop(0, 'rgba(0,220,255,0.88)');
      g.addColorStop(1, 'rgba(0,220,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2); ctx.fill();
      return true;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// 頁面載入後啟動背景動畫
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startNetBg);
  } else {
    startNetBg();
  }
})();


// ===================================================
// 通用拖曳排序（供各管理頁使用）
// ===================================================
function initTableDragSort(tbodyId, getDataFn, saveDataFn, renderFn) {
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  var srcId = null;

  tbody.addEventListener('dragstart', function(e) {
    var row = e.target.closest('tr[data-id]');
    if (!row) return;
    srcId = row.dataset.id;
    setTimeout(function(){ row.classList.add('dragging'); }, 0);
    e.dataTransfer.effectAllowed = 'move';
  });

  tbody.addEventListener('dragend', function() {
    tbody.querySelectorAll('tr').forEach(function(r){ r.classList.remove('dragging','drag-over'); });
  });

  tbody.addEventListener('dragover', function(e) {
    e.preventDefault();
    var row = e.target.closest('tr[data-id]');
    tbody.querySelectorAll('tr').forEach(function(r){ r.classList.remove('drag-over'); });
    if (row && row.dataset.id !== srcId) row.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  });

  tbody.addEventListener('dragleave', function(e) {
    if (!tbody.contains(e.relatedTarget)) {
      tbody.querySelectorAll('tr').forEach(function(r){ r.classList.remove('drag-over'); });
    }
  });

  tbody.addEventListener('drop', function(e) {
    e.preventDefault();
    var tgt = e.target.closest('tr[data-id]');
    tbody.querySelectorAll('tr').forEach(function(r){ r.classList.remove('drag-over'); });
    if (!tgt || !srcId || tgt.dataset.id === srcId) return;
    var arr = getDataFn();
    var si = -1, ti = -1;
    for (var k = 0; k < arr.length; k++) {
      if (arr[k].id === srcId) si = k;
      if (arr[k].id === tgt.dataset.id) ti = k;
    }
    if (si < 0 || ti < 0) return;
    var item = arr.splice(si, 1)[0];
    arr.splice(ti, 0, item);
    saveDataFn(arr);
    renderFn();
    var t = document.createElement('div');
    t.className = 'toast success';
    t.textContent = '✓ 順序已更新，記得發布上線';
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 2200);
  });
}
