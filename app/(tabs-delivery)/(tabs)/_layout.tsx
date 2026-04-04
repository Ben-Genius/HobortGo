import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DeliveryPersonTabLayout() {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];

    const TAB_BAR_STYLE = {
        backgroundColor: colors.tabBar,
        borderTopWidth: 1,
        borderTopColor: colors.tabBarBorder,
        height: Platform.OS === 'ios' ? 88 : 68,
        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        paddingTop: 10,
    };

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.tabIconSelected,
                tabBarInactiveTintColor: colors.tabIconDefault,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: TAB_BAR_STYLE,
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
            }}>
            {/* Tab 1 — Home */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <IconSymbol size={size ?? 24} name={focused ? 'home' : 'home-outline'} color={color} />
                    ),
                }}
            />
            {/* Tab 2 — Scan */}
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, size, focused }) => (
                        <IconSymbol size={size ?? 24} name={focused ? 'qr-code' : 'qr-code-outline'} color={color} />
                    ),
                }}
            />
            {/* Tab 3 — Deliveries */}
            <Tabs.Screen
                name="completed/index"
                options={{
                    title: 'Deliveries',
                    tabBarIcon: ({ color, size, focused }) => (
                        <IconSymbol size={size ?? 24} name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} color={color} />
                    ),
                }}
            />
            {/* Tab 4 — Settings */}
            <Tabs.Screen
                name="settings/index"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size, focused }) => (
                        <IconSymbol size={size ?? 24} name={focused ? 'settings' : 'settings-outline'} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
