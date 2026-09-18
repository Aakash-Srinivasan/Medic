import { MedicationStatus } from '@/storage/medicationStorage';

const toDateKey = (d: Date) => d.toISOString().split('T')[0];

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 'YYYY-MM-DD' -> 'Mon'. Parses the Y/M/D components directly into a local
// Date instead of `new Date(dateKey)` (which parses as UTC midnight and can
// shift the weekday by one near midnight in timezones behind UTC).
export function getWeekdayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return WEEKDAY_LABELS[new Date(y, m - 1, d).getDay()];
}

// Most-recent-first list of 'YYYY-MM-DD' keys, e.g. getLastNDates(7) for a
// week-long window ending today.
export function getLastNDates(n: number, from: Date = new Date()): string[] {
  const dates: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    dates.push(toDateKey(d));
  }
  return dates;
}

export type DaySummary = {
  date: string;
  taken: number;
  notTaken: number;
  pending: number;
  total: number;
};

export function summarizeDay(statuses: MedicationStatus[], date: string): DaySummary {
  const dayStatuses = statuses.filter((s) => s.date === date);
  return {
    date,
    taken: dayStatuses.filter((s) => s.status === 'taken').length,
    notTaken: dayStatuses.filter((s) => s.status === 'not taken').length,
    pending: dayStatuses.filter((s) => s.status === 'not yet').length,
    total: dayStatuses.length,
  };
}

// Percentage of resolved doses (taken / (taken + not taken)) across the
// given days. 'not yet' entries are excluded from the denominator so an
// in-progress today doesn't unfairly drag the number down.
export function calculateAdherencePercent(statuses: MedicationStatus[], days: string[]): number {
  let taken = 0;
  let resolved = 0;
  for (const date of days) {
    for (const s of statuses.filter((st) => st.date === date)) {
      if (s.status === 'taken') {
        taken++;
        resolved++;
      } else if (s.status === 'not taken') {
        resolved++;
      }
    }
  }
  return resolved === 0 ? 0 : Math.round((taken / resolved) * 100);
}

// Consecutive PAST days (today excluded, since it's still in progress) where
// every dose recorded that day was 'taken'. Stops at the first day with no
// recorded doses at all, or any dose that wasn't 'taken'.
//
// Simplification: a medication deleted partway through the history also
// deletes its past statuses (see deleteMedication), so a day's "all taken"
// check only ever sees medications that still exist today - fine for a demo,
// but means a streak can look "cleaner" than it really was for medications
// that were later removed.
export function calculateStreak(statuses: MedicationStatus[], today: Date = new Date()): number {
  let streak = 0;
  for (let i = 1; i <= 3650; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStatuses = statuses.filter((s) => s.date === toDateKey(d));
    if (dayStatuses.length === 0) break;
    if (!dayStatuses.every((s) => s.status === 'taken')) break;
    streak++;
  }
  return streak;
}
