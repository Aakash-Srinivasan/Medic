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
import { getMedications, saveStatus } from '@/storage/medicationStorage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export default function RootLayout() {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [snozzedTab, setSnozzedTab] = useState('');
  const [firstTime, setFirstTime] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [medicationName, setMedicationName] = useState<string | null>(null);


  const handleSnooze = async (minutes: number) => {
    console.log(`Snoozed for ${minutes} minutes`);

    // Schedule a new notification after `minutes` delay
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Medication Reminder',
        body: `Reminder after snooze: It’s time to take your ${medicationName}.`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: minutes * 60,
        repeats: false,
      },
    });

    setShowSnoozeOptions(false);
    setModalVisible(false);
  };



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
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
            padding: 30,
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 15 }}>
              Did you take {medicationName}?
            </Text>

            {!showSnoozeOptions ? (
              <>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                    <TouchableOpacity
                      onPress={async () => {
                        const today = new Date().toISOString().split('T')[0];
                        const meds = await getMedications();
                        const matchedMed = meds.find((med) =>
                          medicationName?.toLowerCase().includes(med.name.toLowerCase())
                        );

                        if (matchedMed) {
                          await saveStatus({
                            medicationId: matchedMed.id,
                            date: today,
                            status: 'taken',
                          });
                        }

                        setModalVisible(false);
                      }}
                      style={{ padding: 10, backgroundColor: '#0BFDA6', borderRadius: 10 }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Yes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={async () => {
                        const today = new Date().toISOString().split('T')[0];
                        const meds = await getMedications();
                        const matchedMed = meds.find((med) =>
                          medicationName?.toLowerCase().includes(med.name.toLowerCase())
                        );

                        if (matchedMed) {
                          await saveStatus({
                            medicationId: matchedMed.id,
                            date: today,
                            status: 'not taken',
                          });
                        }

                        setModalVisible(false);
                      }}
                      style={{ padding: 10, backgroundColor: '#FF7755', borderRadius: 10 }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowSnoozeOptions(true)}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Snooze</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                <Text style={{ marginBottom: 10 }}>Snooze for how many minutes?</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {[1,5, 10].map((min) => (
                    <TouchableOpacity
                      key={min}
                      style={{
                        backgroundColor: '#4CAF50',
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        borderRadius: 5,
                      }}
                      onPress={() => handleSnooze(min)}
                    >
                      <Text style={{ color: 'white' }}>{min} min</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
