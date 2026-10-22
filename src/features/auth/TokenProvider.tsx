import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { readToken, removeToken, saveToken as persistToken } from '@/lib/storage';

type AuthStatus = 'loading' | 'ready';

interface TokenContextValue {
  /** "loading" until the stored token has been read. */
  status: AuthStatus;
  token: string | null;
  saveToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

const TokenContext = createContext<TokenContextValue | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [token, setToken] = useState<string | null>(null);

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

  async function saveToken(value: string) {
    const trimmed = value.trim();
    setToken(trimmed);
    try {
      await persistToken(trimmed);
    } catch {
      // Storage is unavailable: keep the token in memory for this session.
    }
  }

  async function clearToken() {
    setToken(null);
    await removeToken();
  }

  return (
    <TokenContext.Provider value={{ status, token, saveToken, clearToken }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken(): TokenContextValue {
  const value = useContext(TokenContext);
  if (!value) throw new Error('useToken must be used inside TokenProvider');
  return value;
}
