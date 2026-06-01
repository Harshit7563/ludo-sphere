import { execSync } from 'child_process';

const PORTS = [5180, 4001];

function pidsOnPort(port) {
  try {
    return execSync(`lsof -ti :${port}`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

function killPid(pid) {
  const n = Number(pid);
  if (!Number.isFinite(n)) return;
  try {
    process.kill(n, 'SIGTERM');
    console.log(`[kill-dev-ports] stopped PID ${n}`);
  } catch {
    try {
      process.kill(n, 'SIGKILL');
      console.log(`[kill-dev-ports] force-killed PID ${n}`);
    } catch {
      // already gone
    }
  }
}

let stopped = 0;
for (const port of PORTS) {
  const pids = pidsOnPort(port);
  if (!pids.length) continue;
  console.log(`[kill-dev-ports] freeing port ${port}…`);
  for (const pid of pids) {
    killPid(pid);
    stopped++;
  }
}

if (!stopped) {
  console.log('[kill-dev-ports] ports 5180 and 4001 are already free');
}
