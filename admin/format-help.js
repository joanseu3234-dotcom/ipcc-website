// 後台內文格式說明：在支援格式的文字框上方加一列小工具（插入標題／粗體、展開格式說明）
// 支援的格式與前台一致：## 標題、### 小標題、**粗體**
(function () {
  // 各頁支援格式的文字框（動態產生的也會自動套用）
  var TARGETS = [
    // 最新消息／媒體／活動
    '#fContent', '#fDesc',
    // 成功案例
    '#fIntro', '#fChallenge', '#fSolution', '#fBenefits', '#fHighlights', '#fDescription',
    // 專案服務：服務簡介、常見問題答案、版型與動態內容的說明欄
    '#svcContent', '#storyBlocks .sb-f textarea',
    // 獲獎事蹟：簡短說明、完整內容
    'textarea[placeholder^="簡短說明文字（80~120字）"]', 'textarea[placeholder^="可輸入完整的獲獎背景"]'
  ].join(',');

  // 一列一列的清單（欄位很窄、放不下工具列）：在清單上方放一行格式提示
  var NOTES = ['#painPointsList', '#featuresList', '#industriesList', '#faqList', '#storyBlocks'];

  var CSS = ''
    + '.fmt-bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0 0 6px;font-size:12px;color:inherit;opacity:.85}'
    + '.fmt-bar button{border:1px solid #E2E5EC;background:#fff;color:#374151;border-radius:6px;padding:2px 9px;font-size:12px;line-height:20px;cursor:pointer;font-family:inherit}'
    + '.fmt-bar button:hover{border-color:#C8161D;color:#C8161D}'
    + '.fmt-bar .fmt-b{font-weight:900}'
    + '.fmt-bar .fmt-q{border-radius:999px;width:22px;padding:0;text-align:center;color:#6B7280}'
    + '.fmt-help{display:none;margin:0 0 8px;padding:10px 12px;border:1px solid rgba(127,127,127,.28);border-radius:8px;background:rgba(127,127,127,.08);font-size:12.5px;color:inherit;line-height:1.7}'
    + '.fmt-help.open{display:block}'
    + '.fmt-help table{border-collapse:collapse;width:100%;margin:4px 0 6px}'
    + '.fmt-help td{padding:4px 8px;border-bottom:1px solid rgba(127,127,127,.18);vertical-align:top}'
    + '.fmt-help td:first-child{white-space:nowrap;width:42%}'
    + '.fmt-help code,.fmt-bar code{background:rgba(127,127,127,.15);border:1px solid rgba(127,127,127,.25);border-radius:4px;padding:1px 5px;font-size:12px;color:inherit}'
    + '.fmt-help .fmt-ex-h{font-weight:900;border-left:3px solid #C8161D;padding-left:7px}'
    + '.fmt-help small{opacity:.7}';

  var HELP = '<table>'
    + '<tr><td><code>## 標題文字</code></td><td><span class="fmt-ex-h">標題文字</span>（整行，前面加兩個 # 和一個空格）</td></tr>'
    + '<tr><td><code>### 小標題</code></td><td><b>小標題</b>（比 ## 小一號）</td></tr>'
    + '<tr><td><code>**重點文字**</code></td><td><b>重點文字</b>（前後各兩個 *）</td></tr>'
    + '<tr><td>直接按 Enter 換行</td><td>前台照原樣換行；空一行就是新段落</td></tr>'
    + '</table>'
    + '<small>列表卡片、Google 搜尋描述會自動拿掉這些符號，只顯示文字。</small>';

  function addStyle() {
    if (document.getElementById('fmtHelpCss')) return;
    var st = document.createElement('style'); st.id = 'fmtHelpCss'; st.textContent = CSS; document.head.appendChild(st);
  }

  function fire(ta) {
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 在游標所在行前面加上 ## （已有就換成新的層級）
  function heading(ta, level) {
    var v = ta.value, pos = ta.selectionStart;
    var start = v.lastIndexOf('\n', pos - 1) + 1;
    var end = v.indexOf('\n', pos); if (end < 0) end = v.length;
    var line = v.slice(start, end).replace(/^\s*#{1,4}\s*/, '');
    var mark = level === 3 ? '### ' : '## ';
    var newLine = mark + (line || '標題文字');
    ta.value = v.slice(0, start) + newLine + v.slice(end);
    ta.focus();
    if (line) ta.setSelectionRange(start + newLine.length, start + newLine.length);
    else ta.setSelectionRange(start + mark.length, start + newLine.length);
    fire(ta);
  }

  // 選取的文字前後加上 **；沒選取就插入範例
  function bold(ta) {
    var v = ta.value, a = ta.selectionStart, b = ta.selectionEnd;
    var sel = v.slice(a, b) || '重點文字';
    ta.value = v.slice(0, a) + '**' + sel + '**' + v.slice(b);
    ta.focus();
    ta.setSelectionRange(a + 2, a + 2 + sel.length);
    fire(ta);
  }

  function attach(ta) {
    if (ta.__fmt) return;
    ta.__fmt = true;
    var bar = document.createElement('div');
    bar.className = 'fmt-bar';
    bar.innerHTML = '<span>格式：</span>'
      + '<button type="button" data-a="h2" title="把游標所在的這一行變成標題">## 標題</button>'
      + '<button type="button" data-a="h3" title="把游標所在的這一行變成小標題">### 小標題</button>'
      + '<button type="button" class="fmt-b" data-a="b" title="把選取的文字變粗體">B 粗體</button>'
      + '<button type="button" class="fmt-q" data-a="help" title="格式說明">?</button>';
    var help = document.createElement('div');
    help.className = 'fmt-help';
    help.innerHTML = HELP;
    bar.addEventListener('mousedown', function (e) { if (e.target.tagName === 'BUTTON') e.preventDefault(); }); // 保留文字框的選取範圍
    bar.addEventListener('click', function (e) {
      var act = e.target.getAttribute && e.target.getAttribute('data-a');
      if (!act) return;
      if (act === 'h2') heading(ta, 2);
      else if (act === 'h3') heading(ta, 3);
      else if (act === 'b') bold(ta);
      else help.classList.toggle('open');
    });
    ta.parentNode.insertBefore(bar, ta);
    ta.parentNode.insertBefore(help, ta);
  }

  function note(box) {
    if (!box || box.__fmtNote) return;
    box.__fmtNote = true;
    var bar = document.createElement('div');
    bar.className = 'fmt-bar';
    bar.innerHTML = '<span>說明文字支援格式：<code style="font-size:12px">## 標題</code>、<code style="font-size:12px">**粗體**</code></span>'
      + '<button type="button" class="fmt-q" title="格式說明">?</button>';
    var help = document.createElement('div');
    help.className = 'fmt-help';
    help.innerHTML = HELP;
    bar.querySelector('button').addEventListener('click', function () { help.classList.toggle('open'); });
    box.parentNode.insertBefore(bar, box);
    box.parentNode.insertBefore(help, box);
  }

  function scan() {
    addStyle();
    Array.prototype.forEach.call(document.querySelectorAll(TARGETS), attach);
    NOTES.forEach(function (sel) { note(document.querySelector(sel)); });
  }

  function start() {
    scan();
    var t = null;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(scan, 60); })
      .observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
