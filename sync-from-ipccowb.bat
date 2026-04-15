@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo  IPCC 資料同步工具
echo  IPCCOWB (開發) → IPCC (正式前台)
echo ========================================
echo.

set SRC=%~dp0..\IPCCOWB
set DST=%~dp0

echo [1/3] 同步前台檔案（HTML / CSS / JS / 圖片 / Docker）...
robocopy "%SRC%" "%DST%" *.html *.css *.js *.png *.jpg *.jpeg *.gif *.ico *.svg Dockerfile docker-entrypoint.sh nginx.conf /XD "%DST%\admin" /NFL /NDL /NJH /NJS

echo [2/3] 同步後台 admin/ 資料夾...
robocopy "%SRC%\admin" "%DST%\admin" /E /NFL /NDL /NJH /NJS

echo [3/3] 準備部署到 ipcc.zeabur.app...
call "%~dp0deploy-to-zeabur.bat"
