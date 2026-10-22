import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AmountRow } from '@/components/AmountRow';
import { Button, ButtonVariant } from '@/components/Button';
import { balanceTotalsUsd, formatAmountString, formatUsd, isPositive } from '@/lib/money';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { BalanceItem } from '@/types';

export function BalanceCard({ item }: { item: BalanceItem }) {
  const router = useRouter();
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
      <View style={styles.action}>
        <Button
          label="Claim"
          accessibilityLabel={`Claim ${item.asset}`}
          variant={ButtonVariant.Secondary}
          disabled={!isPositive(item.available)}
          onPress={() => router.push({ pathname: '/claim', params: { asset: item.asset } })}
        />
      </View>
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
  action: {
    paddingTop: spacing.md,
  },
});
