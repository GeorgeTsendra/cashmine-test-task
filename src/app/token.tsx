import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useToken } from '@/features/auth/TokenProvider';
import { strings } from '@/strings';
import { colors, fontSize, MIN_TAP, radius, spacing } from '@/theme';

export default function TokenScreen() {
  const { saveToken, notice } = useToken();
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const token = value.trim();
    if (token === '') {
      setError(strings.token.errorEmpty);
    } else if (/\s/.test(token)) {
      setError(strings.token.errorSpaces);
    } else {
      setError(null);
      void saveToken(token);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          {strings.token.title}
        </Text>
        <Text style={styles.subtitle}>{strings.token.subtitle}</Text>
      </View>

      {notice !== null && (
        <Text accessibilityRole="alert" style={styles.notice}>
          {notice}
        </Text>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>{strings.token.label}</Text>
        <View style={[styles.inputRow, error !== null && styles.inputRowError]}>
          <TextInput
            accessibilityLabel={strings.token.label}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            onChangeText={(text) => {
              setValue(text);
              if (error !== null) setError(null);
            }}
            onSubmitEditing={submit}
            placeholder={strings.token.placeholder}
            placeholderTextColor={colors.textMuted}
            returnKeyType="go"
            secureTextEntry={!visible}
            style={styles.input}
            value={value}
          />
          <Pressable
            accessibilityLabel={visible ? strings.token.hideToken : strings.token.showToken}
            accessibilityRole="button"
            onPress={() => setVisible((current) => !current)}
            style={styles.toggle}
          >
            <Text style={styles.toggleLabel}>{visible ? strings.token.hide : strings.token.show}</Text>
          </Pressable>
        </View>
        {error !== null && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
      </View>

      <Button label={strings.token.continue} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  notice: {
    padding: spacing.md,
    borderRadius: radius.md,
    fontSize: fontSize.md,
    color: colors.danger,
    backgroundColor: colors.dangerBackground,
  },
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
    minHeight: MIN_TAP + 4,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  toggle: {
    minWidth: MIN_TAP,
    minHeight: MIN_TAP,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
