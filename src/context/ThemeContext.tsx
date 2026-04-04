import React, { createContext, useContext } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { useSettingsStore } from '@/src/store/settingsStore';

type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
    scheme: ColorScheme;
    colors: typeof Colors.light;
}

const ThemeContext = createContext<ThemeContextValue>({
    scheme: 'light',
    colors: Colors.light,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useSystemColorScheme() ?? 'light';
    const themePreference = useSettingsStore(s => s.themePreference);

    const scheme: ColorScheme =
        themePreference === 'system' ? systemScheme : themePreference;

    return (
        <ThemeContext.Provider value={{ scheme, colors: Colors[scheme] }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    return useContext(ThemeContext);
}
