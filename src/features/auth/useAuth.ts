import { createContext, useContext } from 'react';
import type {
  LoginRequest,
  RegisterRealtorRequest,
  RegisterRequest,
  RoleCode,
  UserProfileResponse,
} from '../../api/contracts';

export interface AuthContextValue {
  user: UserProfileResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (...roles: RoleCode[]) => boolean;
  login: (payload: LoginRequest) => Promise<UserProfileResponse>;
  registerCustomer: (payload: RegisterRequest) => Promise<UserProfileResponse>;
  registerRealtor: (payload: RegisterRealtorRequest) => Promise<UserProfileResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
