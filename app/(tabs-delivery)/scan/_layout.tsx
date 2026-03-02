import { Stack } from 'expo-router';

/**
 * Creates a nested Stack navigator inside the scan tab.
 * - scan/index  → camera / manual entry
 * - scan/result → shipment detail + update form (pushed, no tab bar)
 */
export default function ScanStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="result" options={{ headerShown: false }} />
        </Stack>
    );
}
