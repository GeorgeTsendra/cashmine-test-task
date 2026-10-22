import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useToken } from '@/features/auth/TokenProvider';
import { BalancesView } from '@/features/balances/BalancesView';
import { PendingAttemptBanner } from '@/features/claim/PendingAttemptBanner';
import { colors, fontSize, spacing } from '@/theme';

export default function HomeScreen() {
  const { clearToken } = useToken();

  return (
    <Screen>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>
          Payback
        </Text>
        <Button label="Change token" variant="link" onPress={() => void clearToken()} />
      </View>
      <PendingAttemptBanner />
      <BalancesView />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
});
