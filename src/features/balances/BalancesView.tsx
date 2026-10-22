import { StyleSheet, View } from 'react-native';

import { QueryState } from '@/components/QueryState';
import { balanceTotalsUsd } from '@/lib/money';
import { strings } from '@/strings';
import { spacing } from '@/theme';

import { BalanceCard } from './BalanceCard';
import { Freshness } from './Freshness';
import { TotalCard } from './TotalCard';
import { useBalances } from './useBalances';

export function BalancesView() {
  const balances = useBalances();

  return (
    <View style={styles.stack}>
      {balances.data && (
        <Freshness asOf={balances.data.asOf} isFetching={balances.isFetching} onRefresh={() => void balances.refetch()} />
      )}
      <QueryState
        query={balances}
        isEmpty={(data) => data.items.length === 0}
        loadingLabel={strings.balances.loading}
        emptyTitle={strings.balances.emptyTitle}
        emptyMessage={strings.balances.emptyMessage}
      >
        {(data) => (
          <View style={styles.list}>
            <TotalCard totals={balanceTotalsUsd(data.items)} />
            {data.items.map((item) => (
              <BalanceCard key={item.asset} item={item} />
            ))}
          </View>
        )}
      </QueryState>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.lg,
  },
});
