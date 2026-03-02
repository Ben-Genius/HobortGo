import { create } from 'zustand';
import { IAdminUser } from '../types/user.types';

interface AuthState {
    token: string | null;
    user: IAdminUser | null;
    setAuth: (token: string, user: IAdminUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    setAuth: (token, user) => set({ token, user }),
    logout: () => set({ token: null, user: null }),
}));
