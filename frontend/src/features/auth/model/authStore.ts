import { create } from 'zustand';
import { clearTokens, getAccessToken, setTokens } from '../../../shared/lib/tokenStorage';
import type { AuthTokens, User } from '../api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!getAccessToken(),
  login: (tokens) => {
    setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    set({ user: tokens.user, isAuthenticated: true });
  },
  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },
}));
