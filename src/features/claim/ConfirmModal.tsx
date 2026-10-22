import { Modal, StyleSheet, Text, View } from 'react-native';

import { AmountRow } from '@/components/AmountRow';
import { Button } from '@/components/Button';
import { colors, fontSize, MAX_CONTENT_WIDTH, radius, spacing } from '@/theme';

interface ConfirmModalProps {
  visible: boolean;
  asset: string;
  amount: string;
  fee: string;
  receive: string;
  destination: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ visible, asset, amount, fee, receive, destination, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            Confirm claim
          </Text>
          <View style={styles.rows}>
            <AmountRow label="Amount" value={`${amount} ${asset}`} />
            <AmountRow label="Fee" value={`${fee} ${asset}`} />
            <AmountRow label="You receive" value={`${receive} ${asset}`} strong />
            <AmountRow label="To" value={destination} />
          </View>
          <Text style={styles.note}>This sends the claim to the destination above and cannot be undone.</Text>
          <View style={styles.actions}>
            <Button label="Confirm claim" onPress={onConfirm} />
            <Button label="Cancel" variant="secondary" onPress={onCancel} />
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
  actions: {
    gap: spacing.sm,
  },
});
