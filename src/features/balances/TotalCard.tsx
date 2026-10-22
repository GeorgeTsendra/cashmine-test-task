import { StyleSheet, Text, View } from 'react-native';

import { AmountRow } from '@/components/AmountRow';
import { formatUsd, type BalanceTotals } from '@/lib/money';
import { strings } from '@/strings';
import { colors, fontSize, radius, spacing } from '@/theme';

// `totals` is null when an API value could not be read; we show a dash, never a wrong number.
export function TotalCard({ totals }: { totals: BalanceTotals | null }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{strings.balances.total}</Text>
      <Text accessibilityRole="header" style={styles.total}>
        {totals ? formatUsd(totals.total) : strings.common.noValue}
      </Text>
      {totals ? (
        <View style={styles.breakdown}>
          <AmountRow label={strings.common.available} value={formatUsd(totals.available)} />
          <AmountRow label={strings.common.pending} value={formatUsd(totals.pending)} />
          <AmountRow label={strings.common.claiming} value={formatUsd(totals.claiming)} />
        </View>
      ) : (
        <Text style={styles.label}>{strings.balances.totalUnavailable}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  total: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  breakdown: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
