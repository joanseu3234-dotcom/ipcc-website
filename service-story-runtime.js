/* 動態故事版型：前台互動效果（進場動畫、看板輪播、捲動時間軸、數字跑動） */
(function () {
  function init(root) {
    if (!root || root.__stInit) return;
    root.__stInit = true;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('st-js');

    // 進場動畫
    var reveals = root.querySelectorAll('.st-reveal');
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else reveals.forEach(function (el) { el.classList.add('in'); });

    // 主視覺看板逐列亮起
    root.querySelectorAll('[data-st-panel]').forEach(function (p) {
      var li = p.querySelectorAll('li');
      if (li.length < 2 || reduce) return;
      var i = 0;
      setInterval(function () {
        li[i].classList.remove('on');
        i = (i + 1) % li.length;
        li[i].classList.add('on');
      }, 1800);
    });

    // 捲動時間軸
    root.querySelectorAll('[data-st-timeline]').forEach(function (tl) {
      var steps = tl.querySelectorAll('[data-st-step]');
      var chips = tl.querySelectorAll('[data-st-jump]');
      var now = tl.querySelector('[data-st-now]');
      var cap = tl.querySelector('[data-st-cap]');
      var ring = tl.querySelector('[data-st-ring]');
      var n = steps.length, cur = -1;
      function set(i) {
        if (i === cur) return;
        cur = i;
        steps.forEach(function (s, k) { s.classList.toggle('cur', k === i); });
        chips.forEach(function (c, k) { c.classList.toggle('on', k === i); });
        var st = steps[i];
        if (now) now.textContent = st.querySelector('.st-time') ? st.querySelector('.st-time').textContent : String(i + 1);
        if (cap) cap.textContent = st.querySelector('h3') ? st.querySelector('h3').textContent : '';
        if (ring) ring.style.strokeDashoffset = String(327 * (1 - (i + 1) / n));
      }
      set(0);
      function onScroll() {
        var mid = window.innerHeight * 0.55, best = 0;
        steps.forEach(function (s, k) { if (s.getBoundingClientRect().top < mid) best = k; });
        set(best);
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      chips.forEach(function (c) {
        c.addEventListener('click', function () {
          var s = steps[+c.getAttribute('data-st-jump')];
          if (s) window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3, behavior: reduce ? 'auto' : 'smooth' });
        });
      });
    });

    // 數字跑動
    var nums = root.querySelectorAll('[data-st-count]');
    if ('IntersectionObserver' in window && !reduce) {
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io2.unobserve(e.target);
          var el = e.target, raw = el.textContent, target = parseFloat(el.getAttribute('data-st-count'));
          if (!isFinite(target)) return;
          var dec = (String(el.getAttribute('data-st-count')).split('.')[1] || '').length;
          var t0 = performance.now();
          (function tick(t) {
            var p = Math.min(1, (t - t0) / 1200), v = target * (1 - Math.pow(1 - p, 3));
            el.textContent = p < 1 ? v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : raw;
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        });
      }, { threshold: 0.4 });
      nums.forEach(function (el) { io2.observe(el); });
    }
  }
  window.IPCCStoryInit = init;
  function boot() { document.querySelectorAll('.st-root').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
