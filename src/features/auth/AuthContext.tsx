import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../api/authApi';
import { getAccessToken, setAccessToken } from '../../api/client';
import type {
  LoginRequest,
  RegisterRealtorRequest,
  RegisterRequest,
  RoleCode,
  UserProfileResponse,
} from '../../api/contracts';
import { AuthContext } from './useAuth';

export function AuthProvider({
  children,
  skipInitialSessionBootstrap = false,
}: {
  children: ReactNode;
  skipInitialSessionBootstrap?: boolean;
}) {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!skipInitialSessionBootstrap);

  useEffect(() => {
    if (skipInitialSessionBootstrap) return;
    let active = true;
    (async () => {
      try {
        if (getAccessToken()) {
          const profile = await authApi.getCurrentUser();
          if (active) setUser(profile);
        } else {
          const refreshed = await authApi.refresh();
          if (active) setUser(refreshed.user);
        }
      } catch {
        if (active) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [skipInitialSessionBootstrap]);

  const login = useCallback(async (payload: LoginRequest) => {
    const res = await authApi.login(payload);
    setUser(res.user);
    return res.user;
  }, []);

  const registerCustomer = useCallback(async (payload: RegisterRequest) => {
    const res = await authApi.registerCustomer(payload);
    setUser(res.user);
    return res.user;
  }, []);

  const registerRealtor = useCallback(async (payload: RegisterRealtorRequest) => {
    const res = await authApi.registerRealtor(payload);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await authApi.getCurrentUser();
    setUser(profile);
  }, []);

  const hasRole = useCallback(
    (...roles: RoleCode[]) => {
      if (!user) return false;
      return roles.some((r) => user.roles.includes(r));
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      hasRole,
      login,
      registerCustomer,
      registerRealtor,
      logout,
      refreshProfile,
    }),
    [user, isLoading, hasRole, login, registerCustomer, registerRealtor, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
