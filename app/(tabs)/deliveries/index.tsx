import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

const DELIVERY_FILTERS = ['All', 'Pending', 'Assigned', 'Out', 'Completed', 'Failed'] as const;
type DeliveryFilter = typeof DELIVERY_FILTERS[number];

const DELIVERY_PERSONS = [
    { id: 'dp1', name: 'Kwame Asare', active: 3 },
    { id: 'dp2', name: 'Abena Boateng', active: 1 },
    { id: 'dp3', name: 'Yaw Mensah', active: 5 },
];

const DUMMY_DELIVERIES = [
    { id: '1', trackingId: 'HB-10041', client: 'Kofi Asante', phone: '+233 24 000 001', address: '14 Ring Rd Central, Accra', time: 'Morning (8–12)', status: 'Pending', assignedTo: null, proof: null },
    { id: '2', trackingId: 'HB-10039', client: 'Abena Mensah', phone: '+233 50 000 002', address: '7 Tema Motorway, Accra', time: 'Afternoon (12–5)', status: 'Assigned', assignedTo: 'Kwame Asare', proof: null },
    { id: '3', trackingId: 'HB-10035', client: 'Kwame Boateng', phone: '+233 27 000 003', address: 'Osu Oxford St, Accra', time: 'Evening (5–8)', status: 'Out', assignedTo: 'Yaw Mensah', proof: null },
    { id: '4', trackingId: 'HB-10023', client: 'John Doe', phone: '+233 24 000 004', address: '5 Airport Rd, Accra', time: 'Morning (8–12)', status: 'Completed', assignedTo: 'Abena Boateng', proof: { photo: true, signature: true, time: '11:42 AM' } },
    { id: '5', trackingId: 'HB-10018', client: 'Yaw Osei', phone: '+233 50 000 005', address: 'Labone, Accra', time: 'Afternoon (12–5)', status: 'Failed', assignedTo: 'Kwame Asare', proof: null, reason: 'Customer not available' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    Pending: { bg: '#fef3c7', text: '#92400e' },
    Assigned: { bg: '#e6f0f5', text: '#1e4b69' },
    Out: { bg: '#fff0e6', text: '#f0782d' },
    Completed: { bg: '#f0fdf4', text: '#16a34a' },
    Failed: { bg: '#fef2f2', text: '#dc2626' },
};

export default function AdminDeliveriesScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<DeliveryFilter>('All');
    const [deliveries, setDeliveries] = useState(DUMMY_DELIVERIES);

    const filtered = activeFilter === 'All' ? deliveries : deliveries.filter(d => d.status === activeFilter);

    const handleAssign = (deliveryId: string) => {
        Alert.alert(
            'Assign Delivery',
            'Select a delivery person:',
            [
                ...DELIVERY_PERSONS.map(dp => ({
                    text: `${dp.name} (${dp.active} active)`,
                    onPress: () => {
                        setDeliveries(prev =>
                            prev.map(d => d.id === deliveryId ? { ...d, status: 'Assigned', assignedTo: dp.name } : d)
                        );
                    },
                })),
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const renderItem = ({ item }: { item: typeof DUMMY_DELIVERIES[0] }) => {
        const colors = STATUS_COLORS[item.status] ?? STATUS_COLORS.Pending;
        return (
            <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
                {/* Top row */}
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-gray-900 font-extrabold text-base">{item.trackingId}</Text>
                    <View style={{ backgroundColor: colors.bg }} className="px-3 py-1 rounded-full">
                        <Text style={{ color: colors.text }} className="text-xs font-bold">{item.status}</Text>
                    </View>
                </View>

                {/* Info rows */}
                <View className="flex-row items-center mb-1.5">
                    <Ionicons name="person-outline" size={13} color="#9CA3AF" />
                    <Text className="text-gray-700 font-semibold text-sm ml-1.5">{item.client}</Text>
                    <Text className="text-gray-300 mx-1.5">·</Text>
                    <Ionicons name="call-outline" size={13} color="#9CA3AF" />
                    <Text className="text-gray-500 text-sm ml-1">{item.phone}</Text>
                </View>
                <View className="flex-row items-center mb-1.5">
                    <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                    <Text className="text-gray-500 text-xs ml-1.5 flex-1">{item.address}</Text>
                </View>
                <View className="flex-row items-center mb-3">
                    <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1.5">{item.time}</Text>
                    {item.assignedTo && (
                        <>
                            <Text className="text-gray-300 mx-1.5">·</Text>
                            <Ionicons name="bicycle-outline" size={13} color="#9CA3AF" />
                            <Text className="text-gray-400 text-xs ml-1">{item.assignedTo}</Text>
                        </>
                    )}
                </View>

                {/* Completed proof */}
                {item.proof && (
                    <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                        <Text className="text-green-700 font-semibold text-xs">
                            ✓ Delivered at {item.proof.time} · Photo + Signature captured
                        </Text>
                    </View>
                )}

                {/* Failed reason */}
                {item.status === 'Failed' && (item as any).reason && (
                    <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                        <Text className="text-red-600 font-semibold text-xs">
                            ✕ {(item as any).reason}
                        </Text>
                    </View>
                )}

                {/* Action button */}
                {item.status === 'Pending' && (
                    <TouchableOpacity
                        className="bg-[#1e4b69] py-2.5 rounded-xl items-center flex-row justify-center gap-2"
                        onPress={() => handleAssign(item.id)}>
                        <Ionicons name="person-add" size={16} color="white" />
                        <Text className="text-white font-bold text-sm">Assign Delivery Person</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-extrabold text-gray-900">Deliveries</Text>
                    <View className="bg-[#fff0e6] px-3 py-1 rounded-full">
                        <Text className="text-[#f0782d] font-bold text-xs">
                            {deliveries.filter(d => d.status === 'Pending').length} pending
                        </Text>
                    </View>
                </View>

                {/* Delivery Person Loads */}
                <View className="flex-row gap-2 mb-4">
                    {DELIVERY_PERSONS.map(dp => (
                        <View key={dp.id} className="flex-1 bg-gray-50 rounded-xl p-2 items-center border border-gray-100">
                            <View className="w-7 h-7 bg-[#1e4b69] rounded-full items-center justify-center mb-1">
                                <Text className="text-white font-bold text-xs">{dp.name.charAt(0)}</Text>
                            </View>
                            <Text className="text-gray-700 font-semibold text-[10px] text-center" numberOfLines={1}>
                                {dp.name.split(' ')[0]}
                            </Text>
                            <Text className="text-[#f0782d] font-bold text-xs">{dp.active}</Text>
                        </View>
                    ))}
                </View>

                {/* Filter pills */}
                <FlatList
                    data={DELIVERY_FILTERS as unknown as DeliveryFilter[]}
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

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center mt-20">
                        <Ionicons name="bicycle-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 mt-3 font-medium">No deliveries in this category</Text>
                    </View>
                }
            />
        </View>
    );
}
