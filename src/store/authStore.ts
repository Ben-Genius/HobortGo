import { create } from 'zustand';
import { IAdminUser, UserRole } from '../types/user.types';

interface AuthState {
    token: string | null;
    user: IAdminUser | null;
    role: UserRole | null;
    setAuth: (token: string, user: IAdminUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    role: null,
    setAuth: (token, user) => set({ token, user, role: user.role ?? null }),
    logout: () => set({ token: null, user: null, role: null }),
}));
