import { useQuery } from '@tanstack/react-query';

import { useToken } from '@/features/auth/TokenProvider';
import { getClaim } from '@/lib/api';

import { claimKeys } from './keys';

// A pending claim settles within about 20 seconds. The API rate-limits aggressively, so poll gently.
const POLL_MS = 4000;

export function useClaim(id: string) {
  const { token } = useToken();
  return useQuery({
    queryKey: claimKeys.claim(id),
    queryFn: ({ signal }) => getClaim({ token: token ?? '', signal }, id),
    enabled: token !== null,
    staleTime: POLL_MS - 1000,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? POLL_MS : false),
  });
}
