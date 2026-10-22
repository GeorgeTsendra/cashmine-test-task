import { StyleSheet, Text, View } from 'react-native';

import { balanceTotalsUsd, formatAmountString, formatUsd } from '@/lib/money';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { BalanceItem } from '@/types';

import { AmountRow } from './AmountRow';

export function BalanceCard({ item }: { item: BalanceItem }) {
  const usd = balanceTotalsUsd([item]);
  const amount = (value: string) => `${formatAmountString(value)} ${item.asset}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.asset}>
          {item.asset}
        </Text>
        <Text style={styles.usd}>{usd ? formatUsd(usd.total) : '—'}</Text>
      </View>
      <AmountRow label="Available" value={amount(item.available)} strong />
      <AmountRow label="Pending" value={amount(item.pending)} />
      <AmountRow label="Claiming" value={amount(item.claiming)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingBottom: spacing.xs,
  },
  asset: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  usd: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
});
