import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getShipmentStatusList } from '../../../src/api/shipment';
import { getShipmentMasterById, updateShipmentMasterStatus } from '../../../src/api/shipmentMaster';
import { IShipmentMaster } from '../../../src/types/shipment.types';

const FLAG_REASONS = ['Damaged', 'Missing Item', 'Customs Hold', 'Discrepancy'] as const;

const STATUS_MAP: Record<string, { bg: string; color: string }> = {
    'Processing': { bg: '#FEF9C3', color: '#CA8A04' },
    'In-transit': { bg: '#DBEAFE', color: '#2563EB' },
    'Received': { bg: '#DCFCE7', color: '#16A34A' },
    'Accepted': { bg: '#EDE9FE', color: '#7C3AED' },
    'Delivered': { bg: '#DCFCE7', color: '#16A34A' },
    'PickUp': { bg: '#FFEDD5', color: '#EA580C' },
};

const getStatus = (s: string) => STATUS_MAP[s] ?? { bg: '#F1F5F9', color: '#64748B' };
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type Tab = 'details' | 'timeline' | 'packages';

export default function AdminShipmentDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [shipment, setShipment] = useState<IShipmentMaster | null>(null);
    const [loading, setLoading] = useState(true);
    const [flagged, setFlagged] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [tab, setTab] = useState<Tab>('details');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    // Status update modal
    const [updateModal, setUpdateModal] = useState<{ visible: boolean; status: any | null }>({ visible: false, status: null });
    const [updateNotes, setUpdateNotes] = useState('');
    const [updateLocation, setUpdateLocation] = useState('');
    const [updating, setUpdating] = useState(false);
    const [updateImageUri, setUpdateImageUri] = useState<string | null>(null);

    const pickUpdateImage = useCallback(async () => {
        Alert.alert('Attach Photo', 'Choose a source', [
            {
                text: '📷  Take Photo',
                onPress: async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission needed', 'Allow camera access to take a photo.');
                        return;
                    }
                    try {
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: 'images',
                            quality: 0.8,
                            allowsEditing: true,
                            aspect: [4, 3],
                        });
                        if (!result.canceled && result.assets[0]) setUpdateImageUri(result.assets[0].uri);
                    } catch {
                        Alert.alert('Camera unavailable', 'Camera is not available on this device.');
                    }
                },
            },
            {
                text: '🖼️  Choose from Library',
                onPress: async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission needed', 'Allow photo library access.');
                        return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: 'images',
                        quality: 0.8,
                        allowsEditing: true,
                        aspect: [4, 3],
                    });
                    if (!result.canceled && result.assets[0]) setUpdateImageUri(result.assets[0].uri);
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                if (typeof id === 'string') {
                    const data: any = await getShipmentMasterById(id);
                    setShipment(data as IShipmentMaster);
                    if (data?.flagged) { setFlagged(true); setSelectedFlag(data.flagReason || null); }
                }
            } catch { Alert.alert('Error', 'Could not load shipment.'); }
            finally { setLoading(false); }
        })();
    }, [id]);

    useEffect(() => {
        (async () => {
            try {
                const res = await getShipmentStatusList({ offset: 0, limit: 100 });
                setStatuses(Array.isArray(res) ? res : res.data ?? []);
            } catch { }
        })();
    }, []);

    const handleFlag = useCallback(async (reason: string) => {
        if (!shipment?._id) return;
        try {
            setFlagged(true);
            setSelectedFlag(reason);
            Alert.alert('Flagged', `Shipment has been flagged for: ${reason}`);
        } catch { Alert.alert('Error', 'Failed to flag shipment'); }
    }, [shipment]);

    const handleStatusOverride = useCallback(() => {
        if (!shipment?._id || !statuses.length) {
            Alert.alert('Please Wait', 'Statuses are still loading...');
            return;
        }
        Alert.alert('Update Status', 'Select the new status:', [
            ...statuses.map(s => ({
                text: s.status,
                onPress: () => {
                    setUpdateNotes('');
                    setUpdateLocation('');
                    setUpdateModal({ visible: true, status: s });
                },
            })),
            { text: 'Cancel', style: 'cancel' as const },
        ]);
    }, [shipment, statuses]);

    const handleConfirmStatusUpdate = useCallback(async () => {
        if (!shipment?._id || !updateModal.status) return;
        setUpdating(true);
        try {
            const updated = await updateShipmentMasterStatus(
                shipment._id,
                updateModal.status._id,
                {
                    notes: updateNotes.trim() || undefined,
                    location: updateLocation.trim() || undefined,
                    timestamp: new Date().toISOString(),
                    imageUri: updateImageUri ?? undefined,
                }
            );
            setShipment(updated as IShipmentMaster);
            setUpdateModal({ visible: false, status: null });
            setUpdateImageUri(null);
            Alert.alert('Done', `Status updated to ${updateModal.status.status}`, [
                {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)/shipments'),
                }
            ]);
        } catch {
            Alert.alert('Error', 'Failed to update status. Please try again.');
        } finally {
            setUpdating(false);
        }
    }, [shipment, updateModal, updateNotes, updateLocation, updateImageUri]);

    const handleMarkReady = useCallback(async () => {
        if (!shipment?._id) return;
        const ready = statuses.find(s => s.status === 'Ready' || s.code === 'READY');
        if (!ready) {
            // Fallback: open the status picker so admin can pick whatever is closest
            handleStatusOverride();
            return;
        }
        setUpdateNotes('');
        setUpdateLocation('');
        setUpdateModal({ visible: true, status: ready });
    }, [shipment, statuses, handleStatusOverride]);

    if (loading) return (
        <View className="flex-1 bg-slate-50 items-center justify-center">
            <ActivityIndicator size="large" color="#F0782D" />
        </View>
    );

    if (!shipment) return (
        <View className="flex-1 bg-slate-50 items-center justify-center px-8">
            <Ionicons name="alert-circle-outline" size={40} color="#CBD5E1" />
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-500 mt-3">Not Found</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/shipments')} className="mt-4 bg-brand-orange px-6 py-2.5 rounded-xl">
                <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-white text-sm">Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    const sc = getStatus(shipment.status?.status ?? '');

    return (
        <View className="flex-1 bg-slate-50">

            {/* ── Status Update Modal ── */}
            <Modal
                visible={updateModal.visible}
                transparent
                animationType="slide"
                onRequestClose={() => setUpdateModal({ visible: false, status: null })}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={() => setUpdateModal({ visible: false, status: null })} />
                    <View className="bg-white rounded-t-3xl px-5 pt-5 pb-10">
                        {/* Handle */}
                        <View className="w-10 h-1 bg-slate-200 rounded-full self-center mb-5" />
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16 }} className="text-brand-secondary mb-1">
                            Update Status
                        </Text>
                        {updateModal.status && (
                            <View className="flex-row items-center gap-2 mb-5">
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13 }} className="text-slate-400">New status:</Text>
                                <View style={{ backgroundColor: getStatus(updateModal.status.status).bg }} className="px-2.5 py-1 rounded-full">
                                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: getStatus(updateModal.status.status).color }}>
                                        {updateModal.status.status}
                                    </Text>
                                </View>
                            </View>
                        )}
                        {/* Location */}
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-400 uppercase tracking-wider mb-1.5">Location</Text>
                        <TextInput
                            value={updateLocation}
                            onChangeText={setUpdateLocation}
                            placeholder="e.g. 234 Pineapple Street, Accra"
                            placeholderTextColor="#CBD5E1"
                            style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#1e4b69', marginBottom: 14 }}
                        />
                        {/* Notes */}
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-400 uppercase tracking-wider mb-1.5">Notes (optional)</Text>
                        <TextInput
                            value={updateNotes}
                            onChangeText={setUpdateNotes}
                            placeholder="e.g. Shipment may be delayed…"
                            placeholderTextColor="#CBD5E1"
                            multiline
                            numberOfLines={3}
                            style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#1e4b69', minHeight: 70, textAlignVertical: 'top', marginBottom: 14 }}
                        />
                        {/* Photo Attachment */}
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-400 uppercase tracking-wider mb-1.5">Photo (optional)</Text>
                        {updateImageUri ? (
                            <View className="relative mb-4">
                                <Image
                                    source={{ uri: updateImageUri }}
                                    style={{ width: '100%', height: 140, borderRadius: 12 }}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={() => setUpdateImageUri(null)}
                                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.55)', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name="close" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={pickUpdateImage}
                                style={{ borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                                <Ionicons name="camera-outline" size={20} color="#94A3B8" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#94A3B8' }}>Attach a photo</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={handleConfirmStatusUpdate}
                            disabled={updating}
                            className="bg-brand-orange py-4 rounded-xl items-center flex-row justify-center gap-2">
                            {updating ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-done" size={17} color="white" />
                                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15 }} className="text-white">Confirm Update</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ── Fullscreen Image Modal ── */}
            <Modal
                visible={!!selectedImage}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setSelectedImage(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity
                        onPress={() => setSelectedImage(null)}
                        style={{ position: 'absolute', top: 52, right: 20, zIndex: 10, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="close" size={22} color="white" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.72 }}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>

            {/* ── Compact Header ── */}
            <View className="bg-white border-b border-slate-100 px-5" style={{ paddingTop: 58, paddingBottom: 14 }}>
                {/* Nav */}
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={() => router.push('/(tabs)/shipments')}
                        className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center">
                        <Ionicons name="arrow-back" size={18} color="#1e4b69" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleStatusOverride}
                        className="h-9 px-4 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center flex-row gap-1.5">
                        <Ionicons name="swap-horizontal-outline" size={14} color="#1e4b69" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12 }} className="text-brand-secondary">Update Status</Text>
                    </TouchableOpacity>
                </View>

                {/* Identity */}
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-4">
                        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18 }} className="text-brand-secondary" numberOfLines={2}>
                            {shipment.name}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
                            <View style={{ backgroundColor: sc.bg }} className="px-2.5 py-1 rounded-full flex-row items-center gap-1">
                                <View style={{ backgroundColor: sc.color }} className="w-1.5 h-1.5 rounded-full" />
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: sc.color }}>
                                    {shipment.status?.status ?? 'Unknown'}
                                </Text>
                            </View>
                            <View className="bg-slate-100 px-2.5 py-1 rounded-full">
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-500">
                                    {shipment.shipmentType}
                                </Text>
                            </View>
                            {shipment.code && (
                                <View className="bg-slate-100 px-2.5 py-1 rounded-full">
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-500">
                                        #{shipment.code}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Mini stat */}
                    <View className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 items-center">
                        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 22 }} className="text-brand-secondary">
                            {shipment.shipments?.length ?? 0}
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400">pkgs</Text>
                    </View>
                </View>

                {/* Arrival chip */}
                {shipment.scheduleArrival && (
                    <View className="flex-row items-center gap-1.5 mt-3">
                        <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12 }} className="text-slate-400">
                            ETA <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary">
                                {fmtDate(shipment.scheduleArrival)}
                            </Text>
                        </Text>
                    </View>
                )}

                {/* Flag banner */}
                {flagged && (
                    <View className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 flex-row items-center gap-2">
                        <Ionicons name="flag" size={13} color="#EF4444" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12 }} className="text-red-600">
                            Flagged: {selectedFlag}
                        </Text>
                    </View>
                )}
            </View>

            {/* ── Tab Bar ── */}
            <View className="bg-white border-b border-slate-100 flex-row px-5 gap-0">
                {(['details', 'timeline', 'packages'] as Tab[]).map(t => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setTab(t)}
                        className="flex-1 py-3 items-center"
                        style={{ borderBottomWidth: 2, borderBottomColor: tab === t ? '#F0782D' : 'transparent' }}>
                        <Text style={{
                            fontFamily: tab === t ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                            fontSize: 13,
                            color: tab === t ? '#F0782D' : '#94A3B8',
                            textTransform: 'capitalize',
                        }}>
                            {t}{t === 'packages' && shipment.shipments?.length ? ` (${shipment.shipments.length})` : ''}
                            {t === 'timeline' && shipment.timeline?.length ? ` (${shipment.timeline.length})` : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Tab Content ── */}
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>

                {/* ── Details ── */}
                {tab === 'details' && (
                    <View className="gap-3">
                        <InfoCard label="Description" value={shipment.description || '—'} icon="document-text-outline" />
                        <InfoCard label="Notes" value={shipment.shipmentNote || '—'} icon="chatbubble-outline" />
                        <View className="flex-row gap-3">
                            <InfoCard2 label="Created" value={fmtDate(shipment.createdAt)} />
                            <InfoCard2 label="Updated" value={fmtDate(shipment.updatedAt)} />
                        </View>
                    </View>
                )}

                {/* ── Timeline ── */}
                {tab === 'timeline' && (
                    <View>
                        {!shipment.timeline?.length ? (
                            <EmptyState icon="time-outline" label="No timeline events yet." />
                        ) : (
                            [...shipment.timeline].reverse().map((step: any, idx: number) => {
                                const sc2 = getStatus(step.status);
                                const last = idx === (shipment.timeline!.length - 1);
                                return (
                                    <View key={idx} className="flex-row">
                                        <View className="items-center mr-3.5" style={{ width: 22 }}>
                                            <View style={{ backgroundColor: sc2.color }} className="w-5 h-5 rounded-full items-center justify-center">
                                                <Ionicons name="checkmark" size={11} color="white" />
                                            </View>
                                            {!last && <View style={{ flex: 1, width: 2, backgroundColor: sc2.color + '30', marginTop: 2 }} />}
                                        </View>
                                        <View className="flex-1 pb-5">
                                            <View className="flex-row items-center justify-between mb-1">
                                                <View style={{ backgroundColor: sc2.bg }} className="px-2.5 py-1 rounded-full">
                                                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: sc2.color }}>{step.status}</Text>
                                                </View>
                                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400">
                                                    {fmtDate(step.timestamp)}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center gap-1 mb-0.5">
                                                <Ionicons name="location-outline" size={11} color="#94A3B8" />
                                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12 }} className="text-slate-600">{step.location}</Text>
                                            </View>
                                            {step.notes && (
                                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400 leading-4 mb-1.5">{step.notes}</Text>
                                            )}
                                            {step.picture && (
                                                <TouchableOpacity
                                                    activeOpacity={0.9}
                                                    onPress={() => setSelectedImage(step.picture)}
                                                    className="mt-2 rounded-xl overflow-hidden">
                                                    <Image
                                                        source={{ uri: step.picture }}
                                                        style={{ width: '100%', height: 180 }}
                                                        resizeMode="cover"
                                                    />
                                                    <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                        <Ionicons name="expand-outline" size={12} color="white" />
                                                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: 'white' }}>Tap to expand</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}

                {/* ── Packages ── */}
                {tab === 'packages' && (
                    <View className="gap-2.5">
                        {!shipment.shipments?.length ? (
                            <EmptyState icon="cube-outline" label="No packages linked." />
                        ) : (
                            shipment.shipments.map((pkg: any, idx: number) => {
                                const ps = getStatus(pkg.status?.status ?? '');
                                return (
                                    <View key={pkg._id ?? idx} className="bg-white rounded-2xl border border-slate-100 p-4">
                                        <View className="flex-row items-center justify-between mb-1.5">
                                            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 13 }} className="text-brand-secondary">
                                                {pkg.code}
                                            </Text>
                                            <View style={{ backgroundColor: ps.bg }} className="px-2.5 py-1 rounded-full">
                                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: ps.color }}>
                                                    {pkg.status?.status ?? 'Unknown'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">
                                            {pkg.shipmentType} · {pkg.delivery ?? 'N/A'}
                                        </Text>
                                        {pkg.destinationAddress && (
                                            <View className="flex-row items-center gap-1 mt-1">
                                                <Ionicons name="location-outline" size={11} color="#CBD5E1" />
                                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400" numberOfLines={1}>
                                                    {pkg.destinationAddress}
                                                </Text>
                                            </View>
                                        )}
                                        {pkg.createdBy && (
                                            <View className="flex-row items-center gap-1 mt-0.5">
                                                <Ionicons name="person-outline" size={11} color="#CBD5E1" />
                                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">
                                                    {pkg.createdBy.firstname}{pkg.createdBy.lastname}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </View>
                )}
            </ScrollView>

            {/* ── Sticky Actions ── */}
            <View className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-slate-100 px-5 pt-3 pb-8 flex-row gap-3">
                <TouchableOpacity
                    onPress={handleMarkReady}
                    className="flex-1 bg-brand-orange py-3.5 rounded-xl flex-row items-center justify-center gap-2">
                    <Ionicons name="checkmark-done" size={17} color="white" />
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14 }} className="text-white">Mark Ready</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => Alert.alert('Flag Issue', 'Why are you flagging?',
                        FLAG_REASONS.map(r => ({ text: r, onPress: () => handleFlag(r) }))
                    )}
                    className="bg-slate-50 border border-slate-200 py-3.5 px-5 rounded-xl flex-row items-center gap-2">
                    <Ionicons name="flag-outline" size={17} color="#1e4b69" />
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14 }} className="text-brand-secondary">Flag</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Micro-components ────────────────────────────────────────────────────────

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View className="bg-white rounded-2xl border border-slate-100 p-4 flex-row items-start gap-3">
            <View className="w-8 h-8 bg-slate-50 rounded-lg items-center justify-center">
                <Ionicons name={icon as any} size={15} color="#94A3B8" />
            </View>
            <View className="flex-1">
                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-widest mb-0.5">{label}</Text>
                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13 }} className="text-slate-700 leading-5">{value}</Text>
            </View>
        </View>
    );
}

function InfoCard2({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-1 bg-white rounded-2xl border border-slate-100 p-4">
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-widest mb-1">{label}</Text>
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-slate-700">{value}</Text>
        </View>
    );
}

function EmptyState({ icon, label }: { icon: string; label: string }) {
    return (
        <View className="items-center py-14">
            <Ionicons name={icon as any} size={36} color="#E2E8F0" />
            <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-300 text-sm mt-2">{label}</Text>
        </View>
    );
}
