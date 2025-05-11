import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'medications';
const STATUS_KEY = 'medication_statuses';

// Medication Type
export type Medication = {
  id: string;
  name: string;
  hour: number;
  minute: number;
  foodTiming: any;
  quantityType: any;
  quantity: any;
  notificationId: string;
  status?:'not yet' | 'taken' | 'not taken';
};

// Status Type
export type MedicationStatus = {
  medicationId: string;
  date: string; // Format: 'YYYY-MM-DD'
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

  // Remove old status for this med and date
  const filtered = statuses.filter(
    (s) =>
      !(s.medicationId === status.medicationId && s.date === status.date)
  );

  filtered.push(status);
  await AsyncStorage.setItem(STATUS_KEY, JSON.stringify(filtered));
};

export const getStatusForMedication = async (
  medicationId: string,
  date: string
): Promise<MedicationStatus | undefined> => {
  const existing = await AsyncStorage.getItem(STATUS_KEY);
  const statuses: MedicationStatus[] = existing ? JSON.parse(existing) : [];

  return statuses.find(
    (s) => s.medicationId === medicationId && s.date === date
  );
};

export const getAllStatuses = async (): Promise<MedicationStatus[]> => {
  const existing = await AsyncStorage.getItem(STATUS_KEY);
  return existing ? JSON.parse(existing) : [];
};

export const resetStatusesForNewDay = async () => {
  const meds = await getMedications();
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const statuses: MedicationStatus[] = await getAllStatuses();
  const updatedStatuses = meds.map((med) => {
    const existing = statuses.find(
      (s) => s.medicationId === med.id && s.date === today
    );
    return (
      existing || {
        medicationId: med.id,
        date: today,
        status: 'not yet',
      }
    );
  });

  await AsyncStorage.setItem(STATUS_KEY, JSON.stringify(updatedStatuses));
};
