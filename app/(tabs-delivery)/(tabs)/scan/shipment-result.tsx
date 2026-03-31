import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getShipmentStatusList } from '../../../../src/api/shipment';
import { getShipmentMasterByTrackingCode, updateShipmentMasterStatusByCode } from '../../../../src/api/shipmentMaster';
import { IShipmentMaster, IShipmentStatus } from '../../../../src/types/shipment.types';

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

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [masterRes, statusRes] = await Promise.all([
                    getShipmentMasterByTrackingCode(trackingCode),
                    getShipmentStatusList({ offset: 0, limit: 50 }),
                ]);

                const master = (masterRes as any).data ?? masterRes;
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
            Alert.alert('Success!', 'Shipment status updated successfully.', [
                { text: 'Done', onPress: () => router.replace('/(tabs-delivery)') },
            ]);
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
                <TouchableOpacity className="mt-3" onPress={() => router.replace('/(tabs-delivery)')}>
                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#94A3B8' }}>Go to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const currentStatus = (shipmentMaster.status as IShipmentStatus)?.status ?? '—';
    const shipmentCount = shipmentMaster.shipments?.length ?? 0;

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
                    {/* Banner */}
                    <View className="bg-brand-secondary rounded-xl p-5 overflow-hidden mb-6">
                        <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                        <View className="absolute -right-2 -bottom-6 w-20 h-20 bg-white/5 rounded-full" />
                        <View className="flex-row items-center gap-4">
                            <View className="bg-white/20 p-3 rounded-xl">
                                <Ionicons
                                    name={shipmentMaster.shipmentType === 'Air Freight' ? 'airplane-outline' : 'boat-outline'}
                                    size={32}
                                    color="white"
                                />
                            </View>
                            <View className="flex-1">
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-white/60 uppercase tracking-widest mb-0.5">
                                    {shipmentMaster.shipmentType}
                                </Text>
                                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18 }} className="text-white" numberOfLines={1}>
                                    {shipmentMaster.name}
                                </Text>
                                {shipmentMaster.code ? (
                                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11 }} className="text-white/70 mt-0.5">
                                        Code: {shipmentMaster.code}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        {/* Stats row */}
                        <View className="flex-row gap-3 mt-4">
                            <View className="flex-1 bg-white/10 rounded-lg px-3 py-2.5">
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-white/60 uppercase mb-0.5">
                                    Packages
                                </Text>
                                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 16 }} className="text-white">
                                    {shipmentCount}
                                </Text>
                            </View>
                            <View className="flex-1 bg-white/10 rounded-lg px-3 py-2.5">
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-white/60 uppercase mb-0.5">
                                    Status
                                </Text>
                                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12 }} className="text-white" numberOfLines={1}>
                                    {currentStatus}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Info rows */}
                    <View className="bg-slate-50 rounded-xl px-4 mb-6">
                        <InfoRow
                            icon="calendar-outline"
                            label="Scheduled Arrival"
                            value={fmtDate(shipmentMaster.scheduleArrival)}
                        />
                        {shipmentMaster.description ? (
                            <InfoRow icon="document-text-outline" label="Description" value={shipmentMaster.description} />
                        ) : null}
                        {shipmentMaster.shipmentNote ? (
                            <InfoRow icon="chatbubble-outline" label="Notes" value={shipmentMaster.shipmentNote} />
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
                    {selectedStatusCode && selectedStatusCode !== (shipmentMaster.status as IShipmentStatus)?.code && (
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
                    className={`rounded-lg py-4 items-center flex-row justify-center gap-2 ${
                        submitting || !selectedStatusCode ? 'bg-brand-orange/60' : 'bg-brand-orange'
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
        </SafeAreaView>
    );
}
