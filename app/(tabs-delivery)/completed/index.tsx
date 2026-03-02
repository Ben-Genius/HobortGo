import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

const COMPLETED_DELIVERIES = [
    { id: '1', trackingId: 'HB-10009', client: 'Kojo Frimpong', address: 'Labone, Accra', date: 'Today, 11:42 AM', status: 'Delivered', notes: 'Left with concierge', hasPhoto: true, hasSig: true },
    { id: '2', trackingId: 'HB-10007', client: 'Esi Nyarko', address: 'East Legon, Accra', date: 'Today, 9:30 AM', status: 'Attempted', notes: 'Customer not at home', hasPhoto: false, hasSig: false },
    { id: '3', trackingId: 'HB-10001', client: 'Fiifi Mensah', address: 'North Ridge, Accra', date: 'Yesterday, 3:15 PM', status: 'Delivered', notes: '', hasPhoto: true, hasSig: true },
    { id: '4', trackingId: 'HB-09995', client: 'Adwoa Sarpong', address: 'Tesano, Accra', date: 'Yesterday, 10:00 AM', status: 'Failed', notes: 'Wrong address on file', hasPhoto: false, hasSig: false },
    { id: '5', trackingId: 'HB-09988', client: 'Emmanuel Asare', address: 'Dansoman, Accra', date: 'Feb 28, 2:00 PM', status: 'Delivered', notes: 'Handed directly to recipient', hasPhoto: true, hasSig: true },
];

const DATE_FILTERS = ['All', 'Today', 'Yesterday', 'This Week'] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    Delivered: { bg: '#f0fdf4', text: '#16a34a' },
    Attempted: { bg: '#fef9c3', text: '#92400e' },
    Failed: { bg: '#fef2f2', text: '#dc2626' },
};

export default function DeliveryPersonCompletedScreen() {
    const [dateFilter, setDateFilter] = useState<string>('All');
    const [expanded, setExpanded] = useState<string | null>(null);

    const filtered = dateFilter === 'All'
        ? COMPLETED_DELIVERIES
        : COMPLETED_DELIVERIES.filter(d => d.date.toLowerCase().includes(dateFilter.toLowerCase()));

    const deliveredCount = filtered.filter(d => d.status === 'Delivered').length;
    const failedCount = filtered.filter(d => d.status !== 'Delivered').length;

    const renderItem = ({ item }: { item: typeof COMPLETED_DELIVERIES[0] }) => {
        const colors = STATUS_COLORS[item.status] ?? STATUS_COLORS.Delivered;
        const isExpanded = expanded === item.id;

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setExpanded(isExpanded ? null : item.id)}
                className="bg-white rounded-2xl mb-3 border border-gray-100 overflow-hidden">
                <View className="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-gray-900 font-extrabold text-base">{item.trackingId}</Text>
                        <View style={{ backgroundColor: colors.bg }} className="px-3 py-1 rounded-full">
                            <Text style={{ color: colors.text }} className="text-xs font-bold">{item.status}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="person-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-700 font-semibold text-sm ml-1.5">{item.client}</Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-500 text-xs ml-1.5">{item.address}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs ml-1.5">{item.date}</Text>
                    </View>
                </View>

                {/* Expanded detail */}
                {isExpanded && (
                    <View className="border-t border-gray-100 bg-gray-50 p-4">
                        {/* Proof indicators */}
                        <View className="flex-row gap-2 mb-3">
                            <View className={`flex-row items-center px-3 py-1.5 rounded-full ${item.hasPhoto ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Ionicons name="camera" size={12} color={item.hasPhoto ? '#16a34a' : '#9CA3AF'} />
                                <Text className={`text-xs ml-1 font-semibold ${item.hasPhoto ? 'text-green-700' : 'text-gray-400'}`}>
                                    {item.hasPhoto ? 'Photo' : 'No Photo'}
                                </Text>
                            </View>
                            <View className={`flex-row items-center px-3 py-1.5 rounded-full ${item.hasSig ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Ionicons name="create" size={12} color={item.hasSig ? '#16a34a' : '#9CA3AF'} />
                                <Text className={`text-xs ml-1 font-semibold ${item.hasSig ? 'text-green-700' : 'text-gray-400'}`}>
                                    {item.hasSig ? 'Signature' : 'No Signature'}
                                </Text>
                            </View>
                        </View>

                        {item.notes ? (
                            <View className="bg-white rounded-xl p-3 border border-gray-100">
                                <Text className="text-gray-400 text-xs mb-1">Notes</Text>
                                <Text className="text-gray-700 text-sm font-medium">{item.notes}</Text>
                            </View>
                        ) : (
                            <Text className="text-gray-400 text-xs italic">No notes recorded</Text>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <Text className="text-2xl font-extrabold text-gray-900 mb-4">Completed</Text>

                {/* Stats row */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1 bg-[#f0fdf4] rounded-xl p-3 items-center border border-green-100">
                        <Text className="text-green-600 font-extrabold text-xl">{deliveredCount}</Text>
                        <Text className="text-green-600 text-xs font-medium">Delivered</Text>
                    </View>
                    <View className="flex-1 bg-red-50 rounded-xl p-3 items-center border border-red-100">
                        <Text className="text-red-500 font-extrabold text-xl">{failedCount}</Text>
                        <Text className="text-red-400 text-xs font-medium">Failed / Attempted</Text>
                    </View>
                </View>

                {/* Date filter pills */}
                <FlatList
                    data={DATE_FILTERS as unknown as string[]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setDateFilter(item)}
                            className={`px-4 py-2 rounded-full mr-2 ${dateFilter === item ? 'bg-[#1e4b69]' : 'bg-gray-100'}`}>
                            <Text className={`text-xs font-bold ${dateFilter === item ? 'text-white' : 'text-gray-500'}`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center mt-20">
                        <Ionicons name="checkmark-circle-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 mt-3 font-medium">No completed deliveries</Text>
                    </View>
                }
            />
        </View>
    );
}
