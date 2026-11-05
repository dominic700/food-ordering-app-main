# Poly Fuka – deploy on EasyPanel

This folder has two apps. Each has its own Dockerfile, so choose **Dockerfile** as the builder
(not Nixpacks).

    backend/    Node.js API + Telegram bot   -> port 5000
    frontend/   React (Vite) mini app        -> port 3000

Push this whole folder to ONE GitHub repo, then create the services below.

## 1. Database
1. EasyPanel -> project -> **+ Service -> Postgres** (e.g. `food-db`).
2. Open its **Console** and run the whole file `backend/db/schema.sql`.
3. Make yourself admin (use your own Telegram ID):

       UPDATE admins SET telegram_id = 7764278446 WHERE email = 'admin@foodapp.com';

## 2. Backend service (`app-backend`)
* Source: GitHub, branch `main`, **Build Path: `/backend`**
* Build: **Dockerfile**
* Environment (see `backend/.env.example`):

      PORT=5000
      NODE_ENV=production
      DATABASE_URL=<internal connection string of food-db>
      DB_SSL=false
      JWT_SECRET=<long random text>
      JWT_EXPIRES_IN=7d
      TELEGRAM_BOT_TOKEN=<your bot token>
      FRONTEND_URL=https://<frontend domain>
      WEB_APP_URL=https://<frontend domain>

* Domains: add a domain, port **5000**
* Mounts: add a **Volume** with mount path **/app/uploads** (keeps uploaded images after redeploys)

## 3. Frontend service (`app-frontend`)
* Source: GitHub, branch `main`, **Build Path: `/frontend`**
* Build: **Dockerfile**
* Environment (must be set BEFORE the first deploy, it is baked into the build):

      VITE_API_URL=https://<backend domain>

* Domains: add a domain, port **3000**

## 4. Finish
1. Put the real frontend domain into `FRONTEND_URL` and `WEB_APP_URL` on the backend, then redeploy it.
2. Open `https://<backend domain>/health` – database and bot should say connected/running.
3. Send /start to your bot.

## Payments (important)
* Customers pay by **Telebirr** (shows the cafe's name and number) or **Cash**.
* A Telebirr order or deposit needs a receipt code OR a screenshot as proof. Nothing is auto-checked
  against Ethio Telecom (their site blocks automatic requests).
* Cafe owners see the proof (receipt link or screenshot) on each pending order in the Orders tab.
* Deposits are marked verified through `POST /api/deposits/webhook/verify`
  (`{"transaction_number": "...", "status": "verified"}`). There is no cafe-owner screen for this yet.
