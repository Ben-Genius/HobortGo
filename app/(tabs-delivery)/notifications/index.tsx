import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

type NotifType = 'assignment' | 'update' | 'pickup' | 'sync';

interface Notification {
    id: string;
    type: NotifType;
    title: string;
    body: string;
    time: string;
    read: boolean;
}

const DUMMY_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'assignment', title: 'New Delivery Assigned', body: 'HB-10041 has been assigned to you — Morning window', time: '5 min ago', read: false },
    { id: '2', type: 'pickup', title: 'Pickup Ready', body: 'HB-10039 is ready for pickup at the warehouse', time: '20 min ago', read: false },
    { id: '3', type: 'update', title: 'Address Updated', body: 'HB-10035 — customer updated delivery address to "123 New Rd, Accra"', time: '1 hr ago', read: false },
    { id: '4', type: 'sync', title: 'Delivery Confirmed', body: 'HB-10009 delivery record synced successfully', time: '3 hr ago', read: true },
    { id: '5', type: 'assignment', title: 'New Delivery Assigned', body: 'HB-10007 added to your queue — Afternoon window', time: 'Yesterday', read: true },
    { id: '6', type: 'update', title: 'Reschedule Request', body: 'HB-10001 — Customer requested delivery tomorrow morning', time: 'Yesterday', read: true },
];

const TYPE_ICON: Record<NotifType, { icon: string; bg: string; color: string }> = {
    assignment: { icon: 'add-circle', bg: '#e6f0f5', color: '#1e4b69' },
    update: { icon: 'create', bg: '#fff0e6', color: '#f0782d' },
    pickup: { icon: 'checkmark-circle', bg: '#f0fdf4', color: '#16a34a' },
    sync: { icon: 'sync', bg: '#f3f0ff', color: '#7c3aed' },
};

export default function DeliveryPersonNotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const handleTap = (notif: Notification) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const meta = TYPE_ICON[item.type];
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleTap(item)}
                className={`flex-row p-4 border-b border-gray-100 ${!item.read ? 'bg-white' : 'bg-gray-50'}`}>
                <View style={{ backgroundColor: meta.bg }} className="w-11 h-11 rounded-full items-center justify-center mr-3 mt-0.5">
                    <Ionicons name={meta.icon as any} size={20} color={meta.color} />
                </View>
                <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                        <Text className="text-gray-900 font-bold text-sm flex-1 pr-2">{item.title}</Text>
                        {!item.read && (
                            <View className="w-2.5 h-2.5 bg-[#f0782d] rounded-full mt-1" />
                        )}
                    </View>
                    <Text className="text-gray-500 text-xs mt-0.5 leading-4">{item.body}</Text>
                    <Text className="text-gray-400 text-[10px] mt-1.5">{item.time}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <Text className="text-2xl font-extrabold text-gray-900 mr-3">Updates</Text>
                        {unreadCount > 0 && (
                            <View className="bg-[#f0782d] w-6 h-6 rounded-full items-center justify-center">
                                <Text className="text-white font-bold text-xs">{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                    {unreadCount > 0 && (
                        <TouchableOpacity onPress={markAllRead}>
                            <Text className="text-[#1e4b69] font-semibold text-sm">Mark all read</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="items-center mt-20">
                        <Ionicons name="notifications-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 mt-3 font-medium">No notifications</Text>
                    </View>
                }
            />
        </View>
    );
}
