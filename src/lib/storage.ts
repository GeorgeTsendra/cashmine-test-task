import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ClaimAttempt } from '@/types';

const TOKEN_KEY = 'cashmine.token';
const ATTEMPT_KEY = 'cashmine.claimAttempt';

// Storage can throw (blocked site data, private mode). A failed read counts as "no token".
export async function readToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing stored that we could remove.
  }
}

function isClaimAttempt(value: unknown): value is ClaimAttempt {
  if (typeof value !== 'object' || value === null) return false;
  const { key, body } = value as Record<string, unknown>;
  if (typeof key !== 'string' || typeof body !== 'object' || body === null) return false;
  const { asset, amount, destinationId } = body as Record<string, unknown>;
  return typeof asset === 'string' && typeof amount === 'string' && typeof destinationId === 'string';
}

// The claim request that may have reached the server. It is kept so that a reload can replay it
// with the same Idempotency-Key instead of risking a second claim.
export async function readClaimAttempt(): Promise<ClaimAttempt | null> {
  try {
    const raw = await AsyncStorage.getItem(ATTEMPT_KEY);
    const value: unknown = raw === null ? null : JSON.parse(raw);
    return isClaimAttempt(value) ? value : null;
  } catch {
    return null;
  }
}

export async function saveClaimAttempt(attempt: ClaimAttempt): Promise<void> {
  try {
    await AsyncStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempt));
  } catch {
    // Without storage the replay still works inside this session.
  }
}

export async function removeClaimAttempt(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ATTEMPT_KEY);
  } catch {
    // Nothing stored that we could remove.
  }
}
