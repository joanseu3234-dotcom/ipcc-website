// IPCC 官網「聯絡表單」伺服器端函式
// =====================================================
// 前台送出表單 → 這支函式把資料存進 Vercel Blob，並通知業務單位的 Teams 頻道。
// 後台「聯絡表單管理」也透過這支函式讀取、改狀態、刪除（需帶發布金鑰）。
//
// Blob 儲存空間 ipcc-website-blob 是「公開」型，所以每筆資料存進去前先用
// AES-256-GCM 加密，就算有人拿到檔案網址也只會看到亂碼。
//
// 需要的 Vercel 環境變數：
//   PUBLISH_SECRET     （後台讀取資料時驗證，與「發布上線」共用）
//   CONTACTS_KEY       （加密金鑰，64 個 16 進位字元；遺失就讀不回舊資料）
//   BLOB_STORE_ID      （專案連結 Blob 儲存空間後自動產生）
//   TEAMS_WEBHOOK_URL  （選填，Teams「工作流程」webhook 網址，多個用逗號分隔）
// =====================================================

var crypto = require('crypto');
var blob = require('@vercel/blob');

var PREFIX = 'contacts/';
var STATUSES = ['未處理', '處理中', '已完成'];
var FIELDS = {
  name: 50, jobTitle: 50, company: 100, phone: 30, email: 120,
  service: 50, contactTime: 50, message: 3000
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  var body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ success: false, error: '請求格式錯誤' });
    return;
  }

  var keyHex = process.env.CONTACTS_KEY || '';
  if (!/^[0-9a-f]{64}$/i.test(keyHex)) {
    res.status(500).json({ success: false, error: '伺服器尚未設定 CONTACTS_KEY 環境變數' });
    return;
  }
  var encKey = Buffer.from(keyHex, 'hex');

  try {
    if (body.action === 'submit') {
      await handleSubmit(body, encKey, res);
      return;
    }

    // 以下為後台操作，需驗證發布金鑰
    var SECRET = process.env.PUBLISH_SECRET;
    var key = String(req.headers['x-publish-key'] || '');
    if (!SECRET || !key || key !== SECRET) {
      res.status(401).json({ success: false, error: '發布金鑰錯誤' });
      return;
    }

    if (body.action === 'list') {
      res.status(200).json({ success: true, items: await listAll(encKey) });
    } else if (body.action === 'update') {
      var item = await readOne(String(body.id || ''), encKey);
      if (!item) { res.status(404).json({ success: false, error: '找不到這筆資料' }); return; }
      if (body.status !== undefined) {
        if (STATUSES.indexOf(body.status) === -1) { res.status(400).json({ success: false, error: '狀態不正確' }); return; }
        item.status = body.status;
      }
      if (body.note !== undefined) item.note = String(body.note).slice(0, 2000);
      item.updatedAt = Date.now();
      await writeOne(item, encKey);
      res.status(200).json({ success: true, item: item });
    } else if (body.action === 'delete') {
      var ids = Array.isArray(body.ids) ? body.ids : [body.id];
      ids = ids.map(String).filter(validId);
      if (ids.length) await blob.del(ids.map(pathOf));
      res.status(200).json({ success: true, deleted: ids.length });
    } else {
      res.status(400).json({ success: false, error: '未知的操作' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: String((err && err.message) || err) });
  }
};

async function handleSubmit(body, encKey, res) {
  // 隱藏欄位：真人看不到不會填，機器人常會填 → 假裝成功但不存
  if (body.website) { res.status(200).json({ success: true }); return; }

  var item = {};
  Object.keys(FIELDS).forEach(function (k) {
    item[k] = String(body[k] == null ? '' : body[k]).trim().slice(0, FIELDS[k]);
  });
  if (!item.name || !item.company || !item.phone || !item.email) {
    res.status(400).json({ success: false, error: '必填欄位未填寫' });
    return;
  }

  var now = Date.now();
  // 時間開頭方便排序，後面接隨機碼讓檔名無法被猜到
  item.id = now.toString(36) + '-' + crypto.randomBytes(12).toString('hex');
  item.status = '未處理';
  item.submittedAt = now;
  await writeOne(item, encKey);

  // 通知失敗不影響存檔結果，前台仍顯示送出成功
  var notified = await notifyTeams(item).catch(function () { return false; });
  res.status(200).json({ success: true, notified: notified });
}

function validId(id) { return /^[0-9a-z]+-[0-9a-f]{24}$/.test(id); }
function pathOf(id) { return PREFIX + id + '.enc'; }

function encrypt(obj, key) {
  var iv = crypto.randomBytes(12);
  var cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  var data = Buffer.concat([cipher.update(JSON.stringify(obj), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
}

function decrypt(text, key) {
  var buf = Buffer.from(text, 'base64');
  var decipher = crypto.createDecipheriv('aes-256-gcm', key, buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return JSON.parse(Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8'));
}

async function writeOne(item, key) {
  await blob.put(pathOf(item.id), encrypt(item, key), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'text/plain',
    cacheControlMaxAge: 60
  });
}

async function readOne(id, key) {
  if (!validId(id)) return null;
  var r = await blob.get(pathOf(id), { access: 'public', useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return decrypt(await new Response(r.stream).text(), key);
}

async function listAll(key) {
  var blobs = [];
  var cursor;
  do {
    var page = await blob.list({ prefix: PREFIX, cursor: cursor, limit: 1000 });
    blobs = blobs.concat(page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  var items = await Promise.all(blobs.map(function (b) {
    var id = b.pathname.slice(PREFIX.length).replace(/\.enc$/, '');
    return readOne(id, key).catch(function () { return null; });
  }));
  return items.filter(Boolean).sort(function (a, b) { return b.submittedAt - a.submittedAt; });
}

// Teams「工作流程」→「收到 webhook 要求時張貼到頻道」接受 Adaptive Card 格式
async function notifyTeams(item) {
  var urls = String(process.env.TEAMS_WEBHOOK_URL || '').split(',')
    .map(function (s) { return s.trim(); }).filter(Boolean);
  if (!urls.length) return false;

  var time = new Date(item.submittedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
  var facts = [
    ['姓名', item.name + (item.jobTitle ? '（' + item.jobTitle + '）' : '')],
    ['公司', item.company],
    ['電話', item.phone],
    ['Email', item.email],
    ['服務', item.service || '—'],
    ['聯繫時段', item.contactTime || '—'],
    ['送出時間', time]
  ].map(function (f) { return { title: f[0], value: f[1] }; });

  var card = {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.4',
        body: [
          { type: 'TextBlock', size: 'Medium', weight: 'Bolder', wrap: true,
            text: '官網新諮詢：' + item.name + '（' + item.company + '）' },
          { type: 'FactSet', facts: facts },
          { type: 'TextBlock', wrap: true, text: item.message || '（未填需求說明）' }
        ],
        actions: [{ type: 'Action.OpenUrl', title: '到後台處理',
          url: 'https://ipcc-website.vercel.app/admin/contacts-manage.html' }]
      }
    }]
  };

  var results = await Promise.all(urls.map(function (u) {
    return fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }));
  return results.some(Boolean);
}
