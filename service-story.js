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
        { key: 'note', label: '看板下方註記（選填）', ph: '＊數字為示意' }
      ],
      items: { key: 'panel_items', label: '看板項目（逐列跳動顯示）', fields: [
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

  var R = {};
  R.hero = function (b, svc) {
    var items = arr(b.panel_items);
    var panel = '';
    if (b.panel_title || items.length) {
      panel = '<div class="st-panel" data-st-panel>'
        + '<div class="st-panel-head"><b>' + esc(b.panel_title || '') + '</b><span><i class="st-live"></i>即時</span></div>'
        + '<ul>' + items.map(function (it, i) {
          return '<li' + (i === 0 ? ' class="on"' : '') + '><em>' + esc(it.left) + '</em><span>' + esc(it.label) + '</span><strong>' + esc(it.right) + '</strong></li>';
        }).join('') + '</ul></div>'
        + (b.note ? '<div class="st-note">' + esc(b.note) + '</div>' : '');
    }
    return '<section class="st-hero st-dark"><div class="st-wrap st-hero-grid' + (panel ? '' : ' st-hero-solo') + '">'
      + '<div class="st-hero-text">'
      + '<nav class="st-crumb" aria-label="麵包屑"><a href="/">首頁</a> › <a href="/services.html">專案服務</a> › <span>' + esc(svc.title) + '</span></nav>'
      + (b.eyebrow ? '<div class="st-pill">' + esc(b.eyebrow) + '</div>' : '')
      + '<h1>' + txt(b.title || svc.hero_title || svc.title) + (b.highlight ? '<br><em>' + txt(b.highlight) + '</em>' : '') + '</h1>'
      + '<p class="st-lead">' + txt(b.lead || svc.hero_subtitle || svc.desc) + '</p>'
      + '<div class="st-ctas">' + btn(b.primary_text || '立即諮詢', b.primary_link || '/contact.html', 'st-btn-main') + btn(b.secondary_text, b.secondary_link, 'st-btn-ghost') + '</div>'
      + '</div>'
      + (panel ? '<div class="st-hero-visual">' + panel + '</div>' : '')
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
