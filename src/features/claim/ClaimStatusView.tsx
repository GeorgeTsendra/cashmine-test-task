import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AmountRow } from '@/components/AmountRow';
import { Button, ButtonVariant } from '@/components/Button';
import { QueryState } from '@/components/QueryState';
import { balancesKeys } from '@/features/balances/keys';
import { formatAmountString } from '@/lib/money';
import { colors, fontSize, radius, spacing } from '@/theme';
import { ClaimStatus, type Claim, type ClaimOptions } from '@/types';

import { claimKeys } from './keys';
import { useClaim } from './useClaim';

export function ClaimStatusView({ id }: { id: string }) {
  const claim = useClaim(id);
  const queryClient = useQueryClient();
  const status = claim.data?.status;

  // Once the claim has settled the balances have changed, so fetch them again.
  useEffect(() => {
    if (status === ClaimStatus.Completed || status === ClaimStatus.Failed) {
      void queryClient.invalidateQueries({ queryKey: balancesKeys.all });
    }
  }, [status, queryClient]);

  return (
    <QueryState query={claim} loadingLabel="Loading claim…">
      {(data) => <ClaimStatusCard claim={data} />}
    </QueryState>
  );
}

const TITLES: Record<ClaimStatus, string> = {
  [ClaimStatus.Pending]: 'Claim in progress',
  [ClaimStatus.Completed]: 'Claim completed',
  [ClaimStatus.Failed]: 'Claim failed',
};

function ClaimStatusCard({ claim }: { claim: Claim }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const options = queryClient.getQueryData<ClaimOptions>(claimKeys.options(claim.asset));
  const destination = options?.destinations.find((d) => d.id === claim.destinationId)?.label ?? claim.destinationId;
  const unit = (value: string) => `${formatAmountString(value)} ${claim.asset}`;
  const tone = claim.status === ClaimStatus.Completed ? styles.success : claim.status === ClaimStatus.Failed ? styles.failure : styles.pending;

  return (
    <View style={styles.stack}>
      <View style={[styles.banner, tone]}>
        <Text accessibilityRole="header" style={styles.title}>
          {TITLES[claim.status]}
        </Text>
        {claim.status === ClaimStatus.Pending && (
          <Text style={styles.body}>
            This usually takes about 20 seconds. You can leave this page. Your balance catches up within about 15
            seconds.
          </Text>
        )}
        {claim.status === ClaimStatus.Completed && <Text style={styles.body}>{unit(claim.receiveAmount)} was sent to {destination}.</Text>}
        {claim.status === ClaimStatus.Failed && (
          <Text style={styles.body}>
            Your {unit(claim.amount)} is back in your available balance.
            {claim.failureReason !== null ? ` Reason: ${claim.failureReason}` : ''}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <AmountRow label="Amount" value={unit(claim.amount)} />
        <AmountRow label="Fee" value={unit(claim.fee)} />
        <AmountRow label="You receive" value={unit(claim.receiveAmount)} strong />
        <AmountRow label="To" value={destination} />
      </View>
      <Text style={styles.muted}>Claim {claim.id}</Text>

      <Button label="Back to balances" onPress={() => router.replace('/')} />
      {claim.status === ClaimStatus.Failed && (
        <Button
          label="Try again"
          variant={ButtonVariant.Secondary}
          onPress={() => router.replace({ pathname: '/claim', params: { asset: claim.asset } })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  banner: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  pending: {
    backgroundColor: colors.warningBackground,
  },
  success: {
    backgroundColor: colors.successBackground,
  },
  failure: {
    backgroundColor: colors.dangerBackground,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  card: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  muted: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
