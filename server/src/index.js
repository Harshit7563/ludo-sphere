import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import './loadEnv.js';
import path from 'path';
import { fileURLToPath } from 'url';

import { socketAuth } from './middleware/auth.js';
import { setupSocketHandlers, initBotUser } from './socket/handlers.js';
import { startHeadTailRoundClock } from './headTail/roundClock.js';

import authRoutes from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import roomRoutes from './routes/rooms.js';
import tournamentRoutes from './routes/tournaments.js';
import leaderboardRoutes from './routes/leaderboard.js';
import friendsRoutes from './routes/friends.js';
import rewardsRoutes from './routes/rewards.js';
import kycRoutes from './routes/kyc.js';
import adminRoutes from './routes/admin.js';
import headTailRoutes from './routes/headTail.js';
import appConfigRoutes from './routes/appConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    'http://localhost:5180',
    'http://localhost:5173',
    'http://localhost:5174',
    'capacitor://localhost',
    'https://localhost',
    'http://localhost',
  ].filter(Boolean),
);

/** www + non-www + http/https variants of CLIENT_URL */
function addClientUrlVariants(set) {
  const client = process.env.CLIENT_URL;
  if (!client) return;
  try {
    const u = new URL(client);
    set.add(u.origin);
    const bare = u.hostname.replace(/^www\./, '');
    const hosts = [bare, `www.${bare}`];
    for (const host of hosts) {
      set.add(`${u.protocol}//${host}`);
      const alt = u.protocol === 'https:' ? 'http:' : 'https:';
      set.add(`${alt}//${host}`);
    }
  } catch {
    set.add(client);
  }
}
addClientUrlVariants(allowedOrigins);

function hostMatchesClientUrl(origin) {
  if (!process.env.CLIENT_URL || !origin) return false;
  try {
    const allowed = new URL(process.env.CLIENT_URL);
    const req = new URL(origin);
    const strip = (h) => h.replace(/^www\./, '');
    return strip(allowed.hostname) === strip(req.hostname);
  } catch {
    return false;
  }
}

/** Allow phone/emulator hitting dev server on LAN IP */
function isDevLanOrigin(origin) {
  if (!origin || process.env.NODE_ENV === 'production') return false;
  return /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|10\.0\.2\.2)(:\d+)?$/.test(origin);
}

function corsOrigin(origin, callback) {
  if (
    !origin
    || allowedOrigins.has(origin)
    || isDevLanOrigin(origin)
    || hostMatchesClientUrl(origin)
  ) {
    callback(null, true);
  } else {
    console.warn('[cors] blocked origin:', origin);
    callback(null, false);
  }
}

app.set('trust proxy', 1);

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '512kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', game: 'Ludo Sphere' }));

app.use('/api/app-config', appConfigRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/head-tail', headTailRoutes);

// Serve React build in production
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Client not built' });
  });
});

io.use(socketAuth);
setupSocketHandlers(io);
startHeadTailRoundClock(io);

const PORT = process.env.PORT || 4001;
const HOST = process.env.HOST || '0.0.0.0';

try {
  await initBotUser();
  console.log('🤖 Ludo AI bot ready');
} catch (err) {
  console.error('Bot init failed (AI games need db:setup):', err.message);
}

server.listen(PORT, HOST, () => {
  console.log(`👑 Ludo Sphere Server running on http://${HOST}:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log('   Android device: use your Mac Wi‑Fi IP in client/.env.android (npm run android:prepare)');
  }
});

export { io };
