import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useToken } from '@/features/auth/TokenProvider';
import { colors, fontSize, MIN_TAP, radius, spacing } from '@/theme';

export default function TokenScreen() {
  const { saveToken, notice } = useToken();
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const token = value.trim();
    if (token === '') {
      setError('Paste your access token to continue.');
    } else if (/\s/.test(token)) {
      setError('The token must not contain spaces or line breaks.');
    } else {
      setError(null);
      void saveToken(token);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          CashMine
        </Text>
        <Text style={styles.subtitle}>Enter your access token to see and claim your payback.</Text>
      </View>

      {notice !== null && (
        <Text accessibilityRole="alert" style={styles.notice}>
          {notice}
        </Text>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Access token</Text>
        <View style={[styles.inputRow, error !== null && styles.inputRowError]}>
          <TextInput
            accessibilityLabel="Access token"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            onChangeText={(text) => {
              setValue(text);
              if (error !== null) setError(null);
            }}
            onSubmitEditing={submit}
            placeholder="Paste token"
            placeholderTextColor={colors.textMuted}
            returnKeyType="go"
            secureTextEntry={!visible}
            style={styles.input}
            value={value}
          />
          <Pressable
            accessibilityLabel={visible ? 'Hide token' : 'Show token'}
            accessibilityRole="button"
            onPress={() => setVisible((current) => !current)}
            style={styles.toggle}
          >
            <Text style={styles.toggleLabel}>{visible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>
        {error !== null && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
      </View>

      <Button label="Continue" onPress={submit} />
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
