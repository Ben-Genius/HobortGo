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
                activeOpacity={0.8}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
                onPress={() => router.push(`/(tabs)/shipments/${item.id}` as any)}>
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center">
                        {item.flagged && (
                            <View className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-1" />
                        )}
                        <Text className="text-gray-900 font-extrabold text-base">{item.trackingId}</Text>
                    </View>
                    <View style={{ backgroundColor: colors.bg }} className="px-3 py-1 rounded-full">
                        <Text style={{ color: colors.text }} className="text-xs font-bold">{item.status}</Text>
                    </View>
                </View>
                <View className="flex-row items-center mb-2">
                    <Ionicons name="person-outline" size={13} color="#9CA3AF" />
                    <Text className="text-gray-600 text-sm ml-1.5 font-medium">{item.recipient}</Text>
                    <Text className="text-gray-300 mx-2">·</Text>
                    <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">{item.origin}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="scale-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs ml-1">{item.weight} kg</Text>
                    </View>
                    <Text className="text-gray-400 text-xs">{item.date}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-extrabold text-gray-900">Shipments</Text>
                    <View className="flex-row items-center gap-2">
                        <View className="bg-[#e6f0f5] px-3 py-1 rounded-full">
                            <Text className="text-[#1e4b69] font-bold text-xs">{DUMMY_SHIPMENTS.length} total</Text>
                        </View>
                    </View>
                </View>

                {/* Search */}
                <View className="bg-gray-100 rounded-xl flex-row items-center px-3 py-2.5 mb-4">
                    <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-800 font-medium text-sm"
                        placeholder="Search tracking ID or recipient…"
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
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
                            className={`px-4 py-2 rounded-full mr-2 ${activeFilter === item ? 'bg-[#1e4b69]' : 'bg-gray-100'}`}>
                            <Text className={`text-xs font-bold ${activeFilter === item ? 'text-white' : 'text-gray-500'}`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center mt-20">
                        <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 mt-3 font-medium">No shipments found</Text>
                    </View>
                }
            />
        </View>
    );
}
