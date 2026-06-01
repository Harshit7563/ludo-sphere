import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/** Emulator → host machine; physical device uses .env.android LAN IP */
const NATIVE_FALLBACK = 'http://10.0.2.2:4001';

export const API_URL = import.meta.env.VITE_API_URL || (isNative ? NATIVE_FALLBACK : '');
/** Web dev: Vite proxies /socket.io → :4001. Native: set VITE_SOCKET_URL in .env.android */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || (isNative ? NATIVE_FALLBACK : window.location.origin);

export async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  let res;
  try {
    res = await fetch(`${API_URL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    const hint = isNative
      ? `Phone cannot reach server at ${API_URL}. Same Wi‑Fi? Run: npm run android:prepare && npm run android:build`
      : 'Backend not reachable. Run: cd server && npm run dev (port 4001)';
    throw new Error(hint);
  }

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      'Wrong server responded. Stop other apps on port 4001, then run Ludo server: cd server && npm run dev'
    );
  }

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    if (data.code) err.code = data.code;
    throw err;
  }
  return data;
}
