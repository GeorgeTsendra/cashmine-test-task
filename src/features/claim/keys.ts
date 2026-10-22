export const claimKeys = {
  options: (asset: string) => ['claim-options', asset] as const,
  claim: (id: string) => ['claim', id] as const,
  /** The stored claim request that may not have been confirmed yet. */
  attempt: ['claim-attempt'] as const,
};
