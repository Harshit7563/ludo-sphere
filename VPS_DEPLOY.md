# Ludo Sphere — VPS par live deploy

Ubuntu 22.04/24.04 VPS (Hostinger VPS, DigitalOcean, Hetzner, etc.)

## 1. Domain DNS

Hostinger (ya jahan domain hai) → DNS:

| Type | Name | Value |
|------|------|--------|
| A | `@` | `YOUR_VPS_IP` |
| A | `www` | `YOUR_VPS_IP` |

5–30 min wait for DNS.

---

## 2. VPS par SSH

```bash
ssh root@YOUR_VPS_IP
```

---

## 3. System packages

```bash
apt update && apt upgrade -y
apt install -y git curl nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw
```

### Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## 4. Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v   # v22.x
```

---

## 5. PostgreSQL (same VPS)

```bash
sudo -u postgres psql -c "CREATE USER ludo WITH PASSWORD 'STRONG_DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE ludo_sphere OWNER ludo;"
```

Connection string (server `.env`):

```env
DATABASE_URL=postgresql://ludo:STRONG_DB_PASSWORD@localhost:5432/ludo_sphere
```

---

## 6. App code

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/Harshit7563/ludo-sphere.git
cd ludo-sphere
```

### Environment file

```bash
nano server/.env
```

```env
PORT=4001
HOST=127.0.0.1
NODE_ENV=production
DATABASE_URL=postgresql://ludo:STRONG_DB_PASSWORD@localhost:5432/ludo_sphere
JWT_SECRET=PASTE_LONG_RANDOM_SECRET
CLIENT_URL=https://ludosphere.in
ADMIN_EMAIL=admin@ludosphere.com
ADMIN_PASSWORD=ChangeThisAdminPassword
```

### Install, build, database

```bash
npm install
npm run build
npm run db:setup
```

---

## 7. PM2 (app hamesha chale)

```bash
npm install -g pm2
pm2 start app.js --name ludo-sphere
pm2 save
pm2 startup   # command jo print ho, woh copy-paste karo
```

Check:

```bash
curl http://127.0.0.1:4001/api/health
# {"status":"ok","game":"Ludo Sphere"}
```

---

## 8. Nginx (domain + WebSocket)

```bash
nano /etc/nginx/sites-available/ludosphere.in
```

```nginx
server {
    listen 80;
    server_name ludosphere.in www.ludosphere.in;

    location /socket.io/ {
        proxy_pass http://127.0.0.1:4001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location / {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

`server/.env` must include:

```env
CLIENT_URL=https://ludosphere.in
```

(Use `https://www.ludosphere.in` only if users always open the www URL.)

Enable site:

```bash
ln -sf /etc/nginx/sites-available/ludosphere.in /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### SSL (HTTPS)

```bash
certbot --nginx -d ludosphere.in -d www.ludosphere.in
```

---

## 9. Test

- https://ludosphere.in/api/health
- https://ludosphere.in → login / game
- Socket.IO: matchmaking / private room test

---

## Updates (naya code push ke baad)

```bash
cd /var/www/ludo-sphere
git pull origin main
npm install
npm run build
pm2 restart ludo-sphere
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 502 Bad Gateway | `pm2 logs ludo-sphere` — app crash? `DATABASE_URL`? |
| WebSocket fail | Nginx `Upgrade` headers (config upar) |
| DB error | `sudo -u postgres psql -d ludo_sphere -c '\dt'` |
| Port in use | `pm2 delete ludo-sphere` then start again |

---

## Hostinger Node app vs VPS

- **Node Web App (hPanel):** managed, kam setup — par kabhi routing/403 issues
- **VPS:** poora control — **Ludo + Socket.IO + PostgreSQL** ke liye zyada reliable
