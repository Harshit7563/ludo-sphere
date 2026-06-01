# Deploy on Hostinger (ludosphere.in)

## Build settings (Node.js Web App)

| Setting | Value |
|---------|--------|
| Framework | **Express** (or Other) |
| Branch | main |
| Node | 22.x |
| Root directory | `/` |
| Install | `npm install` |
| Build | `npm run build` |
| Start | `npm start` |
| **Entry file** | `app.js` |
| **Output directory** | `client/dist` *(optional — static assets; API must use Node)* |

**Important:** If only `client/dist` is served without Node running, `/api/health` shows Hostinger’s 404 page. Start command **must** be `npm start` → runs `app.js` → Express server.

## Environment variables (required)

| Key | Example |
|-----|---------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | long random string (32+ chars) |
| `CLIENT_URL` | `https://ludosphere.in` |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/ludo_sphere` |

Optional: `PORT` — usually set by Hostinger automatically.

## Database

This app needs **PostgreSQL**. After DB is ready, run once (SSH or Hostinger terminal):

```bash
npm run db:setup
```

## DNS

Point `ludosphere.in` to the Hostinger app URL Hostinger shows after deploy.

## 403 Forbidden on ludosphere.in

Usually the domain still points to **old Website / public_html**, not your **Node.js Web App**.

### Fix (hPanel)

1. **Websites** → open `ludosphere.in`
2. If type is **Website** (WordPress/static) and not **Node.js**:
   - Backup old site if needed
   - **Remove** that website from the domain (Hostinger docs: remove old site before Node deploy on same domain)
3. **Add Website** → **Frontend web app** / **Node.js Web App**
4. Connect GitHub repo `ludo-sphere`, branch `main`
5. Build: `npm run build` · Start: `npm start`
6. Add env vars (see above) → **Deploy**
7. After success, open the **temporary `.hostingersite.com` URL** — if that works but custom domain shows 403, go to Node app → **Domains** → attach `ludosphere.in`

### Quick checks

| Check | Expected |
|-------|----------|
| Deploy status | Success (not failed build) |
| Test URL | `https://something.hostingersite.com/api/health` → `{"status":"ok"}` |
| Domain type | Node.js app, not empty Premium hosting folder |
| `DATABASE_URL` | Set (app may crash without DB → different error) |

### DNS (Hostinger nameservers)

- `A` record for `@` → Node app IP **or** use Hostinger “Connect domain” on the Node deployment (preferred)
- Do **not** leave domain on old shared hosting root with no `index.html` (causes 403)
