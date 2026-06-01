# Ludo Sphere — Android App

Capacitor Android app: `client/android`  
Package: `com.ludosphere.royal`  
App name: **Ludo Sphere**

## Quick start (physical phone)

### 1. Backend chalao (Mac par)

```bash
cd server && npm run dev
```

Server `0.0.0.0:4001` par chalega.

### 2. Android app build karo

```bash
cd "/Users/harshit/Ludo Sphere"
npm run android:apk
```

Ye tumhare Wi‑Fi IP detect karke `client/.env.android` banata hai, web build karta hai, aur **debug APK** banata hai.

**APK path:**

`client/android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Phone par install

- Phone aur Mac **same Wi‑Fi** par hon
- APK copy karke phone par install karo, ya USB se:

```bash
adb install -r "client/android/app/build/outputs/apk/debug/app-debug.apk"
```

### 4. Android Studio se run (optional)

```bash
npm run android:open
```

Android Studio → apna phone select karo → **Run** (▶).

---

## Emulator

```bash
LAN_IP=10.0.2.2 npm run android:apk
```

`10.0.2.2` = emulator se Mac ka localhost.

---

## IP badal gaya?

Mac ka Wi‑Fi IP change ho to dubara:

```bash
npm run android:build
```

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| App open hoke turant band | `npm run android:build` — Push/Firebase crash fix included |
| Login / API fail | Same Wi‑Fi; `npm run android:prepare`; server `npm run dev` |
| Emulator API | `LAN_IP=10.0.2.2 npm run android:build` |
| Build fail | Android Studio install karo; SDK 34 |
| Firewall | Port **4001** allow karo |
