import { Stack } from 'expo-router';

/**
 * Creates a nested Stack navigator inside the scan tab.
 * Note: result screens have been moved to the outer stack to fix navigation loops
 * and ensure the back button works intuitively across the app.
 */
export default function ScanStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
}
