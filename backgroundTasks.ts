import * as TaskManager from 'expo-task-manager';
import { getMedications, resetStatusesForNewDay } from './storage/medicationStorage';
import { scheduleNotificationSafe, TriggerType } from './utils/notifications';

TaskManager.defineTask('check-missed-doses', async () => {
    try {
        const medications = await getMedications();
        const now = new Date();
        medications.forEach((med) => {
            med.times.forEach(async (t) => {
                const doseTime = new Date();
                doseTime.setHours(t.hour, t.minute, 0, 0);

                // If the current time is past this dose's scheduled time today
                if (now > doseTime) {
                    await scheduleNotificationSafe({
                        content: {
                            title: `💊 Missed Dose`,
                            body: `You missed your dose of ${med.name}`,
                            data: { medicationId: med.id, hour: t.hour, minute: t.minute },
                        },
                        trigger: {
                            type: TriggerType.TIME_INTERVAL,
                            seconds: 1,
                        },
                    });
                }
            });
        });


    } catch (error) {
        // Silently skip this cycle; the next scheduled run will retry.
    }
});
// Task to reset medication statuses at midnight
TaskManager.defineTask('reset-medication-statuses', async () => {
    try {
      await resetStatusesForNewDay();
    } catch (error) {
      // Silently skip; the next scheduled run will retry.
    }
  });
