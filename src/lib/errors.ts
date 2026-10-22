import { ApiErrorKind, isApiError } from '@/lib/api';
import { strings } from '@/strings';

/** A short, user-facing explanation of a failed request. */
export function describeError(error: unknown): string {
  if (!isApiError(error)) return strings.errors.generic;
  switch (error.kind) {
    case ApiErrorKind.Network:
      return strings.errors.network;
    case ApiErrorKind.Timeout:
      return strings.errors.timeout;
    case ApiErrorKind.Parse:
      return strings.errors.unreadable;
    case ApiErrorKind.Http:
      break;
  }
  if (error.status === 429) {
    const seconds = error.retryAfterMs === null ? null : Math.ceil(error.retryAfterMs / 1000);
    return seconds === null ? strings.errors.tooManyRequests : strings.errors.tooManyRequestsIn(seconds);
  }
  if (error.status !== null && error.status >= 500) return strings.errors.server;
  return error.message;
}
