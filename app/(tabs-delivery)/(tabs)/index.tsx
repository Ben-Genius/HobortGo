import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDeliveries } from '@/src/api/delivery';
import { useAuthStore } from '@/src/store/authStore';
import { useTheme } from '@/hooks/use-theme';

const STATUS_CONFIG_LIGHT: Record<string, { bg: string; text: string; dot: string }> = {
    'Pending':   { bg: '#fef3c7', text: '#92400e',  dot: '#d97706' },
    'Scheduled': { bg: '#e6f0f5', text: '#1e4b69',  dot: '#1e4b69' },
    'Assigned':  { bg: '#e6f0f5', text: '#1e4b69',  dot: '#1e4b69' },
    'Out':       { bg: '#fff0e6', text: '#f0782d',  dot: '#f0782d' },
    'Delivered': { bg: '#f0fdf4', text: '#16a34a',  dot: '#16a34a' },
    'Failed':    { bg: '#fef2f2', text: '#dc2626',  dot: '#dc2626' },
};

const STATUS_CONFIG_DARK: Record<string, { bg: string; text: string; dot: string }> = {
    'Pending':   { bg: '#422006', text: '#fbbf24',  dot: '#d97706' },
    'Scheduled': { bg: '#0c3a5a', text: '#38bdf8',  dot: '#38bdf8' },
    'Assigned':  { bg: '#0c3a5a', text: '#38bdf8',  dot: '#38bdf8' },
    'Out':       { bg: '#431407', text: '#fb923c',  dot: '#f0782d' },
    'Delivered': { bg: '#14532d', text: '#4ade80',  dot: '#4ade80' },
    'Failed':    { bg: '#7f1d1d', text: '#f87171',  dot: '#f87171' },
};

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function DeliveryPersonHomeScreen() {
    const router = useRouter();
    const { scheme } = useTheme();
    const STATUS_CONFIG = scheme === 'dark' ? STATUS_CONFIG_DARK : STATUS_CONFIG_LIGHT;
    const user = useAuthStore(state => state.user);
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(translateX, { toValue: 15, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(translateX, { toValue: -5, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, [translateX]);

    const fetchData = async () => {
        try {
            const response = await getDeliveries({ offset: 0, limit: 50 });
            setDeliveries(response.data);
        } catch (error) {
            console.error('Error fetching courier deliveries:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);
    const onRefresh = () => { setRefreshing(true); fetchData(); };

    const pendingCount   = deliveries.filter(d => ['Pending','Scheduled','Assigned','Out'].includes(d.statusId?.status || 'Pending')).length;
    const completedCount = deliveries.filter(d => d.statusId?.status === 'Delivered').length;

    // Show only the 3 most recent deliveries on the home screen
    const recentDeliveries = deliveries.slice(0, 3);

    const renderDeliveryCard = (item: any) => {
        const statusLabel  = item.statusId?.status || 'Pending';
        const cfg          = STATUS_CONFIG[statusLabel] ?? STATUS_CONFIG['Pending'];
        const shipment     = item.shipmentId || {};
        const deliveredByName = typeof item.deliveredBy === 'object' && item.deliveredBy
            ? [item.deliveredBy.firstname?.trim(), item.deliveredBy.lastname?.trim()].filter(Boolean).join(' ')
            : (item.deliveredBy as string | undefined) ?? null;
        const receiverName = [item.receivedBy?.firstname?.trim(), item.receivedBy?.lastname?.trim()]
            .filter(Boolean).join(' ') || deliveredByName || null;
        const address      = item.address || 'Address not provided';
        const date         = item.timestamp ? fmtDate(item.timestamp) : fmtDate(item.createdAt);
        const shipmentType = shipment.shipmentType as string | undefined;

        return (
            <TouchableOpacity
                key={item._id}
                activeOpacity={0.85}
                onPress={() => router.push({
                    pathname: '/(tabs-delivery)/delivery/[id]' as any,
                    params: { id: item._id, data: JSON.stringify(item) },
                })}
                style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, borderColor: cfg.dot, borderWidth: 0.17, shadowOffset: { width: 0, height: 2 } }}
                className="bg-white dark:bg-slate-800 rounded-xl mb-3 overflow-hidden"
            >
                <View className="pl-5 pr-4 py-4">
                    <View className="flex-row justify-between items-center mb-2.5">
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                            {shipment.trackingId || item._id.slice(-8).toUpperCase()}
                        </Text>
                        <View style={{ backgroundColor: cfg.bg }} className="px-2.5 py-1 rounded-full flex-row items-center gap-1.5">
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.dot }} />
                            <Text style={{ fontFamily: 'Manrope_600SemiBold', color: cfg.text, fontSize: 11 }}>{statusLabel}</Text>
                        </View>
                    </View>
                    {receiverName && (
                        <View className="flex-row items-center gap-1.5 mb-1.5">
                            <Ionicons name="person-outline" size={13} color="#94A3B8" />
                            <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-600 text-sm">{receiverName}</Text>
                        </View>
                    )}
                    <View className="flex-row items-center gap-1.5 mb-3">
                        <Ionicons name="location-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs flex-1" numberOfLines={1}>{address}</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row gap-2">
                            {shipmentType && (
                                <View className="flex-row items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                                    <Ionicons name={shipmentType === 'Air Freight' ? 'airplane-outline' : 'boat-outline'} size={11} color="#64748B" />
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-500 dark:text-slate-400">{shipmentType}</Text>
                                </View>
                            )}
                            <View className="flex-row items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                                <Ionicons name="calendar-outline" size={11} color="#64748B" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-500 dark:text-slate-400">{date}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <StatusBar style="auto" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 110 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F0782D" colors={['#F0782D']} />}
            >
                {/* Header */}
                <View className="pt-6 pb-4 px-5">
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">Courier Pro</Text>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-xl mt-0.5">
                                Hi, <Text className="text-brand-orange">{user?.firstname ?? user?.name?.split(' ')[0] ?? 'Driver'}</Text>
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg items-center justify-center border border-slate-100 dark:border-slate-700"
                            onPress={() => router.push('/(tabs-delivery)/notifications' as any)}
                        >
                            <Ionicons name="notifications-outline" size={22} color="#1e4b69" />
                            <View className="absolute top-3 right-3 w-2 h-2 bg-brand-orange rounded-full border-2 border-white" />
                        </TouchableOpacity>
                    </View>

                    {/* Stats + illustration */}
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <View className="bg-brand-orange rounded-lg p-4 overflow-hidden mb-3">
                                <View className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-white/70 uppercase tracking-widest">Remaining</Text>
                                <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-3xl mt-0.5">{pendingCount}</Text>
                            </View>
                            <View className="bg-brand-secondary rounded-lg p-4 overflow-hidden">
                                <View className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-white/70 uppercase tracking-widest">Completed</Text>
                                <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-3xl mt-0.5">{completedCount}</Text>
                            </View>
                        </View>
                        <View className="w-36 items-center justify-center">
                            <Animated.Image
                                source={require('@/assets/images/illustrations/delivery_rider.webp')}
                                style={{ width: 140, height: 140, transform: [{ translateX }] }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>

                {/* Scan & Go CTA */}
                <View className="px-5 mb-5">
                    <TouchableOpacity
                        className="bg-brand-secondary rounded-lg p-5 flex-row items-center justify-between"
                        activeOpacity={0.85}
                        onPress={() => router.push('/(tabs-delivery)/scan' as any)}
                    >
                        <View>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-base">Scan & Go</Text>
                            <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-white/60 text-xs mt-0.5">Ready for your next delivery?</Text>
                        </View>
                        <View className="w-12 h-12 bg-brand-orange rounded-lg items-center justify-center">
                            <Ionicons name="scan" size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Recent Deliveries — latest 3 */}
                <View className="flex-row justify-between items-center px-5 mb-3">
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">Recent Deliveries</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs-delivery)/completed' as any)} hitSlop={8}>
                        <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-orange text-xs">See All</Text>
                    </TouchableOpacity>
                </View>

                <View className="px-5">
                    {loading ? (
                        <View className="items-center py-10">
                            <ActivityIndicator size="large" color="#F0782D" />
                            <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 mt-3 text-sm">Loading deliveries...</Text>
                        </View>
                    ) : recentDeliveries.length === 0 ? (
                        <View className="items-center mt-6 px-8 py-10">
                            <Ionicons name="bicycle-outline" size={48} color="#CBD5E1" />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg text-center mt-4">No Deliveries Yet</Text>
                            <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mt-2">Your assigned deliveries will appear here.</Text>
                        </View>
                    ) : (
                        <>
                            {recentDeliveries.map(item => renderDeliveryCard(item))}
                            {deliveries.length > 3 && (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => router.push('/(tabs-delivery)/completed' as any)}
                                    className="flex-row items-center justify-center gap-2 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl mb-2"
                                >
                                    <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm">
                                        View all {deliveries.length} deliveries
                                    </Text>
                                    <Ionicons name="arrow-forward" size={14} color="#1e4b69" />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
