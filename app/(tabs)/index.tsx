import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';

// ── Dummy Data ────────────────────────────────────────────────────────────────
const SUMMARY_CARDS = [
    { label: 'Received Today', value: 24, icon: 'archive', color: '#1e4b69', bg: '#e6f0f5' },
    { label: 'Pending', value: 8, icon: 'time', color: '#f0782d', bg: '#fff0e6' },
    { label: 'Out for Delivery', value: 5, icon: 'bicycle', color: '#7c3aed', bg: '#f3f0ff' },
    { label: 'Delivered', value: 11, icon: 'checkmark-circle', color: '#16a34a', bg: '#f0fdf4' },
] as const;

const RECENT_SCANS = [
    { id: 'HB-10041', time: '2:15 PM', admin: 'K. Asante', status: 'Received' },
    { id: 'HB-10039', time: '1:47 PM', admin: 'K. Asante', status: 'Received' },
    { id: 'HB-10035', time: '11:22 AM', admin: 'A. Mensah', status: 'Received' },
    { id: 'HB-10031', time: '9:05 AM', admin: 'K. Asante', status: 'Received' },
];

const FLAGGED = [
    { id: 'HB-10029', reason: 'Damaged on arrival' },
    { id: 'HB-10018', reason: 'Customs hold' },
];

export default function AdminDashboardScreen() {
    const router = useRouter();
    const user = useAuthStore(state => state.user);

    return (
        <ScrollView className="flex-1 bg-[#F9FAFB]" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="bg-[#1e4b69] pt-14 pb-8 px-6 rounded-b-[32px]">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-white/70 text-sm font-medium">Good day 👋</Text>
                        <Text className="text-white text-xl font-extrabold mt-0.5">
                            {user?.name ?? user?.email?.split('@')[0] ?? 'Admin'}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/20"
                            onPress={() => router.push('/(tabs)/notifications' as any)}>
                            <Ionicons name="notifications" size={18} color="white" />
                        </TouchableOpacity>
                        <View className="w-10 h-10 bg-[#f0782d] rounded-full items-center justify-center">
                            <Text className="text-white font-extrabold text-base">
                                {user?.email?.charAt(0).toUpperCase() ?? 'A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Hero stats row */}
                <View className="bg-white/10 rounded-2xl p-4 flex-row justify-between border border-white/10">
                    <View className="items-center flex-1">
                        <Text className="text-white font-extrabold text-2xl">48</Text>
                        <Text className="text-white/60 text-xs mt-0.5">Total Today</Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-[#f0782d] font-extrabold text-2xl">8</Text>
                        <Text className="text-white/60 text-xs mt-0.5">Pending</Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-green-400 font-extrabold text-2xl">11</Text>
                        <Text className="text-white/60 text-xs mt-0.5">Delivered</Text>
                    </View>
                </View>
            </View>

            <View className="px-6 mt-6">
                {/* Flagged Alert Banner */}
                {FLAGGED.length > 0 && (
                    <TouchableOpacity className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex-row items-center">
                        <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                            <Ionicons name="warning" size={20} color="#dc2626" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-red-700 font-bold text-sm">
                                {FLAGGED.length} flagged shipment{FLAGGED.length > 1 ? 's' : ''} require attention
                            </Text>
                            <Text className="text-red-500 text-xs mt-0.5">
                                {FLAGGED.map(f => f.id).join(', ')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#dc2626" />
                    </TouchableOpacity>
                )}

                {/* Summary Cards */}
                <Text className="text-gray-900 font-bold text-base mb-3">Today's Overview</Text>
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {SUMMARY_CARDS.map(card => (
                        <View
                            key={card.label}
                            className="flex-1 min-w-[44%] rounded-2xl p-4 border border-gray-100 bg-white">
                            <View
                                style={{ backgroundColor: card.bg }}
                                className="w-9 h-9 rounded-full items-center justify-center mb-3">
                                <Ionicons name={card.icon as any} size={18} color={card.color} />
                            </View>
                            <Text style={{ color: card.color }} className="text-2xl font-extrabold">{card.value}</Text>
                            <Text className="text-gray-500 text-xs mt-0.5 font-medium">{card.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text className="text-gray-900 font-bold text-base mb-3">Quick Actions</Text>
                <View className="flex-row gap-3 mb-6">
                    <TouchableOpacity
                        className="flex-1 bg-[#1e4b69] rounded-2xl p-4 flex-row items-center justify-center gap-2"
                        onPress={() => router.push('/(tabs)/scan' as any)}>
                        <Ionicons name="qr-code" size={20} color="white" />
                        <Text className="text-white font-bold">Scan Package</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 bg-[#f0782d] rounded-2xl p-4 flex-row items-center justify-center gap-2"
                        onPress={() => router.push('/(tabs)/deliveries' as any)}>
                        <Ionicons name="bicycle" size={20} color="white" />
                        <Text className="text-white font-bold">Assign Delivery</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Scan Activity */}
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-900 font-bold text-base">Recent Scans</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/shipments' as any)}>
                        <Text className="text-[#f0782d] text-sm font-semibold">See all</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
                    {RECENT_SCANS.map((scan, idx) => (
                        <View
                            key={scan.id}
                            className={`flex-row items-center p-4 ${idx < RECENT_SCANS.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <View className="w-9 h-9 bg-[#e6f0f5] rounded-full items-center justify-center mr-3">
                                <Ionicons name="cube" size={16} color="#1e4b69" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 font-bold text-sm">{scan.id}</Text>
                                <Text className="text-gray-400 text-xs">{scan.admin}</Text>
                            </View>
                            <View className="items-end">
                                <View className="bg-[#e6f0f5] px-2 py-0.5 rounded-full mb-1">
                                    <Text className="text-[#1e4b69] text-[10px] font-bold">{scan.status}</Text>
                                </View>
                                <Text className="text-gray-400 text-xs">{scan.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
