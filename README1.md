# BillKora V2 - Project Overview

BillKora V2 is an ISP management and billing system for small and medium internet service providers. It runs on the provider's own Windows PC, opens in the browser at `localhost:4050`, and keeps all data on that computer.

## What it covers

- **Dashboard** with a quick view of customers, billing and payments
- **Customer management** and **new connection requests**
- **Package management** (speed and monthly price)
- **Billing and invoices**, and **payment management**
- **Support and ticketing**
- **Installation and field service**
- **Inventory and assets**
- **Accounts and reports**
- **HR and staff**
- **Settings**, including company name and admin login

## Migration assistant

Moving from another billing system is guided step by step:

- Import customers from an **Excel or CSV file**, or
- Import directly from a **MikroTik router** (PPPoE users, passwords and profiles). The router is only read, it is not changed.
- Packages are matched with router profiles, and the import is checked at the end.

## Network devices

- MikroTik routers through the MikroTik API (port 8728)
- Other devices such as OLT and switches can be saved and tested

## Installing and updating

- Download the installer from the Releases page and run it.
- A fresh install starts empty. During setup you choose the company name and the admin username and password.
- Updates come from this repository. Press **Check for update** inside the app and your data is kept.

## Current version

1.3.2. Direct MikroTik import no longer repeats the router and sync steps.