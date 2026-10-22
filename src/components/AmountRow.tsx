import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from '@/theme';

export function AmountRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  value: {
    flexShrink: 1,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'right',
  },
  strong: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
