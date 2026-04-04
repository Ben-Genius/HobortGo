import { toast } from '@/src/utils/sonner';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getShipmentMasterByTrackingCode, updateShipmentMasterStatusByCode } from '../../../src/api/shipmentMaster';
import { getShipmentStatuses } from '../../../src/api/shipmentStatus';
import { IScannedShipment, IShipmentStatus } from '../../../src/types/shipment.types';

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View className="flex-row items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
        <Ionicons name={icon as any} size={15} color="#94A3B8" />
        <View className="flex-1">
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-0.5">
                {label}
            </Text>
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-brand-secondary dark:text-slate-100">
                {value || '—'}
            </Text>
        </View>
    </View>
);

export default function AdminShipmentMasterResultScreen() {
    const { trackingCode } = useLocalSearchParams<{ trackingCode: string }>();
    const router = useRouter();

    const [shipment, setShipment] = useState<IScannedShipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [statuses, setStatuses] = useState<IShipmentStatus[]>([]);
    const [selectedStatusCode, setSelectedStatusCode] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [masterRes, statusRes] = await Promise.all([
                    getShipmentMasterByTrackingCode(trackingCode),
                    getShipmentStatuses({ offset: 0, limit: 50 }),
                ]);

                const first = masterRes.shipments?.[0] ?? null;
                setShipment(first);

                const statusList: IShipmentStatus[] = statusRes?.data ?? statusRes ?? [];
                setStatuses(statusList);

                if (first?.status?.code) setSelectedStatusCode(first.status.code);
            } catch (error: any) {
                const raw = error?.response?.data;
                setFetchError(
                    raw?.message ||
                    (typeof raw === 'string' ? raw : null) ||
                    error?.message ||
                    'Could not retrieve shipment details.'
                );
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [trackingCode]);

    const handleSubmit = async () => {
        if (!selectedStatusCode) {
            setErrorMsg('Please select a status to update.');
            return;
        }
        setErrorMsg(null);
        setSubmitting(true);
        try {
            await updateShipmentMasterStatusByCode({ trackingCode, statusCode: selectedStatusCode });
            const newStatus = statuses.find(s => s.code === selectedStatusCode);
            // Update status in-place so the banner reflects the change immediately
            if (newStatus) {
                setShipment(prev => prev ? { ...prev, status: newStatus } : prev);
            }
            toast.success('Status updated', {
                description: `Set to ${newStatus?.status ?? selectedStatusCode}`,
            });
        } catch (error: any) {
            const raw = error?.response?.data?.message;
            setErrorMsg(
                Array.isArray(raw)
                    ? raw.join(' · ')
                    : raw ||
                    (typeof error?.response?.data === 'string' ? error.response.data : null) ||
                    error?.message ||
                    'Failed to update shipment status.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 items-center justify-center">
                <ActivityIndicator size="large" color="#F0782D" />
                <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 mt-3 text-sm">
                    Fetching Details...
                </Text>
            </SafeAreaView>
        );
    }

    // ── Not Found ─────────────────────────────────────────────────────────────
    if (!shipment) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 items-center justify-center px-8">
                <Ionicons name="alert-circle-outline" size={52} color="#CBD5E1" />
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary dark:text-white text-lg text-center mt-4">
                    Shipment Not Found
                </Text>
                {fetchError ? (
                    <View className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mt-3 w-full">
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#dc2626', textAlign: 'center' }}>
                            {fetchError}
                        </Text>
                    </View>
                ) : (
                    <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mt-2">
                        No shipment matched "{trackingCode || 'unknown'}".
                    </Text>
                )}
                <TouchableOpacity
                    className="mt-6 bg-brand-secondary rounded-lg py-4 w-full items-center"
                    onPress={() => router.back()}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white">Scan Again</Text>
                </TouchableOpacity>
                <TouchableOpacity className="mt-3" onPress={() => router.replace('/(tabs)')}>
                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#94A3B8' }}>Go to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const currentStatus = shipment.status?.status ?? '—';
    const createdByName = shipment.createdBy
        ? `${shipment.createdBy.firstname} ${shipment.createdBy.lastname}`.trim()
        : null;
    const isStatusChanged = selectedStatusCode && selectedStatusCode !== shipment.status?.code;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-2 mb-5">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg items-center justify-center border border-slate-100 dark:border-slate-700">
                    <Ionicons name="arrow-back-outline" size={20} color="#1e4b69" />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">
                    Update Shipment
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="px-5">
                    {/* Banner */}
                    <View style={{ backgroundColor: '#1e4b69', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
                        <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -30 }} />
                        <View style={{ position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 20 }} />

                        <View style={{ padding: 18, paddingBottom: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 }}>
                                        Shipment Code
                                    </Text>
                                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 20, color: 'white', letterSpacing: 0.5 }} numberOfLines={1}>
                                        {shipment.code}
                                    </Text>
                                </View>
                                <View style={{ backgroundColor: 'rgba(240,120,45,0.25)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(240,120,45,0.4)' }}>
                                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: '#f0782d' }}>{currentStatus}</Text>
                                </View>
                            </View>

                            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {shipment.shipmentType ? (
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Type</Text>
                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: 'white' }}>{shipment.shipmentType}</Text>
                                    </View>
                                ) : null}
                                {shipment.country ? (
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Country</Text>
                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: 'white' }}>{shipment.country}</Text>
                                    </View>
                                ) : null}
                                {shipment.items?.length > 0 ? (
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Items</Text>
                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: 'white' }}>{shipment.items.length}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        <View style={{ backgroundColor: 'rgba(0,0,0,0.25)', flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 10, gap: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Ionicons name={shipment.shipmentType === 'Air Freight' ? 'airplane-outline' : 'boat-outline'} size={12} color="rgba(255,255,255,0.55)" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{shipment.shipmentType}</Text>
                            </View>
                            {shipment.delivery ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Ionicons name="bicycle-outline" size={12} color="rgba(255,255,255,0.55)" />
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{shipment.delivery}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Info rows */}
                    <View className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 mb-5">
                        {shipment.destinationAddress ? (
                            <InfoRow icon="location-outline" label="Destination" value={shipment.destinationAddress} />
                        ) : null}
                        {createdByName ? (
                            <InfoRow icon="person-outline" label="Created By" value={createdByName} />
                        ) : null}
                        {shipment.status?.description ? (
                            <InfoRow icon="information-circle-outline" label="Status Description" value={shipment.status.description} />
                        ) : null}
                    </View>

                    {/* Items list */}
                    {shipment.items?.length > 0 ? (
                        <>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary dark:text-white text-base mb-3">
                                Package Items ({shipment.items.length})
                            </Text>
                            <View className="mb-5 gap-2">
                                {shipment.items.map((item, i) => (
                                    <View key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-brand-secondary dark:text-slate-100 flex-1 mr-2">
                                                {item.name}
                                            </Text>
                                            <View className="bg-brand-orange/10 px-2 py-0.5 rounded">
                                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10 }} className="text-brand-orange">
                                                    x{item.quantity}
                                                </Text>
                                            </View>
                                        </View>
                                        {item.description ? (
                                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12 }} className="text-slate-400 mb-2">
                                                {item.description}
                                            </Text>
                                        ) : null}
                                        <View className="flex-row gap-3 flex-wrap">
                                            <View className="flex-row items-center gap-1">
                                                <Ionicons name="scale-outline" size={11} color="#94A3B8" />
                                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-400">{item.weight} kg</Text>
                                            </View>
                                            {item.trackingCode ? (
                                                <View className="flex-row items-center gap-1">
                                                    <Ionicons name="barcode-outline" size={11} color="#94A3B8" />
                                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-400">{item.trackingCode}</Text>
                                                </View>
                                            ) : null}
                                            {item.dimension ? (
                                                <View className="flex-row items-center gap-1">
                                                    <Ionicons name="cube-outline" size={11} color="#94A3B8" />
                                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-400">
                                                        {item.dimension.length}×{item.dimension.width}×{item.dimension.height} cm
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : null}

                    {/* Status update */}
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary dark:text-white text-base mb-3">
                        Update Status
                    </Text>

                    {statuses.length === 0 ? (
                        <View className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-4 items-center mb-6">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#94A3B8' }}>No statuses available</Text>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap gap-2 mb-5">
                            {statuses.map((opt) => {
                                const isSelected = selectedStatusCode === opt.code;
                                return (
                                    <TouchableOpacity
                                        key={opt._id}
                                        onPress={() => setSelectedStatusCode(opt.code)}
                                        style={{
                                            backgroundColor: isSelected ? '#1e4b69' : '#f1f5f9',
                                            borderWidth: 1,
                                            borderColor: isSelected ? '#1e4b69' : '#e2e8f0',
                                        }}
                                        className="rounded-full px-4 py-2 flex-row items-center gap-1.5">
                                        {isSelected && <Ionicons name="checkmark-circle" size={13} color="white" />}
                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: isSelected ? 'white' : '#64748b' }}>
                                            {opt.status}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Change indicator */}
                    {isStatusChanged ? (
                        <View className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 mb-4 flex-row items-center gap-3">
                            <Ionicons name="swap-horizontal-outline" size={16} color="#f0782d" />
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: '#92400e', flex: 1 }}>
                                {'Status will change from '}
                                <Text style={{ fontFamily: 'Manrope_700Bold' }}>{currentStatus}</Text>
                                {' → '}
                                <Text style={{ fontFamily: 'Manrope_700Bold' }}>
                                    {statuses.find(s => s.code === selectedStatusCode)?.status ?? selectedStatusCode}
                                </Text>
                            </Text>
                        </View>
                    ) : null}
                </View>
            </ScrollView>

            {/* Bottom action bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-5 pt-3 pb-4">
                {errorMsg ? (
                    <View className="flex-row items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-3">
                        <Ionicons name="alert-circle-outline" size={16} color="#dc2626" style={{ marginTop: 1 }} />
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#dc2626', flex: 1, lineHeight: 18 }}>
                            {errorMsg}
                        </Text>
                        <TouchableOpacity onPress={() => setErrorMsg(null)} hitSlop={8}>
                            <Ionicons name="close" size={16} color="#dc2626" />
                        </TouchableOpacity>
                    </View>
                ) : null}
                <TouchableOpacity
                    className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${submitting || !selectedStatusCode || !isStatusChanged ? 'bg-brand-orange/50' : 'bg-brand-orange'}`}
                    onPress={handleSubmit}
                    disabled={submitting || !selectedStatusCode || !isStatusChanged}>
                    {submitting
                        ? <ActivityIndicator size="small" color="white" />
                        : <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                    }
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white">
                        {submitting ? 'Updating...' : 'Confirm Status Change'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
