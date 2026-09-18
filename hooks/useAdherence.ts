import { useCallback, useEffect, useState } from 'react';
import { getAllStatuses, MedicationStatus } from '@/storage/medicationStorage';
import { calculateAdherencePercent, calculateStreak, getLastNDates } from '@/utils/adherence';

// Owns the adherence-history data (streak + percentage) shown on the home
// screen banner and inside HistoryModal. Separate from useMedications since
// it needs the FULL status history, not just today's per-medication status.
export function useAdherence() {
  const [statuses, setStatuses] = useState<MedicationStatus[]>([]);

  const refresh = useCallback(async () => {
    const all = await getAllStatuses();
    setStatuses(all);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const last7Days = getLastNDates(7);
  const streak = calculateStreak(statuses);
  const adherencePercent = calculateAdherencePercent(statuses, last7Days);

  return { statuses, streak, adherencePercent, last7Days, refresh };
}
