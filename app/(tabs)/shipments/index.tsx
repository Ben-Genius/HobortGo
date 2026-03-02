import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_FILTERS = ['All', 'Received', 'In Transit', 'Arrived', 'Ready', 'Delivered'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    Received: { bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69' },
    'In Transit': { bg: '#fff0e6', text: '#f0782d', dot: '#f0782d' },
    Arrived: { bg: '#f3f0ff', text: '#7c3aed', dot: '#7c3aed' },
    Ready: { bg: '#fef9c3', text: '#a16207', dot: '#a16207' },
    Delivered: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
    Pending: { bg: '#fef3c7', text: '#d97706', dot: '#d97706' },
    Failed: { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626' },
};

const STAT_OVERVIEW = [
    { label: 'Total', value: 6, color: '#1e4b69', bg: '#e6f0f5' },
    { label: 'In Transit', value: 1, color: '#f0782d', bg: '#fff0e6' },
    { label: 'Ready', value: 1, color: '#a16207', bg: '#fef9c3' },
    { label: 'Delivered', value: 1, color: '#16a34a', bg: '#f0fdf4' },
];

const DUMMY_SHIPMENTS = [
    { id: '1', trackingId: 'HB-10041', sender: 'Amazon US', recipient: 'Kofi Asante', status: 'Received', origin: 'USA', weight: 2.3, date: 'Today, 2:15 PM', flagged: false },
    { id: '2', trackingId: 'HB-10039', sender: 'Shein', recipient: 'Abena Mensah', status: 'In Transit', origin: 'China', weight: 0.8, date: 'Today, 1:47 PM', flagged: false },
    { id: '3', trackingId: 'HB-10035', sender: 'eBay', recipient: 'Kwame Boateng', status: 'Arrived', origin: 'UK', weight: 5.1, date: 'Yesterday', flagged: false },
    { id: '4', trackingId: 'HB-10029', sender: 'AliExpress', recipient: 'Ama Darko', status: 'Ready', origin: 'China', weight: 1.2, date: 'Mon, 24th', flagged: true },
    { id: '5', trackingId: 'HB-10023', sender: 'Nike US', recipient: 'John Doe', status: 'Delivered', origin: 'USA', weight: 0.5, date: 'Fri, 21st', flagged: false },
    { id: '6', trackingId: 'HB-10018', sender: 'Apple', recipient: 'Yaw Osei', status: 'Received', origin: 'USA', weight: 1.8, date: 'Fri, 21st', flagged: true },
];

export default function AdminShipmentsScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
    const [searchText, setSearchText] = useState('');

    const filtered = DUMMY_SHIPMENTS.filter(s => {
        const matchesFilter = activeFilter === 'All' || s.status === activeFilter;
        const matchesSearch = searchText === '' ||
            s.trackingId.toLowerCase().includes(searchText.toLowerCase()) ||
            s.recipient.toLowerCase().includes(searchText.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const renderItem = ({ item }: { item: typeof DUMMY_SHIPMENTS[0] }) => {
        const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.Received;
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-100"
                onPress={() => router.push(`/(tabs)/shipments/${item.id}` as any)}>

                {/* Row 1 — Tracking ID + Status badge */}
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-2">
                        {item.flagged && (
                            <View className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                            {item.trackingId}
                        </Text>
                    </View>
                    <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1 rounded-full flex-row items-center gap-1.5">
                        <View style={{ backgroundColor: cfg.dot }} className="w-1.5 h-1.5 rounded-full" />
                        <Text style={{ color: cfg.text, fontFamily: 'Manrope_600SemiBold', fontSize: 10 }}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                {/* Row 2 — Recipient + Origin side by side */}
                <View className="flex-row gap-4 mb-3">
                    <View className="flex-1 flex-row items-center gap-2">
                        <Ionicons name="person-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-secondary text-sm flex-1" numberOfLines={1}>
                            {item.recipient}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="earth-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs">
                            {item.origin}
                        </Text>
                    </View>
                </View>

                {/* Row 3 — Weight + Date */}
                <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
                    <View className="flex-row items-center gap-1.5">
                        <Ionicons name="scale-outline" size={12} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs">
                            {item.weight} kg · {item.sender}
                        </Text>
                    </View>
                    <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs">
                        {item.date}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* ── Header ── */}
            <View className="pt-6 pb-4 px-5">
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
                <View className="flex-row flex-wrap mb-5" style={{ gap: 8 }}>
                    {STAT_OVERVIEW.map(s => (
                        <View
                            key={s.label}
                            style={{ backgroundColor: s.bg, width: '48.5%' }}
                            className="rounded-lg px-4 py-3 overflow-hidden">
                            {/* Single bubble */}
                            <View
                                style={{ backgroundColor: s.color, opacity: 0.1, position: 'absolute', top: -16, right: -18 }}
                                className="w-24 h-24 rounded-full"
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

                {/* Search bar */}
                <View className="bg-slate-50 rounded-lg flex-row items-center px-4 py-3.5 mb-4 border border-slate-100">
                    <Ionicons name="search-outline" size={18} color="#94A3B8" />
                    <TextInput
                        style={{ fontFamily: 'Manrope_400Regular', flex: 1, marginLeft: 10, fontSize: 14, color: '#1e4b69' }}
                        placeholder="Search tracking ID or recipient…"
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
                    data={STATUS_FILTERS as unknown as StatusFilter[]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setActiveFilter(item)}
                            className={`px-4 py-2 rounded-full mr-2 border ${activeFilter === item
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

            {/* ── List ── */}
            <View className="flex-row justify-between items-center px-5 mb-2 mt-1">
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                    {filtered.length} {activeFilter === 'All' ? 'Packages' : activeFilter}
                </Text>
                <TouchableOpacity>
                    <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-orange text-sm">
                        Sort
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center mt-20 px-12">
                        <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4 border border-slate-100">
                            <Ionicons name="cube-outline" size={32} color="#CBD5E1" />
                        </View>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg text-center">
                            No Shipments Found
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mt-2">
                            Try adjusting your filters or search terms.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
