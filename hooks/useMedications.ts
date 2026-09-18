import 'react-native-get-random-values';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  scheduleNotificationSafe,
  cancelScheduledNotificationSafe,
  TriggerType,
} from '@/utils/notifications';
import { DraftTime } from '@/hooks/useMedicationForm';
import {
  Medication,
  MedicationTime,
  deleteMedication,
  getAllStatuses,
  getMedications,
  saveMedication,
  updateMedication,
} from '@/storage/medicationStorage';

export type MedicationFormValues = {
  name: string;
  times: DraftTime[];
  foodTiming: string;
  quantityType: string;
  quantity: number;
  notes?: string;
};

export type DoseStatus = 'not yet' | 'taken' | 'not taken';

// A medication plus today's status for each of its dose times, keyed by
// "hour:minute" (see MedicationCard for how this drives the per-slot check
// icon instead of one status for the whole medication).
export type MedicationWithStatus = Medication & { statusByTime: Record<string, DoseStatus> };

/**
 * Owns the medication list plus all scheduling/persistence side effects
 * (expo-notifications + AsyncStorage) for add/edit/delete.
 *
 * Each medication can have several dose times per day; every time gets its
 * own scheduled notification, and the medication's own id (plus that dose's
 * hour/minute) is embedded in the notification's `data` payload so anything
 * handling a notification response later (snooze, "did you take it?") can
 * read `data.medicationId`/`data.hour`/`data.minute` directly instead of
 * trying to parse it back out of the notification body text.
 */
export function useMedications() {
  const [medications, setMedications] = useState<MedicationWithStatus[]>([]);

  const fetchMedications = useCallback(async () => {
    try {
      const meds = await getMedications();
      const statuses = await getAllStatuses();
      const today = new Date().toISOString().split('T')[0];
      const merged = meds.map((med) => ({
        ...med,
        // Per-slot status for today, keyed by "hour:minute" so the card can
        // show each dose time's own state instead of one status per med.
        statusByTime: Object.fromEntries(
          med.times.map((t) => {
            const status = statuses.find(
              (s) => s.medicationId === med.id && s.date === today && s.hour === t.hour && s.minute === t.minute
            );
            return [`${t.hour}:${t.minute}`, status ? status.status : ('not yet' as const)];
          })
        ),
      }));
      setMedications(merged);
    } catch (error) {
      // Keep showing the last known list rather than crashing the screen.
    }
  }, []);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const scheduleTimes = useCallback(
    async (medicationId: string, name: string, foodTiming: string, times: DraftTime[]): Promise<MedicationTime[]> => {
      const scheduled: MedicationTime[] = [];
      for (const t of times) {
        const notificationId = await scheduleNotificationSafe({
          content: {
            title: '💊 Medication Reminder',
            body: `It's time to take your ${name} (${foodTiming})`,
            data: { medicationId, hour: t.hour, minute: t.minute },
          },
          trigger: {
            type: TriggerType.DAILY,
            hour: t.hour,
            minute: t.minute,
          },
        });
        scheduled.push({ hour: t.hour, minute: t.minute, notificationId });
      }
      return scheduled;
    },
    []
  );

  const addMedication = useCallback(
    async (values: MedicationFormValues) => {
      const id = uuidv4();
      const times = await scheduleTimes(id, values.name, values.foodTiming, values.times);

      const newMed: Medication = {
        id,
        name: values.name,
        times,
        foodTiming: values.foodTiming,
        quantityType: values.quantityType,
        quantity: values.quantity,
        notes: values.notes,
      };
      await saveMedication(newMed);
      await fetchMedications();
      return newMed;
    },
    [fetchMedications, scheduleTimes]
  );

  const editMedication = useCallback(
    async (id: string, values: MedicationFormValues) => {
      const meds = await getMedications();
      const oldMed = meds.find((m) => m.id === id);

      // Simplest correct approach when times can be added/removed/changed:
      // cancel every old notification for this medication and reschedule
      // fresh ones for the new time list, rather than trying to diff them.
      if (oldMed) {
        for (const t of oldMed.times) {
          await cancelScheduledNotificationSafe(t.notificationId);
        }
      }

      const times = await scheduleTimes(id, values.name, values.foodTiming, values.times);

      const updatedMed: Medication = {
        id,
        name: values.name,
        times,
        foodTiming: values.foodTiming,
        quantityType: values.quantityType,
        quantity: values.quantity,
        notes: values.notes,
      };
      await updateMedication(updatedMed);
      await fetchMedications();
      return updatedMed;
    },
    [fetchMedications, scheduleTimes]
  );

  const removeMedication = useCallback(
    async (id: string) => {
      const meds = await getMedications();
      const medToDelete = meds.find((m) => m.id === id);
      if (!medToDelete) return null;

      for (const t of medToDelete.times) {
        await cancelScheduledNotificationSafe(t.notificationId);
      }
      await deleteMedication(id);
      await fetchMedications();
      return medToDelete;
    },
    [fetchMedications]
  );

  return { medications, fetchMedications, addMedication, editMedication, removeMedication };
}
