import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

const MAX_RETRIES = 2;

// Retry what may work next time (no connection, timeouts, rate limits, server errors) and
// never what the user has to fix (400, 401, 404, 409).
function shouldRetry(failureCount: number, error: Error): boolean {
  if (failureCount >= MAX_RETRIES || !isApiError(error)) return false;
  if (error.kind !== 'http') return true;
  return error.status === 429 || (error.status !== null && error.status >= 500);
}

function retryDelay(attempt: number, error: Error): number {
  if (isApiError(error) && error.retryAfterMs !== null) return error.retryAfterMs;
  return Math.min(1000 * 2 ** attempt, 8000);
}

// The token provider registers what to do when the API rejects the token.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function handleError(error: unknown) {
  if (isApiError(error) && error.status === 401) onUnauthorized?.();
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: { queries: { retry: shouldRetry, retryDelay } },
});
