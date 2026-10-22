import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, ButtonVariant } from '@/components/Button';
import { formatAge } from '@/lib/time';
import { strings } from '@/strings';
import { colors, fontSize, radius, spacing } from '@/theme';

// The server recomputes balances every 15 seconds; a snapshot much older than that is suspect.
const STALE_AFTER_MS = 60_000;

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

interface FreshnessProps {
  /** Time of the snapshot, from the API. */
  asOf: string;
  isFetching: boolean;
  onRefresh: () => void;
}

export function Freshness({ asOf, isFetching, onRefresh }: FreshnessProps) {
  const now = useNow(1000);
  const age = now - Date.parse(asOf);
  const known = !Number.isNaN(age);
  const stale = known && age > STALE_AFTER_MS;

  return (
    <View style={[styles.row, stale && styles.staleRow]}>
      <Text style={[styles.text, stale && styles.staleText]}>
        {known ? strings.balances.updated(formatAge(age)) : strings.balances.updatedUnknown}
        {stale ? strings.balances.mayBeOutOfDate : ''}
      </Text>
      <Button
        label={isFetching ? strings.balances.refreshing : strings.balances.refresh}
        variant={ButtonVariant.Link}
        disabled={isFetching}
        onPress={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radius.md,
  },
  staleRow: {
    paddingLeft: spacing.md,
    backgroundColor: colors.warningBackground,
  },
  text: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  staleText: {
    color: colors.warning,
  },
});
