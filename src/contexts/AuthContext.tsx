import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  AuthUser,
  OrganizationRegisterRequest,
  PartnerRegisterRequest,
  RegisterableRole,
  UserRole,
} from '@/types';
import * as api from '@/api';
import { setAccessToken } from '@/api/client';
import { getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/token';
import { initPushNotifications, teardownPushNotifications } from '@/firebase/messaging';

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  dismissOnboarding: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, role?: RegisterableRole) => Promise<void>;
  registerOrganization: (data: OrganizationRegisterRequest) => Promise<void>;
  registerPartner: (data: PartnerRegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (requiredRole: UserRole) => boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const restoreSession = useCallback(async () => {
    const storedRefresh = getRefreshToken();
    if (!storedRefresh) {
      setIsLoading(false);
      return;
    }

    try {
      const tokens = await api.refreshToken(storedRefresh);
      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      const me = await api.getMe();
      setUser(me);
    } catch {
      removeRefreshToken();
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Start FCM push once a user is authenticated (no-op if Firebase is unconfigured
  // or notification permission isn't granted). Idempotent across user changes.
  useEffect(() => {
    if (user) initPushNotifications();
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.login({ email, password });
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
    const me = await api.getMe();
    setUser(me);
    setIsFirstLogin(false);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string, role: RegisterableRole = 'volunteer') => {
    const tokens = await api.register({ email, username, password, role });
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
    const me = await api.getMe();
    setUser(me);
    setIsFirstLogin(role === 'volunteer');
  }, []);

  const registerOrganization = useCallback(async (data: OrganizationRegisterRequest) => {
    const tokens = await api.registerOrganization(data);
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
    const me = await api.getMe();
    setUser(me);
    setIsFirstLogin(false);
  }, []);

  const registerPartner = useCallback(async (data: PartnerRegisterRequest) => {
    const tokens = await api.registerPartner(data);
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
    const me = await api.getMe();
    setUser(me);
    setIsFirstLogin(false);
  }, []);

  const logout = useCallback(() => {
    // Unregister the device token first (still authenticated at this point).
    teardownPushNotifications();
    setAccessToken(null);
    removeRefreshToken();
    setUser(null);
    setIsFirstLogin(false);
  }, []);

  const dismissOnboarding = useCallback(() => {
    setIsFirstLogin(false);
  }, []);

  const hasRole = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!user) return false;
      const hierarchy: Record<UserRole, number> = {
        volunteer: 1,
        organization: 2,
        partner: 3,
        admin: 4,
      };
      return hierarchy[user.role] >= hierarchy[requiredRole];
    },
    [user],
  );

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isFirstLogin,
      dismissOnboarding,
      login,
      register,
      registerOrganization,
      registerPartner,
      logout,
      hasRole,
      refreshUser,
    }),
    [user, isLoading, isFirstLogin, dismissOnboarding, login, register, registerOrganization, registerPartner, logout, hasRole, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
