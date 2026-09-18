import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'medications';
const STATUS_KEY = 'medication_statuses';

// One scheduled dose time for a medication. A medication can have several
// of these (e.g. a twice-daily prescription), each with its own scheduled
// local notification.
export type MedicationTime = {
  hour: number;
  minute: number;
  notificationId: string;
};

// Medication Type
export type Medication = {
  id: string;
  name: string;
  times: MedicationTime[];
  foodTiming: string;
  quantityType: string;
  quantity: number;
  notes?: string;
};

// Status Type - one entry per medication, per day, per scheduled dose time
// (hour/minute identify which of the medication's times this is).
export type MedicationStatus = {
  medicationId: string;
  date: string; // Format: 'YYYY-MM-DD'
  hour: number;
  minute: number;
  status: 'not yet' | 'taken' | 'not taken';
};

// -----------------------
// Medication CRUD
// -----------------------

export const saveMedication = async (med: Medication) => {
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  const meds: Medication[] = existing ? JSON.parse(existing) : [];
  meds.push(med);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meds));
};

export const getMedications = async (): Promise<Medication[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const updateMedication = async (updatedMed: Medication) => {
  const meds = await getMedications();
  const updated = meds.map((med) =>
    med.id === updatedMed.id ? updatedMed : med
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteMedication = async (id: string) => {
  const meds = await getMedications();
  const filtered = meds.filter((med) => med.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  // Also delete statuses associated with this medication
  const statuses = await getAllStatuses();
  const updatedStatuses = statuses.filter((s) => s.medicationId !== id);
  await AsyncStorage.setItem(STATUS_KEY, JSON.stringify(updatedStatuses));
};

export const clearMedications = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
  await AsyncStorage.removeItem(STATUS_KEY);
};

// -----------------------
// Medication Status CRUD
// -----------------------

export const saveStatus = async (status: MedicationStatus) => {
  const existing = await AsyncStorage.getItem(STATUS_KEY);
  const statuses: MedicationStatus[] = existing ? JSON.parse(existing) : [];

  // Remove any old status for this exact medication + day + dose time
  const filtered = statuses.filter(
    (s) =>
      !(
        s.medicationId === status.medicationId &&
        s.date === status.date &&
        s.hour === status.hour &&
        s.minute === status.minute
      )
  );

  filtered.push(status);
  await AsyncStorage.setItem(STATUS_KEY, JSON.stringify(filtered));
};

export const getStatusForSlot = async (
  medicationId: string,
  date: string,
  hour: number,
  minute: number
): Promise<MedicationStatus | undefined> => {
  const statuses = await getAllStatuses();
  return statuses.find(
    (s) => s.medicationId === medicationId && s.date === date && s.hour === hour && s.minute === minute
  );
};

export const getAllStatuses = async (): Promise<MedicationStatus[]> => {
  const existing = await AsyncStorage.getItem(STATUS_KEY);
  return existing ? JSON.parse(existing) : [];
};

// How long adherence history is kept before being trimmed - long enough for
// a meaningful history view, short enough that AsyncStorage doesn't grow
// forever on a device that's never uninstalled.
const HISTORY_RETENTION_DAYS = 90;

export const resetStatusesForNewDay = async () => {
  const meds = await getMedications();
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // NOTE: this used to REPLACE the entire status list with just today's
  // entries, which silently wiped all adherence history every night. It now
  // only appends a fresh 'not yet' placeholder for each dose time that
  // doesn't already have an entry for today, so every previous day's record
  // survives.
  const statuses: MedicationStatus[] = await getAllStatuses();
  const missingToday: MedicationStatus[] = [];
  meds.forEach((med) => {
    med.times.forEach((t) => {
      const exists = statuses.some(
        (s) => s.medicationId === med.id && s.date === today && s.hour === t.hour && s.minute === t.minute
      );
      if (!exists) {
        missingToday.push({ medicationId: med.id, date: today, hour: t.hour, minute: t.minute, status: 'not yet' });
      }
    });
  });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HISTORY_RETENTION_DAYS);
  const cutoffKey = cutoff.toISOString().split('T')[0];
  const trimmed = statuses.filter((s) => s.date >= cutoffKey);

  if (missingToday.length > 0 || trimmed.length !== statuses.length) {
    await AsyncStorage.setItem(STATUS_KEY, JSON.stringify([...trimmed, ...missingToday]));
  }
};
