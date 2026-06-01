#!/usr/bin/env node
/** USB debugging: phone uses 127.0.0.1 → Mac via adb reverse */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const clientRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = process.env.API_PORT || '4001';
const base = `http://127.0.0.1:${port}`;

fs.writeFileSync(
  path.join(clientRoot, '.env.android'),
  `# USB dev — use with: adb reverse tcp:${port} tcp:${port}\nVITE_API_URL=${base}\nVITE_SOCKET_URL=${base}\nVITE_CAPACITOR=true\n`,
  'utf8'
);

try {
  execSync(`adb reverse tcp:${port} tcp:${port}`, { stdio: 'inherit' });
  console.log(`\n  adb reverse tcp:${port} tcp:${port} — OK`);
} catch {
  console.warn('\n  adb reverse failed — connect phone via USB + enable USB debugging');
}

console.log(`  API / Socket: ${base}`);
console.log('  Now run: npm run build:android --prefix client && cd client && npx cap sync android\n');
