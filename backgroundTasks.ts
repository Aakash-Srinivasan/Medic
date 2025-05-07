import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { getMedications } from './storage/medicationStorage';

TaskManager.defineTask('check-missed-doses', async () => {
    try {
        const medications = await getMedications();
        const now = new Date();
        medications.forEach(async (med) => {
            const medTime = new Date();
            medTime.setHours(med.hour, med.minute, 0, 0);

            // If the current time is past the scheduled medication time and it's not today
            if (now > medTime) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `💊 Missed Dose`,
                        body: `You missed your dose of ${med.name}`,
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: 1,
                    },
                });
            }
        });


    } catch (error) {
        console.error('Error checking missed doses:', error);

    }
});
