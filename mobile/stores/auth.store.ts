import { create } from 'zustand';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { authService } from '../services/auth.service';
import { storage } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuthFromStorage: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: async (user: User, token: string) => {
    set({ user, token });
    await storage.setToken(token);
    await storage.setUser(user);
  },

  clearAuth: async () => {
    set({ user: null, token: null });
    await storage.clearAll();
  },

  loadAuthFromStorage: async () => {
    try {
      set({ isLoading: true });
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();

      if (storedToken && storedUser) {
        set({ token: storedToken, user: storedUser });
        try {
          const freshUser = await authService.getMe();
          set({ user: freshUser });
          await storage.setUser(freshUser);
        } catch (e) {
          console.log('Session cached user loaded');
        }
      }
    } catch (e) {
      console.error('Error loading stored auth:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (credentials: LoginCredentials) => {
    const res = await authService.login(credentials);
    await get().setAuth(res.user, res.token);
  },

  register: async (credentials: RegisterCredentials) => {
    const res = await authService.register(credentials);
    await get().setAuth(res.user, res.token);
  },

  logout: async () => {
    await get().clearAuth();
  },

  refreshUser: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const freshUser = await authService.getMe();
      set({ user: freshUser });
      await storage.setUser(freshUser);
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  },
}));
