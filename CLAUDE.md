# IPCC 東州集團官網（正式前台）

## 資料夾說明
- **IPCC/**（此資料夾）= 正式前台 + 後台 admin/，部署到 ipcc.zeabur.app
- **IPCCOWB/**（桌面另一個資料夾）= 開發工作區

## Zeabur Deployment
- Project ID: 69ccd3019994d25a1d0accdb
- Service ID: 69ccdf619994d25a1d0acf9f
- Environment ID: 69ccd3019c2b3309e23e20d8
- URL: https://ipcc.zeabur.app

## 後台管理
- 後台入口：https://ipcc.zeabur.app/admin/
- 前台與後台同域，localStorage 自動共用，後台儲存後前台即時更新

## 同步與部署
- 執行 `sync-from-ipccowb.bat` → 從 IPCCOWB 同步最新檔案並自動部署
- 執行 `deploy-to-zeabur.bat` → 僅部署（不同步）
