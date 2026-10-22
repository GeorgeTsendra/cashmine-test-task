import type { UseQueryResult } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AmountRow } from '@/components/AmountRow';
import { Button } from '@/components/Button';
import { QueryState } from '@/components/QueryState';
import { describeError } from '@/lib/errors';
import { AmountError, formatAmountString, formatDecimal, isPositive, parseDecimal, validateClaimAmount } from '@/lib/money';
import { newIdempotencyKey } from '@/lib/uuid';
import { strings } from '@/strings';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { BalanceItem, ClaimAttempt, ClaimOptions } from '@/types';

import { AmountField } from './AmountField';
import { ChoicePicker } from './ChoicePicker';
import { ConfirmModal, ConfirmPhase } from './ConfirmModal';
import { describeAmountError } from './messages';
import { mayBeInFlight, useSubmitClaim } from './useSubmitClaim';

// The options query is owned by ClaimView, so remounting this form on an asset switch cannot cancel it.
export function ClaimForm({ item, options }: { item: BalanceItem; options: UseQueryResult<ClaimOptions> }) {
  return (
    <QueryState query={options} loadingLabel={strings.claim.loadingOptions}>
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
  const submit = useSubmitClaim();
  // The request being sent. Confirming the same claim again reuses its Idempotency-Key, so a retry can never double-claim.
  const attempt = useRef<ClaimAttempt | null>(null);

  const rules = { decimals: item.decimals, minAmount: options.minAmount, available: item.available, fee: options.fee };
  const result = validateClaimAmount(amount, rules);
  const destination = options.destinations.find((d) => d.id === destinationId);
  const error = result.ok || result.error === AmountError.Empty ? null : describeAmountError(result.error, { asset, ...rules });
  const unit = (value: string) => `${formatAmountString(value)} ${asset}`;

  const phase: ConfirmPhase = submit.isPending
    ? ConfirmPhase.Submitting
    : submit.isError
      ? mayBeInFlight(submit.error)
        ? ConfirmPhase.Unknown
        : ConfirmPhase.Rejected
      : ConfirmPhase.Confirm;

  function confirm() {
    if (!result.ok || destination === undefined) return;
    const body = { asset, amount: formatDecimal(result.amount), destinationId: destination.id };
    const current = attempt.current;
    const next = current && JSON.stringify(current.body) === JSON.stringify(body) ? current : { key: newIdempotencyKey(), body };
    attempt.current = next;
    submit.mutate(next);
  }

  function close() {
    submit.reset();
    setConfirming(false);
  }

  return (
    <View style={styles.stack}>
      <Text style={styles.muted}>{strings.claim.availableLine(unit(item.available))}</Text>
      <AmountField
        asset={asset}
        value={amount}
        onChangeText={setAmount}
        onMax={() => setAmount(maxAmount(item.available))}
        maxDisabled={!isPositive(item.available)}
        error={error}
      />

      <View style={styles.card}>
        <AmountRow label={strings.common.fee} value={unit(options.fee)} />
        <AmountRow label={strings.common.minimum} value={unit(options.minAmount)} />
        <AmountRow label={strings.common.youReceive} value={result.ok ? `${formatDecimal(result.receive, true)} ${asset}` : strings.common.noValue} strong />
      </View>

      {options.destinations.length === 0 && (
        <Text accessibilityRole="alert" style={styles.problem}>
          {strings.claim.noDestination(asset)}
        </Text>
      )}
      {options.destinations.length === 1 && <AmountRow label={strings.common.to} value={options.destinations[0].label} />}
      {options.destinations.length > 1 && (
        <ChoicePicker
          label={strings.claim.destinationGroup}
          choices={options.destinations.map((d) => ({ value: d.id, label: d.label }))}
          selected={destinationId}
          onSelect={setDestinationId}
        />
      )}

      <Button label={strings.claim.review} disabled={!result.ok || destination === undefined} onPress={() => setConfirming(true)} />

      {result.ok && destination !== undefined && (
        <ConfirmModal
          visible={confirming}
          phase={phase}
          message={submit.isError ? describeError(submit.error) : null}
          asset={asset}
          amount={formatDecimal(result.amount, true)}
          fee={formatAmountString(options.fee)}
          receive={formatDecimal(result.receive, true)}
          destination={destination.label}
          onCancel={close}
          onConfirm={confirm}
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
