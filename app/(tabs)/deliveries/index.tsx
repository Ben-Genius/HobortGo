import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../../src/components/ui/Card';
import { StatusBadge } from '../../../src/components/ui/StatusBadge';

export default function DeliveriesListScreen() {
    const router = useRouter();

    // Example dummy data
    const [deliveries, setDeliveries] = useState<any[]>([
        { id: '1', trackingId: 'HB-10023', status: 'In Transit', client: 'John Doe', address: '123 Main St, Accra', time: '10:30 AM' },
        { id: '2', trackingId: 'HB-10024', status: 'Pending', client: 'Jane Smith', address: 'Warehouse A', time: 'Yesterday' },
        { id: '3', trackingId: 'HB-10025', status: 'Delivered', client: 'Kwame Mensah', address: 'Osu, Accra', time: 'Mon, 12th' },
    ]);
    const [loading, setLoading] = useState(false);

    // Tab filter states (All | Pending | Delivered)
    const [activeFilter, setActiveFilter] = useState('All');

    const filteredDeliveries = activeFilter === 'All'
        ? deliveries
        : deliveries.filter(d => d.status.includes(activeFilter));

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/(tabs)/deliveries/${item.id}` as any)}
        >
            <Card className="mb-4">
                <View className="flex-row justify-between items-start mb-3">
                    <View>
                        <Text className="text-xl font-extrabold text-gray-900 tracking-tight">{item.trackingId}</Text>
                        <Text className="text-gray-500 font-medium text-sm mt-0.5">{item.time}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                </View>

                <View className="h-px bg-gray-100 w-full mb-3" />

                <View className="flex-row items-center mb-1.5">
                    <Text className="text-gray-400 mr-2 w-5 text-center">👤</Text>
                    <Text className="text-gray-700 font-semibold">{item.client}</Text>
                </View>

                <View className="flex-row items-center">
                    <Text className="text-gray-400 mr-2 w-5 text-center">📍</Text>
                    <Text className="text-gray-600 text-sm">{item.address}</Text>
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#F9FAFB] pt-16 px-6">
            <View className="flex-row justify-between items-end mb-6">
                <Text className="text-3xl font-extrabold text-gray-900">Deliveries</Text>
                <TouchableOpacity className="bg-[#fff0e6] p-2 rounded-xl">
                    <Text className="text-[#f0782d]">🔍</Text>
                </TouchableOpacity>
            </View>

            {/* Pill Filters */}
            <View className="flex-row mb-6">
                {['All', 'Pending', 'In Transit', 'Delivered'].map(filter => (
                    <TouchableOpacity
                        key={filter}
                        onPress={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full mr-2 ${activeFilter === filter ? 'bg-gray-900' : 'bg-white border border-gray-200'}`}
                    >
                        <Text className={`font-semibold text-sm ${activeFilter === filter ? 'text-white' : 'text-gray-500'}`}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1e4b69" className="mt-10" />
            ) : (
                <FlatList
                    data={filteredDeliveries}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text className="text-gray-500 text-center mt-10">No deliveries found.</Text>}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </View>
    );
}
