import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useToken } from '@/features/auth/TokenProvider';
import { balancesKeys } from '@/features/balances/keys';
import { createClaim, isApiError } from '@/lib/api';
import { readClaimAttempt, removeClaimAttempt, saveClaimAttempt } from '@/lib/storage';
import type { ClaimAttempt } from '@/types';

import { claimKeys } from './keys';

export const SUBMIT_CLAIM_KEY = ['submit-claim'] as const;

const MAX_REPLAYS = 2;

/**
 * True when the claim may or may not exist on the server (no answer, a timeout, a 5xx) or was not
 * processed yet (429). In both cases the safe move is to send the same request again.
 */
export function mayBeInFlight(error: unknown): boolean {
  return isApiError(error) && (error.outcomeUnknown || error.status === 429);
}

/**
 * Submits a claim. Every send of one attempt carries the same Idempotency-Key and body, so the
 * server returns the original claim instead of creating a second one. React Query replays the
 * request by itself when the outcome is unknown; after that, calling `mutate` again with the same
 * attempt replays it once more.
 */
export function useSubmitClaim() {
  const { token } = useToken();
  const router = useRouter();
  const queryClient = useQueryClient();

  function forgetAttempt() {
    queryClient.setQueryData(claimKeys.attempt, null);
    void removeClaimAttempt();
  }

  return useMutation({
    mutationKey: SUBMIT_CLAIM_KEY,
    networkMode: 'always', // report a lost connection as an error instead of waiting for it to return
    mutationFn: (attempt: ClaimAttempt) => createClaim({ token: token ?? '' }, attempt.body, attempt.key),
    // Runs once per submit, not on replays: keep the attempt so a reload can still replay it.
    onMutate: async (attempt) => {
      queryClient.setQueryData(claimKeys.attempt, attempt);
      await saveClaimAttempt(attempt);
    },
    retry: (failureCount, error) => failureCount < MAX_REPLAYS && mayBeInFlight(error),
    retryDelay: (failureCount, error) =>
      isApiError(error) && error.retryAfterMs !== null ? error.retryAfterMs : Math.min(1000 * 2 ** failureCount, 4000),
    onSuccess: ({ claim }) => {
      forgetAttempt();
      queryClient.setQueryData(claimKeys.claim(claim.id), claim);
      void queryClient.invalidateQueries({ queryKey: balancesKeys.all });
      router.replace({ pathname: '/claims/[id]', params: { id: claim.id } });
    },
    // A definite "no" (400, 404, 409) means no claim was created, so the attempt is over.
    onError: (error) => {
      if (!mayBeInFlight(error)) forgetAttempt();
    },
  });
}

/** The stored claim request that has not been confirmed yet, if any. */
export function usePendingAttempt() {
  const { token } = useToken();
  return useQuery({
    queryKey: claimKeys.attempt,
    queryFn: readClaimAttempt,
    enabled: token !== null,
    staleTime: Infinity,
  });
}
