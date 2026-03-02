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
                activeOpacity={1}
                onPress={() => setExpanded(isExpanded ? null : item.id)}
                className="bg-slate-50 rounded-lg mb-4 border border-slate-100 overflow-hidden">
                <View className="p-6">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-row items-center">
                            <View style={{ backgroundColor: cfg.dot }} className="w-2.5 h-2.5 rounded-full mr-3" />
                            <Text className="text-brand-secondary font-black text-lg">{item.trackingId}</Text>
                        </View>
                        <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1.5 rounded-xl">
                            <Text style={{ color: cfg.text }} className="text-[10px] font-black uppercase tracking-tighter">{item.status}</Text>
                        </View>
                    </View>

                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-white rounded-xl items-center justify-center border border-slate-100">
                                <Ionicons name="person-outline" size={14} color="#64748B" />
                            </View>
                            <Text className="text-brand-secondary font-bold text-sm ml-3">{item.client}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-white rounded-xl items-center justify-center border border-slate-100">
                                <Ionicons name="location-outline" size={14} color="#64748B" />
                            </View>
                            <Text className="text-slate-500 text-xs ml-3 flex-1" numberOfLines={1}>{item.address}</Text>
                        </View>
                    </View>
                </View>

                {isExpanded && (
                    <View className="px-6 pb-6 pt-2 bg-slate-100/30">
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-brand-secondary py-4 rounded-lg flex-row items-center justify-center gap-2"
                                onPress={() => handleNavigate(item.address)}>
                                <Ionicons name="navigate-outline" size={16} color="white" />
                                <Text className="text-white font-bold text-sm">Navigate</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-white py-4 rounded-lg flex-row items-center justify-center gap-2 border border-slate-200"
                                onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                                <Ionicons name="call-outline" size={16} color="#1e4b69" />
                                <Text className="text-brand-secondary font-bold text-sm">Call</Text>
                            </TouchableOpacity>
                        </View>
                        {(item.status === 'Out for Delivery' || item.status === 'Pending') && (
                            <TouchableOpacity
                                className="mt-3 bg-brand-orange py-4 rounded-lg flex-row items-center justify-center gap-2"
                                onPress={() => router.push('/(tabs-delivery)/scan' as any)}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                                <Text className="text-white font-black uppercase tracking-widest text-sm">Complete Delivery</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-16 pb-8 px-8">
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Courier Pro</Text>
                        <Text className="text-brand-secondary text-3xl font-black mt-1">
                            Hi, <Text className="text-brand-orange">{user?.name?.split(' ')[0] ?? 'Driver'}</Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="w-12 h-12 bg-slate-50 rounded-lg items-center justify-center border border-slate-100"
                        onPress={() => router.push('/(tabs-delivery)/notifications' as any)}>
                        <Ionicons name="notifications-outline" size={22} color="#1e4b69" />
                        <View className="absolute top-3 right-3 w-2 h-2 bg-brand-orange rounded-full border-2 border-white" />
                    </TouchableOpacity>
                </View>

                {/* Status Stats */}
                <View className="flex-row gap-4">
                    <View className="flex-1 bg-brand-orange rounded-lg p-5 overflow-hidden">
                        <View className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
                        <Text className="text-white/80 font-bold text-[10px] uppercase tracking-widest">Remaining</Text>
                        <Text className="text-white text-3xl font-black mt-1">{pending}</Text>
                    </View>
                    <View className="flex-1 bg-brand-secondary rounded-lg p-5 overflow-hidden">
                        <View className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
                        <Text className="text-white/80 font-bold text-[10px] uppercase tracking-widest">Completed</Text>
                        <Text className="text-white text-3xl font-black mt-1">{completed}</Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View className="px-8 mb-6">
                <TouchableOpacity
                    className="bg-slate-900 rounded-lg p-6 flex-row items-center justify-between"
                    onPress={() => router.push('/(tabs-delivery)/scan' as any)}>
                    <View>
                        <Text className="text-white font-black text-lg">Scan & Go</Text>
                        <Text className="text-white/60 text-xs mt-1">Ready for your next pickup?</Text>
                    </View>
                    <View className="w-14 h-14 bg-brand-orange rounded-lg items-center justify-center">
                        <Ionicons name="scan" size={28} color="white" />
                    </View>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center px-8 mb-4">
                <Text className="text-brand-secondary font-black text-lg">Delivery Queue</Text>
                <Text className="text-slate-400 text-xs font-bold uppercase">{MY_DELIVERIES.length} Total</Text>
            </View>

            <FlatList
                data={MY_DELIVERIES}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
