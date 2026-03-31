import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';

import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '../src/store/authStore';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { token, role, hasSeenOnboarding } = useAuthStore();
  const [storeHydrated, setStoreHydrated] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    let safetyTimeout: any;

    try {
        console.log('[DEBUG] mmkv hydration check...');
        if (useAuthStore.persist.hasHydrated()) {
          console.log('[DEBUG] mmkv already hydrated.');
          setStoreHydrated(true);
        }

        const unsub = useAuthStore.persist.onFinishHydration(() => {
            console.log('[DEBUG] mmkv hydration finished via listener.');
            setStoreHydrated(true);
        });

        // 5s Safety fallback
        safetyTimeout = setTimeout(() => {
            console.log('[DEBUG] mmkv hydration safety fallback triggered.');
            setStoreHydrated(true);
        }, 5000);

        return () => {
            unsub();
            clearTimeout(safetyTimeout);
        };
    } catch (e) {
        console.error('Initialisation error:', e);
        setStoreHydrated(true); // Fail open
    }
  }, []);
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (loaded && storeHydrated) {
      SplashScreen.hideAsync();
    }
  }, [loaded, storeHydrated]);

  // ── Initial routing after hydration (runs once) ──────────────────────────
  useEffect(() => {
    if (!loaded || !storeHydrated) return;
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        router.replace('/(onboarding)');
      } else if (!token) {
        router.replace('/(auth)/login');
      } else if (role === 'delivery_person' || role === 'staff') {
        router.replace('/(tabs-delivery)' as any);
      } else {
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [loaded, storeHydrated]);

  // ── Token-expiry / logout watcher ─────────────────────────────────────────
  useEffect(() => {
    if (!loaded || !storeHydrated) return;
    if (!token) {
      router.replace('/(auth)/login');
    }
  }, [token, loaded, storeHydrated]);

  if (!loaded || !storeHydrated) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs-delivery)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style='auto' animated />
    </ThemeProvider>
  );
}
