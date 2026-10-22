import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'cashmine.token';

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
