import { getDeliveryById } from '@/src/api/delivery';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    'Pending': { bg: '#fef3c7', text: '#92400e', dot: '#d97706' },
    'Scheduled': { bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69' },
    'Assigned': { bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69' },
    'Out': { bg: '#fff0e6', text: '#f0782d', dot: '#f0782d' },
    'Delivered': { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
    'Failed': { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626' },
};

const ACTIONABLE = ['Pending', 'Scheduled', 'Assigned', 'Out', 'In Transit'];

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const InfoRow = ({ label, value, last = false }: { label: string; value?: string | null; last?: boolean }) => {
    if (!value) return null;
    return (
        <View className={`flex-row justify-between items-start px-4 py-3 ${!last ? 'border-b border-slate-50' : ''}`}>
            <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs flex-shrink-0 mr-3">
                {label}
            </Text>
            <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm text-right flex-1" numberOfLines={2}>
                {value}
            </Text>
        </View>
    );
};

const SectionCard = ({ icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <View className="mb-4">
        <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name={icon} size={14} color="#1e4b69" />
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-sm">{title}</Text>
        </View>
        <View className="bg-white rounded-xl border border-slate-100 overflow-hidden">{children}</View>
    </View>
);

export default function DeliveryDetailScreen() {
    const { id, data: dataParam } = useLocalSearchParams<{ id: string; data?: string }>();
    const router = useRouter();

    const [delivery, setDelivery] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!id) return;
        try {
            const res = await getDeliveryById(id as string);
            setDelivery(res.data || res);
        } catch {
            setError('Failed to load delivery details.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setError(null);
        if (dataParam && !refreshing) {
            try {
                const parsed = JSON.parse(dataParam);
                setDelivery(parsed.data || parsed);
                setLoading(false);
                return;
            } catch { /* fall through */ }
        }
        fetchData();
    }, [id, dataParam]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#F0782D" />
                <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 mt-3 text-sm">Loading details...</Text>
            </SafeAreaView>
        );
    }

    if (error || !delivery) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <Ionicons name="alert-circle-outline" size={52} color="#CBD5E1" />
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg text-center mt-4">
                    Delivery Not Found
                </Text>
                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mt-2">
                    {error ?? 'This delivery could not be loaded.'}
                </Text>
                <TouchableOpacity className="mt-6 bg-brand-secondary px-6 py-3 rounded-lg" onPress={() => router.back()}>
                    <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-white">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const statusLabel = delivery.statusId?.status || 'Pending';
    const cfg = STATUS_CONFIG[statusLabel] ?? STATUS_CONFIG['Pending'];
    const shipment = delivery.shipmentId || {};
    const canComplete = ACTIONABLE.includes(statusLabel);

    const receiverName = [delivery.receivedBy?.firstname?.trim(), delivery.receivedBy?.lastname?.trim()]
        .filter(Boolean).join(' ') || null;
    const phone = delivery.receivedBy?.phoneNumber || delivery.phoneNumber || null;
    const email = delivery.receivedBy?.email || delivery.email || null;
    const photos = (delivery.media ?? []).filter((m: any) => m.type === 'image');
    const signature = (delivery.media ?? []).find((m: any) => m.type === 'signature');

    return (
        <SafeAreaView className="flex-1 bg-[#F8F9FB]" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center px-5 pt-4 pb-3 bg-white border-b border-slate-100">
                <TouchableOpacity
                    className="w-9 h-9 bg-slate-100 rounded-lg items-center justify-center mr-3"
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={18} color="#1e4b69" />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base flex-1">
                    Delivery Details
                </Text>
                <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.dot }} />
                    <Text style={{ fontFamily: 'Manrope_700Bold', color: cfg.text, fontSize: 11 }}>{statusLabel}</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: canComplete ? 140 : 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#F0782D"
                        colors={['#F0782D']}
                    />
                }
            >
                {/* Hero card */}
                <View className="bg-white rounded-xl border border-slate-100 p-5 mb-4">
                    <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest mb-1">
                        Shipment Code
                    </Text>
                    <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-brand-secondary text-2xl mb-1">
                        {shipment.code || '—'}
                    </Text>
                    {shipment.trackingId && (
                        <View className="flex-row items-center gap-1.5">
                            <Ionicons name="barcode-outline" size={13} color="#94A3B8" />
                            <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs">
                                Tracking:{' '}
                                <Text style={{ fontFamily: 'Manrope_700Bold' }} className="text-brand-secondary">
                                    {shipment.trackingId}
                                </Text>
                            </Text>
                        </View>
                    )}
                    <View className="flex-row flex-wrap gap-2 mt-4">
                        {shipment.shipmentType && (
                            <View className="flex-row items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                                <Ionicons name={shipment.shipmentType === 'Air Freight' ? 'airplane-outline' : 'boat-outline'} size={12} color="#1e4b69" />
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11 }} className="text-brand-secondary">{shipment.shipmentType}</Text>
                            </View>
                        )}
                        {delivery.timestamp && (
                            <View className="flex-row items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                                <Ionicons name="calendar-outline" size={12} color="#1e4b69" />
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11 }} className="text-brand-secondary">{fmtDate(delivery.timestamp)}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <SectionCard icon="location-outline" title="Address">
                    <InfoRow label="Address" value={delivery.address} />
                    <InfoRow label="Digital Address" value={delivery.digitalAddress} />
                    <InfoRow label="Landmark" value={delivery.landmark} last={!delivery.location} />
                    {delivery.location?.includes(',') && <InfoRow label="Coordinates" value={delivery.location} last />}
                </SectionCard>

                {(receiverName || phone || email || delivery.idType) && (
                    <SectionCard icon="person-outline" title="Receiver">
                        <InfoRow label="Name" value={receiverName} />
                        <InfoRow label="Phone" value={phone} />
                        <InfoRow label="Email" value={email} />
                        <InfoRow label="ID Type" value={delivery.idType} />
                        <InfoRow label="ID Number" value={delivery.idNumber} last />
                    </SectionCard>
                )}

                {delivery.notes && (
                    <View className="mb-4">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Ionicons name="document-text-outline" size={14} color="#1e4b69" />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-sm">Notes</Text>
                        </View>
                        <View className="bg-white rounded-xl border border-slate-100 px-4 py-3">
                            <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-600 text-sm leading-5">{delivery.notes}</Text>
                        </View>
                    </View>
                )}

                {(signature || photos.length > 0) && (
                    <View className="mb-4">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Ionicons name="images-outline" size={14} color="#1e4b69" />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-sm">Proof of Delivery</Text>
                        </View>
                        <View className="flex-row gap-3 flex-wrap">
                            {signature && (
                                <View className="items-center">
                                    <View className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                                        <Image source={{ uri: signature.fileUrl }} style={{ width: 140, height: 100 }} resizeMode="contain" />
                                    </View>
                                    <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs mt-1.5">Signature</Text>
                                </View>
                            )}
                            {photos.map((p: any) => (
                                <View key={p._id} className="items-center">
                                    <View className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                                        <Image source={{ uri: p.fileUrl }} style={{ width: 140, height: 100 }} resizeMode="cover" />
                                    </View>
                                    <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs mt-1.5">Photo</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <SectionCard icon="time-outline" title="Timeline">
                    <InfoRow label="Created" value={`${fmtDate(delivery.createdAt)}  ${fmtTime(delivery.createdAt)}`} />
                    <InfoRow label="Updated" value={`${fmtDate(delivery.updatedAt)}  ${fmtTime(delivery.updatedAt)}`} last />
                </SectionCard>
            </ScrollView>

            {/* Sticky action bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-3 pb-8">
                <View className="flex-row gap-3 mb-3">
                    <TouchableOpacity
                        className="flex-1 bg-brand-secondary py-3.5 rounded-lg flex-row items-center justify-center gap-2"
                        activeOpacity={0.85}
                        onPress={() => {
                            const addr = delivery.address || '';
                            Linking.openURL(`maps://app?daddr=${encodeURIComponent(addr)}`).catch(() =>
                                Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(addr)}`)
                            );
                        }}
                    >
                        <Ionicons name="navigate-outline" size={16} color="white" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-white text-sm">Navigate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 border border-slate-200 bg-white py-3.5 rounded-lg flex-row items-center justify-center gap-2"
                        activeOpacity={0.85}
                        onPress={() => { if (phone) Linking.openURL(`tel:${phone}`); }}
                        disabled={!phone}
                        style={{ opacity: phone ? 1 : 0.4 }}
                    >
                        <Ionicons name="call-outline" size={16} color="#1e4b69" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm">Call</Text>
                    </TouchableOpacity>
                </View>
                {/* {canComplete && ( */}
                <TouchableOpacity
                    className="bg-brand-orange py-4 rounded-lg flex-row items-center justify-center gap-2"
                    activeOpacity={0.85}
                    onPress={() => router.push({
                        pathname: '/(tabs-delivery)/scan-result' as any,
                        params: { deliveryId: id },
                    })}
                >
                    <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-base">Complete Delivery</Text>
                </TouchableOpacity>
                {/* )} */}
            </View>
        </SafeAreaView>
    );
}
