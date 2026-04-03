import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDeliveries } from '../../../../src/api/delivery';

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    'Pending':   { bg: '#fef3c7', text: '#92400e', dot: '#d97706' },
    'Scheduled': { bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69' },
    'Assigned':  { bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69' },
    'Out':       { bg: '#fff0e6', text: '#f0782d', dot: '#f0782d' },
    'Delivered': { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
    'Failed':    { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626' },
};

const FILTERS = ['All', 'Delivered', 'Pending', 'Scheduled', 'Failed'] as const;
type Filter = typeof FILTERS[number];

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function DeliveryPersonCompletedScreen() {
    const router = useRouter();
    const [deliveries, setDeliveries]   = useState<any[]>([]);
    const [loading, setLoading]         = useState(true);
    const [refreshing, setRefreshing]   = useState(false);
    const [filter, setFilter]           = useState<Filter>('All');

    const fetchData = async () => {
        try {
            const response = await getDeliveries({ offset: 0, limit: 100 });
            setDeliveries(response.data);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const filtered = filter === 'All'
        ? deliveries
        : deliveries.filter(d => (d.statusId?.status || 'Pending') === filter);

    const deliveredCount = deliveries.filter(d => d.statusId?.status === 'Delivered').length;
    const failedCount    = deliveries.filter(d => d.statusId?.status === 'Failed').length;
    const pendingCount   = deliveries.filter(d =>
        ['Pending', 'Scheduled', 'Assigned', 'Out'].includes(d.statusId?.status || 'Pending')
    ).length;

    const renderItem = ({ item }: { item: any }) => {
        const statusLabel = item.statusId?.status || 'Pending';
        const cfg         = STATUS_CONFIG[statusLabel] ?? STATUS_CONFIG['Pending'];
        const shipment    = item.shipmentId || {};

        const receiverFirst = item.receivedBy?.firstname?.trim() || '';
        const receiverLast  = item.receivedBy?.lastname?.trim()  || '';
        const deliveredByName = typeof item.deliveredBy === 'object' && item.deliveredBy
            ? [item.deliveredBy.firstname?.trim(), item.deliveredBy.lastname?.trim()].filter(Boolean).join(' ')
            : (item.deliveredBy as string | undefined) ?? null;
        const receiverName  = [receiverFirst, receiverLast].filter(Boolean).join(' ') || deliveredByName || null;

        const address     = item.address || '—';
        const date        = item.timestamp ? fmtDate(item.timestamp) : fmtDate(item.createdAt);
        const hasMedia    = (item.media ?? []).length > 0;
        const shipType    = shipment.shipmentType as string | undefined;

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                    router.push({
                        pathname: '/(tabs-delivery)/delivery/[id]' as any,
                        params: { id: item._id, data: JSON.stringify(item) },
                    })
                }
                style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}
                className="bg-white rounded-xl mb-3 border border-slate-100 overflow-hidden"
            >
                {/* left accent */}
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: cfg.dot }} />

                <View className="pl-5 pr-4 py-4">
                    {/* row 1 — code + badge */}
                    <View className="flex-row justify-between items-center mb-2.5">
                        <Text
                            style={{ fontFamily: 'Poppins_600SemiBold' }}
                            className="text-brand-secondary text-base"
                        >
                            {shipment.code || item._id.slice(-8).toUpperCase()}
                        </Text>
                        <View
                            style={{ backgroundColor: cfg.bg }}
                            className="px-2.5 py-1 rounded-full flex-row items-center gap-1.5"
                        >
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.dot }} />
                            <Text style={{ fontFamily: 'Manrope_600SemiBold', color: cfg.text, fontSize: 11 }}>
                                {statusLabel}
                            </Text>
                        </View>
                    </View>

                    {/* row 2 — receiver */}
                    {receiverName && (
                        <View className="flex-row items-center gap-1.5 mb-1.5">
                            <Ionicons name="person-outline" size={13} color="#94A3B8" />
                            <Text
                                style={{ fontFamily: 'Manrope_500Medium' }}
                                className="text-slate-600 text-sm"
                            >
                                {receiverName}
                            </Text>
                        </View>
                    )}

                    {/* row 3 — address */}
                    <View className="flex-row items-center gap-1.5 mb-3">
                        <Ionicons name="location-outline" size={13} color="#94A3B8" />
                        <Text
                            style={{ fontFamily: 'Manrope_400Regular' }}
                            className="text-slate-400 text-xs flex-1"
                            numberOfLines={1}
                        >
                            {address}
                        </Text>
                    </View>

                    {/* row 4 — chips + chevron */}
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row gap-2">
                            {shipType && (
                                <View className="flex-row items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                                    <Ionicons
                                        name={shipType === 'Air Freight' ? 'airplane-outline' : 'boat-outline'}
                                        size={11}
                                        color="#64748B"
                                    />
                                    <Text
                                        style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }}
                                        className="text-slate-500"
                                    >
                                        {shipType}
                                    </Text>
                                </View>
                            )}
                            <View className="flex-row items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                                <Ionicons name="calendar-outline" size={11} color="#64748B" />
                                <Text
                                    style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }}
                                    className="text-slate-500"
                                >
                                    {date}
                                </Text>
                            </View>
                            {hasMedia && (
                                <View className="flex-row items-center gap-1 bg-[#f0fdf4] px-2.5 py-1 rounded-full">
                                    <Ionicons name="images-outline" size={11} color="#16a34a" />
                                    <Text
                                        style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: '#16a34a' }}
                                    >
                                        Proof
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8F9FB]">
            {/* ── header ── */}
            <View className="bg-white pt-6 pb-4 px-5 border-b border-slate-100">
                <View className="flex-row justify-between items-center mb-5">
                    <View>
                        <Text
                            style={{ fontFamily: 'Manrope_500Medium' }}
                            className="text-slate-400 text-xs uppercase tracking-widest"
                        >
                            History
                        </Text>
                        <Text
                            style={{ fontFamily: 'Poppins_700Bold' }}
                            className="text-brand-secondary text-2xl mt-0.5"
                        >
                            Deliveries
                        </Text>
                    </View>
                    <Text
                        style={{ fontFamily: 'Manrope_400Regular' }}
                        className="text-slate-400 text-xs"
                    >
                        {deliveries.length} total
                    </Text>
                </View>

                {/* stat row */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 bg-[#f0fdf4] rounded-xl p-3 items-center border border-green-100">
                        <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-green-600 text-xl">
                            {deliveredCount}
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-green-600 text-xs mt-0.5">
                            Delivered
                        </Text>
                    </View>
                    <View className="flex-1 bg-[#fef3c7] rounded-xl p-3 items-center border border-yellow-100">
                        <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-amber-600 text-xl">
                            {pendingCount}
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-amber-600 text-xs mt-0.5">
                            In Progress
                        </Text>
                    </View>
                    <View className="flex-1 bg-[#fef2f2] rounded-xl p-3 items-center border border-red-100">
                        <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-red-500 text-xl">
                            {failedCount}
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-red-400 text-xs mt-0.5">
                            Failed
                        </Text>
                    </View>
                </View>

                {/* filter chips */}
                <FlatList
                    data={FILTERS as unknown as Filter[]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setFilter(item)}
                            className={`px-4 py-2 rounded-full mr-2 border ${filter === item
                                ? 'bg-brand-secondary border-brand-secondary'
                                : 'bg-white border-slate-200'
                                }`}
                        >
                            <Text
                                style={{
                                    fontFamily: filter === item ? 'Manrope_700Bold' : 'Manrope_500Medium',
                                    fontSize: 12,
                                    color: filter === item ? '#fff' : '#64748B',
                                }}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* ── list ── */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#F0782D" />
                    <Text
                        style={{ fontFamily: 'Manrope_500Medium' }}
                        className="text-slate-400 mt-3 text-sm"
                    >
                        Loading deliveries...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#F0782D"
                            colors={['#F0782D']}
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-16 px-12">
                            <Ionicons name="checkmark-circle-outline" size={48} color="#CBD5E1" />
                            <Text
                                style={{ fontFamily: 'Poppins_600SemiBold' }}
                                className="text-brand-secondary text-lg text-center mt-4"
                            >
                                No {filter === 'All' ? '' : filter} Deliveries
                            </Text>
                            <Text
                                style={{ fontFamily: 'Manrope_400Regular' }}
                                className="text-slate-400 text-sm text-center mt-2"
                            >
                                {filter === 'All'
                                    ? 'Your delivery history will appear here.'
                                    : `No deliveries with status "${filter}" found.`}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
