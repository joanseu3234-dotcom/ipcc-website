// IPCC 後台自動部署服務器
// 啟動後保持開著，後台按「發布上線」就會自動部署到 Zeabur

const http = require('http');
const { exec } = require('child_process');
const path = require('path');
const fs   = require('fs');

const PORT = 9393;
const DIR  = __dirname; // 此檔案所在的 IPCC 資料夾

const DEPLOY_CMD =
  'npx zeabur@latest deploy' +
  ' --service-id=69ccdf619994d25a1d0acf9f' +
  ' --environment-id=69ccd3019c2b3309e23e20d8' +
  ' -i=false';

function log(msg) {
  var t = new Date().toLocaleString('zh-TW', { hour12: false });
  console.log('[' + t + '] ' + msg);
}

const server = http.createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200); res.end(); return;
  }

  // 健康檢查
  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ running: true, dir: DIR }));
    return;
  }

  // 觸發部署
  if (req.method === 'POST' && req.url === '/deploy') {
    log('收到部署請求，開始執行...');
    exec(DEPLOY_CMD, { cwd: DIR, timeout: 180000 }, function(err, stdout, stderr) {
      var success = !err;
      if (success) {
        log('✅ 部署成功！');
      } else {
        log('❌ 部署失敗：' + (err && err.message));
        if (stderr) log('stderr: ' + stderr);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: success,
        stdout:  stdout  || '',
        stderr:  stderr  || ''
      }));
    });
    return;
  }

  // 儲存聯絡資訊設定到靜態 JS 檔
  if (req.method === 'POST' && req.url === '/save-contact-config') {
    var body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
      try {
        var cfg = JSON.parse(body);
        var js =
          '// IPCC 聯絡資訊設定（靜態預設值）\n' +
          '// 此檔案由後台「聯絡資訊設定」頁面儲存時自動更新\n' +
          '// 部署後所有瀏覽器與裝置都會讀取到此設定\n\n' +
          'window.IPCC_CONTACT_CONFIG = ' + JSON.stringify(cfg, null, 2) + ';\n';
        var filePath = path.join(DIR, 'contact-config.js');
        var owbPath  = path.join(DIR, '..', 'IPCCOWB', 'contact-config.js');
        fs.writeFileSync(filePath, js, 'utf8');
        if (fs.existsSync(path.join(DIR, '..', 'IPCCOWB'))) {
          fs.writeFileSync(owbPath, js, 'utf8');
        }
        log('✅ contact-config.js 已同步更新（IPCC + IPCCOWB）');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch(e) {
        log('❌ 儲存 contact-config.js 失敗：' + e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, '127.0.0.1', function() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     IPCC 後台自動部署服務器已啟動           ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  請保持此視窗開著                          ║');
  console.log('║  在後台按「🚀 發布上線」即可自動部署         ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  log('等待後台發布指令中...');
});
