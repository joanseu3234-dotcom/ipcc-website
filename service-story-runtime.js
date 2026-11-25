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
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var t = e.target;
          t.classList.add('in'); io.unobserve(t);
          setTimeout(function () { t.classList.add('st-done'); }, 1500); // 進場完成後，懸停反應不再延遲
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else reveals.forEach(function (el) { el.classList.add('in', 'st-done'); });

    // 卡片懸停：滑鼠光暈跟隨（與網站其他卡片一致）
    root.querySelectorAll('.st-card,.st-ind,.st-stat,.st-flow-step,.st-col,.st-other-grid a').forEach(function (c) {
      c.classList.add('st-hv');
      c.addEventListener('mousemove', function (ev) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        c.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    });

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

    // ───── 主題專屬互動 ─────
    function onVisible(el, fn) {
      if (!('IntersectionObserver' in window)) return fn();
      var o = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { o.disconnect(); fn(); } });
      }, { threshold: 0.3 });
      o.observe(el);
    }
    function Timers() {
      var list = [];
      return { add: function (fn, ms) { list.push(setTimeout(fn, ms)); }, clear: function () { list.forEach(clearTimeout); list = []; } };
    }
    function each(sel, fn) { Array.prototype.forEach.call(root.querySelectorAll(sel), fn); }
    function all(el, sel) { return Array.prototype.slice.call(el.querySelectorAll(sel)); }

    // 主視覺：輪播（渠道匯流、語音逐字稿），同步點亮對應渠道
    each('[data-st-cycle]', function (box) {
      var kids = box.children;
      if (kids.length < 2 || reduce) return;
      var vis = box.closest('.st-hero-visual');
      var sync = vis ? vis.querySelectorAll('.st-orb-node') : [];
      var i = 0;
      setInterval(function () {
        kids[i].classList.remove('on'); if (sync[i]) sync[i].classList.remove('on');
        i = (i + 1) % kids.length;
        kids[i].classList.add('on'); if (sync[i]) sync[i].classList.add('on');
      }, 2200);
    });

    // 主視覺：對話視窗逐則出現
    each('[data-st-chat]', function (w) {
      if (reduce) return;
      var body = w.querySelector('.st-chat-body'), msgs = all(body, '.st-msg'), typing = body.querySelector('.st-typing');
      if (!msgs.length) return;
      body.classList.add('st-chat-run');
      var i = 0;
      (function step() {
        if (i >= msgs.length) {
          return setTimeout(function () { msgs.forEach(function (m) { m.classList.remove('in'); }); i = 0; step(); }, 4000);
        }
        var m = msgs[i];
        if (m.classList.contains('st-msg-user')) { m.classList.add('in'); i++; setTimeout(step, 1300); }
        else {
          typing.classList.add('in');
          setTimeout(function () { typing.classList.remove('in'); m.classList.add('in'); i++; setTimeout(step, 1600); }, 1100);
        }
      })();
    });

    // 主視覺：文字逐段標註、JSON 逐行產生
    each('[data-st-tokens]', function (w) {
      var toks = all(w, '.st-tok'), rows = all(w, '.st-tok-row'), stage = w.querySelector('[data-st-tok-stage]');
      if (reduce || !toks.length) { toks.forEach(function (t) { t.classList.add('done'); }); rows.forEach(function (r) { r.classList.add('in'); }); return; }
      var i = 0;
      (function step() {
        toks.forEach(function (t) { t.classList.remove('on'); });
        if (i >= toks.length) {
          if (stage) stage.textContent = '✓ 結構化完成';
          return setTimeout(function () {
            toks.forEach(function (t) { t.classList.remove('done'); }); rows.forEach(function (r) { r.classList.remove('in'); });
            if (stage) stage.textContent = 'AI 預標註中'; i = 0; step();
          }, 3200);
        }
        toks[i].classList.add('on', 'done'); if (rows[i]) rows[i].classList.add('in');
        i++; setTimeout(step, 1300);
      })();
    });

    // ★ 全渠道匯流：先看「分開經營」，再自動切到「整合後」
    each('[data-st-omni]', function (sec) {
      var tabs = all(sec, '[data-st-mode]'), auto = true, t;
      function set(m) {
        sec.setAttribute('data-mode', m);
        tabs.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-st-mode') === m); b.setAttribute('aria-selected', b.getAttribute('data-st-mode') === m); });
      }
      tabs.forEach(function (b) { b.addEventListener('click', function () { auto = false; clearTimeout(t); set(b.getAttribute('data-st-mode')); }); });
      set('before');
      onVisible(sec, function () { t = setTimeout(function () { if (auto) set('after'); }, 3400); });
    });

    // ★ AI Agent 互動示範
    each('[data-st-agent]', function (sec) {
      var btns = all(sec, '[data-st-case]'), cases = all(sec, '.st-ag-case'), T = Timers(), auto = true;
      function play(i) {
        T.clear();
        btns.forEach(function (b, k) { b.classList.toggle('on', k === i); });
        cases.forEach(function (c, k) { c.classList.toggle('on', k === i); });
        if (reduce) return;
        var c = cases[i], p = c.querySelector('[data-st-type]');
        if (!p.getAttribute('data-full')) p.setAttribute('data-full', p.innerHTML);
        var full = p.getAttribute('data-full'), text = p.textContent, n = text.length, ms = Math.min(28, 2400 / Math.max(n, 1));
        c.classList.remove('st-s1', 'st-s2', 'st-s3', 'st-s4');
        T.add(function () { c.classList.add('st-s1'); }, 400);
        T.add(function () { c.classList.remove('st-s1'); c.classList.add('st-s2'); }, 1300);
        T.add(function () {
          c.classList.remove('st-s2'); c.classList.add('st-s3'); p.textContent = '';
          for (var k = 1; k <= n; k++) (function (k) { T.add(function () { p.textContent = text.slice(0, k); if (k === n) p.innerHTML = full; }, k * ms); })(k);
        }, 2300);
        var end = 2300 + n * ms + 500;
        T.add(function () { c.classList.remove('st-s3'); c.classList.add('st-s4'); }, end);
        T.add(function () { if (auto) play((i + 1) % cases.length); }, end + 5500);
      }
      btns.forEach(function (b, k) { b.addEventListener('click', function () { auto = false; play(k); }); });
      onVisible(sec, function () { if (auto) play(0); });
    });

    // ★ 數據標註示範：四個階段自動播放，可點選
    each('[data-st-label]', function (sec) {
      var T = Timers();
      function set(n) { sec.setAttribute('data-stage', String(n)); }
      function run() { T.clear(); [1, 2, 3, 4].forEach(function (n, k) { T.add(function () { set(n); }, k * 2600); }); }
      all(sec, '[data-st-stage]').forEach(function (b) { b.addEventListener('click', function () { T.clear(); set(+b.getAttribute('data-st-stage')); }); });
      var r = sec.querySelector('[data-st-replay]'); if (r) r.addEventListener('click', run);
      if (reduce) return;
      set(1);
      onVisible(sec, run);
    });

    // ★ 對話洞察示範：逐句播放，洞察飛入右側分類
    each('[data-st-voice]', function (sec) {
      var lines = all(sec, '.st-vo-line'), chips = all(sec, '.st-vo-chip'), prog = sec.querySelector('[data-st-progress]'), T = Timers();
      function play() {
        T.clear();
        sec.classList.add('st-play');
        lines.concat(chips).forEach(function (x) { x.classList.remove('in', 'cur'); });
        if (prog) prog.style.width = '0%';
        lines.forEach(function (l, i) {
          T.add(function () {
            lines.forEach(function (x) { x.classList.remove('cur'); });
            l.classList.add('in', 'cur');
            if (prog) prog.style.width = ((i + 1) / lines.length * 100) + '%';
            chips.forEach(function (c) { if (c.getAttribute('data-i') === String(i)) T.add(function () { c.classList.add('in'); }, 600); });
          }, 300 + i * 2000);
        });
        T.add(function () { lines.forEach(function (x) { x.classList.remove('cur'); }); }, 300 + lines.length * 2000);
      }
      var r = sec.querySelector('[data-st-replay]'); if (r) r.addEventListener('click', play);
      if (reduce) return;
      sec.classList.add('st-play');
      onVisible(sec, play);
    });
  }
  window.IPCCStoryInit = init;
  function boot() { document.querySelectorAll('.st-root').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
