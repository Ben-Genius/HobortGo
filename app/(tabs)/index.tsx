import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';

export default function HomeDashboardScreen() {
    const router = useRouter();
    const user = useAuthStore(state => state.user);

    return (
        <ScrollView className="flex-1 bg-white pt-12">

            {/* Top Toolbar */}
            <View className="px-6 flex-row justify-between items-center mb-4 mt-4">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-[#1e4b69] rounded-full items-center justify-center mr-3">
                        <Text className="text-white font-bold">{user?.email?.charAt(0).toUpperCase() || 'A'}</Text>
                    </View>
                    <Text className="text-gray-900 text-lg font-medium">{user?.email || 'Admin User'}</Text>
                </View>
                <View className="flex-row items-center">
                    <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-2 border border-gray-100">
                        <Text className="text-gray-600 text-lg">📝</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
                        <Text className="text-gray-600 text-lg">🔔</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View className="px-6 mb-6">
                <View className="bg-gray-100 rounded-full flex-row items-center px-4 py-3">
                    <Text className="text-gray-400 text-lg mr-2">🔍</Text>
                    <Text className="flex-1 text-gray-500 font-medium">Track package...</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/scanner' as any)}>
                        <Text className="text-gray-600 text-xl">📸</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Hero Card */}
            <View className="px-6 mb-8">
                <View className="bg-[#1e4b69] rounded-[32px] p-6 h-48 relative overflow-hidden shadow-sm">
                    <Text className="text-[#f0782d] font-bold text-sm mb-1 mt-2 tracking-wider uppercase">Nearest delivery</Text>
                    <Text className="text-white font-extrabold text-2xl tracking-tight mb-auto">#964201832-DL</Text>

                    <Text className="text-white font-bold text-sm">Arrived to sorting facility</Text>
                    <Text className="text-white/80 font-medium text-xs">Feb 21</Text>

                    {/* Faux 3D Box Illustration Positioned Absolute */}
                    <Text className="absolute -bottom-6 -right-6 text-[120px] opacity-90">📦</Text>
                </View>
            </View>

            {/* Quick Actions Row */}
            <View className="px-6 flex-row justify-between mb-10">
                <TouchableOpacity className="items-center" onPress={() => router.push('/(tabs)/scanner' as any)}>
                    <View className="w-[70px] h-[70px] rounded-3xl border border-[#1e4b69]/10 bg-[#e6f0f5] items-center justify-center mb-2 shadow-sm">
                        <Text className="text-2xl">📷</Text>
                    </View>
                    <Text className="text-[#1e4b69] font-bold text-xs">Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <View className="w-[70px] h-[70px] rounded-3xl border border-[#1e4b69]/10 bg-[#e6f0f5] items-center justify-center mb-2 shadow-sm">
                        <Text className="text-2xl">📍</Text>
                    </View>
                    <Text className="text-[#1e4b69] font-bold text-xs">Point</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <View className="w-[70px] h-[70px] rounded-3xl border border-[#f0782d]/10 bg-[#fff0e6] items-center justify-center mb-2 shadow-sm">
                        <Text className="text-2xl">⏱️</Text>
                    </View>
                    <Text className="text-[#f0782d] font-bold text-xs">Activity</Text>
                </TouchableOpacity>

                <TouchableOpacity className="items-center">
                    <View className="w-[70px] h-[70px] rounded-3xl border border-[#1e4b69]/10 bg-[#e6f0f5] items-center justify-center mb-2 shadow-sm">
                        <Text className="text-2xl">❔</Text>
                    </View>
                    <Text className="text-[#1e4b69] font-bold text-xs">Support</Text>
                </TouchableOpacity>
            </View>

            {/* Shipping History */}
            <View className="px-6 pb-20">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xl font-bold text-gray-900">Shipping history</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/deliveries' as any)} className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center">
                        <Text className="text-gray-600 font-medium text-xs mr-1">See all</Text>
                        <Text className="text-gray-600 text-xs">{">"}</Text>
                    </TouchableOpacity>
                </View>

                {/* List Items */}
                <View className="mb-5 flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 pr-4">
                        <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                            <Text className="text-gray-600 text-xl">📦</Text>
                        </View>
                        <View>
                            <Text className="text-gray-900 font-bold text-base mb-0.5">#964201832-DL</Text>
                            <Text className="text-gray-500 text-xs">Left warehouse on Feb 21</Text>
                        </View>
                    </View>
                    <View className="bg-[#fff0e6] px-3 py-1.5 rounded-full border border-orange-100">
                        <Text className="text-[#f0782d] font-bold text-[10px]">On the way</Text>
                    </View>
                </View>

                <View className="mb-5 flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 pr-4">
                        <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                            <Text className="text-gray-600 text-xl">📦</Text>
                        </View>
                        <View>
                            <Text className="text-gray-900 font-bold text-base mb-0.5">#964201486-DL</Text>
                            <Text className="text-gray-500 text-xs">Received on Jan 8</Text>
                        </View>
                    </View>
                    <View className="bg-[#e6f0f5] px-3 py-1.5 rounded-full border border-blue-100">
                        <Text className="text-[#1e4b69] font-bold text-[10px]">Delivered</Text>
                    </View>
                </View>

                <View className="mb-5 flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 pr-4">
                        <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                            <Text className="text-gray-600 text-xl">📦</Text>
                        </View>
                        <View>
                            <Text className="text-gray-900 font-bold text-base mb-0.5">#964201195-DL</Text>
                            <Text className="text-gray-500 text-xs">Received Dec 14</Text>
                        </View>
                    </View>
                    <View className="bg-[#e6f0f5] px-3 py-1.5 rounded-full border border-blue-100">
                        <Text className="text-[#1e4b69] font-bold text-[10px]">Delivered</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
