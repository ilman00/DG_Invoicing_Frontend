import { api } from '../lib/axios';
import type { AuthResponse, LoginDTO, RegisterDTO } from '../types';

export const authApi = {
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const res = await api.post<{ success: true; data: AuthResponse }>('/auth/register', data);
    return res.data.data;
  },

  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const res = await api.post<{ success: true; data: AuthResponse }>('/auth/login', data);
    return res.data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const res = await api.post<{ success: true; data: { accessToken: string } }>(
      '/auth/refresh',
      { refreshToken }
    );
    return res.data.data;
  },
};