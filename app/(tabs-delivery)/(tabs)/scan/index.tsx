import { AppModal } from '@/src/components/ui/AppModal';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ScanMode = 'camera' | 'manual';

export default function DeliveryPersonScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [mode, setMode] = useState<ScanMode>('camera');
    const [manualId, setManualId] = useState('');
    const [scanning, setScanning] = useState(false);
    const [errorModal, setErrorModal] = useState<{ visible: boolean; title: string; message: string }>({
        visible: false, title: '', message: '',
    });
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);
    const lastScanRef = useRef<string | null>(null);
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(() => setScanning(true), 300);
            return () => { clearTimeout(timer); setScanning(false); };
        }, [])
    );

    const navigate = (trackingCode: string) => {
        router.push({
            pathname: '/(tabs-delivery)/scan/result',
            params: { trackingId: trackingCode, flow: 'delivery' },
        } as any);
    };

    const handleScanFromImage = async () => {
        try {
            const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 1 });
            if (picked.canceled || !picked.assets[0]) return;
            const results = await scanFromURLAsync(picked.assets[0].uri, ['qr']);
            if (results.length === 0) {
                setErrorModal({ visible: true, title: 'No QR Found', message: 'Could not detect a QR code in that image. Make sure the QR fills most of the frame.' });
                return;
            }
            const data = results[0].data;
            const id = data.includes('hobortgo.com/') ? (data.split('/').pop() ?? data) : data;
            navigate(id);
        } catch (e: any) {
            setErrorModal({ visible: true, title: 'Scan Error', message: e?.message ?? 'Could not scan image.' });
        }
    };

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (!scanning) return;

        // Prevent scanning the same ID too rapidly (common with QR)
        if (data === lastScanRef.current) return;
        lastScanRef.current = data;

        setScanning(false);
        const id = data.includes('hobortgo.com/') ? (data.split('/').pop() ?? data) : data;
        Vibration.vibrate(100);

        // Only reset lastScanRef after some time
        setTimeout(() => {
            lastScanRef.current = null;
        }, 3000);

        navigate(id);
    };

    const handleManualSubmit = () => {
        const id = manualId.trim().toUpperCase();
        if (!id) return;
        Keyboard.dismiss();
        navigate(id);
    };

    // ── Permission denied ──────────────────────────────────────────────────────
    if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

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
                    Grant camera permission to scan QR codes on delivery labels.
                </Text>
                <TouchableOpacity className="bg-brand-secondary rounded-xl py-4 px-8 w-full items-center mb-3" onPress={requestPermission}>
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
                <AppModal
                    visible={errorModal.visible}
                    type="error"
                    title={errorModal.title}
                    message={errorModal.message}
                    onClose={() => setErrorModal({ visible: false, title: '', message: '' })}
                />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                    <View className="pt-6 px-5 flex-1">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-8">
                            <TouchableOpacity
                                onPress={() => setMode('camera')}
                                className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100">
                                <Ionicons name="arrow-back-outline" size={20} color="#1e4b69" />
                            </TouchableOpacity>
                            <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">
                                Manual Entry
                            </Text>
                            <View className="w-10" />
                        </View>

                        {/* Illustration */}
                        <View className="items-center mb-6">
                            <View className="w-24 h-24 bg-brand-orange/10 rounded-full items-center justify-center mb-4">
                                <Ionicons name="bicycle" size={44} color="#F0782D" />
                            </View>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-xl text-center mb-1">
                                Enter Delivery ID
                            </Text>
                            <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center">
                                Type the tracking code from the delivery label
                            </Text>
                        </View>

                        {/* Input */}
                        <View className="bg-slate-50 rounded-2xl border border-slate-200 flex-row items-center px-4 mb-4">
                            <Ionicons name="search-outline" size={18} color="#94A3B8" />
                            <TextInput
                                ref={inputRef}
                                style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1e4b69', letterSpacing: 2, flex: 1, paddingVertical: 16, paddingHorizontal: 10 }}
                                placeholder="e.g. HB-10041"
                                placeholderTextColor="#CBD5E1"
                                value={manualId}
                                onChangeText={t => setManualId(t.toUpperCase())}
                                autoCapitalize="characters"
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={handleManualSubmit}
                            />
                            {manualId.length > 0 && (
                                <TouchableOpacity onPress={() => setManualId('')}>
                                    <Ionicons name="close-circle" size={18} color="#CBD5E1" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${manualId.trim() ? 'bg-brand-orange' : 'bg-slate-100'}`}
                            onPress={handleManualSubmit}
                            disabled={!manualId.trim()}>
                            <Ionicons name="bicycle" size={17} color={manualId.trim() ? 'white' : '#94a3b8'} />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold', color: manualId.trim() ? 'white' : '#94a3b8' }}>
                                Look Up Delivery
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center gap-3 my-5">
                            <View className="flex-1 h-px bg-slate-100" />
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">or</Text>
                            <View className="flex-1 h-px bg-slate-100" />
                        </View>

                        <TouchableOpacity
                            onPress={handleScanFromImage}
                            className="bg-brand-secondary/10 rounded-xl py-3.5 flex-row items-center justify-center gap-2 border border-brand-secondary/20">
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
            <AppModal
                visible={errorModal.visible}
                type="error"
                title={errorModal.title}
                message={errorModal.message}
                onClose={() => setErrorModal({ visible: false, title: '', message: '' })}
            />

            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
            />

            {/* Overlay with cutout */}
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
                <View style={[styles.bottomOverlay, { alignItems: 'center', paddingTop: 28 }]}>
                    <Text style={{ fontFamily: 'Manrope_700Bold', color: 'white', fontSize: 17, marginBottom: 6 }}>
                        Scan Delivery QR
                    </Text>
                    <Text style={{ fontFamily: 'Manrope_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 20 }}>
                        Point camera at the label barcode or QR code
                    </Text>
                    <TouchableOpacity
                        onPress={handleScanFromImage}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                        <Ionicons name="image-outline" size={16} color="white" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', color: 'white', fontSize: 13 }}>Pick QR from photos</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Top bar */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
                    <TouchableOpacity
                        style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 24, paddingHorizontal: 16, height: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
                        onPress={() => setMode('manual')}>
                        <Ionicons name="keypad-outline" size={16} color="white" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', color: 'white', fontSize: 13 }}>Enter manually</Text>
                    </TouchableOpacity>
                </View>

                {/* Delivery label pill */}
                <View style={{ alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(240,120,45,0.85)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                        <Ionicons name="bicycle" size={14} color="white" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', color: 'white', fontSize: 12 }}>Delivery Scan</Text>
                    </View>
                </View>
            </View>
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
