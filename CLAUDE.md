# IPCC 東州集團官網（正式前台）

## 資料夾說明
- **IPCC/**（此資料夾）= 正式前台 + 後台 admin/，部署到 ipcc-website.vercel.app
- **IPCCOWB/**（桌面另一個資料夾）= 開發工作區

## Vercel Deployment
- Project ID: prj_kcmNcBm2RvmVeEbBSPpGvhg5r8JL
- Team ID: team_ZSW8duFgRCNy5fsBC1h156Db
- URL: https://ipcc-website.vercel.app
- 每次 push 到 GitHub main 分支，Vercel 自動部署

## 後台管理
- 後台入口：https://ipcc-website.vercel.app/admin/
- 前台與後台同域，localStorage 自動共用，後台儲存後前台即時更新

## 同步與部署
- 執行 `deploy-to-vercel.bat` → 同步最新 content-data.js 並部署到 Vercel
- 後台點「發布上線」→ 推送到 GitHub → Vercel 自動部署（約 10 秒）

## GitHub Actions
- `.github/workflows/deploy.yml` 已設定 Vercel 自動部署
- 每次 push 到 main 都會觸發

## 最新消息影片上傳
- 後台「最新消息」可直接上傳影片：瀏覽器端先壓縮（最高 1080p、H.264/AAC MP4），再直傳 Vercel Blob（`ipcc-website-blob`，路徑 `news-videos/`）
- `api/video-upload.js`：驗證發布金鑰（`PUBLISH_SECRET`）後簽發短效上傳網址；用專案 OIDC + `BLOB_STORE_ID`，不需要 `BLOB_READ_WRITE_TOKEN`
- `admin/vendor/video-lib.js` 是打包產物，原始碼在 `admin/src/video-lib-entry.js`，修改後執行 `npm run build:video-lib`
- 文章欄位：`videoUrl` / `videoWidth` / `videoHeight` / `imageFromVideo`（封面是否為影片自動擷取）

## 專案服務版型與 SEO 建置（2026-11-23 起）
- 每次部署 Vercel 會執行 `npm run build`（`tools/build-static.js`）：依 `content-data.js` 把每個已發布服務產生成 `services/<slug>/index.html`（靜態檔優先於 `/services/:slug` 改寫），並重產 `sitemap.xml`、`llms.txt`。`services/` 是產物，已列入 .gitignore。`vercel.json` 需保留 `outputDirectory: "."`。
- 服務欄位 `layout`：`standard`（沿用 service-detail.html，SEO 標籤與文字預先寫進 HTML）、`story`（動態故事版）、`custom`（`custom_path` 指向一個含 index.html 的資料夾，例如 `/ipcc-day/`）。
- 動態故事版：`service-story.js`（渲染器＋區塊定義 BLOCKS＋主題色 THEMES，Node 與瀏覽器共用）、`service-story.css`、`service-story-runtime.js`（動畫）、`service-story.html`（外框；後台預覽用 `?preview=1&slug=`）。欄位 `theme`、`story`（區塊陣列）、`story_show_intro`。
- 後台「專案服務 → 版型與動態內容」分頁的表單依 BLOCKS 自動產生；新增區塊類型只要在 service-story.js 加 BLOCKS 定義與 R 渲染函式。
- `robots.txt` 開放 Google 與 AI 搜尋爬蟲；正式網域 https://www.phonecenter.com.tw （canonical 一律指向此網域）。
- 本機驗證：`node tools/build-static.js` 後檢查 `services/`；不要把產物 commit。
