# Speed Post Live Tracker — Vercel Edition

A small, responsive tracking dashboard for four India Post Speed Post article numbers. The frontend is served from `index.html`; the live tracking API runs as a Vercel Serverless Function at `/api/track`. Tracking data comes from 17TRACK.

## Features

- Four configured tracking numbers and their scan histories
- Automatic refresh every 60 seconds, plus a manual refresh button
- Responsive layout and system light/dark theme
- Links to India Post and 17TRACK
- API key stored server-side as a Vercel Environment Variable
- No paid hosting required to get started on Vercel's eligible free plan

## Before deploying

You need:
1. A GitHub account
2. A Vercel account
3. A valid 17TRACK API key (`TRACK17_KEY`)

**Important:** Vercel's free-plan limits and eligibility can change. Check Vercel's current pricing/usage terms. The 17TRACK API may have its own quota, access requirements, or charges. Hosting can be free without making the external tracking API unlimited or guaranteed free.

## Deploy to GitHub + Vercel (no terminal required)

### 1. Upload this project to GitHub

1. Download and extract the ZIP file on your computer.
2. Open GitHub and create a **new repository** (for example `speedpost-live-tracker`). Choose Private if you do not want the source code public.
3. In the new repository, select **Add file → Upload files**.
4. Upload the *contents* of the extracted folder, not the ZIP itself and not an extra enclosing folder. The repository root should contain:
   - `index.html`
   - `api/track.js`
   - `vercel.json`
   - `.gitignore`
   - `.env.example`
   - `README.md`
5. Commit the files.

### 2. Import the repository into Vercel

1. Sign in to Vercel.
2. Choose **Add New → Project**.
3. Import the GitHub repository you just created. Authorize GitHub if Vercel asks.
4. For this project, no build command or framework preset is required. If asked, choose **Other** and leave the build command empty.
5. Click **Deploy**.

### 3. Add the 17TRACK key securely

1. Open the project in Vercel.
2. Go to **Settings → Environment Variables**.
3. Add:
   - **Name:** `TRACK17_KEY`
   - **Value:** your 17TRACK API token
   - **Environments:** Production (and Preview/Development if you need them)
4. Save the variable.
5. Open **Deployments** and redeploy the latest deployment so the function receives the new variable.

Do not paste your real API key into `index.html`, `README.md`, GitHub commits, screenshots, or public messages. `.env.example` is only a placeholder. If a real key was ever committed publicly, revoke/rotate it with the provider.

### 4. Test your website

Open your Vercel deployment URL, for example `https://your-project.vercel.app`.

Then test the API directly by opening `https://your-project.vercel.app/api/track`. You should receive JSON containing `updated` and `articles`.

- If the page opens but the API says `Missing TRACK17_KEY`, add the environment variable and redeploy.
- If the API returns `17TRACK returned HTTP 401/403`, check the token and whether the 17TRACK account has API access.
- If articles say they are waiting for the first scan, the carrier/provider may not have published tracking data yet.
- If you get a 404 at `/api/track`, verify `api/track.js` is in the repository root's `api` folder.
- If deployment fails, check **Vercel → Project → Deployments → Build Logs** and **Runtime Logs**.

## Update the tracked article numbers

Edit the `ARTICLES` array at the top of `api/track.js`. Each entry contains `id`, `div`, optional `block`, `who`, and `no`. Keep IDs unique. Commit the change to GitHub; Vercel will normally deploy it automatically.

## Project structure

```text
speedpost-live-tracker/
├── api/
│   └── track.js
├── index.html
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

## Local preview (optional)

The website's HTML can be previewed by opening `index.html`, but the `/api/track` endpoint only works after deployment to Vercel or in a configured local serverless environment. Do not expect live data from opening the HTML file directly.

## Notes

- The original uploaded `worker.js` was written for Cloudflare Workers. This repository adapts its tracking logic to Vercel's Node.js Serverless Function format.
- The original `wrangler.toml` is Cloudflare-specific and is intentionally not used by Vercel.
- This project uses Node.js built-in `fetch` available in modern Vercel Node.js runtimes; no npm packages are required.
