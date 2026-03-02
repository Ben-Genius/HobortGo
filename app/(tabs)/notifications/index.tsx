import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotifType = 'status' | 'scan' | 'delivery' | 'sla' | 'batch';

interface Notification {
    id: string;
    type: NotifType;
    title: string;
    body: string;
    time: string;
    read: boolean;
    link?: string;
}

const DUMMY_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'sla', title: '⚠️ SLA Breach Alert', body: 'HB-10029 has been in "Ready" status for 48+ hours', time: '2 min ago', read: false, link: 'HB-10029' },
    { id: '2', type: 'delivery', title: 'Delivery Completed', body: 'HB-10023 delivered by Abena Boateng — signature + photo captured', time: '18 min ago', read: false, link: 'HB-10023' },
    { id: '3', type: 'scan', title: 'New Inbound Receipt', body: '4 packages scanned by K. Asante at USA Warehouse', time: '1 hr ago', read: false },
    { id: '4', type: 'status', title: 'Status Change', body: 'HB-10039 moved from In Transit → Arrived at Destination', time: '2 hr ago', read: true, link: 'HB-10039' },
    { id: '5', type: 'batch', title: 'Batch Update Complete', body: 'Batch #B-20241 — 12 shipments updated to "In Transit"', time: '5 hr ago', read: true },
    { id: '6', type: 'delivery', title: 'Delivery Failed', body: 'HB-10018 marked as Failed by Kwame Asare — Customer not available', time: 'Yesterday', read: true, link: 'HB-10018' },
    { id: '7', type: 'status', title: 'Customs Hold', body: 'HB-10031 has been flagged for Customs Hold', time: 'Yesterday', read: true, link: 'HB-10031' },
];

const TYPE_ICON: Record<NotifType, { icon: string; bg: string; color: string }> = {
    status: { icon: 'refresh-circle', bg: '#e6f0f5', color: '#1e4b69' },
    scan: { icon: 'qr-code', bg: '#fff0e6', color: '#f0782d' },
    delivery: { icon: 'bicycle', bg: '#f0fdf4', color: '#16a34a' },
    sla: { icon: 'warning', bg: '#fef2f2', color: '#dc2626' },
    batch: { icon: 'layers', bg: '#f3f0ff', color: '#7c3aed' },
};

export default function AdminNotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const handleTap = (notif: Notification) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        if (notif.link) {
            router.push(`/(tabs)/shipments/${notif.link}` as any);
        }
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
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-white pt-6 pb-4 px-6 border-b border-gray-100">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <Text style={{ fontFamily: 'Poppins_600' }} className="text-brand-secondary text-lg mt-1">
                            Notifications </Text>
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
        </SafeAreaView>
    );
}
