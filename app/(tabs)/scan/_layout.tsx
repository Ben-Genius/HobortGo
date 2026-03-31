import { Stack } from 'expo-router';

/**
 * Nested Stack navigator inside the admin Scan tab.
 * - scan/index  → camera / manual entry with scan type selector
 * - scan/result → delivery detail + update form (pushed, no tab bar)
 * - scan/shipment-result → shipment master detail + status update (pushed, no tab bar)
 */
export default function AdminScanStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="result" options={{ headerShown: false }} />
            <Stack.Screen name="shipment-result" options={{ headerShown: false }} />
        </Stack>
    );
}
