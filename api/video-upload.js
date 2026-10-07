// IPCC 後台「影片上傳」伺服器端函式
// =====================================================
// 影片檔案不會經過這支函式（Vercel 函式有 4.5MB 請求上限），
// 這裡只負責驗證「發布金鑰」後簽發一組短效的上傳網址，
// 由後台瀏覽器直接把影片傳到 Vercel Blob。
//
// 需要的 Vercel 環境變數：
//   PUBLISH_SECRET  （與「發布上線」共用同一把金鑰）
//   BLOB_STORE_ID   （專案連結 Blob 儲存空間後自動產生）
// =====================================================

var blob = require('@vercel/blob');
var blobClient = require('@vercel/blob/client');

var VIDEO_PREFIX = 'news-videos/';
var ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
var MAX_BYTES = 200 * 1024 * 1024;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  var SECRET = process.env.PUBLISH_SECRET;
  if (!SECRET) {
    res.status(500).json({ success: false, error: '伺服器尚未設定 PUBLISH_SECRET 環境變數' });
    return;
  }

  var body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ success: false, error: '請求格式錯誤' });
    return;
  }

  // 發布金鑰放在 header，避免被帶進上傳網址
  var key = String(req.headers['x-publish-key'] || '');
  if (!key || key !== SECRET) {
    res.status(401).json({ success: false, error: '發布金鑰錯誤' });
    return;
  }

  // 金鑰檢查：後台在開始壓縮影片前先確認金鑰正確
  if (body.action === 'ping') {
    res.status(200).json({ success: true });
    return;
  }

  try {
    // 刪除尚未被任何文章使用的影片（上傳後又取消時清掉，避免佔用空間）
    if (body.action === 'delete') {
      var url = String(body.url || '');
      var u = null;
      try { u = new URL(url); } catch (e) { u = null; }
      if (!u || !/\.blob\.vercel-storage\.com$/.test(u.hostname) || u.pathname.indexOf('/' + VIDEO_PREFIX) !== 0) {
        res.status(400).json({ success: false, error: '不允許刪除的網址' });
        return;
      }
      await blob.del(url);
      res.status(200).json({ success: true });
      return;
    }

    var result = await blobClient.handleUploadPresigned({
      body: body,
      request: req,
      getSignedToken: async function (pathname) {
        if (pathname.indexOf(VIDEO_PREFIX) !== 0 || !/\.(mp4|webm|mov)$/i.test(pathname)) {
          throw new Error('不允許的檔案路徑：' + pathname);
        }
        var token = await blob.issueSignedToken({
          pathname: pathname,
          operations: ['put'],
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          validUntil: Date.now() + 60 * 60 * 1000
        });
        return {
          token: token,
          urlOptions: {
            allowedContentTypes: ALLOWED_TYPES,
            maximumSizeInBytes: MAX_BYTES,
            addRandomSuffix: true,
            cacheControlMaxAge: 60 * 60 * 24 * 365
          }
        };
      }
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: String((err && err.message) || err) });
  }
};
