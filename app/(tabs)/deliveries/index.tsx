import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DELIVERY_FILTERS = ['All', 'Pending', 'Assigned', 'Out', 'Completed', 'Failed'] as const;
type DeliveryFilter = typeof DELIVERY_FILTERS[number];

const DELIVERY_PERSONS = [
    { id: 'dp1', name: 'Kwame Asare', active: 3, completed: 8 },
    { id: 'dp2', name: 'Abena Boateng', active: 1, completed: 12 },
    { id: 'dp3', name: 'Yaw Mensah', active: 5, completed: 5 },
];

const DUMMY_DELIVERIES = [
    { id: '1', trackingId: 'HB-10041', client: 'Kofi Asante', phone: '+233 24 000 001', address: '14 Ring Rd Central, Accra', time: 'Morning (8–12)', status: 'Pending', assignedTo: null, proof: null, reason: null },
    { id: '2', trackingId: 'HB-10039', client: 'Abena Mensah', phone: '+233 50 000 002', address: '7 Tema Motorway, Accra', time: 'Afternoon (12–5)', status: 'Assigned', assignedTo: 'Kwame Asare', proof: null, reason: null },
    { id: '3', trackingId: 'HB-10035', client: 'Kwame Boateng', phone: '+233 27 000 003', address: 'Osu Oxford St, Accra', time: 'Evening (5–8)', status: 'Out', assignedTo: 'Yaw Mensah', proof: null, reason: null },
    { id: '4', trackingId: 'HB-10023', client: 'John Doe', phone: '+233 24 000 004', address: '5 Airport Rd, Accra', time: 'Morning (8–12)', status: 'Completed', assignedTo: 'Abena Boateng', proof: { photo: true, signature: true, time: '11:42 AM' }, reason: null },
    { id: '5', trackingId: 'HB-10018', client: 'Yaw Osei', phone: '+233 50 000 005', address: 'Labone, Accra', time: 'Afternoon (12–5)', status: 'Failed', assignedTo: 'Kwame Asare', proof: null, reason: 'Customer not available' },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    Pending: { bg: '#fef3c7', text: '#92400e', dot: '#d97706' },
    Assigned: { bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69' },
    Out: { bg: '#fff0e6', text: '#f0782d', dot: '#f0782d' },
    Completed: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
    Failed: { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626' },
};

const STAT_OVERVIEW = [
    { label: 'Pending', key: 'Pending', color: '#92400e', bg: '#fef3c7' },
    { label: 'Assigned', key: 'Assigned', color: '#1e4b69', bg: '#e6f0f5' },
    { label: 'En Route', key: 'Out', color: '#f0782d', bg: '#fff0e6' },
    { label: 'Done', key: 'Completed', color: '#16a34a', bg: '#f0fdf4' },
];

export default function AdminDeliveriesScreen() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<DeliveryFilter>('All');
    const [deliveries, setDeliveries] = useState(DUMMY_DELIVERIES);

    const filtered = activeFilter === 'All' ? deliveries : deliveries.filter(d => d.status === activeFilter);

    const handleAssign = (deliveryId: string) => {
        Alert.alert(
            'Assign Delivery',
            'Select a delivery person:',
            [
                ...DELIVERY_PERSONS.map(dp => ({
                    text: `${dp.name} (${dp.active} active)`,
                    onPress: () => setDeliveries(prev =>
                        prev.map(d => d.id === deliveryId ? { ...d, status: 'Assigned', assignedTo: dp.name } : d)
                    ),
                })),
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const renderItem = ({ item }: { item: typeof DUMMY_DELIVERIES[0] }) => {
        const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.Pending;
        return (
            <View className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-100">

                {/* Row 1 — Tracking ID + Status */}
                <View className="flex-row justify-between items-center mb-3">
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                        {item.trackingId}
                    </Text>
                    <View style={{ backgroundColor: cfg.bg }} className="px-3 py-1 rounded-full flex-row items-center gap-1.5">
                        <View style={{ backgroundColor: cfg.dot }} className="w-1.5 h-1.5 rounded-full" />
                        <Text style={{ color: cfg.text, fontFamily: 'Manrope_600SemiBold', fontSize: 10 }}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                {/* Row 2 — Client + Time window */}
                <View className="flex-row gap-4 mb-3">
                    <View className="flex-1 flex-row items-center gap-2">
                        <Ionicons name="person-outline" size={13} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-secondary text-sm flex-1" numberOfLines={1}>
                            {item.client}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                        <Ionicons name="time-outline" size={12} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400">
                            {item.time.split(' ')[0]}
                        </Text>
                    </View>
                </View>

                {/* Row 3 — Address */}
                <View className="flex-row items-start gap-2 mb-3">
                    <Ionicons name="location-outline" size={13} color="#94A3B8" style={{ marginTop: 1 }} />
                    <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs flex-1" numberOfLines={2}>
                        {item.address}
                    </Text>
                </View>

                {/* Assigned driver row */}
                {item.assignedTo && (
                    <View className="flex-row items-center gap-2 mb-3">
                        <View className="w-6 h-6 bg-brand-secondary rounded-full items-center justify-center">
                            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 9 }} className="text-white">
                                {item.assignedTo.charAt(0)}
                            </Text>
                        </View>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-brand-secondary">
                            {item.assignedTo}
                        </Text>
                    </View>
                )}

                {/* Proof of delivery */}
                {item.proof && (
                    <View className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3 flex-row items-center gap-2">
                        <Ionicons name="checkmark-circle-outline" size={16} color="#16A34A" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12 }} className="text-green-700">
                            Delivered at {item.proof.time}
                        </Text>
                    </View>
                )}

                {/* Failed reason */}
                {item.status === 'Failed' && item.reason && (
                    <View className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3 flex-row items-center gap-2">
                        <Ionicons name="alert-circle" size={16} color="#DC2626" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12 }} className="text-red-600">
                            {item.reason}
                        </Text>
                    </View>
                )}

                {/* Assign action */}
                {item.status === 'Pending' && (
                    <TouchableOpacity
                        className="bg-brand-secondary rounded-lg py-3 flex-row items-center justify-center gap-2 mt-1"
                        onPress={() => handleAssign(item.id)}>
                        <Ionicons name="person-add-outline" size={15} color="white" />
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12 }} className="text-white">
                            Assign Driver
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* ── Header ── */}
            <View className="pt-6 pb-4 px-5">
                {/* Title row */}
                <View className="flex-row justify-between items-center mb-5">
                    <View>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">
                            Operations
                        </Text>
                        <Text style={{ fontFamily: 'Poppins_600' }} className="text-brand-secondary text-lg mt-1">
                            Deliver<Text className="text-brand-orange">ies</Text>
                        </Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-brand-orange rounded-lg items-center justify-center">
                        <Ionicons name="add" size={22} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Stat grid — 2×2 */}
                <View className="flex-row flex-wrap mb-5" style={{ gap: 8 }}>
                    {STAT_OVERVIEW.map(s => (
                        <View
                            key={s.label}
                            style={{ backgroundColor: s.bg, width: '48.5%' }}
                            className="rounded-lg px-4 py-3 overflow-hidden">
                            {/* Single bubble */}
                            <View
                                style={{ backgroundColor: s.color, opacity: 0.1, position: 'absolute', top: -16, right: -18 }}
                                className="w-24 h-24 rounded-full"
                            />
                            <Text style={{ color: s.color, fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="uppercase tracking-widest mb-1">
                                {s.label}
                            </Text>
                            <Text style={{ color: s.color, fontFamily: 'Poppins_700Bold', fontSize: 26 }}>
                                {deliveries.filter(d => d.status === s.key).length}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Driver board */}
                <View className="flex-row justify-between items-center mb-3">
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                        Drivers
                    </Text>
                    <TouchableOpacity>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-orange text-sm">
                            Manage
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row gap-2 mb-5">
                    {DELIVERY_PERSONS.map(dp => (
                        <View key={dp.id} className="flex-1 bg-slate-50 rounded-lg px-3 py-3 items-center border border-slate-100">
                            <View className="w-9 h-9 bg-brand-secondary rounded-full items-center justify-center mb-2">
                                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 13 }} className="text-white">
                                    {dp.name.charAt(0)}
                                </Text>
                            </View>
                            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10 }} className="text-brand-secondary text-center mb-1" numberOfLines={1}>
                                {dp.name.split(' ')[0]}
                            </Text>
                            <View className="flex-row items-center gap-1">
                                <View className="w-1.5 h-1.5 bg-brand-orange rounded-full" />
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400">
                                    {dp.active} active
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Filter pills */}
                <FlatList
                    data={DELIVERY_FILTERS as unknown as DeliveryFilter[]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setActiveFilter(item)}
                            className={`px-4 py-2 rounded-full mr-2 border ${activeFilter === item
                                ? 'bg-brand-secondary border-brand-secondary'
                                : 'bg-white border-slate-100'
                                }`}>
                            <Text style={{
                                fontFamily: 'Manrope_600SemiBold',
                                fontSize: 11,
                                color: activeFilter === item ? 'white' : '#94A3B8',
                            }}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* ── Section label ── */}
            <View className="flex-row justify-between items-center px-5 mb-2 mt-1">
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                    {filtered.length} {activeFilter === 'All' ? 'Deliveries' : activeFilter}
                </Text>
            </View>

            {/* ── List ── */}
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center mt-20 px-12">
                        <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4 border border-slate-100">
                            <Ionicons name="bicycle-outline" size={32} color="#CBD5E1" />
                        </View>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg text-center">
                            Dispatch Is Clear
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mt-2">
                            No deliveries found in this category.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
