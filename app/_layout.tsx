import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { Alert, Button, Modal, View, Text, TouchableOpacity } from 'react-native';
import * as BackgroundTask from 'expo-background-task';
import '@/backgroundTasks';
import AsyncStorage from '@react-native-async-storage/async-storage';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export default function RootLayout() {
   const [firstTime, setFirstTime] = useState(false);
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
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
      console.log('Background fetch task registered successfully!');
    } catch (error) {
      console.error('Error registering background fetch:', error);
      Alert.alert(
        'Background Task Error',
        'Failed to register background task. Please try again later.'
      );
    }
  };




  useEffect(() => {
    const checkFirstTime = async () => {
      const hasVisited = await AsyncStorage.getItem('hasVisited');
      console.log(hasVisited);
      if (hasVisited) {
        setFirstTime(true);
        await AsyncStorage.setItem('hasVisited', 'true');
      }

    };

    checkFirstTime();
  }, []);
  useEffect(() => {
    requestNotificationPermissions();
    initBackgroundTask(); // Initialize background task on app load
  }, []);


  const colorScheme = useColorScheme();
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
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
       
          <Stack.Screen name="index" options={{ headerShown: false }} />
      
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen name="+not-found" />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
  );
}
