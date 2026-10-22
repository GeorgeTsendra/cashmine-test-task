import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, ButtonVariant } from '@/components/Button';
import { colors, fontSize, MIN_TAP, radius, spacing } from '@/theme';

interface AmountFieldProps {
  asset: string;
  value: string;
  onChangeText: (text: string) => void;
  onMax: () => void;
  maxDisabled: boolean;
  error: string | null;
}

export function AmountField({ asset, value, onChangeText, onMax, maxDisabled, error }: AmountFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Amount</Text>
      <View style={[styles.inputRow, error !== null && styles.inputRowError]}>
        <TextInput
          accessibilityLabel={`Amount in ${asset}`}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          inputMode="decimal"
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={value}
        />
        <Text style={styles.unit}>{asset}</Text>
        <Button label="Max" variant={ButtonVariant.Link} disabled={maxDisabled} onPress={onMax} accessibilityLabel={`Use the maximum ${asset} amount`} />
      </View>
      {error !== null && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: MIN_TAP + 4,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  unit: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
