import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

const DELIVERY_FILTERS = ['All', 'Pending', 'Assigned', 'Out', 'Completed', 'Failed'] as const;
type DeliveryFilter = typeof DELIVERY_FILTERS[number];

const DELIVERY_PERSONS = [
    { id: 'dp1', name: 'Kwame Asare', active: 3 },
    { id: 'dp2', name: 'Abena Boateng', active: 1 },
    { id: 'dp3', name: 'Yaw Mensah', active: 5 },
];

const DUMMY_DELIVERIES = [
    { id: '1', trackingId: 'HB-10041', client: 'Kofi Asante', phone: '+233 24 000 001', address: '14 Ring Rd Central, Accra', time: 'Morning (8–12)', status: 'Pending', assignedTo: null, proof: null },
    { id: '2', trackingId: 'HB-10039', client: 'Abena Mensah', phone: '+233 50 000 002', address: '7 Tema Motorway, Accra', time: 'Afternoon (12–5)', status: 'Assigned', assignedTo: 'Kwame Asare', proof: null },
    { id: '3', trackingId: 'HB-10035', client: 'Kwame Boateng', phone: '+233 27 000 003', address: 'Osu Oxford St, Accra', time: 'Evening (5–8)', status: 'Out', assignedTo: 'Yaw Mensah', proof: null },
    { id: '4', trackingId: 'HB-10023', client: 'John Doe', phone: '+233 24 000 004', address: '5 Airport Rd, Accra', time: 'Morning (8–12)', status: 'Completed', assignedTo: 'Abena Boateng', proof: { photo: true, signature: true, time: '11:42 AM' } },
    { id: '5', trackingId: 'HB-10018', client: 'Yaw Osei', phone: '+233 50 000 005', address: 'Labone, Accra', time: 'Afternoon (12–5)', status: 'Failed', assignedTo: 'Kwame Asare', proof: null, reason: 'Customer not available' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    Pending: { bg: '#fef3c7', text: '#92400e' },
    Assigned: { bg: '#e6f0f5', text: '#1e4b69' },
    Out: { bg: '#fff0e6', text: '#f0782d' },
    Completed: { bg: '#f0fdf4', text: '#16a34a' },
    Failed: { bg: '#fef2f2', text: '#dc2626' },
};

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
                    onPress: () => {
                        setDeliveries(prev =>
                            prev.map(d => d.id === deliveryId ? { ...d, status: 'Assigned', assignedTo: dp.name } : d)
                        );
                    },
                })),
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const renderItem = ({ item }: { item: typeof DUMMY_DELIVERIES[0] }) => {
        const colors = STATUS_COLORS[item.status] ?? STATUS_COLORS.Pending;
        return (
            <View className="bg-slate-50 rounded-3xl p-6 mb-4 border border-slate-100">
                {/* Top row */}
                <View className="flex-row justify-between items-start mb-4">
                    <Text className="text-brand-slate font-black text-lg">{item.trackingId}</Text>
                    <View style={{ backgroundColor: colors.bg }} className="px-3 py-1.5 rounded-xl">
                        <Text style={{ color: colors.text }} className="text-[10px] font-black uppercase tracking-tighter">{item.status}</Text>
                    </View>
                </View>

                {/* Info blocks */}
                <View className="space-y-3 mb-6">
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-white rounded-xl items-center justify-center border border-slate-100">
                            <Ionicons name="person-outline" size={14} color="#64748B" />
                        </View>
                        <Text className="text-brand-slate font-bold text-sm ml-3">{item.client}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-white rounded-xl items-center justify-center border border-slate-100">
                            <Ionicons name="location-outline" size={14} color="#64748B" />
                        </View>
                        <Text className="text-slate-500 text-xs ml-3 flex-1">{item.address}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-white rounded-xl items-center justify-center border border-slate-100">
                            <Ionicons name="time-outline" size={14} color="#64748B" />
                        </View>
                        <Text className="text-slate-400 text-[10px] font-bold ml-3 uppercase tracking-tighter">{item.time}</Text>
                        {item.assignedTo && (
                            <View className="flex-row items-center ml-4">
                                <View className="w-2 h-2 bg-brand-orange rounded-full mr-2" />
                                <Text className="text-brand-slate font-bold text-[10px] uppercase">{item.assignedTo}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Conditional Proof/Fail blocks */}
                {item.proof && (
                    <View className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-4 flex-row items-center">
                        <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
                        <Text className="text-green-700 font-bold text-xs ml-2">
                            Delivered at {item.proof.time}
                        </Text>
                    </View>
                )}

                {item.status === 'Failed' && (item as any).reason && (
                    <View className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 flex-row items-center">
                        <Ionicons name="alert-circle" size={18} color="#DC2626" />
                        <Text className="text-red-600 font-bold text-xs ml-2">
                            {(item as any).reason}
                        </Text>
                    </View>
                )}

                {/* Actions */}
                {item.status === 'Pending' && (
                    <TouchableOpacity
                        className="bg-brand-slate py-4 rounded-2xl items-center flex-row justify-center gap-2"
                        onPress={() => handleAssign(item.id)}>
                        <Ionicons name="person-add-outline" size={16} color="white" />
                        <Text className="text-white font-black uppercase tracking-widest text-xs">Assign Driver</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header Area */}
            <View className="pt-16 pb-8 px-8">
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Operations</Text>
                        <Text className="text-brand-slate text-3xl font-black mt-1">Deliveries</Text>
                    </View>
                    <View className="bg-brand-orange/10 px-4 py-2 rounded-2xl">
                        <Text className="text-brand-orange font-black text-xs uppercase">
                            {deliveries.filter(d => d.status === 'Pending').length} Pending
                        </Text>
                    </View>
                </View>

                {/* Dispatch Board (Driver Stats) */}
                <Text className="text-brand-slate font-black text-lg mb-4">Dispatcher</Text>
                <View className="flex-row gap-3 mb-8">
                    {DELIVERY_PERSONS.map(dp => (
                        <View key={dp.id} className="flex-1 bg-slate-50 rounded-3xl p-4 items-center border border-slate-100">
                            <View className="w-10 h-10 bg-brand-slate rounded-2xl items-center justify-center mb-3">
                                <Text className="text-white font-black text-sm">{dp.name.charAt(0)}</Text>
                            </View>
                            <Text className="text-brand-slate font-bold text-[10px] text-center uppercase mb-1" numberOfLines={1}>
                                {dp.name.split(' ')[0]}
                            </Text>
                            <View className="bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                                <Text className="text-brand-orange font-black text-xs">{dp.active}</Text>
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
                            className={`px-5 py-2.5 rounded-2xl mr-3 border ${activeFilter === item ? 'bg-brand-slate border-brand-slate' : 'bg-white border-slate-100'
                                }`}>
                            <Text className={`text-[10px] uppercase font-black tracking-widest ${activeFilter === item ? 'text-white' : 'text-slate-400'
                                }`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center mt-20 px-12">
                        <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6 border border-slate-100">
                            <Ionicons name="bicycle-outline" size={40} color="#CBD5E1" />
                        </View>
                        <Text className="text-brand-slate text-lg font-black text-center">Dispatch Is Clear</Text>
                        <Text className="text-slate-400 text-sm text-center mt-2 font-medium">No deliveries found in this category.</Text>
                    </View>
                }
            />
        </View>
    );
}
