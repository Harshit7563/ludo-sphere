# Deploy on Hostinger (ludosphere.in)

## Build settings (Node.js Web App)

| Setting | Value |
|---------|--------|
| Framework | Other |
| Branch | main |
| Node | 22.x |
| Root directory | `/` |
| Install | `npm install` |
| Build | `npm run build` |
| Start | `npm start` |

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
