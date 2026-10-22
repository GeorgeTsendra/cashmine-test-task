import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { ClaimStatusView } from '@/features/claim/ClaimStatusView';
import { colors, fontSize, spacing } from '@/theme';

export default function ClaimStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.title}>
        Claim
      </Text>
      <ClaimStatusView id={id} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingTop: spacing.lg,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
});
