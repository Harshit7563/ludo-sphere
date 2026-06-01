import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

/** Push requires Firebase setup (google-services.json) — enable when FCM is configured */
export async function initPushNotifications() {
  // No-op until Firebase is added for Android/iOS
}
