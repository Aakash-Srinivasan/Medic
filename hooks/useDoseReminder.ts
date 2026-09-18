import { useEffect, useState } from 'react';
import { Medication, saveStatus } from '@/storage/medicationStorage';
import {
  addNotificationResponseListenerSafe,
  scheduleNotificationSafe,
  TriggerType,
} from '@/utils/notifications';
import { formatTime } from '@/utils/time';

/**
 * Listens for notification interactions (tapping a reminder, or the OS
 * re-opening the app from one) and drives the "did you take it?" / snooze
 * modal.
 *
 * The medication being referenced, and which of its dose times fired, is
 * identified via `notification.request.content.data.{medicationId,hour,
 * minute}`, set when the notification is scheduled (see
 * hooks/useMedications.ts) — no parsing of the notification body text.
 */
export function useDoseReminder(medications: Medication[], onStatusRecorded: () => void) {
  const [visible, setVisible] = useState(false);
  const [activeMedicationId, setActiveMedicationId] = useState<string | null>(null);
  const [activeTime, setActiveTime] = useState<{ hour: number; minute: number } | null>(null);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  useEffect(() => {
    const subscription = addNotificationResponseListenerSafe((response) => {
      const data = response.notification.request.content.data as
        | { medicationId?: string; hour?: number; minute?: number }
        | undefined;
      setActiveMedicationId(data?.medicationId ?? null);
      setActiveTime(
        typeof data?.hour === 'number' && typeof data?.minute === 'number'
          ? { hour: data.hour, minute: data.minute }
          : null
      );
      setShowSnoozeOptions(false);
      setVisible(true);
    });

    return () => subscription.remove();
  }, []);

  const activeMedication = medications.find((med) => med.id === activeMedicationId) ?? null;
  const activeMedicationName = activeMedication?.name ?? 'this medication';
  const activeTimeLabel = activeTime ? formatTime(activeTime.hour, activeTime.minute) : null;

  const recordStatus = async (status: 'taken' | 'not taken') => {
    if (activeMedicationId && activeTime) {
      const today = new Date().toISOString().split('T')[0];
      await saveStatus({
        medicationId: activeMedicationId,
        date: today,
        hour: activeTime.hour,
        minute: activeTime.minute,
        status,
      });
      onStatusRecorded();
    }
    setVisible(false);
  };

  const openSnoozeOptions = () => setShowSnoozeOptions(true);

  const snooze = async (minutes: number) => {
    if (activeMedicationId && activeTime) {
      await scheduleNotificationSafe({
        content: {
          title: '⏰ Medication Reminder',
          body: `Reminder after snooze: It's time to take your ${activeMedicationName}.`,
          data: { medicationId: activeMedicationId, hour: activeTime.hour, minute: activeTime.minute },
        },
        trigger: {
          type: TriggerType.TIME_INTERVAL,
          seconds: minutes * 60,
          repeats: false,
        },
      });
    }
    setShowSnoozeOptions(false);
    setVisible(false);
  };

  return {
    visible,
    activeMedicationName,
    activeTimeLabel,
    showSnoozeOptions,
    openSnoozeOptions,
    recordStatus,
    snooze,
    close: () => setVisible(false),
  };
}
