import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, ButtonVariant } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ClaimView } from '@/features/claim/ClaimView';
import { strings } from '@/strings';
import { colors, fontSize, spacing } from '@/theme';

export default function ClaimScreen() {
  const { asset } = useLocalSearchParams<{ asset?: string }>();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <Button
          label={strings.common.back}
          variant={ButtonVariant.Link}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
        <Text accessibilityRole="header" style={styles.title}>
          {strings.claim.title}
        </Text>
      </View>
      <ClaimView initialAsset={asset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
});
