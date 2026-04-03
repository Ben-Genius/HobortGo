import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDeliveries } from '../../../src/api/delivery';
import { toast } from '@/src/utils/sonner';

const DELIVERY_FILTERS = ['All', 'Pending', 'Scheduled', 'In-transit', 'Delivered', 'Failed'] as const;
type DeliveryFilter = typeof DELIVERY_FILTERS[number];

const ACTIONABLE_STATUSES = ['Pending', 'Scheduled', 'In-transit', 'In Transit', 'Out for Delivery'];

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any }> = {
    'Pending': { bg: '#fff0e6', text: '#f0782d', icon: 'time-outline' },
    'In-transit': { bg: '#f3f0ff', text: '#7c3aed', icon: 'bicycle-outline' },
    'In Transit': { bg: '#f3f0ff', text: '#7c3aed', icon: 'bicycle-outline' },
    'Out for Delivery': { bg: '#f3f0ff', text: '#7c3aed', icon: 'bicycle-outline' },
    'Scheduled': { bg: '#fef9c3', text: '#a16207', icon: 'calendar-outline' },
    'Delivered': { bg: '#dcfce7', text: '#16a34a', icon: 'checkmark-circle-outline' },
    'Confiscated': { bg: '#fee2e2', text: '#dc2626', icon: 'alert-circle-outline' },
    'Received': { bg: '#e0f2fe', text: '#0369a1', icon: 'archive-outline' },
    'ReceivedGH': { bg: '#e0f2fe', text: '#0369a1', icon: 'archive-outline' },
    'Failed': { bg: '#fef2f2', text: '#dc2626', icon: 'close-circle-outline' },
};

/** Resolve the display name of the recipient from the real API shape */
function getRecipientName(item: any): string | null {
    const rb = item.receivedBy;
    if (!rb) return null;
    const first = rb.firstname?.trim() ?? '';
    const last = rb.lastname?.trim() ?? '';
    return [first, last].filter(Boolean).join(' ') || rb.email || null;
}

/** Resolve the courier name from either an object or a plain string */
function getCourierName(item: any): string | null {
    const db = item.deliveredBy;
    if (!db) return null;
    if (typeof db === 'string') return db;
    const first = db.firstname?.trim() ?? '';
    const last = db.lastname?.trim() ?? '';
    return [first, last].filter(Boolean).join(' ') || db.email || null;
}

export default function AdminDeliveriesScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<DeliveryFilter>('All');
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const response = await getDeliveries({ offset: 0, limit: 100 });
            setDeliveries(response.data);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            toast.error('Fetch Failed', {
                description: 'Could not retrieve deliveries. Please try again.',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchData();
    }, []));

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Real status lives on item.statusId.status, fallback to shipment status
    const getStatus = (d: any): string => d.statusId?.status ?? d.shipmentId?.status?.status ?? 'Pending';

    const filtered = activeFilter === 'All'
        ? deliveries
        : deliveries.filter(d => getStatus(d) === activeFilter);

    const STAT_OVERVIEW = [
        { label: 'Pending', count: deliveries.filter(d => getStatus(d) === 'Pending').length, color: '#92400e', bg: '#fef3c7' },
        { label: 'Scheduled', count: deliveries.filter(d => getStatus(d) === 'Scheduled').length, color: '#1e4b69', bg: '#e6f0f5' },
        { label: 'In-transit', count: deliveries.filter(d => getStatus(d) === 'In-transit').length, color: '#f0782d', bg: '#fff0e6' },
        { label: 'Delivered', count: deliveries.filter(d => getStatus(d) === 'Delivered').length, color: '#16a34a', bg: '#f0fdf4' },
    ];

    const renderItem = ({ item }: { item: any }) => {
        const shipment = item.shipmentId || {};
        const statusLabel = getStatus(item);
        const cfg = STATUS_CONFIG[statusLabel] ?? STATUS_CONFIG.Pending;

        // courier resolved from deliveredBy object or string
        const courierName = getCourierName(item);
        // recipient resolved from receivedBy object
        const recipientName = getRecipientName(item);

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/(tabs)/deliveries/${item._id}` as any)}
                className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-100">
                {/* Header row: tracking ID + status badge */}
                <View className="flex-row justify-between items-center mb-3">
                    <View>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                            {shipment.code || 'N/A'}
                        </Text>
                        {shipment.shipmentType ? (
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400 mt-0.5">
                                {shipment.shipmentType}
                            </Text>
                        ) : null}
                    </View>
                    <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1 rounded-full flex-row items-center gap-1.5">
                        <Ionicons name={cfg.icon} size={11} color={cfg.text} />
                        <Text style={{ color: cfg.text, fontFamily: 'Manrope_600SemiBold', fontSize: 10 }}>
                            {statusLabel}
                        </Text>
                    </View>
                </View>

                {/* Recipient + time */}
                <View className="flex-row gap-4 mb-3">
                    <View className="flex-1 flex-row items-center gap-2">
                        <Ionicons name="person-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-secondary text-sm flex-1" numberOfLines={1}>
                            {recipientName ?? `${item.receiveType} recipient`}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                        <Ionicons name="time-outline" size={12} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>

                {/* Address */}
                <View className="flex-row items-start gap-2 mb-3">
                    <Ionicons name="location-outline" size={13} color="#94A3B8" style={{ marginTop: 1 }} />
                    <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs flex-1" numberOfLines={2}>
                        {[item.address, item.landmark].filter(Boolean).join(' — ') || 'No address'}
                        {item.digitalAddress ? `  ·  ${item.digitalAddress}` : ''}
                    </Text>
                </View>

                {/* Courier */}
                {courierName ? (
                    <View className="flex-row items-center gap-2 mb-3">
                        <View className="w-6 h-6 bg-brand-secondary rounded-full items-center justify-center">
                            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 9 }} className="text-white">
                                {courierName?.charAt?.(0) || '?'}
                            </Text>
                        </View>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-brand-secondary">
                            {courierName}
                        </Text>
                    </View>
                ) : null}

                {/* Notes pill */}
                {item.notes ? (
                    <View className="bg-slate-100 rounded-lg px-3 py-2 mb-3">
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-500" numberOfLines={2}>
                            {item.notes}
                        </Text>
                    </View>
                ) : null}

                {/* Delivered confirmation */}
                {statusLabel === 'Delivered' && (
                    <View className="bg-green-50 border border-green-100 rounded-lg p-3 flex-row items-center gap-2">
                        <Ionicons name="checkmark-circle-outline" size={16} color="#16A34A" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12 }} className="text-green-700">
                            Delivered at {new Date(item.updatedAt).toLocaleTimeString()}
                        </Text>
                    </View>
                )}

                {/* Update Status CTA — only for actionable statuses */}
                {ACTIONABLE_STATUSES.includes(statusLabel) && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push(`/(tabs)/deliveries/${item._id}/update` as any)}
                        className="mt-3 bg-brand-orange rounded-lg py-2.5 flex-row items-center justify-center gap-2">
                        <Ionicons name="checkmark-circle-outline" size={15} color="white" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12 }} className="text-white">
                            Update Status
                        </Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="pt-6 pb-4 px-5">
                <View className="flex-row justify-between items-center mb-5">
                    <View>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">
                            Operations
                        </Text>
                        <Text style={{ fontFamily: 'Poppins_600' }} className="text-brand-secondary text-lg mt-1">
                            Deliver<Text className="text-brand-orange">ies</Text>
                        </Text>
                    </View>
                </View>

                {/* Stat overview cards */}
                <View className="flex-row flex-wrap mb-5" style={{ gap: 8 }}>
                    {STAT_OVERVIEW.map(s => (
                        <View
                            key={s.label}
                            style={{ backgroundColor: s.bg, width: '48.5%' }}
                            className="rounded-lg px-4 py-3 overflow-hidden">
                            <View
                                style={{ backgroundColor: s.color, opacity: 0.1, position: 'absolute', top: -16, right: -18 }}
                                className="w-24 h-24 rounded-full"
                            />
                            <Text style={{ color: s.color, fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="uppercase tracking-widest mb-1">
                                {s.label}
                            </Text>
                            <Text style={{ color: s.color, fontFamily: 'Poppins_700Bold', fontSize: 26 }}>
                                {s.count}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Filter tabs */}
                <FlatList
                    data={DELIVERY_FILTERS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setActiveFilter(item)}
                            className={`px-4 py-2 rounded-lg mr-2 border ${activeFilter === item
                                ? 'bg-brand-secondary border-brand-secondary'
                                : 'bg-white border-slate-100'
                                }`}>
                            <Text style={{
                                fontFamily: 'Manrope_600SemiBold',
                                fontSize: 11,
                                color: activeFilter === item ? 'white' : '#94A3B8',
                            }}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View className="flex-row justify-between items-center px-5 mb-2 mt-1">
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                    {filtered.length} {activeFilter === 'All' ? 'Deliveries' : activeFilter}
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#F0782D" />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F0782D']} />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-16 px-12">
                            <Image
                                source={require('../../../assets/images/illustrations/delivery_rider.webp')}
                                style={{ width: 120, height: 100, marginBottom: 12 }}
                                resizeMode="contain"
                            />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg text-center">
                                Dispatch Is Clear
                            </Text>
                            <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mt-2">
                                No deliveries found in this category.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
