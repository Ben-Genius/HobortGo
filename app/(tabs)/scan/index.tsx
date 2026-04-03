import Ionicons from '@expo/vector-icons/Ionicons';
import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Image,
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
import { toast } from '@/src/utils/sonner';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ScanMode = 'camera' | 'manual';
type ScanType = 'delivery' | 'shipment';

const SCAN_TYPES: { value: ScanType; label: string; icon: string; description: string }[] = [
    {
        value: 'delivery',
        label: 'Delivery',
        icon: 'bicycle',
        description: 'Update a delivery status using the shipment QR code',
    },
    {
        value: 'shipment',
        label: 'Shipment',
        icon: 'boat-outline',
        description: 'Update a shipment received at warehouse (master) using its tracking code',
    },
];

const CameraScanTypePill = ({
    value,
    onChange,
}: {
    value: ScanType;
    onChange: (v: ScanType) => void;
}) => (
    <View
        style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(0,0,0,0.45)',
            borderRadius: 24,
            padding: 3,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.15)',
        }}>
        {SCAN_TYPES.map(({ value: v, label, icon }) => {
            const active = value === v;
            return (
                <TouchableOpacity
                    key={v}
                    onPress={() => onChange(v)}
                    style={{
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        borderRadius: 20,
                        backgroundColor: active ? '#f0782d' : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                    }}>
                    <Ionicons name={icon as any} size={13} color="white" />
                    <Text style={{ fontFamily: 'Manrope_600SemiBold', color: 'white', fontSize: 12 }}>
                        {label}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

export default function AdminScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [mode, setMode] = useState<ScanMode>('camera');
    const [scanType, setScanType] = useState<ScanType>('delivery');
    const insets = useSafeAreaInsets();
    const [manualId, setManualId] = useState('');
    const [scanning, setScanning] = useState(true);
    const router = useRouter();
    const inputRef = useRef<TextInput>(null);

    const navigate = (trackingCode: string, flow?: string) => {
        if (scanType === 'shipment') {
            router.push({
                pathname: '/(tabs)/scan/shipment-result',
                params: { trackingCode },
            } as any);
        } else {
            const deliveryFlow = flow ?? (trackingCode.charCodeAt(0) % 2 === 0 ? 'pickup' : 'delivery');
            router.push({
                pathname: '/(tabs)/scan/result',
                params: { trackingId: trackingCode, flow: deliveryFlow },
            } as any);
        }
    };

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
                toast.warning('No QR Found', {
                    description: 'Could not detect a QR code in that image. Make sure the QR fills most of the frame.',
                });
                return;
            }
            const data = results[0].data;
            let id = data;
            if (data.includes('hobortgo.com/')) id = data.split('/').pop() ?? data;
            navigate(id);
        } catch (e: any) {
            toast.error('Error scanning image', {
                description: e?.message || 'Could not scan image.',
            });
        }
    };

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (!scanning) return;
        setScanning(false);
        let id = data;
        if (data.includes('hobortgo.com/')) id = data.split('/').pop() ?? data;
        Vibration.vibrate(100);
        setTimeout(() => setScanning(true), 2000);
        navigate(id);
    };

    const handleManualSubmit = () => {
        const id = manualId.trim().toUpperCase();
        if (!id) return;
        Keyboard.dismiss();
        navigate(id);
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
        const activeScanTypeCfg = SCAN_TYPES.find(s => s.value === scanType)!;
        return (
            <SafeAreaView className="flex-1 bg-white">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
                    <View className="pt-6 px-5 flex-1">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-6">
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

                        {/* Scan type selector cards */}
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-400 uppercase tracking-widest mb-3 text-center">
                            What are you scanning?
                        </Text>
                        <View className="flex-row gap-3 mb-6">
                            {SCAN_TYPES.map(({ value: v, label, icon, description }) => {
                                const active = scanType === v;
                                return (
                                    <TouchableOpacity
                                        key={v}
                                        onPress={() => setScanType(v)}
                                        activeOpacity={0.8}
                                        style={{
                                            flex: 1,
                                            borderWidth: 2,
                                            borderColor: active ? '#f0782d' : '#e5e7eb',
                                            backgroundColor: active ? '#fff7f0' : '#f9fafb',
                                            borderRadius: 12,
                                            padding: 14,
                                            alignItems: 'center',
                                        }}>
                                        <View
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                backgroundColor: active ? '#f0782d' : '#e5e7eb',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: 8,
                                            }}>
                                            <Ionicons name={icon as any} size={20} color={active ? 'white' : '#9ca3af'} />
                                        </View>
                                        <Text
                                            style={{
                                                fontFamily: 'Poppins_600SemiBold',
                                                fontSize: 12,
                                                color: active ? '#f0782d' : '#1e4b69',
                                                textAlign: 'center',
                                                marginBottom: 4,
                                            }}>
                                            {label}
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: 'Manrope_400Regular',
                                                fontSize: 10,
                                                color: '#94a3b8',
                                                textAlign: 'center',
                                                lineHeight: 14,
                                            }}>
                                            {description}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Illustration */}
                        <View className="items-center mb-5">
                            <Image
                                source={require('../../../assets/images/illustrations/scan_package.webp')}
                                style={{ width: 140, height: 120 }}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-xl text-center mb-1">
                            Enter Tracking ID
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mb-4">
                            {activeScanTypeCfg.description}
                        </Text>

                        {/* Input */}
                        <TextInput
                            ref={inputRef}
                            style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1e4b69', letterSpacing: 2 }}
                            className="bg-slate-50 rounded-lg px-5 py-4 border border-slate-200 text-center mb-4"
                            placeholder="e.g. HB-10041"
                            placeholderTextColor="#CBD5E1"
                            value={manualId}
                            onChangeText={t => setManualId(t.toUpperCase())}
                            autoCapitalize="characters"
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleManualSubmit}
                        />

                        <TouchableOpacity
                            className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${manualId.trim() ? 'bg-brand-orange' : 'bg-slate-100'}`}
                            onPress={handleManualSubmit}
                            disabled={!manualId.trim()}>
                            <Ionicons
                                name={scanType === 'shipment' ? 'boat-outline' : 'bicycle'}
                                size={16}
                                color={manualId.trim() ? 'white' : '#94a3b8'}
                            />
                            <Text
                                style={{ fontFamily: 'Poppins_600SemiBold' }}
                                className={manualId.trim() ? 'text-white' : 'text-slate-400'}>
                                Look Up {scanType === 'shipment' ? 'Shipment' : 'Delivery'}
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
                <View style={[styles.bottomOverlay, { alignItems: 'center', paddingTop: 28 }]}>
                    <Text style={{ fontFamily: 'Manrope_600SemiBold', color: 'white', fontSize: 16, marginBottom: 4 }}>
                        {scanType === 'shipment' ? 'Scan Shipment Received at Warehouse QR' : 'Scan Delivery QR Code'}
                    </Text>
                    <Text style={{ fontFamily: 'Manrope_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 16 }}>
                        {scanType === 'shipment'
                            ? 'Point camera at the shipment batch QR code'
                            : 'Point camera at label barcode or QR'}
                    </Text>
                    <TouchableOpacity
                        onPress={handleScanFromImage}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            backgroundColor: 'rgba(255,255,255,0.12)',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 24,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.2)',
                        }}>
                        <Ionicons name="image-outline" size={16} color="white" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', color: 'white', fontSize: 13 }}>Pick QR from photos</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Top controls — no back button since scan is a Tab */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top }}>
                <View className="flex-row justify-end items-center px-5 pt-4 mb-4">
                    <TouchableOpacity
                        className="bg-black/40 border border-white/20 rounded-full px-4 h-11 items-center justify-center flex-row gap-2"
                        onPress={() => setMode('manual')}>
                        <Ionicons name="keypad-outline" size={16} color="white" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', color: 'white', fontSize: 13 }}>Enter manually</Text>
                    </TouchableOpacity>
                </View>

                {/* Scan type pill — centred below top bar */}
                <View style={{ alignItems: 'center' }}>
                    <CameraScanTypePill value={scanType} onChange={setScanType} />
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
