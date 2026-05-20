// Fix slugs in content-data.js — preserves ALL user content, only adds missing slug field
const fs = require('fs');

const raw = fs.readFileSync('content-data.js', 'utf8');
const selfExecIdx = raw.indexOf('(function(){');
const dataStart = raw.indexOf('window.IPCC_CONTENT_DATA = ') + 'window.IPCC_CONTENT_DATA = '.length;
const dataStr = raw.slice(dataStart, selfExecIdx).trim().replace(/;\s*$/, '');
const selfExec = raw.slice(selfExecIdx);
const data = JSON.parse(dataStr);

// Slug mapping by service ID (stable, won't change on re-run)
const SLUG_MAP = {
  'svc-1':        'smart-customer-service',
  'svc-2':        'multichannel-cx',
  'svc-3':        'ai-agent-ops',
  'mp5794gebcw85':'data-annotation',
  'mp57ej8wos3qu':'cx-data-analytics',
};

let changed = 0;
(data.ipcc_services || []).forEach(svc => {
  if (!svc.slug && SLUG_MAP[svc.id]) {
    svc.slug = SLUG_MAP[svc.id];
    changed++;
    console.log(`Added slug "${svc.slug}" to service: ${svc.title} (${svc.id})`);
  } else if (svc.slug) {
    console.log(`OK: "${svc.title}" already has slug: ${svc.slug}`);
  } else {
    console.warn(`WARNING: No slug mapping for id=${svc.id}, title=${svc.title}`);
  }
});

// Bump timestamp so self-exec syncs new slug data to localStorage
data.__ts = Date.now();
data.__published = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });

const header = '// IPCC 內容資料 — 由後台管理系統自動產生，請勿手動修改\n// 最後發布：' + data.__published + '\n\n';
const newContent = header + 'window.IPCC_CONTENT_DATA = ' + JSON.stringify(data, null, 2) + ';\n\n' + selfExec;

fs.writeFileSync('content-data.js', newContent, 'utf8');
console.log('\nDone. Changed', changed, 'services.');
console.log('New timestamp:', data.__ts);
console.log('File size:', fs.statSync('content-data.js').size, 'bytes');
