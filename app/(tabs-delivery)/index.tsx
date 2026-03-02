import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';

type DeliveryStatus = 'Pending' | 'Out for Delivery' | 'Delivered' | 'Failed';

const STATUS_CONFIG: Record<DeliveryStatus, { bg: string; text: string; dot: string; icon: string }> = {
    'Pending': { bg: '#fef9c3', text: '#92400e', dot: '#f59e0b', icon: 'time' },
    'Out for Delivery': { bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69', icon: 'bicycle' },
    'Delivered': { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', icon: 'checkmark-circle' },
    'Failed': { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626', icon: 'close-circle' },
};

const MY_DELIVERIES = [
    { id: '1', trackingId: 'HB-10041', client: 'Kofi Asante', phone: '+233 24 000 001', address: '14 Ring Rd Central, Accra', window: 'Morning (8–12)', status: 'Out for Delivery' as DeliveryStatus },
    { id: '2', trackingId: 'HB-10039', client: 'Abena Mensah', phone: '+233 50 000 002', address: '7 Tema Motorway, Accra', window: 'Afternoon (12–5)', status: 'Pending' as DeliveryStatus },
    { id: '3', trackingId: 'HB-10035', client: 'Kwame Boateng', phone: '+233 27 000 003', address: 'Osu Oxford St, Accra', window: 'Morning (8–12)', status: 'Pending' as DeliveryStatus },
    { id: '4', trackingId: 'HB-10023', client: 'John Doe', phone: '+233 24 000 004', address: '5 Airport Rd, Accra', window: 'Morning (8–12)', status: 'Delivered' as DeliveryStatus },
    { id: '5', trackingId: 'HB-10018', client: 'Yaw Osei', phone: '+233 50 000 005', address: 'Labone, Accra', window: 'Afternoon (12–5)', status: 'Failed' as DeliveryStatus },
];

export default function DeliveryPersonHomeScreen() {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const [expanded, setExpanded] = useState<string | null>(null);

    const pending = MY_DELIVERIES.filter(d => d.status === 'Pending' || d.status === 'Out for Delivery').length;
    const completed = MY_DELIVERIES.filter(d => d.status === 'Delivered').length;

    const handleNavigate = (address: string) => {
        const url = `maps://app?daddr=${encodeURIComponent(address)}`;
        Linking.openURL(url).catch(() =>
            Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`)
        );
    };

    const renderItem = ({ item }: { item: typeof MY_DELIVERIES[0] }) => {
        const cfg = STATUS_CONFIG[item.status];
        const isExpanded = expanded === item.id;
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setExpanded(isExpanded ? null : item.id)}
                className="bg-white rounded-2xl mb-3 border border-gray-100 overflow-hidden">
                <View className="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-row items-center">
                            <View style={{ backgroundColor: cfg.dot }} className="w-2.5 h-2.5 rounded-full mr-2 mt-1" />
                            <Text className="text-gray-900 font-extrabold text-base">{item.trackingId}</Text>
                        </View>
                        <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1 rounded-full flex-row items-center gap-1">
                            <Ionicons name={cfg.icon as any} size={11} color={cfg.text} />
                            <Text style={{ color: cfg.text }} className="text-[10px] font-bold">{item.status}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="person-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-700 font-semibold text-sm ml-1.5">{item.client}</Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-500 text-xs ml-1.5 flex-1" numberOfLines={1}>{item.address}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs ml-1.5">{item.window}</Text>
                    </View>
                </View>

                {/* Expanded panel */}
                {isExpanded && (
                    <View className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50">
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                className="flex-1 bg-[#1e4b69] py-2.5 rounded-xl flex-row items-center justify-center gap-1.5"
                                onPress={() => handleNavigate(item.address)}>
                                <Ionicons name="navigate" size={15} color="white" />
                                <Text className="text-white font-bold text-sm">Navigate</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 border border-[#1e4b69] py-2.5 rounded-xl flex-row items-center justify-center gap-1.5"
                                onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                                <Ionicons name="call" size={15} color="#1e4b69" />
                                <Text className="text-[#1e4b69] font-bold text-sm">Call</Text>
                            </TouchableOpacity>
                            {(item.status === 'Out for Delivery' || item.status === 'Pending') && (
                                <TouchableOpacity
                                    className="flex-1 bg-[#f0782d] py-2.5 rounded-xl flex-row items-center justify-center gap-1.5"
                                    onPress={() => router.push('/(tabs-delivery)/scan' as any)}>
                                    <Ionicons name="qr-code" size={15} color="white" />
                                    <Text className="text-white font-bold text-sm">Complete</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            {/* Header */}
            <View className="bg-[#1e4b69] pt-14 pb-6 px-6 rounded-b-[32px]">
                <View className="flex-row justify-between items-center mb-5">
                    <View>
                        <Text className="text-white/70 text-sm font-medium">Good day 👋</Text>
                        <Text className="text-white text-xl font-extrabold">
                            {user?.name ?? user?.email?.split('@')[0] ?? 'Driver'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20"
                        onPress={() => router.push('/(tabs-delivery)/notifications' as any)}>
                        <Ionicons name="notifications" size={18} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="bg-white/10 rounded-2xl p-4 flex-row justify-between border border-white/10">
                    <View className="items-center flex-1">
                        <Text className="text-white font-extrabold text-2xl">{MY_DELIVERIES.length}</Text>
                        <Text className="text-white/60 text-xs mt-0.5">Assigned</Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-[#f0782d] font-extrabold text-2xl">{pending}</Text>
                        <Text className="text-white/60 text-xs mt-0.5">Remaining</Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-green-400 font-extrabold text-2xl">{completed}</Text>
                        <Text className="text-white/60 text-xs mt-0.5">Done</Text>
                    </View>
                </View>
            </View>

            {/* Quick Scan CTA */}
            <TouchableOpacity
                className="mx-6 mt-4 bg-[#f0782d] rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
                onPress={() => router.push('/(tabs-delivery)/scan' as any)}>
                <View>
                    <Text className="text-white font-extrabold text-base">Scan to Start / Complete</Text>
                    <Text className="text-white/80 text-xs mt-0.5">Scan QR at warehouse or delivery address</Text>
                </View>
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                    <Ionicons name="qr-code" size={22} color="white" />
                </View>
            </TouchableOpacity>

            <View className="flex-row justify-between items-center px-6 mt-5 mb-3">
                <Text className="text-gray-900 font-bold text-base">Today's Queue</Text>
                <Text className="text-gray-400 text-xs">Tap to expand</Text>
            </View>

            <FlatList
                data={MY_DELIVERIES}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
