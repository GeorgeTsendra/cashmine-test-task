import { isApiError } from '@/lib/api';

/** A short, user-facing explanation of a failed request. */
export function describeError(error: unknown): string {
  if (!isApiError(error)) return 'Something went wrong. Please try again.';
  switch (error.kind) {
    case 'network':
      return "Can't reach the server. Check your connection and try again.";
    case 'timeout':
      return 'The server took too long to respond. Please try again.';
    case 'parse':
      return 'The server sent an unreadable response. Please try again.';
    case 'http':
      break;
  }
  if (error.status === 429) {
    const seconds = error.retryAfterMs === null ? null : Math.ceil(error.retryAfterMs / 1000);
    return seconds === null ? 'Too many requests. Try again in a moment.' : `Too many requests. Try again in ${seconds} s.`;
  }
  if (error.status !== null && error.status >= 500) return 'The server had a problem. Please try again.';
  return error.message;
}
