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

export default function AdminTabLayout() {
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
      {/* Tab 1 — Home / Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => <IconSymbol size={size ?? 24} name={focused ? 'home' : 'home-outline'} color={color} />,
        }}
      />
      {/* Tab 2 — Scan / Receipt */}
      <Tabs.Screen
        name="scan/index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size, focused }) => <IconSymbol size={size ?? 24} name={focused ? 'qr-code' : 'qr-code-outline'} color={color} />,
        }}
      />
      {/* Tab 3 — Shipments */}
      <Tabs.Screen
        name="shipments/index"
        options={{
          title: 'Shipments',
          tabBarIcon: ({ color, size, focused }) => <IconSymbol size={size ?? 24} name={focused ? 'cube' : 'cube-outline'} color={color} />,
        }}
      />
      {/* Tab 4 — Deliveries */}
      <Tabs.Screen
        name="deliveries/index"
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color, size, focused }) => <IconSymbol size={size ?? 24} name={focused ? 'bicycle' : 'bicycle-outline'} color={color} />,
        }}
      />
      {/* Tab 5 — Notifications */}
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size, focused }) => <IconSymbol size={size ?? 24} name={focused ? 'notifications' : 'notifications-outline'} color={color} />,
        }}
      />

      {/* ── Hidden screens ── */}
      <Tabs.Screen name="scanner" options={{ href: null }} />
      <Tabs.Screen name="deliveries/[id]" options={{ href: null }} />
      <Tabs.Screen name="deliveries/[id]/update" options={{ href: null }} />
      <Tabs.Screen name="shipments/[id]" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
