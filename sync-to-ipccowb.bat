@echo off
chcp 65001 >nul
echo ========================================
echo  IPCC 官網同步工具
echo  從 IPCC 同步到 IPCCOWB（保留後台）
echo ========================================
echo.

set SRC=%~dp0
set DST=%~dp0..\IPCCOWB

:: 同步所有 HTML 和 CSS 檔案（排除 admin 資料夾）
robocopy "%SRC%" "%DST%" *.html *.css *.js *.png *.jpg *.jpeg *.gif *.ico *.svg /XD "%DST%\admin" /NFL /NDL /NJH /NJS

echo.
echo [OK] 同步完成！
echo      來源：%SRC%
echo      目標：%DST%
echo.
pause
