import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, MIN_TAP, radius, spacing } from '@/theme';

interface Choice {
  value: string;
  label: string;
}

interface ChoicePickerProps {
  /** Names the group for screen readers, e.g. "Asset". */
  label: string;
  choices: Choice[];
  selected: string;
  onSelect: (value: string) => void;
}

export function ChoicePicker({ label, choices, selected, onSelect }: ChoicePickerProps) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
      {choices.map((choice) => {
        const active = choice.value === selected;
        return (
          <Pressable
            key={choice.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={() => onSelect(choice.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{choice.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minWidth: MIN_TAP + 16,
    minHeight: MIN_TAP,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  labelActive: {
    color: colors.primaryText,
  },
});
