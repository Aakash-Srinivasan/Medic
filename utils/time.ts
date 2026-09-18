export type TimeCategory = 'Morning' | 'Afternoon' | 'Evening';

/**
 * Category for the current wall-clock time. Morning starts at 5am so that
 * very-early-morning hours are treated as "Evening" (still winding down)
 * rather than "Morning".
 */
export function getCurrentTimeCategory(): TimeCategory {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  return 'Evening';
}

/**
 * Category for a medication's scheduled hour (used to bucket the medication
 * list). Unlike getCurrentTimeCategory, this has no early-morning special
 * case: any hour before 12 is "Morning".
 */
export function getTimeCategory(hour: number): TimeCategory {
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

export function formatTime(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}
