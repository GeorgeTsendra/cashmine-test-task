import { strings } from '@/strings';
/** "just now", "12 s ago", "3 min ago", "2 h ago". Negative ages (clock skew) count as 0. */
export function formatAge(ageMs: number): string {
  const seconds = Math.max(0, Math.floor(ageMs / 1000));
  if (seconds < 5) return strings.time.justNow;
  if (seconds < 60) return strings.time.secondsAgo(seconds);
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return strings.time.minutesAgo(minutes);
  return strings.time.hoursAgo(Math.floor(minutes / 60));
}
