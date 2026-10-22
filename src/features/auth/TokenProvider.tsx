import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { setUnauthorizedHandler } from '@/lib/queryClient';
import { readToken, removeToken, saveToken as persistToken } from '@/lib/storage';

type AuthStatus = 'loading' | 'ready';

const UNAUTHORIZED_NOTICE = 'Your token was rejected or has expired. Enter a new one to continue.';

interface TokenContextValue {
  /** "loading" until the stored token has been read. */
  status: AuthStatus;
  token: string | null;
  /** Why the user is back on the token screen, e.g. after the API rejected the token. */
  notice: string | null;
  saveToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

const TokenContext = createContext<TokenContextValue | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readToken().then((stored) => {
      if (!active) return;
      setToken(stored);
      setStatus('ready');
    });
    return () => {
      active = false;
    };
  }, []);

  // Any request the API answers with 401 signs the user out. Cached data belongs to the old
  // token, so it goes too.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setNotice(UNAUTHORIZED_NOTICE);
      setToken(null);
      queryClient.clear();
      void removeToken();
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  async function saveToken(value: string) {
    const trimmed = value.trim();
    setNotice(null);
    queryClient.clear();
    setToken(trimmed);
    try {
      await persistToken(trimmed);
    } catch {
      // Storage is unavailable: keep the token in memory for this session.
    }
  }

  async function clearToken() {
    setNotice(null);
    setToken(null);
    queryClient.clear();
    await removeToken();
  }

  return (
    <TokenContext.Provider value={{ status, token, notice, saveToken, clearToken }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken(): TokenContextValue {
  const value = useContext(TokenContext);
  if (!value) throw new Error('useToken must be used inside TokenProvider');
  return value;
}
