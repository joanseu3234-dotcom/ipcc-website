@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║   IPCC 官網 — 推送到 GitHub（首次設定用）                  ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo  請先在 https://github.com/new 建立一個新的 Repository
echo  建立後複製 Repository 的網址（例：https://github.com/joan/ipcc-website.git）
echo.
set /p REPO_URL=請貼上 GitHub Repository 網址：

if "%REPO_URL%"=="" (
  echo 取消。
  pause
  exit /b
)

echo.
echo  正在初始化 Git...
git init
git add .
git commit -m "initial: IPCC website"
git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO_URL%
echo.
echo  正在推送到 GitHub...
git push -u origin main

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║  推送完成！接下來請到 Zeabur 後台連結此 GitHub Repository   ║
echo  ║  連結後，每次後台發布，Zeabur 就會自動更新官網              ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
pause
