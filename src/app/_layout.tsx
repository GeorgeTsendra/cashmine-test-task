import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { TokenProvider, useToken } from '@/features/auth/TokenProvider';
import { colors } from '@/theme';

const queryClient = new QueryClient();

function RootStack() {
  const { status, token } = useToken();

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator accessibilityLabel="Loading" color={colors.primary} />
      </View>
    );
  }

  const hasToken = token !== null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!hasToken}>
        <Stack.Screen name="token" />
      </Stack.Protected>
      <Stack.Protected guard={hasToken}>
        <Stack.Screen name="index" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <TokenProvider>
        <RootStack />
      </TokenProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
