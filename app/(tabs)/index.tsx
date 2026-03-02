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
        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
            {/* Header Area */}
            <View className="pt-16 pb-8 px-5">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">Dashboard</Text>
                        <Text style={{ fontFamily: 'Poppins_600' }} className="text-brand-secondary text-lg mt-1">
                            Hello, <Text className="text-brand-orange">{user?.name?.split(' ')[0] ?? 'Admin'}</Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="w-12 h-12 bg-slate-50 rounded-lg items-center justify-center border border-slate-100"
                        onPress={() => router.push('/(tabs)/notifications' as any)}>
                        <Ionicons name="notifications-outline" size={22} color="#1e4b69" />
                        <View className="absolute top-3 right-3 w-2 h-2 bg-brand-orange rounded-full border-2 border-white" />
                    </TouchableOpacity>
                </View>

                {/* Modern Search Bar */}
                <View className="mt-8 bg-slate-50 px-5 py-4 rounded-lg flex-row items-center border border-slate-100">
                    <Ionicons name="search-outline" size={20} color="#94A3B8" />
                    <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 ml-3">Track your shipment...</Text>
                    <TouchableOpacity className="ml-auto w-8 h-8 bg-brand-orange rounded-lg items-center justify-center">
                        <Ionicons name="scan-outline" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <View className="px-5 flex-1">
                {/* Banner/Highlight Card */}
                <View className="bg-brand-orange rounded-lg p-6 mb-8 overflow-hidden">
                    <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
                    <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-white/80 text-xs uppercase tracking-widest mb-1">Active Deliveries</Text>
                    <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-4xl">24</Text>
                    <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-white/70 text-sm mt-2">Packages moving through your fleet today</Text>
                    <TouchableOpacity className="bg-white/20 self-start mt-4 px-4 py-2 rounded-lg">
                        <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-white text-xs">View Report</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions Grid */}
                <View className="flex-row gap-4 mb-8">
                    <TouchableOpacity
                        className="flex-1 items-center justify-center"
                        onPress={() => router.push('/(tabs)/scan' as any)}>
                        <View className="w-12 h-12 bg-brand-secondary rounded-lg items-center justify-center mb-3">
                            <Ionicons name="qr-code" size={18} color="white" />
                        </View>
                        <Text className="text-brand-secondary font-bold text-sm">Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 items-center justify-center"
                        onPress={() => router.push('/(tabs)/deliveries' as any)}>
                        <View className="w-12 h-12 bg-brand-orange/10 rounded-lg items-center justify-center mb-3">
                            <Ionicons name="bicycle-outline" size={18} color="#F0782D" />
                        </View>
                        <Text className="text-brand-secondary font-bold text-sm">Assign</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 items-center justify-center">
                        <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mb-3">
                            <Ionicons name="stats-chart-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-brand-secondary font-bold text-sm">Stats</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 items-center justify-center">
                        <View className="w-12 h-12 bg-[#26ca93ff] rounded-lg items-center justify-center mb-3">
                            <Ionicons name="search-outline" size={18} color="white" />
                        </View>
                        <Text className="text-brand-secondary font-bold text-sm">Activity</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Activity Section */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg">Recent Scans</Text>
                    <TouchableOpacity>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-orange text-sm">See all</Text>
                    </TouchableOpacity>
                </View>

                <View className="mb-10">
                    {RECENT_SCANS.map((scan, idx) => (
                        <View
                            key={scan.id}
                            className="flex-row items-center p-4 bg-slate-50 rounded-lg mb-3 border border-slate-100">
                            <View className="w-11 h-11 bg-white rounded-lg items-center justify-center border border-slate-100">
                                <Ionicons name="cube-outline" size={20} color="#F0782D" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm">{scan.id}</Text>
                                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs mt-0.5">{scan.admin}</Text>
                            </View>
                            <View className="items-end">
                                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs">{scan.time}</Text>
                                <View className="mt-1 bg-green-100 px-2 py-0.5 rounded">
                                    <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-green-700 text-[10px]">{scan.status}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
