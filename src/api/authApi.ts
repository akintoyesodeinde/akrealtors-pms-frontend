import { httpClient, setAccessToken } from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRealtorRequest,
  RegisterRequest,
  UserProfileResponse,
} from './contracts';

export const authApi = {
  async registerCustomer(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/register', payload);
    setAccessToken(data.accessToken);
    return data;
  },

  async registerRealtor(payload: RegisterRealtorRequest): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/register/realtor', payload);
    setAccessToken(data.accessToken);
    return data;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', payload);
    setAccessToken(data.accessToken);
    return data;
  },

  async refresh(): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/refresh', {});
    setAccessToken(data.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post('/auth/logout', {});
    } finally {
      setAccessToken(null);
    }
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await httpClient.post<{ message: string }>('/auth/verify-email', { token });
    return data;
  },

  async resendVerification(): Promise<{ message: string }> {
    const { data } = await httpClient.post<{ message: string }>('/auth/resend-verification', {});
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await httpClient.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await httpClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    setAccessToken(null);
    return data;
  },

  async getCurrentUser(): Promise<UserProfileResponse> {
    const { data } = await httpClient.get<UserProfileResponse>('/users/me');
    return data;
  },

  async updateCurrentUser(payload: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<UserProfileResponse> {
    const { data } = await httpClient.patch<UserProfileResponse>('/users/me', payload);
    return data;
  },
};
