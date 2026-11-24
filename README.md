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

## Download for Windows

[**Download Windows Installer (BillKora-Setup.exe)**](https://github.com/SINOBI-Melloflex/BILLKORA-V2/releases/latest/download/BillKora-Setup.exe)

1. Download and double-click `BillKora-Setup.exe`.
2. If Windows shows "Windows protected your PC", click **More info**, then **Run anyway**.
3. Choose an install folder, keep or change the default login (**admin / admin**), and click **Install**.

Requires Windows 10 or 11 and an internet connection during setup. Setup downloads everything else it needs automatically.

<!-- BK-UPDATE-START -->
## Updating

### সাধারণ নিয়ম (Normal update)

1. কম্পিউটারে ইন্টারনেট চালু আছে কি না দেখুন।
2. BillKora খুলুন। বাম মেনুর একদম নিচে **Check for update** চাপুন।
3. নতুন ভার্সন থাকলে **Update now** চাপুন।
4. অপেক্ষা করুন। অ্যাপ নিজে বন্ধ হয়ে আবার চালু হবে। এই সময় কিছু বন্ধ বা ডিলিট করবেন না।
5. আবার লগইন করুন। আবার **Check for update** চাপলে "You are up to date" দেখালে আপডেট সম্পন্ন।

Open BillKora, press **Check for update** at the bottom of the left menu, then **Update now**. The app restarts by itself. Log in again and press Check for update once more: it should say "You are up to date".

আপনার ডেটা নিরাপদ: আপডেট `data` ও `runtime` ফোল্ডার ছোঁয় না। প্রতিটি আপডেটের আগে ডেটাবেসের ব্যাকআপ `data` ফোল্ডারে `db.backup-before-update-...` নামে রাখা হয় (সর্বশেষ ৩টা থাকে)। আপডেট মাঝপথে ব্যর্থ হলে আগের অবস্থায় ফিরে যায়।

Your data is not touched by updates. A database backup is saved before every update, and a failed update is undone automatically.

অথবা নতুন ইনস্টলার (BillKora-Setup.exe) আবার নামিয়ে চালান। এটা পুরোনো অ্যাপ বদলে দেয় এবং ডেটা রাখে।

### Check for update কাজ না করলে (One-time repair)

যাদের বাটন চাপলে এরর আসে বা আপডেট আটকে যায়, একবার এটা করুন:

1. কীবোর্ডে **Windows + X** চেপে **Windows PowerShell** খুলুন।
2. নিচের লাইনটা পুরোটা কপি করে পেস্ট করে Enter চাপুন:

        irm https://raw.githubusercontent.com/SINOBI-Melloflex/BILLKORA-V2/main/tools/Fix-Update.ps1 | iex

3. স্ক্রিপ্ট নিজে BillKora-র ফোল্ডার খুঁজে নেবে। না পেলে ফোল্ডারের পথ জিজ্ঞেস করবে (যে ফোল্ডারে `server.js` আছে)।
4. "Fixed" লেখা এলে BillKora খুলে আবার **Check for update** চাপুন।

এটা শুধু আপডেটের ফাইল (`upd.js`) বদলায়, আপনার ডেটা নয়।

### সাধারণ সমস্যা (Troubleshooting)

- **"Could not reach GitHub"**: কম্পিউটারের ইন্টারনেট দেখুন, আবার চেষ্টা করুন।
- **"GitHub is still preparing the new version"**: এক মিনিট পর আবার চেষ্টা করুন।
- **"An update is already running"**: কয়েক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।
- **"Update failed and was undone"**: আগের ভার্সন আর ডেটা অক্ষত আছে। আবার চেষ্টা করুন, না হলে ওপরের Repair করুন।

### স্ক্রিন সাইজ

ভার্সন 1.2.5 থেকে বাম মেনু যেকোনো স্ক্রিনে পুরো উচ্চতা নেয়। এর জন্য কোনো সেটিং বা জুম বদলাতে হয় না। ব্রাউজারের নিজের জুম 100% রাখুন।
<!-- BK-UPDATE-END -->

