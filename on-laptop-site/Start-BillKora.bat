@echo off
title BillKora V2 Server
cd /d "%~dp0"
echo Starting BillKora V2 ...
echo Server address: http://127.0.0.1:4050
echo Close this window to stop the server.
echo.
start "" cmd /c "timeout /t 2 >nul & start http://127.0.0.1:4050"
node server.js
echo.
echo Server stopped.
pause
