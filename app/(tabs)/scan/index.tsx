import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

export default function AdminScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [batchMode, setBatchMode] = useState(false);
    const [scannedCodes, setScannedCodes] = useState<string[]>([]);
    const [scanning, setScanning] = useState(true);
    const router = useRouter();

    if (!permission) return <View className="flex-1 bg-black" />;

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-[#F9FAFB] items-center justify-center px-6">
                <View className="w-20 h-20 bg-[#e6f0f5] rounded-full items-center justify-center mb-6">
                    <Ionicons name="camera-outline" size={36} color="#1e4b69" />
                </View>
                <Text className="text-xl font-extrabold text-gray-900 mb-2 text-center">Camera Access Required</Text>
                <Text className="text-gray-500 text-center mb-8">Grant camera permission to scan shipment QR codes</Text>
                <TouchableOpacity
                    className="bg-[#1e4b69] py-4 px-8 rounded-lg w-full items-center"
                    onPress={requestPermission}>
                    <Text className="text-white font-bold text-lg">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (!scanning) return;
        let shipmentId = data;
        if (data.includes('hobortgo.com/')) shipmentId = data.split('/').pop() ?? data;
        if (shipmentId.length > 20) shipmentId = shipmentId.substring(0, 12);

        if (!scannedCodes.includes(shipmentId)) {
            Vibration.vibrate(100);
            setScannedCodes(prev => [...prev, shipmentId]);
            if (!batchMode) setScanning(false); // pause after first in single mode
        }
    };

    const handleSingleSubmit = () => {
        if (scannedCodes.length === 0) return;
        Alert.alert('Shipment Received', `${scannedCodes[0]} marked as Received at USA Warehouse.`, [
            { text: 'OK', onPress: () => { setScannedCodes([]); setScanning(true); } },
        ]);
    };

    const handleBatchSubmit = () => {
        if (scannedCodes.length === 0) return;
        Alert.alert(
            'Batch Submit',
            `${scannedCodes.length} shipments will be marked as Received at USA Warehouse.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Submit All', onPress: () => { setScannedCodes([]); setScanning(true); } },
            ]
        );
    };

    return (
        <View className="flex-1 bg-black">
            {scanning && (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={handleBarcodeScanned}
                />
            )}

            {/* Dark overlay with cutout */}
            {scanning && (
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
                        <Text className="text-white font-bold text-lg">Align QR code to scan</Text>
                        <Text className="text-white/60 text-sm mt-1">
                            {batchMode ? `${scannedCodes.length} scanned in batch` : 'Single scan mode'}
                        </Text>
                    </View>
                </View>
            )}

            {/* Top bar */}
            <View className="absolute top-14 left-6 right-6 z-10 flex-row justify-between items-center">
                <TouchableOpacity
                    className="w-11 h-11 bg-black/40 rounded-full items-center justify-center border border-white/20"
                    onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>

                {/* Batch Mode Toggle */}
                <TouchableOpacity
                    onPress={() => { setBatchMode(b => !b); setScannedCodes([]); setScanning(true); }}
                    className={`px-4 py-2 rounded-full border ${batchMode ? 'bg-[#f0782d] border-[#f0782d]' : 'bg-black/40 border-white/30'}`}>
                    <Text className="text-white font-bold text-sm">
                        {batchMode ? '⚡ Batch ON' : 'Batch Mode'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Bottom panel — Single mode */}
            {!batchMode && !scanning && scannedCodes.length > 0 && (
                <View className="absolute bottom-10 left-6 right-6 bg-white rounded-lg p-5 shadow-xl">
                    <View className="flex-row items-center mb-3">
                        <View className="w-10 h-10 bg-[#e6f0f5] rounded-full items-center justify-center mr-3">
                            <Ionicons name="cube" size={20} color="#1e4b69" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-900 font-extrabold text-lg">{scannedCodes[0]}</Text>
                            <Text className="text-gray-500 text-xs">Scanned successfully</Text>
                        </View>
                    </View>
                    <View className="bg-gray-50 rounded-xl p-3 mb-4">
                        <Text className="text-gray-400 text-xs font-medium mb-1">Action</Text>
                        <Text className="text-gray-800 font-semibold text-sm">→ Mark as Received at USA Warehouse</Text>
                    </View>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 border border-gray-200 py-3 rounded-xl items-center"
                            onPress={() => { setScannedCodes([]); setScanning(true); }}>
                            <Text className="text-gray-600 font-semibold">Rescan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-2 bg-[#1e4b69] py-3 px-6 rounded-xl items-center flex-1"
                            onPress={handleSingleSubmit}>
                            <Text className="text-white font-bold">Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Bottom panel — Batch mode */}
            {batchMode && scannedCodes.length > 0 && (
                <View className="absolute bottom-10 left-6 right-6 bg-white rounded-lg p-5 shadow-xl max-h-72">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-900 font-extrabold text-lg">
                            Batch Queue ({scannedCodes.length})
                        </Text>
                        <TouchableOpacity onPress={handleBatchSubmit} className="bg-[#f0782d] px-4 py-1.5 rounded-full">
                            <Text className="text-white font-bold text-sm">Batch Submit</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {scannedCodes.map((code, i) => (
                            <View key={code} className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2 mb-2">
                                <Text className="text-gray-400 text-xs w-6">{i + 1}.</Text>
                                <Ionicons name="cube-outline" size={14} color="#1e4b69" style={{ marginRight: 6 }} />
                                <Text className="text-gray-800 font-semibold flex-1">{code}</Text>
                                <TouchableOpacity onPress={() => setScannedCodes(prev => prev.filter(c => c !== code))}>
                                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
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
