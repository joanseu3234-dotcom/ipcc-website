@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     IPCC 後台自動部署服務器                 ║
echo  ╠══════════════════════════════════════════╣
echo  ║  啟動後請不要關閉此視窗                     ║
echo  ║  在後台按「發布上線」就會自動部署到 Zeabur    ║
echo  ╚══════════════════════════════════════════╝
echo.
node deploy-server.js
pause
