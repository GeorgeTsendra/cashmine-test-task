import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button, ButtonVariant } from '@/components/Button';
import { describeError } from '@/lib/errors';
import { strings } from '@/strings';
import { colors, fontSize, radius, spacing } from '@/theme';

// The part of a React Query result that QueryState needs.
interface QueryLike<T> {
  data: T | undefined;
  error: Error | null;
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => unknown;
}

interface QueryStateProps<T> {
  query: QueryLike<T>;
  /** Renders the data. Only called when there is data and it is not empty. */
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

// Loading, error with Retry, empty and data. If a refresh fails while we still have data, the
// data stays on screen with an error banner above it.
export function QueryState<T>({
  query,
  children,
  isEmpty,
  loadingLabel = strings.query.loading,
  emptyTitle = strings.query.emptyTitle,
  emptyMessage,
}: QueryStateProps<T>) {
  const { data, error, isPending, isError, isFetching, refetch } = query;
  const retry = () => void refetch();

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator accessibilityLabel={loadingLabel} color={colors.primary} />
        <Text style={styles.muted}>{loadingLabel}</Text>
      </View>
    );
  }

  if (data === undefined) {
    return <ErrorBox message={describeError(error)} onRetry={retry} retrying={isFetching} />;
  }

  return (
    <View style={styles.stack}>
      {isError && (
        <ErrorBox message={strings.query.refreshFailed(describeError(error))} onRetry={retry} retrying={isFetching} />
      )}
      {isEmpty?.(data) ? (
        <View style={styles.center}>
          <Text accessibilityRole="header" style={styles.title}>
            {emptyTitle}
          </Text>
          {emptyMessage !== undefined && <Text style={styles.muted}>{emptyMessage}</Text>}
        </View>
      ) : (
        children(data)
      )}
    </View>
  );
}

function ErrorBox({ message, onRetry, retrying }: { message: string; onRetry: () => void; retrying: boolean }) {
  return (
    <View style={styles.error}>
      <Text accessibilityRole="alert" style={styles.errorText}>
        {message}
      </Text>
      <Button label={retrying ? strings.common.retrying : strings.common.retry} onPress={onRetry} disabled={retrying} variant={ButtonVariant.Secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  center: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  muted: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.dangerBackground,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.danger,
  },
});
