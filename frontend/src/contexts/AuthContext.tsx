import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchCurrentUser, loginRequest, type AuthUser } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'gran-dzilam:auth-token';
const USER_STORAGE_KEY = 'gran-dzilam:auth-user';

const readStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(key);
};

const writeStorage = (key: string, value: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (value === null) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, value);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = readStorage(TOKEN_STORAGE_KEY);
    const storedUser = readStorage(USER_STORAGE_KEY);

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as AuthUser;
        setToken(storedToken);
        setUser(parsed);
      } catch (error) {
        console.warn('No se pudo restaurar la sesión almacenada', error);
        writeStorage(TOKEN_STORAGE_KEY, null);
        writeStorage(USER_STORAGE_KEY, null);
      }
    }

    setIsLoading(false);
  }, []);

  const persistSession = useCallback((nextToken: string | null, nextUser: AuthUser | null) => {
    setToken(nextToken);
    setUser(nextUser);
    writeStorage(TOKEN_STORAGE_KEY, nextToken);
    writeStorage(USER_STORAGE_KEY, nextUser ? JSON.stringify(nextUser) : null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: nextToken, user: nextUser } = await loginRequest(email, password);
    persistSession(nextToken, nextUser);
    return nextUser;
  }, [persistSession]);

  const logout = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null;
    }

    try {
      const current = await fetchCurrentUser(token);
      persistSession(token, current);
      return current;
    } catch (error) {
      console.warn('No se pudo actualizar la sesión', error);
      persistSession(null, null);
      return null;
    }
  }, [persistSession, token]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, logout, refreshUser }),
    [user, token, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
