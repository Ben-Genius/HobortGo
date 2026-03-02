import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

const TAB_BAR_STYLE = {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 10,
};

export default function DeliveryPersonTabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#f0782d',
                tabBarInactiveTintColor: '#9CA3AF',
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: TAB_BAR_STYLE,
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
            }}>
            {/* Tab 1 — My Deliveries */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'My Deliveries',
                    tabBarIcon: ({ color, size, focused }) => <IconSymbol size={size ?? 24} name={focused ? 'home' : 'home-outline'} color={color} />,
                }}
            />
            {/* Tab 2 — Scan */}
            <Tabs.Screen
                name="scan/index"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, size, focused }) => <IconSymbol size={size ?? 24} name={focused ? 'qr-code' : 'qr-code-outline'} color={color} />,
                }}
            />
            {/* Tab 3 — Completed */}
            <Tabs.Screen
                name="completed/index"
                options={{
                    title: 'Completed',
                    tabBarIcon: ({ color, size, focused }) => <IconSymbol size={size ?? 24} name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} color={color} />,
                }}
            />
            {/* Tab 4 — Notifications */}
            <Tabs.Screen
                name="notifications/index"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color, size, focused }) => <IconSymbol size={size ?? 24} name={focused ? 'notifications' : 'notifications-outline'} color={color} />,
                }}
            />
        </Tabs>
    );
}
