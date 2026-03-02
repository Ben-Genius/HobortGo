import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignaturePad from '../../../src/components/forms/SignaturePad';
import { getShipmentByTrackingId } from '../../../src/data/shipments';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
    { value: 'Pending', label: 'Pending', bg: '#fef3c7', text: '#92400e', dot: '#d97706' },
    { value: 'Out', label: 'Out for Delivery', bg: '#fff0e6', text: '#f0782d', dot: '#f0782d' },
    { value: 'Completed', label: 'Delivered', bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
    { value: 'Failed', label: 'Failed / Attempted', bg: '#fef2f2', text: '#dc2626', dot: '#dc2626' },
] as const;

const FAIL_REASONS = [
    'Customer not available',
    'Wrong address on file',
    'Customer refused delivery',
    'Damaged package — not delivered',
    'Other',
];

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function ScanResultScreen() {
    const { trackingId, flow } = useLocalSearchParams<{ trackingId: string; flow: string }>();
    const router = useRouter();

    const shipment = getShipmentByTrackingId(trackingId ?? '');

    // Form state
    const [selectedStatus, setSelectedStatus] = useState<string>(
        flow === 'pickup' ? 'Out' : 'Completed'
    );
    const [receivedBy, setReceivedBy] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [failReason, setFailReason] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [signature, setSignature] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const currentStatusOption = STATUS_OPTIONS.find(s => s.value === selectedStatus) ?? STATUS_OPTIONS[1];
    const isFailed = selectedStatus === 'Failed';
    const isDelivered = selectedStatus === 'Completed';

    // ── Handlers ──────────────────────────────────────────────────────────────

    const pickImage = async () => {
        try {
            // Try camera first — not available on iOS Simulator
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                quality: 0.75,
                allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
                setPhotos(prev => [...prev, result.assets[0].uri]);
            }
        } catch {
            // Fallback to photo library (simulator-safe)
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                quality: 0.75,
                allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
                setPhotos(prev => [...prev, result.assets[0].uri]);
            }
        }
    };

    const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = () => {
        if (isDelivered && !receivedBy.trim()) {
            Alert.alert('Required', 'Please enter the receiver name for delivery confirmation.');
            return;
        }
        if (isFailed && !failReason) {
            Alert.alert('Required', 'Please select a reason for the failed attempt.');
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            const messages: Record<string, string> = {
                Out: `${trackingId} is now Out for Delivery. Customer notified.`,
                Completed: `${trackingId} marked as Delivered. Confirmation sent.`,
                Failed: `${trackingId} logged as Failed / Attempted. Admin notified.`,
                Pending: `${trackingId} status updated to Pending.`,
            };
            Alert.alert('Updated!', messages[selectedStatus] ?? 'Shipment status updated.', [
                { text: 'Done', onPress: () => router.replace('/(tabs-delivery)' as any) },
            ]);
        }, 900);
    };

    // ── Not found state ────────────────────────────────────────────────────────

    if (!shipment) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
                <Image
                    source={require('../../../assets/images/illustrations/shipment_box.webp')}
                    style={{ width: 140, height: 140, marginBottom: 24 }}
                    resizeMode="contain"
                />
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-xl text-center mb-2">
                    Shipment Not Found
                </Text>
                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mb-8">
                    No shipment matched "{trackingId}". Try scanning again or check the ID.
                </Text>
                <TouchableOpacity
                    className="bg-brand-secondary rounded-lg py-3 px-8 mb-3 w-full items-center"
                    onPress={() => router.back()}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white">Scan Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace('/(tabs-delivery)/scan' as any)}>
                    <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-orange text-sm">Enter manually</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ── Main screen ────────────────────────────────────────────────────────────

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 120 }}>

                {/* ── Header ── */}
                <View className="pt-6 px-5 pb-4">
                    <View className="flex-row items-center justify-between mb-5">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-slate-50 rounded-lg items-center justify-center border border-slate-100">
                            <Ionicons name="arrow-back-outline" size={20} color="#1e4b69" />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">
                            Scan Result
                        </Text>
                        <View className="w-10" />
                    </View>

                    {/* ── Package banner ── */}
                    <View className="bg-brand-orange rounded-lg p-5 overflow-hidden mb-6">
                        <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                        <View className="flex-row items-center gap-4">
                            <Image
                                source={require('../../../assets/images/illustrations/shipment_box.webp')}
                                style={{ width: 68, height: 68 }}
                                resizeMode="contain"
                            />
                            <View className="flex-1">
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-white/70 uppercase tracking-widest mb-0.5">
                                    Scanned Package
                                </Text>
                                <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-2xl">
                                    {shipment.trackingId}
                                </Text>
                                <View className="flex-row items-center gap-1.5 mt-1.5">
                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} className="px-2.5 py-1 rounded-full">
                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11 }} className="text-white">
                                            Current: {shipment.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ── Package info grid ── */}
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                        Package Info
                    </Text>
                    <View className="bg-slate-50 rounded-lg border border-slate-100 mb-6 overflow-hidden">
                        <View className="flex-row border-b border-slate-100">
                            <View className="flex-1 p-3.5 border-r border-slate-100">
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-0.5">Recipient</Text>
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-brand-secondary" numberOfLines={1}>{shipment.recipient}</Text>
                            </View>
                            <View className="flex-1 p-3.5">
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-0.5">Sender</Text>
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-brand-secondary" numberOfLines={1}>{shipment.sender}</Text>
                            </View>
                        </View>
                        <View className="flex-row border-b border-slate-100">
                            <View className="flex-1 p-3.5 border-r border-slate-100">
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-0.5">Phone</Text>
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-brand-secondary">{shipment.recipientPhone}</Text>
                            </View>
                            <View className="flex-1 p-3.5">
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-0.5">Weight</Text>
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-brand-secondary">{shipment.weight} kg</Text>
                            </View>
                        </View>
                        <View className="p-3.5">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-0.5">Delivery Address</Text>
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13 }} className="text-brand-secondary">{shipment.address}</Text>
                        </View>
                        {shipment.notes ? (
                            <View className="px-3.5 pb-3.5">
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-0.5">Package Notes</Text>
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12 }} className="text-brand-orange">{shipment.notes}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* ── Status Update ── */}
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                        Update Status
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {STATUS_OPTIONS.map(opt => {
                            const active = selectedStatus === opt.value;
                            return (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => setSelectedStatus(opt.value)}
                                    style={{ backgroundColor: active ? opt.text : opt.bg, borderWidth: 1.5, borderColor: active ? opt.text : 'transparent' }}
                                    className="rounded-full px-4 py-2 flex-row items-center gap-1.5">
                                    <View style={{ backgroundColor: active ? 'white' : opt.dot }} className="w-2 h-2 rounded-full" />
                                    <Text style={{
                                        fontFamily: 'Manrope_600SemiBold',
                                        fontSize: 12,
                                        color: active ? 'white' : opt.text,
                                    }}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* ── Fail reason — only when Failed ── */}
                    {isFailed && (
                        <View className="mb-6">
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                                Reason for Failure
                            </Text>
                            <View className="gap-2">
                                {FAIL_REASONS.map(reason => {
                                    const active = failReason === reason;
                                    return (
                                        <TouchableOpacity
                                            key={reason}
                                            onPress={() => setFailReason(reason)}
                                            className={`px-4 py-3.5 rounded-lg border flex-row items-center justify-between ${active ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: active ? '#dc2626' : '#1e4b69' }}>
                                                {reason}
                                            </Text>
                                            {active && <Ionicons name="checkmark-circle" size={18} color="#dc2626" />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* ── Proof section — receiver + ID for delivery ── */}
                    {isDelivered && (
                        <View className="mb-6">
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                                Proof of Delivery
                            </Text>
                            <View className="gap-3">
                                <View>
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">
                                        Received By *
                                    </Text>
                                    <TextInput
                                        style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#1e4b69' }}
                                        className="bg-slate-50 rounded-lg px-4 py-3.5 border border-slate-100"
                                        placeholder="Recipient full name"
                                        placeholderTextColor="#94A3B8"
                                        value={receivedBy}
                                        onChangeText={setReceivedBy}
                                    />
                                </View>
                                <View>
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">
                                        ID Number (optional)
                                    </Text>
                                    <TextInput
                                        style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#1e4b69' }}
                                        className="bg-slate-50 rounded-lg px-4 py-3.5 border border-slate-100"
                                        placeholder="GHA-123456789-0"
                                        placeholderTextColor="#94A3B8"
                                        value={idNumber}
                                        onChangeText={setIdNumber}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* ── Photo Evidence ── */}
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                        Photo Evidence
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {photos.map((uri, idx) => (
                            <View key={idx} className="relative">
                                <Image
                                    source={{ uri }}
                                    style={{ width: 96, height: 96, borderRadius: 10 }}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={() => removePhoto(idx)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full items-center justify-center">
                                    <Ionicons name="close" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {photos.length < 5 && (
                            <TouchableOpacity
                                onPress={pickImage}
                                className="w-24 h-24 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 items-center justify-center gap-1">
                                <Ionicons name="camera-outline" size={24} color="#94A3B8" />
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">Add photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── Signature ── */}
                    {isDelivered && (
                        <View className="mb-6">
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">
                                Customer Signature
                            </Text>
                            <SignaturePad height={160} onSave={setSignature} />
                        </View>
                    )}

                    {/* ── Notes / Comment ── */}
                    <View className="mb-2">
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                            Notes & Comments
                        </Text>
                        <TextInput
                            style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#1e4b69', minHeight: 88, textAlignVertical: 'top' }}
                            className="bg-slate-50 rounded-lg px-4 py-3.5 border border-slate-100"
                            placeholder='e.g. "Left with building security on floor 3"'
                            placeholderTextColor="#94A3B8"
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* ── Sticky submit ── */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 py-4">
                <View className="flex-row items-center gap-3">
                    {/* Summary badge */}
                    <View style={{ backgroundColor: currentStatusOption.bg }} className="flex-row items-center gap-1.5 px-3 py-2.5 rounded-lg">
                        <View style={{ backgroundColor: currentStatusOption.dot }} className="w-2 h-2 rounded-full" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: currentStatusOption.text }}>
                            {currentStatusOption.label}
                        </Text>
                    </View>
                    <TouchableOpacity
                        className={`flex-1 rounded-lg py-3.5 items-center ${submitting ? 'bg-brand-orange/60' : 'bg-brand-orange'}`}
                        onPress={handleSubmit}
                        disabled={submitting}>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white">
                            {submitting ? 'Submitting…' : 'Submit Update'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
