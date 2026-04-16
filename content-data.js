// IPCC 內容資料 — 由後台管理系統自動產生，請勿手動修改
// 最後發布：2026/4/16 10:45:59

window.IPCC_CONTENT_DATA = {
  "__ts": 1776307559738,
  "__published": "2026/4/16 10:45:59"
};

// 自動將已部署的內容同步到此瀏覽器的 localStorage
(function(){
  if (!window.IPCC_CONTENT_DATA) return;
  var deployTs = window.IPCC_CONTENT_DATA.__ts || 0;
  var localTs = parseInt(localStorage.getItem('ipcc_deploy_ts') || '0');
  if (deployTs > localTs) {
    Object.keys(window.IPCC_CONTENT_DATA).forEach(function(key) {
      if (key.indexOf('ipcc_') === 0) {
        localStorage.setItem(key, JSON.stringify(window.IPCC_CONTENT_DATA[key]));
      }
    });
    localStorage.setItem('ipcc_deploy_ts', String(deployTs));
  }
})();
