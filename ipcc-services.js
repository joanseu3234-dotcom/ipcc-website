// Shared service renderer — populates #footerSvcList and #homeServicesGrid
// on any page that includes this script after content-data.js.
(function() {
  function getPublishedServices() {
    var svcs = [];
    try { var r = localStorage.getItem('ipcc_services'); if (r) svcs = JSON.parse(r); } catch(e) {}
    if (!svcs.length && window.IPCC_CONTENT_DATA && window.IPCC_CONTENT_DATA.ipcc_services)
      svcs = window.IPCC_CONTENT_DATA.ipcc_services;
    return svcs.filter(function(s){ return s.published; }).sort(function(a,b){ return (a.order||0) - (b.order||0); });
  }

  // Populate footer service link list
  function renderFooterSvcList() {
    var el = document.getElementById('footerSvcList');
    if (!el) return;
    var svcs = getPublishedServices();
    if (!svcs.length) return;
    el.innerHTML = svcs.map(function(s) {
      var href = s.slug ? '/services/' + s.slug : 'services.html';
      return '<li><a href="' + href + '">' + (s.title || '') + '</a></li>';
    }).join('');
  }

  // 各服務主題色（與服務頁一致）：c＝主色、l＝深色背景上用的亮色
  var THEME = {
    navy:     { c: '47,123,255',  l: '127,176,255' },
    teal:     { c: '15,165,151',  l: '95,224,210' },
    graphite: { c: '184,137,46',  l: '230,201,138' },
    indigo:   { c: '99,102,241',  l: '165,180,252' },
    red:      { c: '200,22,29',   l: '255,130,130' }
  };
  function themeOf(s) { return THEME[s.theme] || THEME[s.layout === 'custom' ? 'navy' : 'red']; }

  var FX_CSS = ''
    + '.svc-fx{--c:200,22,29;--l:255,130,130;--mx:50%;--my:0%;isolation:isolate;transition:transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s,border-color .45s,background .45s}'
    + '.svc-fx::before{background:linear-gradient(90deg,rgb(var(--c)),rgb(var(--l)))!important;height:4px!important}'
    + '.svc-fx::after{content:"";position:absolute;inset:0;z-index:-1;opacity:0;transition:opacity .4s;background:radial-gradient(420px circle at var(--mx) var(--my),rgba(var(--c),.16),transparent 60%)}'
    + '.svc-fx:hover::after{opacity:1}'
    + '.section-dark .svc-fx:hover{background:rgba(var(--c),.12);border-color:rgba(var(--l),.5);box-shadow:0 22px 50px -16px rgba(var(--c),.55),0 2px 8px rgba(0,0,0,.4)}'
    + '.svc-fx:not(.section-dark *):hover{border-color:rgba(var(--c),.45);box-shadow:0 22px 48px -18px rgba(var(--c),.45)}'
    + '.svc-fx .service-icon{transition:background .45s,box-shadow .45s;transform-origin:50% 80%}'
    + '.svc-fx:hover .service-icon{background:linear-gradient(135deg,rgba(var(--c),.75),rgb(var(--c)));box-shadow:0 10px 24px -6px rgba(var(--c),.7);animation:svc-fx-icon 1.2s ease-in-out}'
    + '@keyframes svc-fx-icon{0%{transform:none}25%{transform:translateY(-6px) rotate(-8deg) scale(1.12)}50%{transform:translateY(-2px) rotate(5deg) scale(1.08)}75%{transform:translateY(-4px) rotate(-2deg) scale(1.1)}100%{transform:none}}'
    + '.svc-fx .service-num,.svc-fx .service-title,.svc-fx .service-link,.svc-fx .service-tag{transition:color .35s,background .35s,border-color .35s}'
    + '.svc-fx:hover .service-num,.svc-fx:hover .service-link{color:rgb(var(--l))}'
    + '.svc-fx:not(.section-dark *):hover .service-num,.svc-fx:not(.section-dark *):hover .service-link,.svc-fx:not(.section-dark *):hover .service-title{color:rgb(var(--c))}'
    + '.section-dark .svc-fx:hover .service-title{color:rgb(var(--l))}'
    + '.svc-fx:hover .service-tag{background:rgba(var(--c),.16);border-color:rgba(var(--l),.35);color:rgb(var(--l))}'
    + '.svc-fx:hover .service-link{gap:12px}'
    + '.svc-fx-badge{position:absolute;top:22px;right:22px;display:inline-flex;align-items:center;gap:6px;font-size:.7rem;font-weight:700;letter-spacing:.04em;padding:4px 10px;border-radius:100px;color:rgb(var(--l));background:rgba(var(--c),.16);border:1px solid rgba(var(--l),.3)}'
    + '.svc-fx-badge i{width:6px;height:6px;border-radius:50%;background:rgb(var(--l));animation:svc-fx-pulse 1.8s infinite}'
    + '@keyframes svc-fx-pulse{0%{box-shadow:0 0 0 0 rgba(var(--l),.55)}70%{box-shadow:0 0 0 7px rgba(var(--l),0)}100%{box-shadow:0 0 0 0 rgba(var(--l),0)}}'
    + '.svc-fx-js .svc-fx{opacity:0;transform:translateY(28px)}'
    + '.svc-fx-js .svc-fx.in{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .7s cubic-bezier(.2,.8,.2,1) var(--d,0s),box-shadow .45s,border-color .45s,background .45s}'
    + '.svc-fx-js .svc-fx.in.done{transition:transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s,border-color .45s,background .45s}'
    + '.svc-fx-js .svc-fx.in.done:hover{transform:translateY(-8px)}'
    + '@media (prefers-reduced-motion:reduce){.svc-fx-js .svc-fx{opacity:1;transform:none}.svc-fx:hover .service-icon,.svc-fx-badge i{animation:none}.svc-fx:hover{transform:none!important}}';

  function addFx(box) {
    if (!document.getElementById('svcFxCss')) {
      var st = document.createElement('style'); st.id = 'svcFxCss'; st.textContent = FX_CSS; document.head.appendChild(st);
    }
    var cards = box.querySelectorAll('.svc-fx');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && 'IntersectionObserver' in window) {
      box.classList.add('svc-fx-js');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          e.target.classList.add('in');
          setTimeout(function () { e.target.classList.add('done'); }, 1400);
        });
      }, { threshold: 0.12 });
      Array.prototype.forEach.call(cards, function (c, i) { c.style.setProperty('--d', (i % 3) * 0.12 + 's'); io.observe(c); });
    }
    Array.prototype.forEach.call(cards, function (c) {
      c.addEventListener('mousemove', function (ev) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        c.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    });
  }

  // Populate homepage / section services grid
  function renderHomeSvcGrid() {
    var el = document.getElementById('homeServicesGrid');
    if (!el) return;
    var svcs = getPublishedServices();
    if (!svcs.length) {
      el.innerHTML = '<p style="text-align:center;color:var(--text-sub);margin-top:40px;">服務內容載入中，請稍後再試。</p>';
      return;
    }
    var gridClass = svcs.length === 5 ? 'services-grid services-grid-5' : 'services-grid';
    el.innerHTML = '<div class="' + gridClass + '">'
      + svcs.map(function(s) {
          var href = s.slug ? '/services/' + s.slug : 'services.html';
          var tags = (s.tags || []).slice(0, 4).map(function(t) {
            return '<span class="service-tag">' + t + '</span>';
          }).join('');
          var t = themeOf(s);
          var badge = s.layout === 'story' || s.layout === 'custom' ? '<span class="svc-fx-badge"><i></i>互動體驗</span>' : '';
          return '<a href="' + href + '" class="service-card svc-fx" style="text-decoration:none;color:inherit;--c:' + t.c + ';--l:' + t.l + '">' + badge
            + '<div><span class="service-num">' + (s.num || '') + '</span></div>'
            + '<div class="service-icon">' + (s.icon || '📋') + '</div>'
            + '<div><h3 class="service-title">' + (s.title || '') + '</h3>'
            + '<p class="service-desc">' + (s.desc || '') + '</p></div>'
            + '<div class="service-tags">' + tags + '</div>'
            + '<span class="service-link">了解更多 →</span>'
            + '</a>';
        }).join('')
      + '</div>';
    addFx(el);
  }


  // 內容卡片（成功案例 / 最新消息 / 媒體採訪 / 活動 / 首頁消息）：與服務卡片同系列的動態效果
  var CX_CSS = ''
    + '.cx-fx{--c:30,42,94;--mx:50%;--my:0%;position:relative;isolation:isolate;transition:transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s,border-color .45s!important}'
    + '.cx-fx:not(.cx-plain)::before{content:"";position:absolute;left:0;top:0;right:0;height:4px;z-index:3;background:linear-gradient(90deg,rgb(var(--c)),rgba(var(--c),.35));transform:scaleX(0);transform-origin:left;transition:transform .5s cubic-bezier(.2,.8,.2,1)}'
    + '.cx-fx:not(.cx-plain):hover::before{transform:scaleX(1)}'
    + '.cx-fx:not(.cx-plain)::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(380px circle at var(--mx) var(--my),rgba(var(--c),.12),transparent 60%)}'
    + '.cx-fx:not(.cx-plain):hover::after{opacity:1}'
    + '.cx-fx:not(.cx-soft):hover{transform:translateY(-8px)!important;border-color:rgba(var(--c),.4)!important;box-shadow:0 22px 48px -18px rgba(var(--c),.5),0 2px 8px rgba(0,0,0,.06)!important}'
    + '.cx-fx .cx-img{overflow:hidden}'
    + '.cx-fx .cx-img img,.cx-fx .cx-img video,.cx-fx .cx-ph{transition:transform .7s cubic-bezier(.2,.8,.2,1)}'
    + '.cx-fx:hover .cx-img img,.cx-fx:hover .cx-img video{transform:scale(1.06)}'
    + '.cx-fx:hover .cx-ph{animation:cx-fx-wig 1.2s ease-in-out}'
    + '@keyframes cx-fx-wig{0%{transform:none}25%{transform:translateY(-6px) rotate(-8deg) scale(1.12)}50%{transform:translateY(-2px) rotate(5deg) scale(1.08)}75%{transform:translateY(-4px) rotate(-2deg) scale(1.1)}100%{transform:none}}'
    + '.cx-fx .cx-icobg{transition:background .45s,box-shadow .45s}'
    + '.cx-fx:hover .cx-icobg{background:linear-gradient(135deg,rgba(var(--c),.75),rgb(var(--c)));box-shadow:0 8px 20px -6px rgba(var(--c),.7)}'
    + '.about-card-main.cx-fx::before{transition:transform .8s cubic-bezier(.2,.8,.2,1)}.about-card-main.cx-fx:hover::before{transform:scale(1.7)}'
    + '.about-card-main.cx-fx [style*="rgba(255,255,255,0.07)"]{position:relative;z-index:1;transition:background .35s,transform .35s}.about-card-main.cx-fx [style*="rgba(255,255,255,0.07)"]:hover{background:rgba(255,255,255,.13)!important;transform:translateX(6px)}'
    + '.cx-fx .cx-badge{transition:transform .35s,box-shadow .35s}'
    + '.cx-fx:hover .cx-badge{transform:translateY(-2px);box-shadow:0 6px 16px -4px rgba(var(--c),.7)}'
    + '.cx-fx .cx-title{transition:color .35s}'
    + '.cx-fx:hover .cx-title{color:rgb(var(--c))}'
    + '.cx-fx .cx-btn{transition:color .35s,transform .35s}'
    + '.cx-fx:hover .cx-btn{color:rgb(var(--c));transform:translateX(5px)}'
    + '.cx-fx-js .cx-fx{opacity:0;transform:translateY(28px)}'
    + '.cx-fx-js .cx-fx.in{opacity:1;transform:none;transition:opacity .7s ease var(--d,0s),transform .7s cubic-bezier(.2,.8,.2,1) var(--d,0s)!important}'
    + '.cx-fx-js .cx-fx.in.done{transition:transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s,border-color .45s!important}'
    + '@media (hover:none){.cx-fx:hover{transform:none!important}}'
    + '@media (prefers-reduced-motion:reduce){.cx-fx-js .cx-fx{opacity:1;transform:none}.cx-fx:hover{transform:none!important}.cx-fx:hover .cx-ph{animation:none}.cx-fx:hover .cx-img img,.cx-fx:hover .cx-img video{transform:none}}';

  // grid：容器；pre：卡片 class 前綴（cn / news / media / event / insight），或自訂選擇器物件；rgb：主題色（省略則取徽章顏色）
  function cardFx(grid, pre, rgb) {
    if (!grid) return;
    var q = typeof pre === 'string' ? {
      card: '.' + pre + '-card', img: '.' + pre + '-card-img',
      ph: '.' + pre + '-card-emoji,.' + pre + '-card-placeholder',
      title: '.' + pre + '-card-client,.' + pre + '-card-title,h4',
      btn: '.' + pre + '-read-btn,.' + pre + '-card-cta,.' + pre + '-card-read',
      badge: '.' + pre + '-card-badge,.' + pre + '-card-cat'
    } : pre;
    if (!document.getElementById('cxFxCss')) {
      var st = document.createElement('style'); st.id = 'cxFxCss'; st.textContent = CX_CSS; document.head.appendChild(st);
    }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var io = !reduce && 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add('in');
        setTimeout(function () { e.target.classList.add('done'); }, 1400);
      });
    }, { threshold: 0.12 }) : null;
    if (io) grid.classList.add('cx-fx-js');
    function tag(c, sel, cls) { Array.prototype.forEach.call(c.querySelectorAll(sel), function (x) { x.classList.add(cls); }); }
    function apply() {
      var cards = grid.querySelectorAll(q.card);
      if (!cards.length) return;
      var color = rgb;
      if (!color) {
        color = '30,42,94';
        var b = grid.querySelector(q.badge);
        var m = b && getComputedStyle(b).backgroundColor.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (m) color = m[1] + ',' + m[2] + ',' + m[3];
      }
      Array.prototype.forEach.call(cards, function (c, i) {
        if (c.classList.contains('cx-fx')) return;
        c.classList.add('cx-fx');
        if (q.soft) c.classList.add('cx-soft');
        if (q.plain) c.classList.add('cx-plain');
        if (q.icobg) tag(c, q.icobg, 'cx-icobg');
        c.style.setProperty('--c', color);
        tag(c, q.img, 'cx-img');
        tag(c, q.ph, 'cx-ph');
        tag(c, q.title, 'cx-title');
        tag(c, q.btn, 'cx-btn');
        tag(c, q.badge, 'cx-badge');
        // 圖片區只有 emoji 文字時，包成可晃動的元素
        Array.prototype.forEach.call(c.querySelectorAll('.cx-img'), function (im) {
          if (!im.children.length && im.textContent.trim()) {
            im.innerHTML = '<span class="cx-ph" style="display:inline-block">' + im.innerHTML + '</span>';
          }
        });
        Array.prototype.forEach.call(c.querySelectorAll('.cx-btn'), function (x) {
          if (getComputedStyle(x).display === 'inline') x.style.display = 'inline-block';
        });
        if (io) { c.style.setProperty('--d', (i % 3) * 0.12 + 's'); io.observe(c); }
        c.addEventListener('mousemove', function (ev) {
          var r = c.getBoundingClientRect();
          c.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
          c.style.setProperty('--my', (ev.clientY - r.top) + 'px');
        });
      });
    }
    apply();
    // 卡片重新渲染（例如切換分類）時自動補上效果
    if ('MutationObserver' in window) new MutationObserver(apply).observe(grid, { childList: true });
  }

  function contentCardFx() {
    cardFx(document.getElementById('caseGrid'), 'cn');           // 成功案例三頁（色取自徽章）
    cardFx(document.getElementById('newsGrid'), 'news', '30,42,94');   // 最新消息
    cardFx(document.getElementById('mediaGrid'), 'media', '30,42,94'); // 媒體採訪
    cardFx(document.getElementById('eventGrid'), 'event', '30,42,94'); // 活動
    cardFx(document.getElementById('insightsGrid'), 'insight', '200,22,29'); // 產業新知列表
    cardFx(document.getElementById('homeInsightsGrid'), {           // 首頁「客服產業新知」
      card: '.insight-home-card', img: '.insight-home-img', ph: '.cx-none', title: '.insight-home-title',
      btn: '.insight-home-link', badge: '.insight-home-cat'
    }, '200,22,29');
    // 關於我們
    cardFx(document.getElementById('awards-main-grid'), {           // 獲獎事蹟：主要獎項（獎項橘）
      card: '.award-card', img: '.award-card-img', ph: '.cx-none', title: '.award-card-title',
      btn: '.award-card-read', badge: '.cx-none'
    }, '217,119,6');
    cardFx(document.getElementById('awards-certs-grid'), {          // 獲獎事蹟：認證（深色區，金色）
      card: '#awards-certs-grid > div', img: ':scope > div:first-child', ph: '.cx-none', title: '.cx-none',
      btn: '.cx-none', badge: '.cx-none'
    }, '255,200,100');
    cardFx(document.getElementById('security-principles-grid'), {   // 資訊安全：六大原則（保留原本的深藍反色）
      card: '.sec-principle-card', img: '.cx-none', ph: '.sec-icon-wrap', title: '.cx-none',
      btn: '.cx-none', badge: '.cx-none'
    }, '200,22,29');
    cardFx(document.querySelector('.core-values-grid'), {           // 願景：核心價值（格狀相連，不浮起）
      card: '.core-value-card', img: '.cx-none', ph: '.cx-none', title: '.cx-none',
      btn: '.cx-none', badge: '.cx-none', soft: true
    }, '200,22,29');
    cardFx(document.querySelector('.about-stats-row'), {            // 關於我們：統計小卡
      card: '.about-stat-card', img: '.cx-none', ph: '.cx-none', title: '.about-stat-num',
      btn: '.cx-none', badge: '.cx-none'
    }, '200,22,29');
    // 首頁「我們是誰」：四個價值項目、雙核心大卡（保留原本裝飾，不加光暈層）
    cardFx(document.querySelector('.about-values'), {
      card: '.value-item', img: '.cx-none', ph: '.value-icon', icobg: '.value-icon', title: '.value-title',
      btn: '.cx-none', badge: '.cx-none', soft: true, plain: true
    }, '200,22,29');
    cardFx(document.querySelector('.about-visual') || document.querySelector('.about-card-main') && document.querySelector('.about-card-main').parentNode, {
      card: '.about-card-main', img: '.cx-none', ph: '.cx-none', title: '.cx-none',
      btn: '.cx-none', badge: '.cx-none', plain: true
    }, '200,22,29');
    Array.prototype.forEach.call(document.querySelectorAll('[id^="tab-"] .news-grid'), function (g) {
      cardFx(g, 'news', '200,22,29');                              // 首頁「最新消息」分頁（品牌紅）
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { renderFooterSvcList(); renderHomeSvcGrid(); contentCardFx(); });
  } else {
    renderFooterSvcList();
    renderHomeSvcGrid();
    contentCardFx();
  }
})();
