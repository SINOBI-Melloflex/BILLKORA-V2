# BillKora V2

![BillKora](public/logo.png)

ISP billing and customer management app (Node.js, no extra packages).

## Run
1. Install Node.js (https://nodejs.org)
2. In this folder run: node server.js
3. Open http://127.0.0.1:4050

## Demo logins
- Admin: admin / admin
- Customer: user / user

Data is saved in data/db.json (created automatically on first start).
Windows launcher: BillKora.ps1 (needs Microsoft Edge). launch.vbs has the folder path G:\billkora inside it - edit it if you put the project somewhere else.

## Download for Windows

[**Download Windows Installer (BillKora-Setup.exe)**](https://github.com/SINOBI-Melloflex/BILLKORA-V2/releases/latest/download/BillKora-Setup.exe)

1. Download and double-click `BillKora-Setup.exe`.
2. If Windows shows "Windows protected your PC", click **More info**, then **Run anyway**.
3. Choose an install folder, keep or change the default login (**admin / admin**), and click **Install**.

Requires Windows 10 or 11 and an internet connection during setup. Setup downloads everything else it needs automatically.

## Updating

Inside BillKora (admin panel, top bar) click **Check for update**. If a new version is on GitHub it downloads and installs itself. Your customers, invoices and settings are kept.

Or just download the newest installer again and run it. It replaces the old app and keeps your data.
