@echo off
cd /d "%~dp0"
start "" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%~dp0'; $host.UI.RawUI.WindowTitle='BillKora V2'; Start-Job { Start-Sleep 2; Start-Process 'http://127.0.0.1:4050' } | Out-Null; Write-Host 'BillKora V2 running at http://127.0.0.1:4050' -ForegroundColor Green; Write-Host 'Close this window to stop.'; node server.js"
