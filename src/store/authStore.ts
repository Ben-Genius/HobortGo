import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { IAdminUser, UserRole } from '../types/user.types';

const storage = new MMKV();

const mmkvStorage: StateStorage = {
    setItem: (name, value) => {
        return storage.set(name, value);
    },
    getItem: (name) => {
        const value = storage.getString(name);
        return value ?? null;
    },
    removeItem: (name) => {
        return storage.delete(name);
    },
};

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: IAdminUser | null;
    role: UserRole | null;
    hasSeenOnboarding: boolean;
    setAuth: (token: string, refreshToken: string, user: IAdminUser) => void;
    logout: () => void;
    setHasSeenOnboarding: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            refreshToken: null,
            user: null,
            role: null,
            hasSeenOnboarding: false,
            setAuth: (token, refreshToken, user) => set({ token, refreshToken, user, role: user.role ?? null }),
            logout: () => set({ token: null, refreshToken: null, user: null, role: null }),
            setHasSeenOnboarding: (val) => set({ hasSeenOnboarding: val }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
