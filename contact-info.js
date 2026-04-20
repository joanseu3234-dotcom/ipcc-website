// IPCC 前台聯絡資訊動態載入
(function () {
  function qrSrc(url) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(url);
  }

  function initContactInfo() {
    try {
      // 優先讀 localStorage，再讀靜態部署檔（跨瀏覽器/裝置皆可用）
      var cfg = JSON.parse(localStorage.getItem('ipcc_contact_config') || 'null');
      if (!cfg && window.IPCC_CONTACT_CONFIG) cfg = window.IPCC_CONTACT_CONFIG;
      if (!cfg) return;

      // ── 0800 電話 ──────────────────────────────
      if (cfg.phone0800) {
        var tel = cfg.phone0800.replace(/[^0-9]/g, '');
        var el = document.getElementById('contactPhone');
        if (el) { el.textContent = cfg.phone0800; el.href = 'tel:' + tel; }
        var ctaA = document.getElementById('ctaPhone');
        if (ctaA) ctaA.href = 'tel:' + tel;
        var ctaV = document.getElementById('ctaPhoneValue');
        if (ctaV) ctaV.textContent = cfg.phone0800;
        document.querySelectorAll('[data-ci="phone"]').forEach(function (e) {
          e.textContent = '☎ ' + cfg.phone0800;
        });
      }

      // ── 服務時間 ────────────────────────────────
      if (cfg.phoneHours) {
        var hEl = document.getElementById('contactPhoneHours');
        if (hEl) hEl.textContent = cfg.phoneHours;
      }

      // ── LINE URL + QR Code（點擊後彈出 modal） ──
      if (cfg.lineUrl) {
        var src = qrSrc(cfg.lineUrl);

        // contact.html 的 LINE 連結
        var lEl = document.getElementById('lineLink');
        if (lEl) lEl.href = cfg.lineUrl;

        // index.html CTA 的 LINE（原本是 div，現在是 a）
        var ctaLine = document.getElementById('ctaLine');
        if (ctaLine) {
          ctaLine.href = cfg.lineUrl;
          ctaLine.target = '_blank';
          ctaLine.rel = 'noopener';
        }

        // contact.html modal QR + 按鈕
        var qrM = document.getElementById('qrModalImg');
        if (qrM) qrM.src = src;
        var qrLink = document.getElementById('qrModalLink');
        if (qrLink) qrLink.style.display = 'block';
        var qrAnchor = document.getElementById('qrModalAnchor');
        if (qrAnchor) qrAnchor.href = cfg.lineUrl;

        // index.html modal QR + 按鈕
        var idxM = document.getElementById('idxQrModalImg');
        if (idxM) idxM.src = src;
        var idxLink = document.getElementById('idxQrModalLink');
        if (idxLink) idxLink.style.display = 'block';
        var idxAnchor = document.getElementById('idxQrModalAnchor');
        if (idxAnchor) idxAnchor.href = cfg.lineUrl;
      }

      // ── 1111 招募連結 ───────────────────────────
      if (cfg.recruitUrl) {
        document.querySelectorAll('a[title="1111人力銀行"]').forEach(function (a) {
          a.href = cfg.recruitUrl;
        });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactInfo);
  } else {
    initContactInfo();
  }
})();
