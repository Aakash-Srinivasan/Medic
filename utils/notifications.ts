import Constants from 'expo-constants';

// expo-notifications' Android native module throws synchronously the
// moment its JS module is even IMPORTED inside Expo Go on SDK 53+ ("Android
// Push notifications (remote notifications)... removed from Expo Go") - a
// plain top-level `import * as Notifications from 'expo-notifications'` is
// enough to crash the whole app before any of its APIs are ever called
// (gating individual calls behind isExpoGo isn't enough, since the static
// import itself already ran). So nothing else in this app imports
// expo-notifications directly - everything goes through the lazy-loaded
// wrappers below, which never `require()` the module at all when running in
// Expo Go. Testing there degrades to "no reminders fire" instead of
// crashing.
export const isExpoGo = Constants.appOwnership === 'expo';

let cachedModule: any = null;
function getNotifications() {
  if (isExpoGo) return null;
  if (!cachedModule) {
    // Must stay a runtime require(), not a static import, so it's never
    // evaluated (and never throws) when running in Expo Go.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-notifications');
  }
  return cachedModule;
}

// String literals matching expo-notifications' own SchedulableTriggerInputTypes
// enum ('daily', 'timeInterval', ...) - hardcoded so nothing else needs to
// import the real module just to build a trigger object.
export const TriggerType = {
  DAILY: 'daily',
  TIME_INTERVAL: 'timeInterval',
} as const;

export type NotificationRequest = {
  content: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };
  trigger: {
    type: string;
    seconds?: number;
    hour?: number;
    minute?: number;
    repeats?: boolean;
  };
};

export type NotificationResponse = {
  notification: {
    request: {
      content: {
        data?: Record<string, unknown>;
      };
    };
  };
};

export function setNotificationHandlerSafe(): void {
  const Notifications = getNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissionsSafe(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) {
    console.warn(
      'Skipping notification permission request - expo-notifications is not supported in Expo Go on SDK 53+. Use a development build to test reminders.'
    );
    return false;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNotificationSafe(request: NotificationRequest): Promise<string> {
  const Notifications = getNotifications();
  if (!Notifications) return '';
  return Notifications.scheduleNotificationAsync(request);
}

export async function cancelScheduledNotificationSafe(
  id: string | null | undefined
): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications || !id) return;
  await Notifications.cancelScheduledNotificationAsync(id);
}

export function addNotificationResponseListenerSafe(
  listener: (response: NotificationResponse) => void
): { remove: () => void } {
  const Notifications = getNotifications();
  if (!Notifications) {
    return { remove: () => {} };
  }
  return Notifications.addNotificationResponseReceivedListener(listener);
}
