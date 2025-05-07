import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import { Alert, Button, Modal, View ,Text} from 'react-native';
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
      console.log('Background fetch task registered successfully!');
    } catch (error) {
      console.error('Error registering background fetch:', error);
      Alert.alert(
        'Background Task Error',
        'Failed to register background task. Please try again later.'
      );
    }
  };

  const [firstTime, setFirstTime] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [medicationName, setMedicationName] = useState<string | null>(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { notification } = response;
      const name = notification.request.content.body?.split(' ')[5]; // crude extraction
      setMedicationName(name || 'this medication');
      setModalVisible(true); // show modal when opened from notification
    });

    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const checkFirstTime = async () => {
      const hasVisited = await AsyncStorage.getItem('hasVisited');
      if (!hasVisited) {
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
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {firstTime ? (
          <Stack.Screen name="Wellcome" />
        ) : (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: 30
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 20,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, marginBottom: 15 }}>
              Did you take {medicationName}?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Yes" onPress={() => {
                // ✅ Save confirmation logic here
                setModalVisible(false);
              }} />
              <Button title="No" onPress={() => {
                // 🚫 You can log or re-schedule here
                setModalVisible(false);
              }} />
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
