import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getShipmentStatuses } from '../../src/api/shipmentStatus';
import { getShipmentMasterByTrackingCode, updateShipmentMasterStatusByCode } from '../../src/api/shipmentMaster';
import { IShipmentMaster, IShipmentStatus } from '../../src/types/shipment.types';

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View className="flex-row items-center gap-3 py-3 border-b border-slate-50">
        <Ionicons name={icon as any} size={15} color="#94A3B8" />
        <View className="flex-1">
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-0.5">
                {label}
            </Text>
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-brand-secondary">
                {value || '—'}
            </Text>
        </View>
    </View>
);


export default function ShipmentMasterResultScreen() {
    const { trackingCode } = useLocalSearchParams<{ trackingCode: string }>();
    const router = useRouter();

    const [shipmentMaster, setShipmentMaster] = useState<IShipmentMaster | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [statuses, setStatuses] = useState<IShipmentStatus[]>([]);
    const [selectedStatusCode, setSelectedStatusCode] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const toastOpacity = useRef(new Animated.Value(0)).current;
    const showToast = useCallback(() => {
        setTimeout(() => {
            Animated.sequence([
                Animated.timing(toastOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
                Animated.delay(2000),
                Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]);
            setTimeout(() => router.replace('/(tabs-delivery)' as any), 500);
        }, 300);
    }, [toastOpacity, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [masterRes, statusRes] = await Promise.all([
                    getShipmentMasterByTrackingCode(trackingCode),
                    getShipmentStatuses({ offset: 0, limit: 50 }),
                ]);

                // Response returns data as an array — take the first item
                const rawData = (masterRes as any).data ?? masterRes;
                const master = Array.isArray(rawData) ? rawData[0] : rawData;
                setShipmentMaster(master);

                const statusList: IShipmentStatus[] = statusRes?.data ?? statusRes ?? [];
                setStatuses(statusList);

                // Pre-select current status
                const currentCode = (master.status as IShipmentStatus)?.code ?? '';
                if (currentCode) setSelectedStatusCode(currentCode);
            } catch (error: any) {
                const raw = error?.response?.data;
                const msg =
                    raw?.message ||
                    (typeof raw === 'string' ? raw : null) ||
                    error?.message ||
                    'Could not retrieve shipment details.';
                setFetchError(msg);
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
            showToast();
        } catch (error: any) {
            const raw = error?.response?.data?.message;
            const serverMsg = Array.isArray(raw)
                ? raw.join(' · ')
                : raw ||
                (typeof error?.response?.data === 'string' ? error.response.data : null) ||
                error?.message ||
                'Failed to update shipment status.';
            setErrorMsg(serverMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#F0782D" />
                <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 mt-3 text-sm">
                    Fetching Details...
                </Text>
            </SafeAreaView>
        );
    }

    // ── Not Found ──────────────────────────────────────────────────────────────
    if (!shipmentMaster) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <Ionicons name="alert-circle-outline" size={52} color="#CBD5E1" />
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg text-center mt-4">
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
                <TouchableOpacity className="mt-3" onPress={() => router.replace('/(tabs-delivery)' as any)}>
                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#94A3B8' }}>Go to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const sm = shipmentMaster as any;
    const currentStatus = (sm.status as IShipmentStatus)?.status ?? '—';
    const createdByName = sm.createdBy ? `${sm.createdBy.firstname ?? ''} ${sm.createdBy.lastname ?? ''}`.trim() : null;

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-2 mb-5">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-slate-50 rounded-lg items-center justify-center border border-slate-100">
                    <Ionicons name="arrow-back-outline" size={20} color="#1e4b69" />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">
                    Update Shipment
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="px-5">
                    {/* Context Card */}
                    <View style={{ backgroundColor: '#1e4b69', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
                        <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -30 }} />
                        <View style={{ position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 20 }} />

                        <View style={{ padding: 18, paddingBottom: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 }}>Tracking Code</Text>
                                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 22, color: 'white', letterSpacing: 0.5 }}>{sm.code || trackingCode}</Text>
                                </View>
                                <View style={{ backgroundColor: 'rgba(240,120,45,0.25)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(240,120,45,0.4)' }}>
                                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: '#f0782d' }}>{currentStatus}</Text>
                                </View>
                            </View>

                            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {createdByName ? (
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Owner</Text>
                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: 'white' }} numberOfLines={1}>{createdByName}</Text>
                                    </View>
                                ) : null}
                                {sm.country ? (
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Country</Text>
                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: 'white' }} numberOfLines={1}>{sm.country}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        <View style={{ backgroundColor: 'rgba(0,0,0,0.25)', flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 10, gap: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Ionicons name="layers-outline" size={12} color="rgba(255,255,255,0.55)" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{sm.shipmentType || 'N/A'}</Text>
                            </View>
                            {sm.delivery ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Ionicons name="bicycle-outline" size={12} color="rgba(255,255,255,0.55)" />
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{sm.delivery}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Info rows */}
                    <View className="bg-slate-50 rounded-xl px-4 mb-6">
                        {sm.destinationAddress ? (
                            <InfoRow icon="location-outline" label="Destination" value={sm.destinationAddress} />
                        ) : null}
                        {createdByName ? (
                            <InfoRow icon="person-outline" label="Created By" value={createdByName} />
                        ) : null}
                    </View>

                    {/* Status update */}
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                        Update Status
                    </Text>

                    {statuses.length === 0 ? (
                        <View className="bg-slate-50 rounded-lg px-4 py-4 items-center mb-6">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#94A3B8' }}>
                                No statuses available
                            </Text>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap gap-2 mb-6">
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
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={13} color="white" />
                                        )}
                                        <Text
                                            style={{
                                                fontFamily: 'Manrope_600SemiBold',
                                                fontSize: 12,
                                                color: isSelected ? 'white' : '#64748b',
                                            }}>
                                            {opt.status}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Current vs new indicator */}
                    {selectedStatusCode && selectedStatusCode !== (sm.status as IShipmentStatus)?.code && (
                        <View className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 mb-4 flex-row items-center gap-3">
                            <Ionicons name="swap-horizontal-outline" size={16} color="#f0782d" />
                            <View className="flex-1">
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: '#92400e' }}>
                                    Status will change from{' '}
                                    <Text style={{ fontFamily: 'Manrope_700Bold' }}>{currentStatus}</Text>
                                    {' → '}
                                    <Text style={{ fontFamily: 'Manrope_700Bold' }}>
                                        {statuses.find(s => s.code === selectedStatusCode)?.status ?? selectedStatusCode}
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom action bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-3 pb-4">
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
                    className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${submitting || !selectedStatusCode ? 'bg-brand-orange/60' : 'bg-brand-orange'
                        }`}
                    onPress={handleSubmit}
                    disabled={submitting || !selectedStatusCode}>
                    {submitting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                    )}
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white">
                        {submitting ? 'Updating...' : 'Confirm Status Change'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── Success Toast ── */}
            <Animated.View pointerEvents="none" style={{ position: 'absolute', bottom: 100, left: 20, right: 20, opacity: toastOpacity, zIndex: 99 }}>
                <View style={{ backgroundColor: '#1a2e3b', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="checkmark" size={18} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: 'white' }}>Shipment updated</Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                            Status set to <Text style={{ fontFamily: 'Manrope_600SemiBold', color: '#4ade80' }}>
                                {statuses.find(s => s.code === selectedStatusCode)?.status ?? selectedStatusCode}
                            </Text>
                        </Text>
                    </View>
                    <Ionicons name="checkmark-done-outline" size={16} color="#4ade80" />
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}
