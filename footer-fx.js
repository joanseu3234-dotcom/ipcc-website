// 頁尾動態效果（全站共用）：欄位依序進場、滑鼠光暈、社群按鈕浮起、連結滑動
// 每個有 <footer class="footer"> 的頁面在 </body> 前載入：<script src="/footer-fx.js"></script>
(function () {
  var CSS = ''
    + '.footer.ffx{position:relative;isolation:isolate;--mx:50%;--my:0%}'
    + '.footer.ffx::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,#E84048 35%,#FF6B70 50%,#E84048 65%,transparent);background-size:200% 100%;opacity:.55;animation:ffx-sweep 6s linear infinite;pointer-events:none}'
    + '@keyframes ffx-sweep{0%{background-position:100% 0}100%{background-position:-100% 0}}'
    + '.footer.ffx .ffx-glow{position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:0;transition:opacity .5s;background:radial-gradient(520px circle at var(--mx) var(--my),rgba(200,22,29,.13),transparent 60%)}'
    + '.footer.ffx:hover .ffx-glow{opacity:1}'
    // 進場
    + '.ffx-js .ffx-in{opacity:0;transform:translateY(22px);transition:opacity .7s ease var(--d,0s),transform .7s cubic-bezier(.2,.8,.2,1) var(--d,0s)}'
    + '.ffx-js.ffx-on .ffx-in{opacity:1;transform:none}'
    // 社群按鈕
    + '.footer.ffx .footer-social{transition:transform .35s cubic-bezier(.2,.8,.2,1),background .3s,color .3s,box-shadow .35s!important}'
    + '.footer.ffx .footer-social:hover{transform:translateY(-5px) rotate(-6deg);box-shadow:0 10px 22px -6px rgba(200,22,29,.75)}'
    // Logo
    + '.footer.ffx .footer-logo-box{transition:box-shadow .4s;transform-origin:50% 80%}'
    + '.footer.ffx .footer-logo:hover .footer-logo-box{animation:ffx-wig 1.2s ease-in-out;box-shadow:0 10px 24px -8px rgba(200,22,29,.7)}'
    + '@keyframes ffx-wig{0%{transform:none}25%{transform:translateY(-5px) rotate(-7deg) scale(1.08)}50%{transform:translateY(-2px) rotate(4deg) scale(1.05)}75%{transform:translateY(-3px) rotate(-2deg) scale(1.06)}100%{transform:none}}'
    // 欄位連結：滑入時往右推、前面長出紅色短線
    + '.footer.ffx .footer-col ul li a{position:relative;display:inline-block;transition:color .3s,transform .35s cubic-bezier(.2,.8,.2,1)!important}'
    + '.footer.ffx .footer-col ul li a::before{content:"";position:absolute;left:-14px;top:50%;width:0;height:2px;border-radius:2px;background:#FF6B70;transition:width .35s cubic-bezier(.2,.8,.2,1)}'
    + '.footer.ffx .footer-col ul li a:hover{transform:translateX(14px);color:#FF6B70}'
    + '.footer.ffx .footer-col ul li a:hover::before{width:9px}'
    // 地址、招募按鈕
    + '.footer.ffx .footer-address{transition:transform .35s cubic-bezier(.2,.8,.2,1),color .3s}'
    + '.footer.ffx .footer-address:hover{transform:translateX(5px);color:rgba(255,255,255,.8)}'
    + '.footer.ffx .footer-recruit{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s,background .3s,border-color .3s,color .3s!important}'
    + '.footer.ffx .footer-recruit:hover{transform:translateY(-3px);box-shadow:0 12px 26px -10px rgba(200,22,29,.7)}'
    + '@media (hover:none){.footer.ffx .footer-col ul li a:hover{transform:none}}'
    + '@media (prefers-reduced-motion:reduce){.footer.ffx::before{animation:none}.ffx-js .ffx-in{opacity:1;transform:none}.footer.ffx .footer-social:hover,.footer.ffx .footer-col ul li a:hover,.footer.ffx .footer-address:hover,.footer.ffx .footer-recruit:hover{transform:none}.footer.ffx .footer-logo:hover .footer-logo-box{animation:none}}';

  function init() {
    var f = document.querySelector('footer.footer');
    if (!f || f.classList.contains('ffx')) return;
    var st = document.createElement('style'); st.id = 'ffxCss'; st.textContent = CSS; document.head.appendChild(st);
    f.classList.add('ffx');
    var g = document.createElement('div'); g.className = 'ffx-glow'; f.insertBefore(g, f.firstChild);
    f.addEventListener('mousemove', function (e) {
      var r = f.getBoundingClientRect();
      f.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      f.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    var grid = f.querySelector('.footer-grid');
    var parts = grid ? Array.prototype.slice.call(grid.children) : [];
    var bottom = f.querySelector('.footer-bottom');
    if (bottom) parts.push(bottom);
    parts.forEach(function (el, i) { el.classList.add('ffx-in'); el.style.setProperty('--d', (i * 0.1) + 's'); });
    f.classList.add('ffx-js');
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      f.classList.add('ffx-on'); io.disconnect();
    }, { threshold: 0.08 });
    io.observe(f);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
