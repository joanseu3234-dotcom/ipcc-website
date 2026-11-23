/*
 * 專案服務「動態故事版型」共用渲染器
 * - 瀏覽器：window.IPCCStory（後台預覽、前台備援渲染）
 * - Node：require('./service-story.js')（部署時預先產生靜態頁，供 Google／AI 搜尋讀取）
 * 區塊欄位定義在 BLOCKS，後台編輯器依此自動產生表單。
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.IPCCStory = api;
})(typeof self !== 'undefined' ? self : this, function () {
  var SITE = 'https://www.phonecenter.com.tw';

  // 主題色：導覽列、Logo、頁尾固定品牌紅，只有內容區換色
  var THEMES = {
    navy:     { name: '深海軍藍', deep: '#060E1C', bg: '#0B1B33', bg2: '#13315C', accent: '#2F7BFF', accentDark: '#1D5FD6', light: '#7FB0FF', soft: '#A9C9FF', rgb: '47,123,255', tint: '#EEF4FF', sub: '#C7D3E6' },
    teal:     { name: '深青綠',   deep: '#03171A', bg: '#06262B', bg2: '#0E4A52', accent: '#0FA597', accentDark: '#0B8278', light: '#5FE0D2', soft: '#9FEFE6', rgb: '15,165,151', tint: '#E8FAF7', sub: '#C2E2DE' },
    graphite: { name: '石墨灰＋金', deep: '#0C0D10', bg: '#16181D', bg2: '#2A2E36', accent: '#B8892E', accentDark: '#94701F', light: '#E6C98A', soft: '#F0DDB0', rgb: '184,137,46', tint: '#FBF6EC', sub: '#D5D0C6' },
    indigo:   { name: '靛紫',     deep: '#0B0A1F', bg: '#151338', bg2: '#2B2670', accent: '#6366F1', accentDark: '#4F46E5', light: '#A5B4FC', soft: '#C7D2FE', rgb: '99,102,241', tint: '#EEF0FF', sub: '#CBCDE8' },
    red:      { name: '品牌紅',   deep: '#0C0304', bg: '#1E0608', bg2: '#4E0A0E', accent: '#C8161D', accentDark: '#8B0F13', light: '#E84048', soft: '#FF6B70', rgb: '200,22,29', tint: '#FDF0F0', sub: '#D9C4C4' }
  };

  // 區塊定義（後台表單依此產生）。items 為可增減的清單。
  var BLOCKS = {
    hero: {
      label: '主視覺（頁首大標）',
      fields: [
        { key: 'eyebrow', label: '小標（膠囊文字）', ph: '東州集團｜智能客服' },
        { key: 'title', label: '大標第一行', ph: '一通電話背後，' },
        { key: 'highlight', label: '大標第二行（主題色）', ph: '是一整天的準備' },
        { key: 'lead', label: '說明文字', type: 'textarea' },
        { key: 'primary_text', label: '主按鈕文字', ph: '立即諮詢' },
        { key: 'primary_link', label: '主按鈕連結', ph: '/contact.html' },
        { key: 'secondary_text', label: '次按鈕文字（選填）' },
        { key: 'secondary_link', label: '次按鈕連結（選填）' },
        { key: 'panel_title', label: '右側看板標題（選填）', ph: '今日營運看板' },
        { key: 'note', label: '看板下方註記（選填）', ph: '＊數字為示意' },
        { key: 'visual', label: '右側動畫樣式', type: 'select', options: [
          ['panel', '營運看板（逐列亮起）'], ['orbit', '渠道匯流（左＝渠道名稱）'], ['chat', '對話視窗（左＝客戶／AI／專員）'],
          ['tokens', '文字標註（左＝標籤、中＝文字片段、右＝標註值）'], ['wave', '語音波形＋逐字稿（左＝說話者、右＝洞察）']] }
      ],
      items: { key: 'panel_items', label: '看板項目（依右側動畫樣式解讀，見上方說明）', fields: [
        { key: 'left', label: '左（時間/代號）', ph: '08:30' },
        { key: 'label', label: '中（說明）', ph: '排班完成' },
        { key: 'right', label: '右（數字/狀態）', ph: '1,248 通' }
      ] }
    },
    timeline: {
      label: '捲動時間軸（左側固定、右側逐段出現）',
      fields: [
        { key: 'eyebrow', label: '英文小標', ph: 'A DAY AT IPCC' },
        { key: 'title', label: '標題', ph: '從開線到收線，' },
        { key: 'highlight', label: '標題（主題色）', ph: '每個環節都有人負責' },
        { key: 'hint', label: '提示文字', ph: '往下捲動，跟著流程走一遍' }
      ],
      items: { key: 'steps', label: '時間軸段落', fields: [
        { key: 'time', label: '時間/步驟', ph: '08:30' },
        { key: 'title', label: '段落標題' },
        { key: 'desc', label: '說明', type: 'textarea' },
        { key: 'tag', label: '標籤（選填）' }
      ] }
    },
    flow: {
      label: '流程步驟（深色區塊）',
      fields: [
        { key: 'eyebrow', label: '英文小標', ph: 'HOW IT WORKS' },
        { key: 'title', label: '標題' },
        { key: 'highlight', label: '標題（主題色）' },
        { key: 'sub', label: '說明', type: 'textarea' }
      ],
      items: { key: 'steps', label: '步驟', fields: [
        { key: 'label', label: '步驟編號', ph: 'STEP 1' },
        { key: 'title', label: '步驟標題' },
        { key: 'desc', label: '說明', type: 'textarea' }
      ] }
    },
    stats: {
      label: '數據亮點（數字會跑動）',
      fields: [
        { key: 'eyebrow', label: '英文小標', ph: 'RESULTS' },
        { key: 'title', label: '標題' },
        { key: 'highlight', label: '標題（主題色）' },
        { key: 'note', label: '數據註記（統計期間/示意）', ph: '統計期間 2026/1–6' }
      ],
      items: { key: 'items', label: '數據', fields: [
        { key: 'num', label: '數字', ph: '98' },
        { key: 'unit', label: '單位', ph: '%' },
        { key: 'label', label: '說明', ph: '客戶滿意度' }
      ] }
    },
    features: {
      label: '服務特色卡片',
      fields: [
        { key: 'eyebrow', label: '英文小標', ph: 'WHAT WE DO' },
        { key: 'title', label: '標題' },
        { key: 'highlight', label: '標題（主題色）' },
        { key: 'sub', label: '說明', type: 'textarea' }
      ],
      items: { key: 'items', label: '卡片', fields: [
        { key: 'icon', label: '圖示', ph: '✦' },
        { key: 'title', label: '標題' },
        { key: 'desc', label: '說明', type: 'textarea' }
      ] }
    },
    omni: {
      label: '★ 全渠道匯流（整合前／整合後切換）',
      fields: [
        { key: 'eyebrow', label: '英文小標', ph: 'BEFORE / AFTER' },
        { key: 'title', label: '標題' }, { key: 'highlight', label: '標題（主題色）' },
        { key: 'sub', label: '說明', type: 'textarea' },
        { key: 'before_label', label: '整合前按鈕文字', ph: '各平台分開經營' },
        { key: 'after_label', label: '整合後按鈕文字', ph: '全渠道整合' },
        { key: 'before_note', label: '整合前結論', ph: '同一位客戶，被拆成好幾筆互不相關的紀錄' },
        { key: 'after_note', label: '整合後結論', ph: '同一位客戶，一條完整的服務歷程' },
        { key: 'hub', label: '中心名稱', ph: '統一客服平台' }
      ],
      items: { key: 'channels', label: '渠道（整合前顯示訊息；整合後依序串成客戶歷程）', fields: [
        { key: 'name', label: '渠道', ph: 'LINE' },
        { key: 'msg', label: '整合前：該平台的訊息', ph: '會員點數怎麼兌換？' },
        { key: 'when', label: '整合後：時間點', ph: '週二' },
        { key: 'action', label: '整合後：歷程說明', ph: '追問點數兌換，專員已看到前一天的留言' }
      ] }
    },
    agent_chat: {
      label: '★ AI Agent 互動示範（點問題看 AI 怎麼處理）',
      fields: [
        { key: 'eyebrow', label: '英文小標', ph: 'TRY IT' },
        { key: 'title', label: '標題' }, { key: 'highlight', label: '標題（主題色）' },
        { key: 'sub', label: '說明', type: 'textarea' },
        { key: 'note', label: '註記', ph: '＊對話內容為示意' }
      ],
      items: { key: 'cases', label: '示範問題', fields: [
        { key: 'q', label: '客戶問題' },
        { key: 'intent', label: '①辨識意圖', ph: '退換貨流程' },
        { key: 'source', label: '②引用知識', ph: '《退換貨 SOP》第 3 條' },
        { key: 'answer', label: '③AI 回覆', type: 'textarea' },
        { key: 'handoff', label: '④轉真人原因（空白＝AI 直接完成）' }
      ] }
    },
    label_demo: {
      label: '★ 數據標註示範（原始→AI 預標→人工 QA→結構化）',
      fields: [
        { key: 'eyebrow', label: '英文小標', ph: 'SEE IT WORK' },
        { key: 'title', label: '標題' }, { key: 'highlight', label: '標題（主題色）' },
        { key: 'sub', label: '說明', type: 'textarea' },
        { key: 'source', label: '資料來源說明', ph: '客服錄音逐字稿（示意）' }
      ],
      items: { key: 'segs', label: '句子片段（依序組成一句話；文字空白＝整句標註）', fields: [
        { key: 'text', label: '文字片段' },
        { key: 'tag', label: '標籤（空白＝不標）', ph: '意圖' },
        { key: 'ai', label: 'AI 預標結果', ph: '詢問訂閱' },
        { key: 'qa', label: '人工 QA 修正（空白＝AI 正確）', ph: '取消訂閱' }
      ] }
    },
    voice_insight: {
      label: '★ 對話洞察示範（逐句播放、自動歸類洞察）',
      fields: [
        { key: 'eyebrow', label: '英文小標', ph: 'VOICE OF CUSTOMER' },
        { key: 'title', label: '標題' }, { key: 'highlight', label: '標題（主題色）' },
        { key: 'sub', label: '說明', type: 'textarea' },
        { key: 'call', label: '通話標題', ph: '來電｜保健食品訂購專線（示意）' },
        { key: 'note', label: '註記', ph: '＊對話內容為示意' }
      ],
      items: { key: 'lines', label: '對話（類別相同的洞察會歸到同一欄）', fields: [
        { key: 'who', label: '說話者', ph: '客戶' },
        { key: 'text', label: '內容', type: 'textarea' },
        { key: 'kind', label: '洞察類別（空白＝無）', ph: '流失訊號' },
        { key: 'insight', label: '洞察', ph: '物流體驗不佳' }
      ] }
    },
    pain_solution: {
      label: '痛點 × 解決方案（沿用「詳情內容」的痛點與特色）',
      fields: [
        { key: 'title', label: '標題', ph: '痛點解析 × 解決方案' }
      ]
    },
    industries: {
      label: '適用產業（沿用「詳情內容」的產業）',
      fields: [ { key: 'title', label: '標題', ph: '適用產業' } ]
    },
    faq: {
      label: '常見問題（沿用「詳情內容」的 FAQ）',
      fields: [ { key: 'title', label: '標題', ph: '常見問題' } ]
    },
    cta: {
      label: '行動呼籲（頁尾大按鈕）',
      fields: [
        { key: 'title', label: '標題', ph: '準備好開始了嗎？' },
        { key: 'desc', label: '說明', type: 'textarea' },
        { key: 'primary_text', label: '主按鈕文字', ph: '免費諮詢' },
        { key: 'primary_link', label: '主按鈕連結', ph: '/contact.html' },
        { key: 'secondary_text', label: '次按鈕文字（選填）', ph: 'LINE 官方帳號' },
        { key: 'secondary_link', label: '次按鈕連結（選填）', ph: 'https://lin.ee/rp9TNMU' }
      ]
    }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function txt(s) { return esc(s).replace(/\n/g, '<br>'); }
  function arr(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v.trim()) { try { var p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch (e) { return []; } }
    return [];
  }
  function link(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^(javascript|data):/i.test(u)) return '';
    return esc(u);
  }
  function heading(b, cls) {
    if (!b.title && !b.highlight) return '';
    return '<h2' + (cls ? ' class="' + cls + '"' : '') + '>' + txt(b.title) + (b.highlight ? '<em>' + txt(b.highlight) + '</em>' : '') + '</h2>';
  }
  function eyebrow(b) { return b.eyebrow ? '<div class="st-eyebrow">' + esc(b.eyebrow) + '</div>' : ''; }
  function btn(text, href, cls) {
    var h = link(href);
    return text && h ? '<a class="st-btn ' + cls + '" href="' + h + '">' + esc(text) + '</a>' : '';
  }

  // 主視覺右側動畫（依 b.visual 切換）
  var VIS = {};
  VIS.panel = function (b, items) {
    return '<div class="st-panel" data-st-panel>'
      + '<div class="st-panel-head"><b>' + esc(b.panel_title || '') + '</b><span><i class="st-live"></i>即時</span></div>'
      + '<ul>' + items.map(function (it, i) {
        return '<li' + (i === 0 ? ' class="on"' : '') + '><em>' + esc(it.left) + '</em><span>' + esc(it.label) + '</span><strong>' + esc(it.right) + '</strong></li>';
      }).join('') + '</ul></div>';
  };
  VIS.orbit = function (b, items) {
    var n = items.length || 1;
    return '<div class="st-orbit" data-st-sync>'
      + '<div class="st-orb-ring"></div><div class="st-orb-ring st-orb-ring2"></div>'
      + items.map(function (it, i) {
        var a = (360 * i / n - 90) + 'deg';
        return '<i class="st-orb-dot" style="--a:' + a + ';--d:' + (i * 0.45) + 's"></i>'
          + '<span class="st-orb-node' + (i === 0 ? ' on' : '') + '" style="--a:' + a + '"><b>' + esc(it.left) + '</b></span>';
      }).join('')
      + '<div class="st-orb-hub"><b>' + esc(b.panel_title || '統一客服平台') + '</b></div></div>'
      + '<div class="st-orb-feed" data-st-cycle>' + items.map(function (it, i) {
        return '<div' + (i === 0 ? ' class="on"' : '') + '><em>' + esc(it.left) + '</em><span>' + esc(it.label) + '</span><strong>' + esc(it.right) + '</strong></div>';
      }).join('') + '</div>';
  };
  function who(w) { w = String(w || ''); return /AI/i.test(w) ? 'ai' : /專員|真人|客服/.test(w) ? 'agent' : 'user'; }
  VIS.chat = function (b, items) {
    return '<div class="st-chatwin" data-st-chat><div class="st-chat-head"><i class="st-live"></i><b>' + esc(b.panel_title || 'AI 客服助理') + '</b><span>線上</span></div>'
      + '<div class="st-chat-body">' + items.map(function (it) {
        return '<div class="st-msg st-msg-' + who(it.left) + '"><small>' + esc(it.left) + '</small><p>' + esc(it.label) + '</p>' + (it.right ? '<em>' + esc(it.right) + '</em>' : '') + '</div>';
      }).join('') + '<div class="st-typing"><i></i><i></i><i></i></div></div></div>';
  };
  VIS.tokens = function (b, items) {
    var tagged = items.filter(function (it) { return it.left; });
    return '<div class="st-tokwin" data-st-tokens><div class="st-chat-head"><i class="st-live"></i><b>' + esc(b.panel_title || '標註作業') + '</b><span data-st-tok-stage>AI 預標註中</span></div>'
      + '<p class="st-tok-text">' + items.map(function (it) {
        return it.left ? '<span class="st-tok" data-tag="' + esc(it.left) + '">' + esc(it.label) + '<sup>' + esc(it.left) + '</sup></span>' : esc(it.label);
      }).join('') + '</p>'
      + '<pre class="st-tok-json">' + '{\n' + tagged.map(function (it, i) {
        return '<span class="st-tok-row">  "' + esc(it.left) + '": "' + esc(it.right || it.label) + '"' + (i < tagged.length - 1 ? ',' : '') + '\n</span>';
      }).join('') + '}</pre></div>';
  };
  VIS.wave = function (b, items) {
    var bars = '';
    for (var i = 0; i < 44; i++) {
      var h = 18 + Math.round(Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 70);
      bars += '<i style="--h:' + h + '%;--d:' + ((i % 11) * 0.09).toFixed(2) + 's"></i>';
    }
    return '<div class="st-wavewin"><div class="st-chat-head"><i class="st-live"></i><b>' + esc(b.panel_title || '通話分析') + '</b><span>分析中</span></div>'
      + '<div class="st-wave">' + bars + '</div>'
      + '<div class="st-wave-feed" data-st-cycle>' + items.map(function (it, i) {
        return '<div' + (i === 0 ? ' class="on"' : '') + '><small>' + esc(it.left) + '</small><p>' + esc(it.label) + '</p>' + (it.right ? '<em>' + esc(it.right) + '</em>' : '') + '</div>';
      }).join('') + '</div></div>';
  };

  var R = {};
  R.hero = function (b, svc) {
    var items = arr(b.panel_items);
    var vis = VIS[b.visual] ? b.visual : 'panel';
    var panel = '';
    if (b.panel_title || items.length) {
      panel = VIS[vis](b, items) + (b.note ? '<div class="st-note">' + esc(b.note) + '</div>' : '');
    }
    return '<section class="st-hero st-dark"><div class="st-wrap st-hero-grid' + (panel ? '' : ' st-hero-solo') + '">'
      + '<div class="st-hero-text">'
      + '<nav class="st-crumb" aria-label="麵包屑"><a href="/">首頁</a> › <a href="/services.html">專案服務</a> › <span>' + esc(svc.title) + '</span></nav>'
      + (b.eyebrow ? '<div class="st-pill">' + esc(b.eyebrow) + '</div>' : '')
      + '<h1>' + txt(b.title || svc.hero_title || svc.title) + (b.highlight ? '<br><em>' + txt(b.highlight) + '</em>' : '') + '</h1>'
      + '<p class="st-lead">' + txt(b.lead || svc.hero_subtitle || svc.desc) + '</p>'
      + '<div class="st-ctas">' + btn(b.primary_text || '立即諮詢', b.primary_link || '/contact.html', 'st-btn-main') + btn(b.secondary_text, b.secondary_link, 'st-btn-ghost') + '</div>'
      + '</div>'
      + (panel ? '<div class="st-hero-visual st-vis-' + vis + '">' + panel + '</div>' : '')
      + '</div></section>';
  };

  // ★ 全渠道匯流
  R.omni = function (b) {
    var ch = arr(b.channels);
    if (!ch.length) return '';
    var n = ch.length;
    var st = ['未讀', '等待回覆', '已回覆', '未讀', '轉給其他部門', '等待回覆'];
    return '<section class="st-sec st-dark st-omni" data-st-omni data-mode="after"><div class="st-wrap">'
      + eyebrow(b) + heading(b) + (b.sub ? '<p class="st-sub">' + txt(b.sub) + '</p>' : '')
      + '<div class="st-tabs" role="tablist"><button type="button" data-st-mode="before">' + esc(b.before_label || '各平台分開經營') + '</button>'
      + '<button type="button" data-st-mode="after" class="on">' + esc(b.after_label || '全渠道整合') + '</button></div>'
      + '<div class="st-omni-grid">'
      + '<div class="st-omni-map">'
      + '<svg viewBox="-200 -200 400 400" aria-hidden="true">' + ch.map(function (c, i) {
        var a = (2 * Math.PI * i / n) - Math.PI / 2, x = Math.round(Math.cos(a) * 150), y = Math.round(Math.sin(a) * 150);
        return '<path class="st-omni-line" d="M' + x + ' ' + y + ' L0 0"/><circle class="st-omni-pkt" r="4"><animateMotion dur="2.4s" begin="' + (i * 0.4).toFixed(1) + 's" repeatCount="indefinite" path="M' + x + ' ' + y + ' L0 0"/></circle>';
      }).join('') + '</svg>'
      + ch.map(function (c, i) {
        var a = (2 * Math.PI * i / n) - Math.PI / 2;
        return '<span class="st-omni-node" style="left:' + (50 + Math.cos(a) * 37.5).toFixed(2) + '%;top:' + (50 + Math.sin(a) * 37.5).toFixed(2) + '%">' + esc(c.name) + '</span>';
      }).join('')
      + '<div class="st-omni-hub"><b>' + esc(b.hub || '統一客服平台') + '</b><span class="st-omni-q">?</span></div></div>'
      + '<div class="st-omni-panel">'
      + '<div class="st-omni-before"><h3>' + esc(n) + ' 個收件匣，各自處理</h3><ul>' + ch.map(function (c, i) {
        return '<li style="--d:' + (i * 0.08) + 's"><b>' + esc(c.name) + '</b><span>' + esc(c.msg) + '</span><em class="s' + (i % 3) + '">' + st[i % st.length] + '</em></li>';
      }).join('') + '</ul><p class="st-omni-note bad">' + esc(b.before_note || '同一位客戶，被拆成好幾筆互不相關的紀錄') + '</p></div>'
      + '<div class="st-omni-after"><h3>同一位客戶的完整歷程</h3><ol>' + ch.map(function (c, i) {
        return '<li style="--d:' + (i * 0.12) + 's"><i>' + esc(c.when) + '</i><b>' + esc(c.name) + '</b><span>' + esc(c.action) + '</span></li>';
      }).join('') + '</ol><p class="st-omni-note good">' + esc(b.after_note || '同一位客戶，一條完整的服務歷程') + '</p></div>'
      + '</div></div></div></section>';
  };

  // ★ AI Agent 互動示範
  R.agent_chat = function (b) {
    var cs = arr(b.cases).filter(function (c) { return c && c.q; });
    if (!cs.length) return '';
    return '<section class="st-sec st-light st-agent" data-st-agent><div class="st-wrap">'
      + eyebrow(b) + heading(b) + (b.sub ? '<p class="st-sub st-sub-dark">' + txt(b.sub) + '</p>' : '')
      + '<div class="st-ag-qs">' + cs.map(function (c, i) {
        return '<button type="button" data-st-case="' + i + '"' + (i === 0 ? ' class="on"' : '') + '>' + esc(c.q) + '</button>';
      }).join('') + '</div>'
      + '<div class="st-ag-grid">' + cs.map(function (c, i) {
        var hand = String(c.handoff || '').trim();
        return '<div class="st-ag-case st-s4' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">'
          + '<div class="st-ag-chat"><div class="st-chat-head"><i class="st-live"></i><b>AI 客服助理</b><span>示範</span></div>'
          + '<div class="st-ag-body"><div class="st-msg st-msg-user"><small>客戶</small><p>' + esc(c.q) + '</p></div>'
          + '<div class="st-msg st-msg-ai st-ag-ans"><small>AI</small><p data-st-type>' + txt(c.answer) + '</p></div>'
          + (hand ? '<div class="st-msg st-msg-agent st-ag-hand"><small>專員</small><p>已接手，您好，我是客服專員，這件事由我為您處理。</p></div>' : '')
          + '</div></div>'
          + '<ol class="st-ag-steps">'
          + '<li class="k1"><b>理解意圖</b><span>' + esc(c.intent) + '</span></li>'
          + '<li class="k2"><b>檢索企業知識庫</b><span>' + esc(c.source) + '</span></li>'
          + '<li class="k3"><b>依知識產生回覆</b><span>只根據企業資料回答，不自行編造</span></li>'
          + '<li class="k4' + (hand ? ' hand' : '') + '"><b>' + (hand ? '轉交真人專員' : 'AI 直接完成') + '</b><span>' + esc(hand || '問題已解決，紀錄寫回 CRM') + '</span></li>'
          + '</ol></div>';
      }).join('') + '</div>'
      + (b.note ? '<p class="st-note-dark">' + esc(b.note) + '</p>' : '')
      + '</div></section>';
  };

  // ★ 數據標註示範
  R.label_demo = function (b) {
    var sg = arr(b.segs);
    if (!sg.length) return '';
    var tagged = sg.filter(function (x) { return x.tag; });
    function val(x) { return x.qa || x.ai || x.text; }
    var stages = ['原始資料', 'AI 預標註', '人工 QA 複審', '結構化輸出'];
    return '<section class="st-sec st-warm st-label" data-st-label data-stage="4"><div class="st-wrap">'
      + eyebrow(b) + heading(b) + (b.sub ? '<p class="st-sub st-sub-dark">' + txt(b.sub) + '</p>' : '')
      + '<div class="st-stepper">' + stages.map(function (t, i) {
        return '<button type="button" data-st-stage="' + (i + 1) + '"><i>' + (i + 1) + '</i>' + t + '</button>';
      }).join('') + '<button type="button" class="st-replay" data-st-replay aria-label="重播">↻ 重播</button></div>'
      + '<div class="st-lb-grid"><div class="st-lb-card">'
      + '<div class="st-lb-src">' + esc(b.source || '客服錄音逐字稿（示意）') + '</div>'
      + '<p class="st-lb-text">' + sg.filter(function (x) { return x.text; }).map(function (x) {
        if (!x.tag) return '<span>' + esc(x.text) + '</span>';
        var fix = x.qa && x.qa !== x.ai;
        return '<span class="st-lb-seg' + (fix ? ' fix' : '') + (!x.ai ? ' add' : '') + '" data-tag="' + esc(x.tag) + '">' + esc(x.text)
          + '<span class="st-lb-chip"><b>' + esc(x.tag) + '</b>'
          + (x.ai ? '<s>' + esc(x.ai) + '</s>' : '') + (fix || !x.ai ? '<ins>' + esc(x.qa) + '</ins>' : '') + '</span></span>';
      }).join('') + '</p>'
      + (sg.some(function (x) { return x.tag && !x.text; }) ? '<div class="st-lb-whole">整句標註：' + sg.filter(function (x) { return x.tag && !x.text; }).map(function (x) {
        var fix = x.qa && x.qa !== x.ai;
        return '<span class="st-lb-seg' + (fix ? ' fix' : '') + (!x.ai ? ' add' : '') + '"><span class="st-lb-chip"><b>' + esc(x.tag) + '</b>' + (x.ai ? '<s>' + esc(x.ai) + '</s>' : '') + (fix || !x.ai ? '<ins>' + esc(x.qa) + '</ins>' : '') + '</span></span>';
      }).join('') + '</div>' : '')
      + '<div class="st-lb-legend"><span class="l-ai">AI 預標</span><span class="l-fix">人工修正</span><span class="l-add">人工補標</span></div>'
      + '</div>'
      + '<pre class="st-lb-json"><code>{\n' + tagged.map(function (x, i) {
        return '  <span class="k">"' + esc(x.tag) + '"</span>: <span class="v">"' + esc(val(x)) + '"</span>' + (i < tagged.length - 1 ? ',' : '') + '\n';
      }).join('') + '}</code><small>AI 可直接學習的結構化資料</small></pre>'
      + '</div></div></section>';
  };

  // ★ 對話洞察示範
  R.voice_insight = function (b) {
    var ln = arr(b.lines).filter(function (x) { return x && x.text; });
    if (!ln.length) return '';
    var kinds = [];
    ln.forEach(function (x) { if (x.kind && kinds.indexOf(x.kind) < 0) kinds.push(x.kind); });
    return '<section class="st-sec st-dark st-voice" data-st-voice><div class="st-wrap">'
      + eyebrow(b) + heading(b) + (b.sub ? '<p class="st-sub">' + txt(b.sub) + '</p>' : '')
      + '<div class="st-vo-grid"><div class="st-vo-call">'
      + '<div class="st-chat-head"><i class="st-live"></i><b>' + esc(b.call || '客服來電（示意）') + '</b><button type="button" data-st-replay>↻ 重播</button></div>'
      + '<div class="st-vo-bar"><i data-st-progress></i></div>'
      + '<div class="st-vo-lines">' + ln.map(function (x, i) {
        return '<div class="st-vo-line ' + (who(x.who) === 'user' ? 'cust' : 'agent') + (x.kind ? ' has' : '') + '" data-i="' + i + '"><small>' + esc(x.who) + '</small><p>' + esc(x.text) + '</p></div>';
      }).join('') + '</div></div>'
      + '<div class="st-vo-board">' + kinds.map(function (k) {
        return '<div class="st-vo-col"><h3>' + esc(k) + '</h3>' + ln.map(function (x, i) {
          return x.kind === k ? '<span class="st-vo-chip" data-i="' + i + '">' + esc(x.insight || x.text) + '</span>' : '';
        }).join('') + '</div>';
      }).join('') + '</div></div>'
      + (b.note ? '<p class="st-note-dark st-note-light">' + esc(b.note) + '</p>' : '')
      + '</div></section>';
  };
  R.timeline = function (b) {
    var steps = arr(b.steps);
    if (!steps.length) return '';
    return '<section class="st-sec st-light" data-st-timeline><div class="st-wrap">'
      + eyebrow(b) + heading(b)
      + (b.hint ? '<p class="st-hint">' + esc(b.hint) + ' ↓</p>' : '')
      + '<div class="st-tl">'
      + '<div class="st-tl-sticky"><div class="st-tl-board">'
      + '<div class="st-tl-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="st-ring-bg"/><circle cx="60" cy="60" r="52" class="st-ring-fg" data-st-ring/></svg>'
      + '<div class="st-tl-now" data-st-now>' + esc(steps[0].time) + '</div></div>'
      + '<div class="st-tl-cap" data-st-cap>' + esc(steps[0].title) + '</div>'
      + '<div class="st-chips">' + steps.map(function (s, i) {
        return '<button type="button" data-st-jump="' + i + '"' + (i === 0 ? ' class="on"' : '') + '>' + esc(s.time || (i + 1)) + '</button>';
      }).join('') + '</div></div></div>'
      + '<div class="st-tl-steps">' + steps.map(function (s, i) {
        return '<article class="st-step st-reveal" data-st-step="' + i + '">'
          + '<span class="st-time">' + esc(s.time) + '</span>'
          + '<h3>' + txt(s.title) + '</h3><p>' + txt(s.desc) + '</p>'
          + (s.tag ? '<span class="st-tag">' + esc(s.tag) + '</span>' : '')
          + '</article>';
      }).join('') + '</div></div></div></section>';
  };
  R.flow = function (b) {
    var steps = arr(b.steps);
    if (!steps.length) return '';
    return '<section class="st-sec st-dark"><div class="st-wrap">'
      + eyebrow(b) + heading(b) + (b.sub ? '<p class="st-sub">' + txt(b.sub) + '</p>' : '')
      + '<div class="st-flow">' + steps.map(function (s, i) {
        return '<div class="st-flow-step st-reveal" style="--d:' + (i * 0.12) + 's"><b>' + esc(s.label || ('STEP ' + (i + 1))) + '</b><h3>' + txt(s.title) + '</h3><p>' + txt(s.desc) + '</p></div>';
      }).join('') + '</div></div></section>';
  };
  R.stats = function (b) {
    var items = arr(b.items);
    if (!items.length) return '';
    return '<section class="st-sec st-warm"><div class="st-wrap">'
      + eyebrow(b) + heading(b)
      + '<div class="st-stats">' + items.map(function (s) {
        return '<div class="st-stat st-reveal"><div class="st-num"><span data-st-count="' + esc(String(s.num || '').replace(/[^0-9.]/g, '')) + '">' + esc(s.num) + '</span><small>' + esc(s.unit) + '</small></div><div class="st-stat-label">' + esc(s.label) + '</div></div>';
      }).join('') + '</div>'
      + (b.note ? '<p class="st-note-dark">' + esc(b.note) + '</p>' : '')
      + '</div></section>';
  };
  R.features = function (b) {
    var items = arr(b.items);
    if (!items.length) return '';
    return '<section class="st-sec st-light"><div class="st-wrap">'
      + eyebrow(b) + heading(b) + (b.sub ? '<p class="st-sub st-sub-dark">' + txt(b.sub) + '</p>' : '')
      + '<div class="st-cards">' + items.map(function (f, i) {
        return '<div class="st-card st-reveal" style="--d:' + (i % 3 * 0.1) + 's"><i>' + esc(f.icon || '✦') + '</i><h3>' + txt(f.title) + '</h3><p>' + txt(f.desc) + '</p></div>';
      }).join('') + '</div></div></section>';
  };
  R.pain_solution = function (b, svc) {
    var pains = arr(svc.pain_points), feats = arr(svc.features);
    if (!pains.length && !feats.length) return '';
    return '<section class="st-sec st-warm"><div class="st-wrap">'
      + '<div class="st-eyebrow">PAIN × SOLUTION</div><h2>' + txt(b.title || '痛點解析 × ') + (b.title ? '' : '<em>解決方案</em>') + '</h2>'
      + '<div class="st-compare">'
      + '<div class="st-col st-col-pain st-reveal"><h3>企業常見痛點</h3><ul>' + pains.map(function (p) { return '<li>' + esc(p.desc) + '</li>'; }).join('') + '</ul></div>'
      + '<div class="st-col st-col-sol st-reveal"><h3>我們的解決方案</h3><ul>' + feats.map(function (f) { return '<li><b>' + esc(f.title) + '</b>' + (f.desc ? '<span>' + esc(f.desc) + '</span>' : '') + '</li>'; }).join('') + '</ul></div>'
      + '</div></div></section>';
  };
  R.industries = function (b, svc) {
    var inds = arr(svc.industries);
    if (!inds.length) return '';
    return '<section class="st-sec st-light"><div class="st-wrap">'
      + '<div class="st-eyebrow">INDUSTRIES</div><h2>' + txt(b.title || '適用產業') + '</h2>'
      + '<div class="st-inds">' + inds.map(function (x) {
        return '<div class="st-ind st-reveal">' + (x.icon ? '<i>' + esc(x.icon) + '</i>' : '') + '<b>' + esc(x.name) + '</b>' + (x.desc ? '<span>' + esc(x.desc) + '</span>' : '') + '</div>';
      }).join('') + '</div></div></section>';
  };
  R.faq = function (b, svc) {
    var faq = arr(svc.faq);
    if (!faq.length) return '';
    return '<section class="st-sec st-warm"><div class="st-wrap st-narrow">'
      + '<div class="st-eyebrow">FAQ</div><h2>' + txt(b.title || '常見問題') + '</h2>'
      + '<div class="st-faq">' + faq.map(function (f, i) {
        return '<details class="st-reveal"' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary><p>' + txt(f.a) + '</p></details>';
      }).join('') + '</div></div></section>';
  };
  R.cta = function (b) {
    return '<section class="st-sec st-dark st-cta"><div class="st-wrap">'
      + '<h2>' + txt(b.title || '準備好開始了嗎？') + '</h2>'
      + (b.desc ? '<p class="st-sub">' + txt(b.desc) + '</p>' : '')
      + '<div class="st-ctas st-center">' + btn(b.primary_text || '免費諮詢', b.primary_link || '/contact.html', 'st-btn-main')
      + btn(b.secondary_text, b.secondary_link, 'st-btn-ghost') + '</div>'
      + '<p class="st-tel">免付費專線 <a href="tel:0800666080">0800-666-080</a></p>'
      + '</div></section>';
  };

  function others(svc, all) {
    var list = arr(all).filter(function (s) { return s.published && s.slug; })
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    if (list.length < 2) return '';
    return '<section class="st-sec st-others"><div class="st-wrap"><div class="st-eyebrow">MORE SERVICES</div><h2>其他專案服務</h2><div class="st-other-grid">'
      + list.map(function (s) {
        return '<a href="/services/' + esc(s.slug) + '"' + (s.slug === svc.slug ? ' class="cur" aria-current="page"' : '') + '><i>' + esc(s.icon || '📋') + '</i><span><small>' + esc(s.num) + '</small>' + esc(s.title) + '</span></a>';
      }).join('') + '</div></div></section>';
  }

  function themeCss(name) {
    var t = THEMES[name] || THEMES.navy;
    return '--st-deep:' + t.deep + ';--st-bg:' + t.bg + ';--st-bg2:' + t.bg2 + ';--st-accent:' + t.accent + ';--st-accent-dark:' + t.accentDark
      + ';--st-light:' + t.light + ';--st-soft:' + t.soft + ';--st-rgb:' + t.rgb + ';--st-tint:' + t.tint + ';--st-sub:' + t.sub;
  }

  // 沒填故事區塊時，依現有欄位自動組一個基本版本
  function defaultBlocks(svc) {
    return [
      { type: 'hero', eyebrow: '東州集團｜' + (svc.title || ''), title: svc.hero_title || svc.title, lead: svc.hero_subtitle || svc.desc, primary_text: '立即諮詢', primary_link: '/contact.html', secondary_text: '查看所有服務', secondary_link: '/services.html' },
      { type: 'pain_solution' }, { type: 'industries' }, { type: 'faq' }, { type: 'cta' }
    ];
  }

  function render(svc, all) {
    var blocks = arr(svc.story);
    if (!blocks.length) blocks = defaultBlocks(svc);
    var html = blocks.map(function (b) {
      var fn = R[b && b.type];
      var h = fn ? fn(b, svc) : '';
      // 每個區塊加錨點（#timeline、#faq…），按鈕可用 #區塊類型 跳轉
      return h ? h.replace('<section ', '<section id="' + esc(b.type) + '" ') : '';
    }).join('');
    // 「服務介紹」正文放在主視覺之後（讀者與搜尋引擎都看得到）；後台可關閉
    if (svc.content && svc.story_show_intro !== false) {
      html = html.replace('</section>', '</section>' + '<section class="st-sec st-light st-intro"><div class="st-wrap st-narrow"><div class="st-eyebrow">SERVICE OVERVIEW</div><h2>' + esc(svc.title) + '</h2><p>' + txt(svc.content) + '</p></div></section>');
    }
    return { style: themeCss(svc.theme), html: html + others(svc, all) };
  }

  // SEO：head 內的標籤（title、description、canonical、OG、結構化資料）
  function headTags(svc) {
    var url = SITE + '/services/' + svc.slug;
    var title = svc.seo_title || (svc.title + '｜IPCC 東州集團');
    var desc = svc.seo_desc || svc.desc || '';
    var img = svc.image && /^https?:/.test(svc.image) ? svc.image : SITE + '/IPCCLOGO.png';
    var ld = [{
      '@context': 'https://schema.org', '@type': 'Service', name: svc.title, description: desc, url: url,
      serviceType: svc.title, keywords: arr(svc.tags).join(', '), areaServed: { '@type': 'Country', name: 'Taiwan' }, inLanguage: 'zh-Hant-TW',
      provider: { '@type': 'Organization', name: '東州集團', alternateName: ['IPCC', '顯榮國際'], url: SITE + '/', telephone: '+886-800-666-080', sameAs: ['https://www.facebook.com/easy.ipcc/', 'https://lin.ee/rp9TNMU'] }
    }, {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首頁', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: '專案服務', item: SITE + '/services.html' },
        { '@type': 'ListItem', position: 3, name: svc.title, item: url }]
    }];
    var faq = arr(svc.faq).filter(function (f) { return f && f.q && f.a; });
    if (faq.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(function (f) { return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }; }) });
    return '<title>' + esc(title) + '</title>\n'
      + '<meta name="description" content="' + esc(desc) + '">\n'
      + (arr(svc.tags).length ? '<meta name="keywords" content="' + esc(arr(svc.tags).join(',')) + '">\n' : '')
      + '<link rel="canonical" href="' + url + '">\n'
      + '<meta property="og:type" content="website">\n<meta property="og:locale" content="zh_TW">\n<meta property="og:site_name" content="IPCC 東州集團">\n'
      + '<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n'
      + '<meta property="og:url" content="' + url + '">\n<meta property="og:image" content="' + esc(img) + '">\n'
      + '<meta name="twitter:card" content="summary_large_image">\n'
      + '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script>\n';
  }

  return { SITE: SITE, THEMES: THEMES, BLOCKS: BLOCKS, render: render, headTags: headTags, defaultBlocks: defaultBlocks, arr: arr, esc: esc };
});
