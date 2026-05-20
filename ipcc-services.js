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
          return '<a href="' + href + '" class="service-card" style="text-decoration:none;color:inherit;">'
            + '<div><span class="service-num">' + (s.num || '') + '</span></div>'
            + '<div class="service-icon">' + (s.icon || '📋') + '</div>'
            + '<div><h3 class="service-title">' + (s.title || '') + '</h3>'
            + '<p class="service-desc">' + (s.desc || '') + '</p></div>'
            + '<div class="service-tags">' + tags + '</div>'
            + '<span class="service-link">了解更多 →</span>'
            + '</a>';
        }).join('')
      + '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { renderFooterSvcList(); renderHomeSvcGrid(); });
  } else {
    renderFooterSvcList();
    renderHomeSvcGrid();
  }
})();
