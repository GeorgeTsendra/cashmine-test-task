import { useQuery } from '@tanstack/react-query';

import { useToken } from '@/features/auth/TokenProvider';
import { getBalances } from '@/lib/api';

import { balancesKeys } from './keys';

// The server recomputes balances every 15 seconds, so asking more often gains nothing.
const REFETCH_INTERVAL_MS = 15_000;
// The API rate-limits aggressively: opening another screen that shows balances should reuse fresh data.
const STALE_MS = 10_000;

export function useBalances() {
  const { token } = useToken();
  return useQuery({
    queryKey: balancesKeys.all,
    queryFn: ({ signal }) => getBalances({ token: token ?? '', signal }),
    enabled: token !== null,
    refetchInterval: REFETCH_INTERVAL_MS,
    staleTime: STALE_MS,
  });
}
