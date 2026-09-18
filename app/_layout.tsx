import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as BackgroundTask from 'expo-background-task';
import { isExpoGo, setNotificationHandlerSafe, requestNotificationPermissionsSafe } from '@/utils/notifications';
import { ThemeProvider } from '@/context/ThemeContext';
import '@/backgroundTasks';

// Do NOT `import * as Notifications from 'expo-notifications'` here - even
// that plain import throws synchronously inside Expo Go on SDK 53+ ("Android
// Push notifications (remote notifications)... removed from Expo Go"),
// before RootLayout is even defined. Everything notification-related goes
// through utils/notifications.ts, which lazy-`require()`s the module only
// when NOT running in Expo Go.
setNotificationHandlerSafe();


export default function RootLayout() {
  const requestNotificationPermissions = async () => {
    const granted = await requestNotificationPermissionsSafe();
    if (!granted && !isExpoGo) {
      Alert.alert("Permission denied", "Enable notifications in settings.");
    }
  };
  const initBackgroundTask = async () => {
    try {
      await BackgroundTask.registerTaskAsync('check-missed-doses', {
        minimumInterval: 15 * 60,
      });
      await BackgroundTask.registerTaskAsync('reset-medication-statuses', {
        minimumInterval: 24 * 60 * 60,
      });
    } catch {
      // Also expected in Expo Go (background tasks need a dev build too) -
      // only surface this as a user-facing error outside of Expo Go.
      if (!isExpoGo) {
        Alert.alert(
          'Background Task Error',
          'Failed to register background task. Please try again later.'
        );
      }
    }
  };

  useEffect(() => {
    requestNotificationPermissions();
    initBackgroundTask(); // Initialize background task on app load
  }, []);


  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Lemon: require('../assets/fonts/Lemon-Regular.ttf'),
    Light: require('../assets/fonts/Poppins-Light.ttf'),
    regular: require('../assets/fonts/Poppins-Regular.ttf'),
    medium: require('../assets/fonts/Poppins-Medium.ttf'),
    semibold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    bold: require('../assets/fonts/Poppins-Bold.ttf')

  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>

        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
