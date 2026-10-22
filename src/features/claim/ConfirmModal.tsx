import { Modal, StyleSheet, Text, View } from 'react-native';

import { AmountRow } from '@/components/AmountRow';
import { Button, ButtonVariant } from '@/components/Button';
import { strings } from '@/strings';
import { colors, fontSize, MAX_CONTENT_WIDTH, radius, spacing } from '@/theme';

/**
 * confirm: waiting for the user. submitting: the request is on its way.
 * unknown: no answer, so the claim may or may not exist; checking again replays the same request.
 * rejected: the server said no, so nothing was claimed.
 */
export enum ConfirmPhase {
  Confirm = 'confirm',
  Submitting = 'submitting',
  Unknown = 'unknown',
  Rejected = 'rejected',
}

interface ConfirmModalProps {
  visible: boolean;
  phase: ConfirmPhase;
  /** Why the claim was rejected; only shown in the "rejected" phase. */
  message: string | null;
  asset: string;
  amount: string;
  fee: string;
  receive: string;
  destination: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const NOTES: Record<ConfirmPhase, string> = {
  [ConfirmPhase.Confirm]: strings.confirm.notes.confirm,
  [ConfirmPhase.Submitting]: strings.confirm.notes.submitting,
  [ConfirmPhase.Unknown]: strings.confirm.notes.unknown,
  [ConfirmPhase.Rejected]: strings.confirm.notes.rejected,
};

export function ConfirmModal({
  visible,
  phase,
  message,
  asset,
  amount,
  fee,
  receive,
  destination,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const busy = phase === ConfirmPhase.Submitting;
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={busy ? undefined : onCancel}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            {strings.confirm.title}
          </Text>
          <View style={styles.rows}>
            <AmountRow label={strings.common.amount} value={`${amount} ${asset}`} />
            <AmountRow label={strings.common.fee} value={`${fee} ${asset}`} />
            <AmountRow label={strings.common.youReceive} value={`${receive} ${asset}`} strong />
            <AmountRow label={strings.common.to} value={destination} />
          </View>
          {phase === ConfirmPhase.Rejected && message !== null && (
            <Text accessibilityRole="alert" style={styles.problem}>
              {message}
            </Text>
          )}
          <Text accessibilityRole={phase === ConfirmPhase.Unknown ? 'alert' : undefined} style={phase === ConfirmPhase.Unknown ? styles.warning : styles.note}>
            {NOTES[phase]}
          </Text>
          <View style={styles.actions}>
            {phase === ConfirmPhase.Rejected ? null : (
              <Button
                label={busy ? strings.confirm.submitting : phase === ConfirmPhase.Unknown ? strings.confirm.checkAgain : strings.confirm.confirm}
                disabled={busy}
                onPress={onConfirm}
              />
            )}
            <Button label={phase === ConfirmPhase.Confirm ? strings.common.cancel : strings.common.close} variant={ButtonVariant.Secondary} disabled={busy} onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(17, 24, 28, 0.5)',
  },
  card: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  rows: {
    gap: spacing.sm,
  },
  note: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  warning: {
    padding: spacing.md,
    borderRadius: radius.sm,
    fontSize: fontSize.sm,
    color: colors.warning,
    backgroundColor: colors.warningBackground,
  },
  problem: {
    fontSize: fontSize.md,
    color: colors.danger,
  },
  actions: {
    gap: spacing.sm,
  },
});
