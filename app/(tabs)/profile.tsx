import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/login');
    };

    return (
        <View className="flex-1 bg-gray-50 p-6 pt-16">
            <View className="items-center mb-8">
                <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
                    <Text className="text-blue-600 text-3xl font-bold">
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </Text>
                </View>
                <Text className="text-2xl font-bold text-gray-800">{user?.role || 'Administrator'}</Text>
                <Text className="text-gray-500">{user?.email || 'admin@hobortgo.com'}</Text>
            </View>

            <View className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <TouchableOpacity className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                    <Text className="text-gray-700 font-medium text-lg">Account Settings</Text>
                    <Text className="text-gray-400">›</Text>
                </TouchableOpacity>
                <TouchableOpacity className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                    <Text className="text-gray-700 font-medium text-lg">Help & Support</Text>
                    <Text className="text-gray-400">›</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="p-4 flex-row justify-between items-center bg-red-50"
                    onPress={handleLogout}
                >
                    <Text className="text-red-600 font-bold text-lg">Log Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
