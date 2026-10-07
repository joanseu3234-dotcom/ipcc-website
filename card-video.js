// 列表卡片的影片：進入畫面時靜音自動循環播放，離開畫面就暫停（不浪費訪客流量）
(function () {
  var conn = navigator.connection;
  // 訪客開了省流量模式或「減少動態效果」→ 不自動播放，卡片維持封面圖 + ▶ 標記
  var lite = (conn && conn.saveData) ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    !('IntersectionObserver' in window);

  function attr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  // 回傳卡片用的 <video>；回傳空字串表示不自動播放，呼叫端改用封面圖
  window.ipccCardVideoHtml = function (url, poster) {
    if (lite || !url) return '';
    return '<video class="card-video" muted loop playsinline preload="none" data-src="' + attr(url) + '"'
      + (poster ? ' poster="' + attr(poster) + '"' : '') + '></video>';
  };
  if (lite) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (!v.getAttribute('src')) v.src = v.getAttribute('data-src');
        v.muted = true;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.4 });

  function scan() {
    var list = document.querySelectorAll('video.card-video:not([data-observed])');
    for (var i = 0; i < list.length; i++) {
      list[i].setAttribute('data-observed', '1');
      io.observe(list[i]);
    }
  }
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
