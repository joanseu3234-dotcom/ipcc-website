// IPCC 後台「發布上線」伺服器端函式
// =====================================================
// GitHub 金鑰只存在 Vercel 環境變數，永遠不會送到瀏覽器。
// 後台按「發布上線」時，瀏覽器只送出檔案內容＋一把「發布金鑰」，
// 由這支在伺服器上執行的函式拿環境變數裡的 GitHub Token 去推送。
//
// 需在 Vercel → 專案 → Settings → Environment Variables 設定：
//   GITHUB_TOKEN    （新產生的 GitHub Personal Access Token，需 repo / contents:write 權限）
//   GITHUB_REPO     （例：joanseu3234-dotcom/ipcc-website）
//   GITHUB_BRANCH   （通常是 main，可不填，預設 main）
//   PUBLISH_SECRET  （自訂一串密碼，後台「系統設定」也要填同一串）
// =====================================================

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  var TOKEN  = process.env.GITHUB_TOKEN;
  var REPO   = process.env.GITHUB_REPO;
  var BRANCH = process.env.GITHUB_BRANCH || 'main';
  var SECRET = process.env.PUBLISH_SECRET;

  if (!TOKEN || !REPO || !SECRET) {
    res.status(500).json({ success: false, error: '伺服器尚未設定 GITHUB_TOKEN / GITHUB_REPO / PUBLISH_SECRET 環境變數' });
    return;
  }

  // 解析 body（Vercel 視設定可能傳入物件或字串）
  var body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ success: false, error: '請求格式錯誤' });
    return;
  }

  // 驗證發布金鑰（不在公開檔案裡，存在管理員瀏覽器）
  if (!body.secret || body.secret !== SECRET) {
    res.status(401).json({ success: false, error: '發布金鑰錯誤' });
    return;
  }

  // 只允許覆寫這幾個內容檔，避免被拿來竄改其他程式碼
  var ALLOWED = { 'content-data.js': 1, 'admin/users-config.js': 1, 'contact-config.js': 1 };
  var files = Array.isArray(body.files) ? body.files : [];

  // 連線測試：帶正確金鑰但不帶檔案 → 回 200 ok，用來在「系統設定」驗證金鑰
  if (!files.length) {
    res.status(200).json({ success: true, message: '金鑰正確（測試連線）' });
    return;
  }

  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    if (!f || !ALLOWED[f.path]) {
      res.status(400).json({ success: false, error: '不允許的檔案路徑：' + (f && f.path) });
      return;
    }
  }

  var commitMsg = String(body.commitMsg || '後台發布').slice(0, 200);
  var headers = {
    'Authorization': 'Bearer ' + TOKEN,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'ipcc-admin-publisher'
  };

  try {
    for (var j = 0; j < files.length; j++) {
      var file = files[j];
      var apiUrl = 'https://api.github.com/repos/' + REPO + '/contents/' + file.path;

      // 取得現有檔案 SHA（更新時需要）
      var sha = null;
      var getRes = await fetch(apiUrl + '?ref=' + encodeURIComponent(BRANCH), { headers: headers });
      if (getRes.ok) {
        var existing = await getRes.json();
        sha = existing.sha;
      }

      var putBody = {
        message: commitMsg,
        content: Buffer.from(String(file.content), 'utf8').toString('base64'),
        branch: BRANCH
      };
      if (sha) putBody.sha = sha;

      var putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(putBody)
      });
      if (!putRes.ok) {
        var errData = await putRes.json().catch(function () { return {}; });
        throw new Error((errData.message || putRes.status) + ' (' + file.path + ')');
      }
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String((err && err.message) || err) });
  }
};
