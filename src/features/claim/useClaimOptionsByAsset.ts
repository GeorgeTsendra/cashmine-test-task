import { useQueries, type UseQueryResult } from '@tanstack/react-query';

import { useToken } from '@/features/auth/TokenProvider';
import { getClaimOptions } from '@/lib/api';
import type { ClaimOptions } from '@/types';

import { claimKeys } from './keys';

// The limit and fee rarely change, and the API rate-limits aggressively, so do not refetch on every focus.
const OPTIONS_STALE_MS = 60_000;

/**
 * Claim options for the active asset and every asset visited before it. Call this from a component
 * that stays mounted while the user switches assets: the observers then live as long as the screen,
 * so switching never abandons a request that is still in flight.
 *
 * The request deliberately does not take an abort signal. It counts against the rate limit even when
 * the client cancels it, so it is better to let it finish and fill the cache.
 */
export function useClaimOptionsByAsset(
  active: string,
  visited: readonly string[],
): Record<string, UseQueryResult<ClaimOptions>> {
  const { token } = useToken();
  const assets = [...new Set([...visited, active])].filter((asset) => asset !== '');
  const results = useQueries({
    queries: assets.map((asset) => ({
      queryKey: claimKeys.options(asset),
      queryFn: () => getClaimOptions({ token: token ?? '' }, asset),
      enabled: token !== null,
      staleTime: OPTIONS_STALE_MS,
    })),
  });
  return Object.fromEntries(assets.map((asset, index) => [asset, results[index]]));
}
