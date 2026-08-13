import { api } from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>('/users/me');
    return response.data.data.user;
  },
};
