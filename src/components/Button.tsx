import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, MIN_TAP, radius, spacing } from '@/theme';

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Link = 'link',
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Use when the visible label is ambiguous on its own, e.g. several "Claim" buttons. */
  accessibilityLabel?: string;
}

export function Button({ label, onPress, variant = ButtonVariant.Primary, disabled = false, accessibilityLabel }: ButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
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

const containerStyles = {
  [ButtonVariant.Primary]: styles.primary,
  [ButtonVariant.Secondary]: styles.secondary,
  [ButtonVariant.Link]: styles.link,
};
const labelStyles = {
  [ButtonVariant.Primary]: styles.primaryLabel,
  [ButtonVariant.Secondary]: styles.secondaryLabel,
  [ButtonVariant.Link]: styles.linkLabel,
};
