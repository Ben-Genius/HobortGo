import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedCodes, setScannedCodes] = useState<string[]>([]);
    const router = useRouter();

    if (!permission) {
        return <View className="flex-1 bg-[#F9FAFB]" />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-[#F9FAFB] items-center justify-center px-6">
                <Text className="text-xl font-bold text-gray-900 mb-4 text-center">We need your permission to show the camera</Text>
                <TouchableOpacity
                    className="bg-[#1e4b69] py-4 px-8 rounded-2xl w-full items-center"
                    onPress={requestPermission}
                >
                    <Text className="text-white font-bold text-lg">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarcodeScanned = (scanningResult: any) => {
        const { type, data } = scanningResult;

        let deliveryId = data;
        if (data.includes('hobortgo.com/')) {
            deliveryId = data.split('/').pop() || '1';
        }
        if (deliveryId.length > 20) {
            deliveryId = deliveryId.substring(0, 8);
        }

        if (!scannedCodes.includes(deliveryId)) {
            Vibration.vibrate();
            setScannedCodes(prev => [...prev, deliveryId]);
        }
    };

    const handleProcess = () => {
        if (scannedCodes.length === 0) return;
        const ids = scannedCodes.join(',');
        router.replace(`/(tabs)/deliveries/${ids}/update` as any);
    };

    return (
        <View className="flex-1 bg-black">
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
            />

            {/* Dark transparent overlay with a cutout for scanning */}
            <View style={[styles.overlay, StyleSheet.absoluteFillObject]} pointerEvents="none">
                <View style={styles.topOverlay} />
                <View style={styles.middleRow}>
                    <View style={styles.sideOverlay} />
                    <View style={styles.cutout}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <View style={styles.sideOverlay} />
                </View>
                <View style={[styles.bottomOverlay, { alignItems: 'center', paddingTop: 40 }]}>
                    <Text className="text-white text-lg font-bold">Align QR Code to scan</Text>
                </View>
            </View>

            {/* Header / Back Action */}
            <View className="absolute top-16 left-6 right-6 z-10 flex-row justify-between items-center">
                <TouchableOpacity
                    className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border border-white/30"
                    onPress={() => router.back()}
                >
                    <Text className="text-white text-lg font-bold">{"<"}</Text>
                </TouchableOpacity>

                {scannedCodes.length > 0 && (
                    <TouchableOpacity
                        className="bg-[#f0782d] px-6 py-3 rounded-full flex-row items-center shadow-lg"
                        onPress={handleProcess}
                    >
                        <Text className="text-white font-bold mr-2">Process ({scannedCodes.length})</Text>
                        <Text className="text-white font-bold">→</Text>
                    </TouchableOpacity>
                )}
            </View>

            {scannedCodes.length > 0 && (
                <View className="absolute bottom-10 left-6 right-6 bg-white rounded-3xl p-4 shadow-xl max-h-60">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-900 font-extrabold text-lg">Scanned Packages</Text>
                        <TouchableOpacity onPress={handleProcess} className="bg-[#1e4b69] px-4 py-1.5 rounded-full">
                            <Text className="text-white font-bold text-sm">Done</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {scannedCodes.map(code => (
                            <View key={code} className="bg-gray-50 border border-gray-100 p-3 rounded-xl mb-2 flex-row justify-between items-center">
                                <Text className="text-gray-800 font-bold">{code}</Text>
                                <TouchableOpacity onPress={() => setScannedCodes(prev => prev.filter(c => c !== code))} className="p-2">
                                    <Text className="text-red-500 font-bold">✕</Text>
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
    overlay: {
        flex: 1,
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    middleRow: {
        flexDirection: 'row',
        height: 250,
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    cutout: {
        width: 250,
        backgroundColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#f0782d', // HobortGo Orange Accent
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    }
});
