// storage/medicationStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'medications';

export type Medication = {
  id: string;
  name: string;
  hour: number;
  minute: number;
};

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

export const clearMedications = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
