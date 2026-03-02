import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SHIPMENTS } from '../../../src/data/shipments';

export default function DeliveryPersonScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [mode, setMode] = useState<'camera' | 'manual'>('camera');
    const [manualId, setManualId] = useState('');
    const [scanning, setScanning] = useState(true);
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);

    // Navigate to scan/result within the nested Stack using absolute path
    const navigate = (trackingId: string, flow: string) => {
        router.push({
            pathname: "/(tabs-delivery)/scan/result",
            params: { trackingId, flow }
        } as any);
    };

    // Decode QR from a picked image using expo-camera's scanFromURLAsync
    const handleScanFromImage = async () => {
        try {
            const picked = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                quality: 1,
            });
            if (picked.canceled || !picked.assets[0]) return;
            const uri = picked.assets[0].uri;
            const results = await scanFromURLAsync(uri, ['qr']);
            if (results.length === 0) {
                Alert.alert('No QR Found', 'Could not detect a QR code in that image. Make sure the QR fills most of the frame.');
                return;
            }
            const data = results[0].data;
            let id = data;
            if (data.includes('hobortgo.com/')) id = data.split('/').pop() ?? data;
            const deliveryFlow = id.charCodeAt(0) % 2 === 0 ? 'pickup' : 'delivery';
            navigate(id, deliveryFlow);
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Could not scan image.');
        }
    };

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (!scanning) return;
        setScanning(false);
        let id = data;
        if (data.includes('hobortgo.com/')) id = data.split('/').pop() ?? data;
        Vibration.vibrate(100);
        const deliveryFlow = id.charCodeAt(0) % 2 === 0 ? 'pickup' : 'delivery';
        setTimeout(() => setScanning(true), 2000);
        navigate(id, deliveryFlow);
    };

    const handleManualSubmit = () => {
        const id = manualId.trim().toUpperCase();
        if (!id) return;
        Keyboard.dismiss();
        navigate(id, 'delivery');
    };

    // ── Permission denied ──────────────────────────────────────────────────────
    if (!permission) return <View className="flex-1 bg-black" />;

    if (!permission.granted) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
                <View className="w-20 h-20 bg-[#e6f0f5] rounded-full items-center justify-center mb-6">
                    <Ionicons name="camera-outline" size={36} color="#1e4b69" />
                </View>
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-xl text-center mb-2">
                    Camera Access Required
                </Text>
                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mb-8">
                    Grant camera permission to scan QR codes on shipment labels.
                </Text>
                <TouchableOpacity
                    className="bg-brand-secondary rounded-lg py-4 px-8 w-full items-center mb-3"
                    onPress={requestPermission}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white">Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode('manual')}>
                    <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-orange text-sm">Enter tracking ID manually</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ── Manual entry mode ──────────────────────────────────────────────────────
    if (mode === 'manual') {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                    <View className="pt-6 px-5 flex-1">
                        {/* Back */}
                        <View className="flex-row items-center justify-between mb-8">
                            <TouchableOpacity
                                onPress={() => setMode('camera')}
                                className="w-10 h-10 bg-slate-50 rounded-lg items-center justify-center border border-slate-100">
                                <Ionicons name="arrow-back-outline" size={20} color="#1e4b69" />
                            </TouchableOpacity>
                            <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">
                                Manual Entry
                            </Text>
                            <View className="w-10" />
                        </View>

                        {/* Illustration */}
                        <View className="items-center mb-8">
                            <Image
                                source={require('../../../assets/images/illustrations/scan_package.webp')}
                                style={{ width: 180, height: 160 }}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-xl text-center mb-1">
                            Enter Tracking ID
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mb-6">
                            Type the tracking ID printed on the shipment label.
                        </Text>

                        {/* Input */}
                        <TextInput
                            ref={inputRef}
                            style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1e4b69', letterSpacing: 2 }}
                            className="bg-slate-50 rounded-lg px-5 py-4 border border-slate-200 text-center mb-4"
                            placeholder="HB-10041"
                            placeholderTextColor="#CBD5E1"
                            value={manualId}
                            onChangeText={t => setManualId(t.toUpperCase())}
                            autoCapitalize="characters"
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleManualSubmit}
                        />

                        {/* Quick pick chips */}
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-widest mb-2 text-center">
                            Quick Demo — tap a shipment
                        </Text>
                        <View className="flex-row flex-wrap gap-2 justify-center mb-6">
                            {SHIPMENTS.slice(0, 6).map(s => (
                                <TouchableOpacity
                                    key={s.id}
                                    onPress={() => navigate(s.trackingId, s.deliveryStatus === 'Pending' ? 'pickup' : 'delivery')}
                                    className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
                                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12 }} className="text-brand-secondary">
                                        {s.trackingId}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            className={`rounded-lg py-4 items-center ${manualId.trim() ? 'bg-brand-orange' : 'bg-slate-100'}`}
                            onPress={handleManualSubmit}
                            disabled={!manualId.trim()}>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }}
                                className={manualId.trim() ? 'text-white' : 'text-slate-400'}>
                                Look Up Shipment
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View className="flex-row items-center gap-3 my-4">
                            <View className="flex-1 h-px bg-slate-100" />
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">or</Text>
                            <View className="flex-1 h-px bg-slate-100" />
                        </View>

                        {/* Scan from image */}
                        <TouchableOpacity
                            onPress={handleScanFromImage}
                            className="bg-brand-secondary/10 rounded-lg py-3.5 flex-row items-center justify-center gap-2 border border-brand-secondary/20">
                            <Ionicons name="image-outline" size={18} color="#1e4b69" />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13 }} className="text-brand-secondary">
                                Pick QR image from photos
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // ── Camera mode ────────────────────────────────────────────────────────────
    return (
        <View className="flex-1 bg-black">
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
            />

            {/* Dark overlay with cutout */}
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
                    <Text style={{ fontFamily: 'Manrope_600SemiBold', color: 'white', fontSize: 16 }}>
                        Scan shipment QR code
                    </Text>
                    <Text style={{ fontFamily: 'Manrope_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>
                        Point camera at label barcode or QR
                    </Text>
                    <TouchableOpacity
                        onPress={handleScanFromImage}
                        style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                        <Ionicons name="image-outline" size={16} color="white" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', color: 'white', fontSize: 13 }}>Pick QR from photos</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Top controls */}
            <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
                <View className="flex-row justify-between items-center px-5 pt-4">
                    <TouchableOpacity
                        className="w-11 h-11 bg-black/40 rounded-full items-center justify-center border border-white/20"
                        onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-black/40 border border-white/20 rounded-full px-4 h-11 items-center justify-center flex-row gap-2"
                        onPress={() => setMode('manual')}>
                        <Ionicons name="keypad-outline" size={16} color="white" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', color: 'white', fontSize: 13 }}>Enter manually</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
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
