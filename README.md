# 👑 Ludo Sphere

Premium Royal Multiplayer Ludo Game with React UI, Node.js backend, Socket.IO real-time multiplayer, PostgreSQL, and Android app support.

## Architecture

| Layer | Tech |
|-------|------|
| **Game (Mobile/PWA)** | React + Vite + Capacitor (Android) |
| **Admin** | React (web) at `/admin` |
| **API** | Node.js + Express |
| **Real-time** | Socket.IO |
| **Database** | PostgreSQL |

## Features

### Game (Android / PWA / Web)
- Royal luxury theme (gold, dark, crowns, glowing dice)
- Splash, Login, Register, Home, Wallet
- Create/Join Room, Quick Match (2p/4p)
- Tournament lobby, Friends, Leaderboard
- Profile, Rewards, Referral, Transaction History
- Real-time Ludo board with dice, tokens, turn timer
- Live chat & emoji, disconnect/reconnect
- Winner screen with prize distribution

### Admin Dashboard (Web only)
- User management (ban/unban)
- Wallet management & balance adjustments
- Match history & result control
- Tournament management
- Pay-in/payout transaction reports
- Commission settings
- Referral reports
- Fraud monitoring

### Socket.IO Events
- `matchmaking:join` / `matchmaking:leave`
- `room:join` / `room:ready`
- `game:roll` / `game:move`
- `chat:message` / `emoji:send`
- `game:state` / `game:finished`
- `player:disconnected` / `player:reconnected`

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Android Studio (for Android build)

## Setup

### 1. Database

```bash
createdb ludo_sphere
```

### 2. Install dependencies

```bash
cd "Ludo Sphere"
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment

```bash
cp server/.env.example server/.env
# Edit DATABASE_URL and JWT_SECRET
```

### 4. Migrate & seed

```bash
cd server
npm run db:migrate
npm run db:seed
```

Default admin: `admin@ludosphere.com` / `Admin@123`

### 5. Run development

```bash
# From project root
npm run dev
```

- Game: http://localhost:5180
- API: http://localhost:4001
- Admin: http://localhost:5180/admin (login as admin)

## Android App (Capacitor)

Project already includes `client/android`. Test on a **physical device** on the same Wi‑Fi as your Mac.

### 1. Start backend (all interfaces)

```bash
cd server && npm run dev
```

Server listens on `0.0.0.0:4001` so your phone can connect.

### 2. Build APK assets with your LAN IP

From repo root:

```bash
npm run android:build
```

This detects your Mac’s Wi‑Fi IP, writes `client/.env.android`, builds the web app, and runs `cap sync android`.

**Android emulator** (host machine from emulator):

```bash
LAN_IP=10.0.2.2 npm run android:build
```

### 3. Run on device

```bash
npm run android:open
```

In Android Studio: select your phone → **Run** (green play).

### Manual IP

Copy `client/.env.android.example` → `client/.env.android`, set `VITE_API_URL` and `VITE_SOCKET_URL` to `http://YOUR_IP:4001`, then:

```bash
cd client && npm run build:android && npx cap sync android
```

### Troubleshooting

- Login/API fails: phone and Mac must be on the **same Wi‑Fi**; re-run `npm run android:prepare` if your IP changed.
- Firewall: allow incoming connections on port **4001**.
- UI: native safe areas and full-width layout apply via `mobile.css` when the app runs in Capacitor.

### Push notifications

Configured via `@capacitor/push-notifications`. Set up Firebase Cloud Messaging in Android Studio for production.

## Production

```bash
cd client && npm run build
cd ../server && npm start
```

Server serves the React build from `client/dist` on the same port.

## Project Structure

```
Ludo Sphere/
├── client/          # React game + admin UI
├── server/          # Express API + Socket.IO
├── capacitor.config.json
└── package.json
```

## Screens

| Screen | Route |
|--------|-------|
| Splash | Auto |
| Login | `/login` |
| Register | `/register` |
| Home | `/home` |
| Wallet | `/wallet` |
| Create Room | `/create-room` |
| Join Room | `/join-room` |
| Quick Match | `/matchmaking` |
| Tournaments | `/tournaments` |
| Friends | `/friends` |
| Leaderboard | `/leaderboard` |
| Profile | `/profile` |
| Rewards | `/rewards` |
| Referral | `/referral` |
| Game Board | `/game/:roomCode` |
| Transactions | `/transactions` |
| Admin | `/admin/*` |
