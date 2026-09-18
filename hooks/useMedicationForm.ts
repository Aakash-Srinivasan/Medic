import { useState } from 'react';
import { Medication } from '@/storage/medicationStorage';

const defaultQuantityFor = (quantityType: string) => (quantityType === 'Syrup' ? 10 : 1);

// A time slot as edited in the form, before it has a notificationId (that's
// assigned once useMedications actually schedules it).
export type DraftTime = { hour: number; minute: number };

const draftTimeKey = (t: DraftTime) => `${t.hour}:${t.minute}`;

/**
 * Local UI state for the add/edit medication form modal. Pure form state —
 * no persistence or notification scheduling here (see useMedications for
 * that); the screen wires the two together on submit.
 */
export function useMedicationForm() {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [times, setTimes] = useState<DraftTime[]>([]);
  const [foodTiming, setFoodTiming] = useState('Before Food');
  const [quantityType, setQuantityTypeState] = useState('Pills');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const setQuantityType = (type: string) => {
    setQuantityTypeState(type);
    setQuantity(defaultQuantityFor(type));
  };

  const addTime = (time: Date) => {
    const draft: DraftTime = { hour: time.getHours(), minute: time.getMinutes() };
    setTimes((prev) => (prev.some((t) => draftTimeKey(t) === draftTimeKey(draft)) ? prev : [...prev, draft]));
  };

  const removeTime = (index: number) => {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setName('');
    setTimes([]);
    setFoodTiming('Before Food');
    setQuantityTypeState('Pills');
    setQuantity(1);
    setNotes('');
    setIsEditing(false);
    setEditingId(null);
    setVisible(false);
  };

  const openForAdd = () => {
    reset();
    setVisible(true);
  };

  const openForEdit = (med: Medication) => {
    setName(med.name);
    setTimes(med.times.map((t) => ({ hour: t.hour, minute: t.minute })));
    setFoodTiming(med.foodTiming);
    setQuantityTypeState(med.quantityType);
    setQuantity(med.quantity);
    setNotes(med.notes ?? '');
    setEditingId(med.id);
    setIsEditing(true);
    setVisible(true);
  };

  return {
    visible,
    isEditing,
    editingId,
    name,
    setName,
    times,
    addTime,
    removeTime,
    foodTiming,
    setFoodTiming,
    quantityType,
    setQuantityType,
    quantity,
    setQuantity,
    notes,
    setNotes,
    reset,
    openForAdd,
    openForEdit,
    close: () => setVisible(false),
  };
}
