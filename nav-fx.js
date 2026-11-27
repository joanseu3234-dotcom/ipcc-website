// 導覽列動態效果（全站共用）：進場、跟隨滑鼠的選單底色、Logo 晃動、按鈕流光、閱讀進度條、手機選單依序展開
// 每個有 <nav class="navbar"> 的頁面在 </body> 前載入：<script src="/nav-fx.js"></script>
(function () {
  var CSS = ''
    // 進場：Logo、選單、按鈕依序淡入
    + '.nfx-js .nfx-in{opacity:0;transform:translateY(-10px)}'
    + '.nfx-js.nfx-on .nfx-in{opacity:1;transform:none;transition:opacity .6s ease var(--d,0s),transform .6s cubic-bezier(.2,.8,.2,1) var(--d,0s)}'
    // 跟隨滑鼠的選單底色（桌機）
    + '.nfx-menu{position:relative}'
    + '.nfx-pill{position:absolute;top:50%;left:0;height:38px;width:0;margin-top:-19px;border-radius:10px;background:rgba(200,22,29,.07);box-shadow:inset 0 0 0 1px rgba(200,22,29,.1);opacity:0;pointer-events:none;z-index:0;transition:left .38s cubic-bezier(.2,.8,.2,1),width .38s cubic-bezier(.2,.8,.2,1),opacity .25s}'
    + '.nfx-menu li{position:relative;z-index:1}'
    + '.navbar .nav-link::before{content:"";position:absolute;bottom:0;left:50%;width:0;height:2px;border-radius:2px;background:#C8161D;transform:translateX(-50%);transition:width .35s cubic-bezier(.2,.8,.2,1)}'
    + '.navbar .nav-link:hover::before{width:20px}'
    + '.navbar .nav-link.active::before{display:none}'
    // Logo
    + '.navbar .nav-logo img{transition:transform .5s cubic-bezier(.2,.8,.2,1)}'
    + '.navbar .nav-logo:hover img{animation:nfx-wig 1.1s ease-in-out}'
    + '.navbar .nav-logo-group{transition:color .3s}'
    + '.navbar .nav-logo:hover .nav-logo-group{color:#C8161D}'
    + '@keyframes nfx-wig{0%{transform:none}25%{transform:rotate(-6deg) scale(1.06)}50%{transform:rotate(4deg) scale(1.04)}75%{transform:rotate(-2deg) scale(1.05)}100%{transform:none}}'
    // 「與我們聯繫」按鈕：定時流光、懸停浮起
    + '.navbar .nav-cta{position:relative;overflow:hidden;isolation:isolate}'
    + '.navbar .nav-cta::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:45%;z-index:-1;background:linear-gradient(105deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-18deg);animation:nfx-shine 4.5s ease-in-out infinite 1.5s}'
    + '@keyframes nfx-shine{0%{left:-60%}22%{left:130%}100%{left:130%}}'
    + '.navbar .nav-cta:hover{transform:translateY(-2px)!important;box-shadow:0 10px 24px -6px rgba(200,22,29,.55)!important}'
    // 閱讀進度條（捲動後才出現）
    + '.nfx-progress{position:absolute;left:0;bottom:-1px;height:2px;width:100%;transform-origin:left;transform:scaleX(var(--p,0));background:linear-gradient(90deg,#C8161D,#FF6B70);opacity:0;transition:opacity .3s;pointer-events:none}'
    + '.navbar.scrolled .nfx-progress,.navbar.nfx-scrolled .nfx-progress{opacity:1}'
    // 手機選單：項目依序滑入
    + '@keyframes nfx-drop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}'
    + '.nav-menu.open li{animation:nfx-drop .4s cubic-bezier(.2,.8,.2,1) both}'
    + '.nav-hamburger span{transition:transform .3s,opacity .3s}'
    + '.nfx-x span:nth-child(1){transform:translateY(7px) rotate(45deg)}.nfx-x span:nth-child(2){opacity:0}.nfx-x span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}'
    + '@media (prefers-reduced-motion:reduce){.nfx-js .nfx-in{opacity:1;transform:none}.navbar .nav-cta::after,.nav-menu.open li,.navbar .nav-logo:hover img{animation:none}.nfx-pill{transition:none}}';

  function init() {
    var nav = document.querySelector('nav.navbar');
    if (!nav || nav.classList.contains('nfx')) return;
    nav.classList.add('nfx');
    var st = document.createElement('style'); st.id = 'nfxCss'; st.textContent = CSS; document.head.appendChild(st);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 進場
    if (!reduce) {
      var parts = [nav.querySelector('.nav-logo')]
        .concat(Array.prototype.slice.call(nav.querySelectorAll('.nav-menu > li')))
        .concat([nav.querySelector('.nav-cta')]).filter(Boolean);
      parts.forEach(function (el, i) { el.classList.add('nfx-in'); el.style.setProperty('--d', (i * 0.06) + 's'); });
      nav.classList.add('nfx-js');
      requestAnimationFrame(function () { requestAnimationFrame(function () { nav.classList.add('nfx-on'); }); });
      // 進場完成後拿掉，避免影響手機選單
      setTimeout(function () { parts.forEach(function (el) { el.classList.remove('nfx-in'); }); nav.classList.remove('nfx-js', 'nfx-on'); }, 1400);
    }

    // 跟隨滑鼠的選單底色
    var menu = nav.querySelector('.nav-menu');
    if (menu && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
      menu.classList.add('nfx-menu');
      var pill = document.createElement('span'); pill.className = 'nfx-pill'; menu.insertBefore(pill, menu.firstChild);
      function moveTo(a) {
        if (!a || menu.classList.contains('open')) { pill.style.opacity = 0; return; }
        var mr = menu.getBoundingClientRect(), r = a.getBoundingClientRect();
        pill.style.left = (r.left - mr.left) + 'px';
        pill.style.width = r.width + 'px';
        pill.style.opacity = 1;
      }
      Array.prototype.forEach.call(menu.querySelectorAll('.nav-link'), function (a) {
        a.addEventListener('mouseenter', function () { moveTo(a); });
      });
      menu.addEventListener('mouseleave', function () { pill.style.opacity = 0; });
    }

    // 閱讀進度條
    var bar = document.createElement('div'); bar.className = 'nfx-progress'; nav.appendChild(bar);
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var y = window.scrollY || window.pageYOffset;
        bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h) : 0);
        nav.classList.toggle('nfx-scrolled', y > 40);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 漢堡選單：開啟時變成 ✕
    var ham = nav.querySelector('.nav-hamburger');
    if (ham && menu && 'MutationObserver' in window) {
      new MutationObserver(function () {
        var open = menu.classList.contains('open');
        ham.classList.toggle('nfx-x', open);
        ham.setAttribute('aria-expanded', open);
        if (open) Array.prototype.forEach.call(menu.querySelectorAll('li'), function (li, i) { li.style.animationDelay = (i * 0.05) + 's'; });
      }).observe(menu, { attributes: true, attributeFilter: ['class'] });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
