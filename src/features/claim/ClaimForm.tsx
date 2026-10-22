import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AmountRow } from '@/components/AmountRow';
import { Button } from '@/components/Button';
import { QueryState } from '@/components/QueryState';
import { formatAmountString, formatDecimal, isPositive, parseDecimal, validateClaimAmount } from '@/lib/money';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { BalanceItem, ClaimOptions } from '@/types';

import { AmountField } from './AmountField';
import { ChoicePicker } from './ChoicePicker';
import { ConfirmModal } from './ConfirmModal';
import { describeAmountError } from './messages';

// The options query is owned by ClaimView, so remounting this form on an asset switch cannot cancel it.
export function ClaimForm({ item, options }: { item: BalanceItem; options: UseQueryResult<ClaimOptions> }) {
  return (
    <QueryState query={options} loadingLabel="Loading claim options…">
      {(data) => <ClaimFormBody item={item} options={data} />}
    </QueryState>
  );
}

// The canonical string for the full available balance, without thousands separators.
function maxAmount(available: string): string {
  const value = parseDecimal(available);
  return value ? formatDecimal(value) : '';
}

function ClaimFormBody({ item, options }: { item: BalanceItem; options: ClaimOptions }) {
  const { asset } = item;
  const [amount, setAmount] = useState('');
  const [destinationId, setDestinationId] = useState(options.destinations[0]?.id ?? '');
  const [confirming, setConfirming] = useState(false);

  const rules = { decimals: item.decimals, minAmount: options.minAmount, available: item.available, fee: options.fee };
  const result = validateClaimAmount(amount, rules);
  const destination = options.destinations.find((d) => d.id === destinationId);
  const error = result.ok || result.error === 'EMPTY' ? null : describeAmountError(result.error, { asset, ...rules });
  const unit = (value: string) => `${formatAmountString(value)} ${asset}`;

  return (
    <View style={styles.stack}>
      <Text style={styles.muted}>Available: {unit(item.available)}</Text>
      <AmountField
        asset={asset}
        value={amount}
        onChangeText={setAmount}
        onMax={() => setAmount(maxAmount(item.available))}
        maxDisabled={!isPositive(item.available)}
        error={error}
      />

      <View style={styles.card}>
        <AmountRow label="Fee" value={unit(options.fee)} />
        <AmountRow label="Minimum" value={unit(options.minAmount)} />
        <AmountRow label="You receive" value={result.ok ? `${formatDecimal(result.receive, true)} ${asset}` : '—'} strong />
      </View>

      {options.destinations.length === 0 && (
        <Text accessibilityRole="alert" style={styles.problem}>
          No destination is available for {asset} right now.
        </Text>
      )}
      {options.destinations.length === 1 && <AmountRow label="To" value={options.destinations[0].label} />}
      {options.destinations.length > 1 && (
        <ChoicePicker
          label="Destination"
          choices={options.destinations.map((d) => ({ value: d.id, label: d.label }))}
          selected={destinationId}
          onSelect={setDestinationId}
        />
      )}

      <Button label="Review claim" disabled={!result.ok || destination === undefined} onPress={() => setConfirming(true)} />

      {result.ok && destination !== undefined && (
        <ConfirmModal
          visible={confirming}
          asset={asset}
          amount={formatDecimal(result.amount, true)}
          fee={formatAmountString(options.fee)}
          receive={formatDecimal(result.receive, true)}
          destination={destination.label}
          onCancel={() => setConfirming(false)}
          // Submitting the claim comes with the next commit.
          onConfirm={() => setConfirming(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  muted: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  card: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  problem: {
    fontSize: fontSize.md,
    color: colors.danger,
  },
});
