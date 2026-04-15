@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo  IPCC 官網  一鍵部署到 Zeabur
echo  https://ipcc.zeabur.app/
echo ========================================
echo.
echo [1/2] 上傳至 Zeabur (前台 service)...
npx zeabur@latest deploy --service-id=69ccdf619994d25a1d0acf9f --environment-id=69ccd3019c2b3309e23e20d8 -i=false
echo.
echo [2/2] 部署完成！
echo       https://ipcc.zeabur.app/
echo.
pause
