import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { QueryState } from '@/components/QueryState';
import { useBalances } from '@/features/balances/useBalances';
import { strings } from '@/strings';
import { spacing } from '@/theme';

import { ChoicePicker } from './ChoicePicker';
import { ClaimForm } from './ClaimForm';
import { PendingAttemptBanner } from './PendingAttemptBanner';
import { useClaimOptionsByAsset } from './useClaimOptionsByAsset';

// Picks the asset (from the balances) and shows the claim form for it. This component owns the
// balances and claim-options queries; the form only receives their results.
export function ClaimView({ initialAsset }: { initialAsset?: string }) {
  const balances = useBalances();
  const [selected, setSelected] = useState(initialAsset);
  const [visited, setVisited] = useState<string[]>([]);

  const items = balances.data?.items ?? [];
  const active = items.find((i) => i.asset === selected)?.asset ?? items[0]?.asset ?? '';
  const optionsByAsset = useClaimOptionsByAsset(active, visited);

  function selectAsset(asset: string) {
    setVisited((current) => (current.includes(active) ? current : [...current, active]));
    setSelected(asset);
  }

  return (
    <View style={styles.stack}>
      <PendingAttemptBanner />
      <QueryState
        query={balances}
        isEmpty={(data) => data.items.length === 0}
        loadingLabel={strings.balances.loading}
        emptyTitle={strings.claim.emptyTitle}
        emptyMessage={strings.balances.emptyMessage}
      >
        {(data) => {
          const item = data.items.find((i) => i.asset === active) ?? data.items[0];
          return (
            <View style={styles.stack}>
              <ChoicePicker
                label={strings.claim.assetGroup}
                choices={data.items.map((i) => ({ value: i.asset, label: i.asset }))}
                selected={item.asset}
                onSelect={selectAsset}
              />
              <ClaimForm key={item.asset} item={item} options={optionsByAsset[item.asset]} />
            </View>
          );
        }}
      </QueryState>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
});
