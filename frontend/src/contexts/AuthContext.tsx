import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchCurrentUser, loginRequest, logoutRequest, type AuthUser } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * R2 — Antes el token y el usuario se guardaban en localStorage, donde cualquier script
 * inyectado en la página podía leerlos, y la sesión se restauraba confiando en lo que
 * hubiera ahí. Ahora la sesión vive en una cookie httpOnly que este código no puede ver:
 * al arrancar se le pregunta al backend quién es el usuario, y él decide.
 *
 * El perfil ya no se cachea en el navegador a propósito. Una petición a /api/auth/me al
 * cargar cuesta muy poco y evita mostrar como sesión válida algo que el servidor ya no
 * reconoce.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let vivo = true;

    fetchCurrentUser()
      .then((actual) => {
        if (vivo) setUser(actual);
      })
      .catch(() => {
        // Sin cookie válida simplemente no hay sesión: no es un error que mostrar.
        if (vivo) setUser(null);
      })
      .finally(() => {
        if (vivo) setIsLoading(false);
      });

    return () => {
      vivo = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: siguiente } = await loginRequest(email, password);
    setUser(siguiente);
    return siguiente;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.warn('No se pudo cerrar la sesión en el servidor', error);
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const actual = await fetchCurrentUser();
      setUser(actual);
      return actual;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, logout, refreshUser }),
    [user, isLoading, login, logout, refreshUser],
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
