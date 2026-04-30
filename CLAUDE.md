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
