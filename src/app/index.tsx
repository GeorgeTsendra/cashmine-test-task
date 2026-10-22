import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useToken } from '@/features/auth/TokenProvider';
import { colors, fontSize, spacing } from '@/theme';

// Placeholder until the balances screen lands.
export default function HomeScreen() {
  const { token, clearToken } = useToken();

  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        Payback
      </Text>
      <Text style={styles.body}>Token saved (ends with {token?.slice(-4)}).</Text>
      <Button label="Change token" variant="secondary" onPress={() => void clearToken()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingTop: spacing.xxl,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
