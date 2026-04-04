import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

const storage = new MMKV({ id: 'settings-storage' });

const mmkvStorage: StateStorage = {
    setItem: (name, value) => storage.set(name, value),
    getItem: (name) => storage.getString(name) ?? null,
    removeItem: (name) => storage.delete(name),
};

export type ThemePreference = 'light' | 'dark' | 'system';

interface SettingsState {
    themePreference: ThemePreference;
    setThemePreference: (pref: ThemePreference) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            themePreference: 'system',
            setThemePreference: (pref) => set({ themePreference: pref }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
