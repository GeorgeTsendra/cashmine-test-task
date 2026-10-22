import { useIsMutating } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { describeError } from '@/lib/errors';
import { formatAmountString } from '@/lib/money';
import { colors, fontSize, radius, spacing } from '@/theme';

import { mayBeInFlight, SUBMIT_CLAIM_KEY, usePendingAttempt, useSubmitClaim } from './useSubmitClaim';

// Shown when a claim request may have reached the server but we never saw the answer, for example
// after a reload. "Check status" sends the same request again, which cannot create a second claim.
export function PendingAttemptBanner() {
  const attempt = usePendingAttempt().data ?? null;
  const submit = useSubmitClaim();
  const sending = useIsMutating({ mutationKey: SUBMIT_CLAIM_KEY }) > 0;

  if (attempt === null || (sending && !submit.isPending)) return null;

  const { amount, asset } = attempt.body;
  return (
    <View style={styles.box}>
      <Text accessibilityRole="alert" style={styles.text}>
        We could not confirm your claim of {formatAmountString(amount)} {asset}. It may already be in progress.
        Checking again sends the same request, so it cannot create a second claim.
      </Text>
      {submit.isError && !mayBeInFlight(submit.error) && <Text style={styles.text}>{describeError(submit.error)}</Text>}
      <Button
        label={submit.isPending ? 'Checking…' : 'Check status'}
        variant="secondary"
        disabled={submit.isPending}
        onPress={() => submit.mutate(attempt)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.warningBackground,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.warning,
  },
});
