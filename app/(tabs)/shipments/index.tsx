import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

const STATUS_FILTERS = ['All', 'Received', 'In Transit', 'Arrived', 'Ready', 'Delivered'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const STATUS_COLORS: Record<StatusFilter | 'Pending' | 'Failed', { bg: string; text: string }> = {
    All: { bg: '#F3F4F6', text: '#6B7280' },
    Received: { bg: '#e6f0f5', text: '#1e4b69' },
    'In Transit': { bg: '#fff0e6', text: '#f0782d' },
    Arrived: { bg: '#f3f0ff', text: '#7c3aed' },
    Ready: { bg: '#fef9c3', text: '#a16207' },
    Delivered: { bg: '#f0fdf4', text: '#16a34a' },
    Pending: { bg: '#fef3c7', text: '#d97706' },
    Failed: { bg: '#fef2f2', text: '#dc2626' },
};

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
        const colors = STATUS_COLORS[item.status as StatusFilter] ?? STATUS_COLORS.Received;
        return (
            <TouchableOpacity
                activeOpacity={1}
                className="bg-slate-50 rounded-3xl p-6 mb-4 border border-slate-100"
                onPress={() => router.push(`/(tabs)/shipments/${item.id}` as any)}>
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center">
                        {item.flagged && (
                            <View className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                        )}
                        <Text className="text-brand-slate font-black text-lg">{item.trackingId}</Text>
                    </View>
                    <View style={{ backgroundColor: colors.bg }} className="px-3 py-1.5 rounded-xl">
                        <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-tighter">{item.status}</Text>
                    </View>
                </View>

                <View className="space-y-3 mb-4">
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-white rounded-xl items-center justify-center border border-slate-100">
                            <Ionicons name="person-outline" size={14} color="#64748B" />
                        </View>
                        <Text className="text-brand-slate font-bold text-sm ml-3">{item.recipient}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-white rounded-xl items-center justify-center border border-slate-100">
                            <Ionicons name="location-outline" size={14} color="#64748B" />
                        </View>
                        <Text className="text-slate-500 text-xs ml-3">{item.origin}</Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between pt-4 border-t border-slate-200/50">
                    <View className="flex-row items-center">
                        <Ionicons name="scale-outline" size={14} color="#94A3B8" />
                        <Text className="text-slate-400 text-xs font-bold ml-2 uppercase">{item.weight} kg</Text>
                    </View>
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-tighter">{item.date}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header Area */}
            <View className="pt-16 pb-6 px-8">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Inventory</Text>
                        <Text className="text-brand-slate text-3xl font-black mt-1">Shipments</Text>
                    </View>
                    <View className="bg-brand-orange/10 px-4 py-2 rounded-2xl">
                        <Text className="text-brand-orange font-black text-xs uppercase">{filtered.length} Packages</Text>
                    </View>
                </View>

                {/* Search */}
                <View className="bg-slate-50 rounded-3xl flex-row items-center px-6 py-4 mb-6 border border-slate-100">
                    <Ionicons name="search-outline" size={20} color="#94A3B8" />
                    <TextInput
                        className="flex-1 ml-3 text-brand-slate font-bold text-sm"
                        placeholder="Tracking ID or Recipient..."
                        placeholderTextColor="#94A3B8"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#94A3B8" />
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
                            className={`px-5 py-2.5 rounded-2xl mr-3 border ${activeFilter === item ? 'bg-brand-slate border-brand-slate' : 'bg-white border-slate-100'
                                }`}>
                            <Text className={`text-[10px] uppercase font-black tracking-widest ${activeFilter === item ? 'text-white' : 'text-slate-400'
                                }`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* List Area */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center mt-20 px-12">
                        <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6 border border-slate-100">
                            <Ionicons name="cube-outline" size={40} color="#CBD5E1" />
                        </View>
                        <Text className="text-brand-slate text-lg font-black text-center">No Shipments Found</Text>
                        <Text className="text-slate-400 text-sm text-center mt-2 font-medium">Try adjusting your filters or search terms.</Text>
                    </View>
                }
            />
        </View>
    );
}
