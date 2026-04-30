@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo  IPCC 官網  一鍵部署到 Vercel
echo ========================================
echo.

echo [1/2] 從 GitHub 同步最新 content-data.js...
curl -sf "https://raw.githubusercontent.com/joanseu3234-dotcom/ipcc-website/main/content-data.js" -o "content-data_latest.js" 2>nul
if exist content-data_latest.js (
  move /y content-data_latest.js content-data.js >nul
  echo       已同步最新 content-data.js ✓
) else (
  echo       [警告] 無法從 GitHub 取得最新資料，使用本機版本
)
echo.

echo [2/2] 部署到 Vercel（如尚未登入請先執行 npx vercel login）...
npx vercel@latest --prod --yes
echo.

echo 部署完成！
echo.
pause
