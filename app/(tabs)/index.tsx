import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getDeliveries } from '../../src/api/delivery';
import { getShipments } from '../../src/api/shipment';
import { useAuthStore } from '../../src/store/authStore';
import { IShipment } from '../../src/types/shipment.types';

const INITIAL_SUMMARY = [
    { label: 'Pending', value: 0, icon: 'time', color: '#f0782d', bg: '#fff0e6', statusKey: 'Pending' },
    { label: 'In-transit', value: 0, icon: 'bicycle', color: '#7c3aed', bg: '#f3f0ff', statusKey: 'In-transit' },
    { label: 'Scheduled', value: 0, icon: 'calendar', color: '#a16207', bg: '#fef9c3', statusKey: 'Scheduled' },
    { label: 'Delivered', value: 0, icon: 'checkmark-circle', color: '#16a34a', bg: '#f0fdf4', statusKey: 'Delivered' },
] as const;

function getStatusStyle(status: string): { bg: string; text: string; icon: any } {
    switch (status) {
        case 'Delivered': return { bg: '#dcfce7', text: '#16a34a', icon: 'checkmark-circle-outline' };
        case 'In-transit': 
        case 'In Transit':
        case 'Out for Delivery': return { bg: '#f3f0ff', text: '#7c3aed', icon: 'bicycle-outline' };
        case 'Pending': return { bg: '#fff0e6', text: '#f0782d', icon: 'time-outline' };
        case 'Scheduled': return { bg: '#fef9c3', text: '#a16207', icon: 'calendar-outline' };
        case 'Confiscated': return { bg: '#fee2e2', text: '#dc2626', icon: 'alert-circle-outline' };
        case 'Received':
        case 'ReceivedGH': return { bg: '#e0f2fe', text: '#0369a1', icon: 'archive-outline' };
        default: return { bg: '#f1f5f9', text: '#64748b', icon: 'help-circle-outline' };
    }
}

function formatTimestamp(ts: string): string {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    if (diffHrs < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function AdminDashboardScreen() {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const token = useAuthStore(state => state.token);
    const [loading, setLoading] = React.useState(true);
    const [summary, setSummary] = React.useState(INITIAL_SUMMARY);
    const [recentDeliveries, setRecentDeliveries] = React.useState<any[]>([]);
    const [activeDeliveriesCount, setActiveDeliveriesCount] = React.useState(0);

    const [refreshing, setRefreshing] = React.useState(false);

    const fetchDashboardData = async () => {
        try {
            const [shipmentData, deliveryData] = await Promise.all([
                getShipments({ offset: 0, limit: 100 }),
                getDeliveries({ offset: 0, limit: 5 }),
            ]);

            const shipments: IShipment[] = shipmentData.data;
            const newSummary = INITIAL_SUMMARY.map(item => ({
                ...item,
                value: shipments.filter(s => s.status?.status === item.statusKey).length
            }));
            setSummary(newSummary as any);

            setActiveDeliveriesCount(deliveryData.total || 0);
            setRecentDeliveries(deliveryData.data || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
        if (!token) return;
        fetchDashboardData();
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#F0782D" />
                <Text className="mt-4 text-slate-400 font-medium">Loading Dashboard...</Text>
            </View>
        );
    }

    return (
        <>
            <View className="pt-16 pb-4 px-5">
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
            </View>
            <ScrollView
                className="flex-1 bg-white"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#F0782D"
                        colors={['#F0782D']}
                    />
                }
            >
                <View className="px-5 flex-1 pt-4">
                    {/* Banner */}
                    <View className="bg-brand-orange rounded-lg p-6 mb-8 overflow-hidden">
                        <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-white/80 text-xs uppercase tracking-widest mb-1">Active Deliveries</Text>
                        <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-4xl">{activeDeliveriesCount}</Text>
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

                    {/* Recent Deliveries Section */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg">Recent Deliveries</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/deliveries' as any)}>
                            <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-orange text-sm">See all</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-10">
                        {recentDeliveries.length === 0 ? (
                            <View className="p-10 items-center justify-center bg-slate-50 rounded-lg border border-slate-100">
                                <Ionicons name="bicycle-outline" size={32} color="#CBD5E1" />
                                <Text className="text-slate-400 mt-2 font-medium">No recent deliveries</Text>
                            </View>
                        ) : (
                            recentDeliveries.map((delivery: any) => {
                                const status = delivery.statusId?.status ?? delivery.shipmentId?.status?.status ?? 'Unknown';
                                const statusStyle = getStatusStyle(status);
                                const deliveredBy = delivery.deliveredBy
                                    ? `${delivery.deliveredBy.firstname} ${delivery.deliveredBy.lastname}`
                                    : 'Unassigned';
                                const shipmentCode = delivery.shipmentId?.code ?? '—';
                                const time = formatTimestamp(delivery.timestamp ?? delivery.createdAt);

                                return (
                                    <TouchableOpacity
                                        key={delivery._id}
                                        activeOpacity={0.75}
                                        onPress={() => router.push(`/(tabs)/deliveries/${delivery._id}` as any)}
                                        className="p-4 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                                        <View className="flex-row items-start">
                                            {/* Icon */}
                                            <View className="w-11 h-11 bg-white rounded-lg items-center justify-center border border-slate-100 mt-0.5">
                                                <Ionicons
                                                    name={delivery.type === 'Pickup' ? 'storefront-outline' : 'bicycle-outline'}
                                                    size={20}
                                                    color="#F0782D"
                                                />
                                            </View>

                                            {/* Main info */}
                                            <View className="flex-1 ml-3">
                                                <View className="flex-row items-center justify-between">
                                                    <View className="flex-row items-center gap-2">
                                                        <Text
                                                            style={{ fontFamily: 'Manrope_700Bold' }}
                                                            className="text-brand-secondary text-sm"
                                                            numberOfLines={1}>
                                                            {shipmentCode}
                                                        </Text>
                                                        <View className="px-1.5 py-0.5 bg-slate-100 rounded">
                                                            <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-slate-500 text-[9px] uppercase tracking-tighter">
                                                                {delivery.type ?? 'Delivery'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs ml-2">{time}</Text>
                                                </View>

                                                <Text
                                                    style={{ fontFamily: 'Manrope_400Regular' }}
                                                    className="text-slate-500 text-xs mt-0.5"
                                                    numberOfLines={1}>
                                                    {delivery.address ?? 'No address'}
                                                </Text>

                                                {delivery.landmark ? (
                                                    <Text
                                                        style={{ fontFamily: 'Manrope_400Regular' }}
                                                        className="text-slate-400 text-[11px] mt-0.5"
                                                        numberOfLines={1}>
                                                        {delivery.landmark}
                                                    </Text>
                                                ) : null}

                                                <View className="flex-row items-center justify-between mt-2">
                                                    <View className="flex-row items-center gap-1">
                                                        <Ionicons name="person-outline" size={11} color="#94a3b8" />
                                                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-[11px]">
                                                            {deliveredBy}
                                                        </Text>
                                                    </View>
                                                    <View style={{ backgroundColor: statusStyle.bg }} className="px-2 py-0.5 rounded-full flex-row items-center gap-1">
                                                        <Ionicons name={statusStyle.icon} size={10} color={statusStyle.text} />
                                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', color: statusStyle.text }} className="text-[10px]">
                                                            {status}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </View>
            </ScrollView>
        </>
    );
}
