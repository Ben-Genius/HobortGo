import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';

type ScanFlow = 'idle' | 'pickup_confirm' | 'delivery_complete' | 'failed';

export default function DeliveryPersonScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [flow, setFlow] = useState<ScanFlow>('idle');
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [failReason, setFailReason] = useState<string | null>(null);
    const router = useRouter();

    if (!permission) return <View className="flex-1 bg-black" />;

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-[#F9FAFB] items-center justify-center px-6">
                <View className="w-20 h-20 bg-[#e6f0f5] rounded-full items-center justify-center mb-6">
                    <Ionicons name="camera-outline" size={36} color="#1e4b69" />
                </View>
                <Text className="text-xl font-extrabold text-gray-900 mb-2 text-center">Camera Access Required</Text>
                <Text className="text-gray-500 text-center mb-8">Grant camera permission to scan QR codes</Text>
                <TouchableOpacity className="bg-[#1e4b69] py-4 px-8 rounded-2xl w-full items-center" onPress={requestPermission}>
                    <Text className="text-white font-bold text-lg">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (flow !== 'idle') return;
        let id = data;
        if (data.includes('hobortgo.com/')) id = data.split('/').pop() ?? data;
        if (id.length > 20) id = id.substring(0, 12);
        Vibration.vibrate(100);
        setScannedId(id);
        // For demo: alternate between pickup and delivery flows based on odd/even
        setFlow(id.charCodeAt(0) % 2 === 0 ? 'pickup_confirm' : 'delivery_complete');
    };

    const handlePickupConfirm = () => {
        Alert.alert('Picked Up!', `${scannedId} is now Out for Delivery. Customer notified.`, [
            { text: 'OK', onPress: () => { setFlow('idle'); setScannedId(null); } },
        ]);
    };

    const handleCompleteDelivery = () => {
        Alert.alert('Delivery Complete', `${scannedId} marked as Delivered. Customer will receive confirmation.`, [
            { text: 'OK', onPress: () => { setFlow('idle'); setScannedId(null); setNotes(''); } },
        ]);
    };

    const handleFailed = (reason: string) => {
        setFailReason(reason);
        Alert.alert('Logged', `${scannedId} marked as Attempted. Admin notified.`, [
            { text: 'OK', onPress: () => { setFlow('idle'); setScannedId(null); setFailReason(null); } },
        ]);
    };

    const FAIL_REASONS = ['Customer not available', 'Wrong address', 'Customer refused', 'Other'];

    return (
        <View className="flex-1 bg-black">
            {flow === 'idle' && (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={handleBarcodeScanned}
                />
            )}

            {/* Overlay */}
            {flow === 'idle' && (
                <View style={[styles.overlay, StyleSheet.absoluteFillObject]} pointerEvents="none">
                    <View style={styles.topOverlay} />
                    <View style={styles.middleRow}>
                        <View style={styles.sideOverlay} />
                        <View style={styles.cutout}>
                            {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map(pos => (
                                <View key={pos} style={[styles.corner, styles[pos]]} />
                            ))}
                        </View>
                        <View style={styles.sideOverlay} />
                    </View>
                    <View style={[styles.bottomOverlay, { alignItems: 'center', paddingTop: 36 }]}>
                        <Text className="text-white font-bold text-lg">Scan shipment QR</Text>
                        <Text className="text-white/60 text-xs mt-1">Warehouse pickup or delivery completion</Text>
                    </View>
                </View>
            )}

            {/* Header */}
            {flow === 'idle' && (
                <View className="absolute top-14 left-6 z-10">
                    <TouchableOpacity
                        className="w-11 h-11 bg-black/40 rounded-full items-center justify-center border border-white/20"
                        onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* ── Pickup Confirm Panel ── */}
            {flow === 'pickup_confirm' && (
                <View className="flex-1 bg-[#F9FAFB] pt-16 px-6">
                    <TouchableOpacity onPress={() => setFlow('idle')} className="flex-row items-center mb-6">
                        <Ionicons name="arrow-back" size={20} color="#1e4b69" />
                        <Text className="text-[#1e4b69] font-medium ml-2">Rescan</Text>
                    </TouchableOpacity>

                    <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
                        <View className="items-center mb-4">
                            <View className="w-16 h-16 bg-[#e6f0f5] rounded-full items-center justify-center mb-3">
                                <Ionicons name="cube" size={30} color="#1e4b69" />
                            </View>
                            <Text className="text-gray-900 font-extrabold text-xl">{scannedId}</Text>
                            <Text className="text-gray-500 text-sm mt-1">Assigned to you — ready for pickup</Text>
                        </View>
                        <View className="bg-[#e6f0f5] rounded-xl p-3">
                            <Text className="text-[#1e4b69] font-medium text-sm text-center">
                                Tap Confirm Pickup to change status to "Out for Delivery"
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="bg-[#1e4b69] py-4 rounded-2xl items-center"
                        onPress={handlePickupConfirm}>
                        <Text className="text-white font-extrabold text-lg">Confirm Pickup</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="mt-3 py-3 items-center"
                        onPress={() => setFlow('failed')}>
                        <Text className="text-gray-400 font-medium">Mark as Failed / Attempted</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ── Delivery Complete Panel ── */}
            {flow === 'delivery_complete' && (
                <ScrollView className="flex-1 bg-[#F9FAFB] pt-16 px-6">
                    <TouchableOpacity onPress={() => setFlow('idle')} className="flex-row items-center mb-6">
                        <Ionicons name="arrow-back" size={20} color="#1e4b69" />
                        <Text className="text-[#1e4b69] font-medium ml-2">Rescan</Text>
                    </TouchableOpacity>

                    <Text className="text-gray-900 font-extrabold text-xl mb-1">Complete Delivery</Text>
                    <Text className="text-gray-500 text-sm mb-6">{scannedId} — Capture proof of delivery</Text>

                    {/* Signature */}
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-3">
                        <Text className="text-gray-700 font-bold mb-2">Customer Signature</Text>
                        <TouchableOpacity className="h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl items-center justify-center">
                            <Ionicons name="create-outline" size={24} color="#9CA3AF" />
                            <Text className="text-gray-400 text-xs mt-1">Tap to capture signature</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Delivery Photo */}
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-3">
                        <Text className="text-gray-700 font-bold mb-2">Delivery Photo</Text>
                        <TouchableOpacity className="h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl items-center justify-center">
                            <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
                            <Text className="text-gray-400 text-xs mt-1">Tap to take photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Notes */}
                    <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-5">
                        <Text className="text-gray-700 font-bold mb-2">Notes (optional)</Text>
                        <TextInput
                            className="text-gray-700 text-sm min-h-[60px]"
                            placeholder='e.g. "Left with building security"'
                            placeholderTextColor="#9CA3AF"
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-green-600 py-4 rounded-2xl items-center mb-3"
                        onPress={handleCompleteDelivery}>
                        <Text className="text-white font-extrabold text-lg">Complete Delivery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="border border-gray-200 py-3 rounded-2xl items-center mb-10"
                        onPress={() => setFlow('failed')}>
                        <Text className="text-gray-500 font-medium">Mark as Attempted / Failed</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* ── Failed Flow Panel ── */}
            {flow === 'failed' && (
                <View className="flex-1 bg-[#F9FAFB] pt-16 px-6">
                    <TouchableOpacity onPress={() => setFlow('idle')} className="flex-row items-center mb-6">
                        <Ionicons name="arrow-back" size={20} color="#1e4b69" />
                        <Text className="text-[#1e4b69] font-medium ml-2">Back</Text>
                    </TouchableOpacity>
                    <Text className="text-gray-900 font-extrabold text-xl mb-1">Failed / Attempted</Text>
                    <Text className="text-gray-500 text-sm mb-6">{scannedId ?? '—'} — Select a reason:</Text>
                    {FAIL_REASONS.map(reason => (
                        <TouchableOpacity
                            key={reason}
                            className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 flex-row items-center justify-between"
                            onPress={() => handleFailed(reason)}>
                            <Text className="text-gray-800 font-semibold">{reason}</Text>
                            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1 },
    topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
    bottomOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
    middleRow: { flexDirection: 'row', height: 260 },
    sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
    cutout: { width: 260, backgroundColor: 'transparent', position: 'relative' },
    corner: { position: 'absolute', width: 40, height: 40, borderColor: '#f0782d' },
    topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 6 },
    topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 6 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 6 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 6 },
});
