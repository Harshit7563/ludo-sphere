#!/usr/bin/env node
/**
 * Writes client/.env.android with your LAN IP so the APK can reach the dev server.
 */
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.join(__dirname, '..');

function getLanIp() {
  if (process.env.LAN_IP) return process.env.LAN_IP;
  // Prefer Mac Wi‑Fi interface
  try {
    const en0 = execSync('ipconfig getifaddr en0 2>/dev/null', { encoding: 'utf8' }).trim();
    if (en0) return en0;
  } catch {
    /* fall through */
  }
  try {
    const nets = os.networkInterfaces();
    for (const ifaces of Object.values(nets)) {
      for (const net of ifaces || []) {
        if (net.family === 'IPv4' && !net.internal) return net.address;
      }
    }
  } catch {
    /* sandbox / restricted env */
  }
  return null;
}

const ip = process.env.LAN_IP || getLanIp();
const port = process.env.API_PORT || '4001';

if (!ip) {
  console.error('Could not detect LAN IP. Set LAN_IP=192.168.x.x npm run android:build');
  process.exit(1);
}

const base = `http://${ip}:${port}`;
const content = `# Auto-generated — do not commit
VITE_API_URL=${base}
VITE_SOCKET_URL=${base}
VITE_CAPACITOR=true
`;

fs.writeFileSync(path.join(clientRoot, '.env.android'), content, 'utf8');

console.log('');
console.log('  Android env ready');
console.log(`  API / Socket: ${base}`);
console.log('');
console.log('  1. Phone + Mac same Wi‑Fi');
console.log(`  2. Start server: cd server && npm run dev  (listening on 0.0.0.0:${port})`);
console.log('  3. Android Studio → Run on device');
console.log('');
console.log('  Emulator instead of device: LAN_IP=10.0.2.2 npm run android:build');
console.log('');
