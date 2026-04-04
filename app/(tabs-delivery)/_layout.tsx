import { Stack } from 'expo-router';
import React from 'react';
import RoleGuard from '@/src/components/navigation/RoleGuard';

/**
 * Outer Stack for the delivery-person section.
 *
 * - (tabs)              → tab bar (Home | Scan | Deliveries | Settings)
 * - delivery/[id]       → detail pushed above tabs — back() restores the active tab
 * - notifications/index → notifications pushed from home bell icon
 *
 * Detail screens live here (NOT inside the Tabs navigator) so router.back()
 * correctly restores whichever tab was active instead of resetting to Home.
 */
export default function DeliveryPersonLayout() {
    return (
        <RoleGuard allowedRoles={['delivery_person', 'staff']}>
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="delivery/[id]" />
                <Stack.Screen name="scan-result" />
                <Stack.Screen name="shipment-result" />
                <Stack.Screen name="notifications/index" />
            </Stack>
        </RoleGuard>
    );
}
