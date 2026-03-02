import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
                            <Text className="text-brand-secondary font-medium text-lg">{item.trackingId}</Text>
                        </View>
                        <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1.5 rounded-xl">
                            <Text style={{ color: cfg.text }} className="text-[10px] font-medium uppercase tracking-tighter">{item.status}</Text>
                        </View>
                    </View>

                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-white rounded-xl items-center justify-center border border-slate-100">
                                <Ionicons name="person-outline" size={14} color="#64748B" />
                            </View>
                            <Text className="text-brand-secondary font-medium text-sm ml-3">{item.client}</Text>
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
                                <Text className="text-white font-normal text-sm">Navigate</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-white py-4 rounded-lg flex-row items-center justify-center gap-2 border border-slate-200"
                                onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                                <Ionicons name="call-outline" size={16} color="#1e4b69" />
                                <Text className="text-brand-secondary font-normal text-sm">Call</Text>
                            </TouchableOpacity>
                        </View>
                        {(item.status === 'Out for Delivery' || item.status === 'Pending') && (
                            <TouchableOpacity
                                className="mt-3 bg-brand-orange py-4 rounded-lg flex-row items-center justify-center gap-2"
                                onPress={() => router.push('/(tabs-delivery)/scan' as any)}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                                <Text className="text-white font-medium text-sm">Complete Delivery</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-6 pb-6 px-5">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">Courier Pro</Text>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-xl mt-0.5">
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
                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <View className="bg-brand-orange rounded-lg p-4 overflow-hidden mb-3">
                            <View className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-white/70 uppercase tracking-widest">Remaining</Text>
                            <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-3xl mt-0.5">{pending}</Text>
                        </View>
                        <View className="bg-brand-secondary rounded-lg p-4 overflow-hidden">
                            <View className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-white/70 uppercase tracking-widest">Completed</Text>
                            <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-3xl mt-0.5">{completed}</Text>
                        </View>
                    </View>
                    {/* Rider illustration */}
                    <View className="w-36 items-center justify-center">
                        <Image
                            source={require('../../assets/images/illustrations/delivery_rider.webp')}
                            style={{ width: 140, height: 140 }}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View className="px-5 mb-4">
                <TouchableOpacity
                    className="bg-brand-secondary rounded-lg p-5 flex-row items-center justify-between"
                    onPress={() => router.push({
                        pathname: "/(tabs-delivery)/scan/result",
                        params: { trackingId: 'HB-10041', flow: 'delivery' }
                    } as any)}>
                    <View>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-base">Scan &amp; Go</Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-white/60 text-xs mt-0.5">Ready for your next pickup?</Text>
                    </View>
                    <View className="w-12 h-12 bg-brand-orange rounded-lg items-center justify-center">
                        <Ionicons name="scan" size={24} color="white" />
                    </View>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center px-5 my-3">
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">Delivery Queue</Text>
                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs">{MY_DELIVERIES.length} Total</Text>
            </View>

            <FlatList
                data={MY_DELIVERIES}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
