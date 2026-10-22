import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, MIN_TAP, radius, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'link';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        containerStyles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TAP + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  link: {
    minHeight: MIN_TAP,
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  primaryLabel: {
    color: colors.primaryText,
  },
  secondaryLabel: {
    color: colors.text,
  },
  linkLabel: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
});

const containerStyles = { primary: styles.primary, secondary: styles.secondary, link: styles.link };
const labelStyles = { primary: styles.primaryLabel, secondary: styles.secondaryLabel, link: styles.linkLabel };
