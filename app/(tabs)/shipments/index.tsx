import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getShipmentMasters } from '../../../src/api/shipmentMaster';
import { getShipmentStatuses } from '../../../src/api/shipmentStatus';
import { useAuthStore } from '../../../src/store/authStore';
import { IShipmentMaster, IShipmentStatus } from '../../../src/types/shipment.types';

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
    'Processing':   { bg: '#fef9c3', text: '#a16207',  dot: '#a16207' },
    'In-transit':   { bg: '#fff0e6', text: '#f0782d',  dot: '#f0782d' },
    'In Transit':   { bg: '#fff0e6', text: '#f0782d',  dot: '#f0782d' },
    'Received':     { bg: '#e0f2fe', text: '#0369a1',  dot: '#0369a1' },
    'ReceivedGH':   { bg: '#e0f2fe', text: '#0369a1',  dot: '#0369a1' },
    'Accepted':     { bg: '#ede9fe', text: '#7c3aed',  dot: '#7c3aed' },
    'Ready':        { bg: '#fef9c3', text: '#a16207',  dot: '#a16207' },
    'Delivered':    { bg: '#f0fdf4', text: '#16a34a',  dot: '#16a34a' },
    'Confiscated':  { bg: '#fee2e2', text: '#dc2626',  dot: '#dc2626' },
    'Scheduled':    { bg: '#fef9c3', text: '#a16207',  dot: '#a16207' },
    'Pending':      { bg: '#fef3c7', text: '#d97706',  dot: '#d97706' },
};

function getStatusCfg(status?: string) {
    return STATUS_COLOR[status ?? ''] ?? { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
}

function fmtDate(d?: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminShipmentsScreen() {
    const router = useRouter();
    const token = useAuthStore(state => state.token);
    const [masters, setMasters] = useState<IShipmentMaster[]>([]);
    const [statuses, setStatuses] = useState<IShipmentStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [searchText, setSearchText] = useState('');

    const fetchData = async () => {
        if (!token) return;
        try {
            const [mastersRes, statusesRes] = await Promise.all([
                getShipmentMasters({ offset: 0, limit: 100 }),
                getShipmentStatuses({ offset: 0, limit: 100 }),
            ]);
            setMasters(mastersRes.data ?? []);
            setStatuses(statusesRes.data ?? []);
        } catch (e) {
            console.error('Shipments fetch error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const filterOptions = ['All', ...statuses.map(s => s.status)];

    const filtered = masters.filter(m => {
        const matchesFilter = activeFilter === 'All' || m.status?.status === activeFilter;
        const q = searchText.toLowerCase();
        const matchesSearch = q === '' ||
            (m.code ?? '').toLowerCase().includes(q) ||
            m.name.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    // Stat grid — computed from loaded data
    const statCards = [
        { label: 'Total',      value: masters.length,                                                        color: '#1e4b69', bg: '#e6f0f5' },
        { label: 'In-transit', value: masters.filter(m => m.status?.status === 'In-transit').length,         color: '#f0782d', bg: '#fff0e6' },
        { label: 'Received',   value: masters.filter(m => ['Received','ReceivedGH'].includes(m.status?.status ?? '')).length, color: '#0369a1', bg: '#e0f2fe' },
        { label: 'Delivered',  value: masters.filter(m => m.status?.status === 'Delivered').length,          color: '#16a34a', bg: '#f0fdf4' },
    ];

    const renderItem = useCallback(({ item }: { item: IShipmentMaster }) => {
        const cfg = getStatusCfg(item.status?.status);
        const pkgCount = item.shipments?.length ?? 0;
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-3 border border-slate-100 dark:border-slate-700"
                onPress={() => router.push(`/(tabs)/shipments/${item._id}` as any)}>

                {/* Row 1 — Name + Status badge */}
                <View className="flex-row justify-between items-start mb-2.5">
                    <View className="flex-1 pr-3">
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14 }} className="text-brand-secondary" numberOfLines={1}>
                            {item.name}
                        </Text>
                        {item.code ? (
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-400 mt-0.5">
                                #{item.code}
                            </Text>
                        ) : null}
                    </View>
                    <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1 rounded-full flex-row items-center gap-1.5 shrink-0">
                        <View style={{ backgroundColor: cfg.dot, width: 6, height: 6, borderRadius: 3 }} />
                        <Text style={{ color: cfg.text, fontFamily: 'Manrope_600SemiBold', fontSize: 10 }}>
                            {item.status?.status ?? 'Unknown'}
                        </Text>
                    </View>
                </View>

                {/* Row 2 — Type + Package count */}
                <View className="flex-row gap-4 mb-2.5">
                    <View className="flex-row items-center gap-1.5">
                        <Ionicons name="airplane-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12 }} className="text-slate-500">
                            {item.shipmentType}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                        <Ionicons name="cube-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12 }} className="text-slate-400">
                            {pkgCount} package{pkgCount !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>

                {/* Row 3 — ETA + Created */}
                <View className="flex-row justify-between items-center pt-2.5 border-t border-slate-100">
                    <View className="flex-row items-center gap-1.5">
                        <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">
                            ETA <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-slate-500">{fmtDate(item.scheduleArrival)}</Text>
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={11} color="#CBD5E1" />
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">
                            {fmtDate(item.createdAt)}
                        </Text>
                    </View>
                </View>

                {/* Flagged indicator */}
                {item.flagged ? (
                    <View className="mt-2 flex-row items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                        <Ionicons name="flag" size={11} color="#EF4444" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11 }} className="text-red-500">
                            {item.flagReason ?? 'Flagged'}
                        </Text>
                    </View>
                ) : null}
            </TouchableOpacity>
        );
    }, [router]);

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            {/* ── Header ── */}
            <View className="pt-4 pb-4 px-5">
                {/* Title row */}
                <View className="flex-row justify-between items-center mb-5">
                    <View>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">
                            Inventory
                        </Text>
                        <Text style={{ fontFamily: 'Poppins_600' }} className="text-brand-secondary text-lg mt-1">
                            Shipme<Text className="text-brand-orange">nts</Text>
                        </Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-brand-orange rounded-lg items-center justify-center">
                        <Ionicons name="add" size={22} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Stat grid — 2×2 */}
                {loading && !refreshing ? (
                    <View className="items-center justify-center py-6">
                        <ActivityIndicator color="#F0782D" />
                    </View>
                ) : (
                    <View className="flex-row flex-wrap mb-5" style={{ gap: 8 }}>
                        {statCards.map(s => (
                            <View
                                key={s.label}
                                style={{ backgroundColor: s.bg, width: '48.5%' }}
                                className="rounded-xl px-4 py-3 overflow-hidden">
                                <View
                                    style={{ backgroundColor: s.color, opacity: 0.08, position: 'absolute', top: -16, right: -18, width: 88, height: 88, borderRadius: 44 }}
                                />
                                <Text style={{ color: s.color, fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="uppercase tracking-widest mb-1">
                                    {s.label}
                                </Text>
                                <Text style={{ color: s.color, fontFamily: 'Poppins_700Bold', fontSize: 26 }}>
                                    {s.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Search bar */}
                <View className="bg-slate-50 dark:bg-slate-800 rounded-xl flex-row items-center px-4 py-3.5 mb-4 border border-slate-100 dark:border-slate-700">
                    <Ionicons name="search-outline" size={18} color="#94A3B8" />
                    <TextInput
                        style={{ fontFamily: 'Manrope_400Regular', flex: 1, marginLeft: 10, fontSize: 14, color: '#1e4b69' }}
                        placeholder="Search name or code…"
                        placeholderTextColor="#94A3B8"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter pills */}
                <FlatList
                    data={filterOptions}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setActiveFilter(item)}
                            className={`px-4 py-2 rounded-full mr-2 border ${activeFilter === item
                                ? 'bg-brand-secondary border-brand-secondary'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
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

            {/* ── List ── */}
            {!(loading && !refreshing) && (
                <View className="flex-row justify-between items-center px-5 mb-2">
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                        {filtered.length} {activeFilter === 'All' ? 'Shipments' : activeFilter}
                    </Text>
                </View>
            )}

            <FlatList
                data={loading && !refreshing ? [] : filtered}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
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
                    loading && !refreshing ? null : (
                        <View className="items-center mt-16 px-12">
                            <Image
                                source={require('../../../assets/images/illustrations/shipment_box.webp')}
                                style={{ width: 120, height: 120, marginBottom: 16 }}
                                resizeMode="contain"
                            />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg text-center">
                                No Shipments Found
                            </Text>
                            <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mt-2">
                                Try adjusting your filters or search terms.
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}
