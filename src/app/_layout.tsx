import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthStatus, TokenProvider, useToken } from '@/features/auth/TokenProvider';
import { queryClient } from '@/lib/queryClient';
import { colors } from '@/theme';

function RootStack() {
  const { status, token } = useToken();

  if (status === AuthStatus.Loading) {
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
        <Stack.Screen name="claim" />
        <Stack.Screen name="claims/[id]" />
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
