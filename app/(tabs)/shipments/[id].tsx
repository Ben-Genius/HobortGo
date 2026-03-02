import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const TIMELINE = [
    { status: 'Received at USA Warehouse', time: 'Feb 24, 2:15 PM', actor: 'K. Asante', done: true },
    { status: 'Added to Master Shipment', time: 'Feb 24, 3:00 PM', actor: 'System', done: true },
    { status: 'In Transit', time: 'Feb 25, 8:00 AM', actor: 'A. Mensah', done: true },
    { status: 'Arrived at Destination', time: 'Mar 1, 6:30 AM', actor: 'System', done: false },
    { status: 'Ready for Pickup / Delivery', time: '—', actor: '—', done: false },
];

const SHIPMENT = {
    id: 'HB-10041',
    sender: 'Amazon US',
    recipient: 'Kofi Asante',
    recipientPhone: '+233 24 000 0001',
    origin: 'USA',
    weight: 2.3,
    declaredValue: 180,
    status: 'In Transit',
    notes: 'Handle with care — electronics',
    photos: [] as string[],
};

const FLAG_REASONS = ['Damaged', 'Missing Item', 'Customs Hold', 'Discrepancy'] as const;

export default function AdminShipmentDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [flagged, setFlagged] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState<string | null>(null);

    const handleFlag = (reason: string) => {
        setSelectedFlag(reason);
        setFlagged(true);
        Alert.alert('Flagged', `Shipment flagged: ${reason}`);
    };

    const handleStatusOverride = () => {
        Alert.alert('Override Status', 'Select a reason code to manually override the status.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Override', style: 'destructive', onPress: () => Alert.alert('Status Updated') },
        ]);
    };

    const handleMarkReady = () => {
        Alert.alert('Mark Ready', 'Shipment will be marked Ready for Pickup / Delivery.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Confirm', onPress: () => Alert.alert('Updated', 'Shipment is now Ready.') },
        ]);
    };

    return (
        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

            {/* ── Header ── */}
            <View className="pt-16 px-5 pb-5">
                {/* Back + Actions row */}
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-slate-50 rounded-lg items-center justify-center border border-slate-100">
                        <Ionicons name="arrow-back-outline" size={20} color="#1e4b69" />
                    </TouchableOpacity>
                    <View className="flex-row gap-2">
                        <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-lg items-center justify-center border border-slate-100">
                            <Ionicons name="share-outline" size={18} color="#1e4b69" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-lg items-center justify-center border border-slate-100">
                            <Ionicons name="ellipsis-horizontal" size={18} color="#1e4b69" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hero card — orange accent */}
                <View className="bg-brand-orange rounded-lg p-5 overflow-hidden mb-5">
                    <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                    <View className="absolute right-10 bottom-2 w-16 h-16 bg-white/5 rounded-full" />
                    <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-white/70 text-xs uppercase tracking-widest mb-1">
                        Tracking ID
                    </Text>
                    <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-3xl mb-2">
                        {SHIPMENT.id}
                    </Text>
                    <View className="flex-row items-center gap-3">
                        <View className="bg-white/20 px-3 py-1.5 rounded-full">
                            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11 }} className="text-white">
                                {SHIPMENT.status}
                            </Text>
                        </View>
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-white/70 text-xs">
                            {SHIPMENT.sender} · {SHIPMENT.origin}
                        </Text>
                    </View>
                </View>

                {/* Flagged alert */}
                {flagged && (
                    <View className="bg-red-50 border border-red-100 p-3.5 rounded-lg flex-row items-center gap-3">
                        <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center">
                            <Ionicons name="flag" size={14} color="#EF4444" />
                        </View>
                        <View>
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-red-400 uppercase tracking-widest">Shipment Flagged</Text>
                            <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-red-600 text-sm">{selectedFlag}</Text>
                        </View>
                    </View>
                )}
            </View>

            <View className="px-5">
                {/* ── Recipient & Package Info — two-column grid ── */}
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                    Package Details
                </Text>

                <View className="bg-slate-50 rounded-lg border border-slate-100 mb-5 overflow-hidden">
                    {/* Row 1 */}
                    <View className="flex-row border-b border-slate-100">
                        <View className="flex-1 p-4 border-r border-slate-100">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1">Recipient</Text>
                            <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm" numberOfLines={1}>{SHIPMENT.recipient}</Text>
                        </View>
                        <View className="flex-1 p-4">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1">Phone</Text>
                            <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm" numberOfLines={1}>{SHIPMENT.recipientPhone}</Text>
                        </View>
                    </View>
                    {/* Row 2 */}
                    <View className="flex-row border-b border-slate-100">
                        <View className="flex-1 p-4 border-r border-slate-100">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1">Sender</Text>
                            <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm">{SHIPMENT.sender}</Text>
                        </View>
                        <View className="flex-1 p-4">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1">Origin</Text>
                            <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm">{SHIPMENT.origin}</Text>
                        </View>
                    </View>
                    {/* Row 3 */}
                    <View className="flex-row border-b border-slate-100">
                        <View className="flex-1 p-4 border-r border-slate-100">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1">Weight</Text>
                            <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm">{SHIPMENT.weight} kg</Text>
                        </View>
                        <View className="flex-1 p-4">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1">Declared Value</Text>
                            <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-secondary text-sm">${SHIPMENT.declaredValue}</Text>
                        </View>
                    </View>
                    {/* Notes full width */}
                    <View className="p-4">
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1">Notes</Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-500 text-sm leading-5">{SHIPMENT.notes}</Text>
                    </View>
                </View>

                {/* ── Timeline ── */}
                <View className="flex-row justify-between items-center mb-3">
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">
                        Journey
                    </Text>
                    <View className="flex-row items-center gap-1">
                        <View className="w-2 h-2 bg-brand-orange rounded-full" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-400">Live</Text>
                    </View>
                </View>

                <View className="bg-slate-50 rounded-lg border border-slate-100 p-4 mb-5">
                    {TIMELINE.map((step, idx) => (
                        <View key={idx} className="flex-row">
                            {/* dot + line */}
                            <View className="items-center mr-3.5" style={{ width: 20 }}>
                                <View className={`w-5 h-5 rounded-full items-center justify-center border-2 ${step.done ? 'bg-brand-secondary border-brand-secondary' : 'bg-white border-slate-200'
                                    }`}>
                                    {step.done
                                        ? <Ionicons name="checkmark" size={11} color="white" />
                                        : <View className="w-1.5 h-1.5 bg-slate-200 rounded-full" />}
                                </View>
                                {idx < TIMELINE.length - 1 && (
                                    <View className={`w-0.5 my-1 flex-1 ${step.done ? 'bg-brand-secondary/30' : 'bg-slate-100'}`} style={{ minHeight: 20 }} />
                                )}
                            </View>
                            {/* content */}
                            <View className="flex-1 pb-4">
                                <Text style={{
                                    fontFamily: step.done ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                                    fontSize: 13,
                                    color: step.done ? '#1e4b69' : '#94A3B8',
                                }}>
                                    {step.status}
                                </Text>
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400 mt-0.5">
                                    {step.time}{step.actor !== '—' ? ` · ${step.actor}` : ''}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Actions ── */}
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                    Actions
                </Text>

                <View className="gap-3 mb-5">
                    <TouchableOpacity
                        className="bg-brand-orange rounded-lg py-4 flex-row items-center justify-center gap-2"
                        onPress={handleMarkReady}>
                        <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-sm">
                            Mark Ready for Pickup
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-brand-secondary rounded-lg py-4 flex-row items-center justify-center gap-2"
                            onPress={handleStatusOverride}>
                            <Ionicons name="refresh-outline" size={16} color="white" />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-sm">
                                Override
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-slate-50 border border-slate-100 rounded-lg py-4 flex-row items-center justify-center gap-2">
                            <Ionicons name="camera-outline" size={16} color="#1e4b69" />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-sm">
                                Photos
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Flag Issue ── */}
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">
                    Flag Issue
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {FLAG_REASONS.map(reason => (
                        <TouchableOpacity
                            key={reason}
                            onPress={() => handleFlag(reason)}
                            className={`px-4 py-2.5 rounded-lg border ${selectedFlag === reason
                                    ? 'bg-red-500 border-red-500'
                                    : 'bg-slate-50 border-slate-100'
                                }`}>
                            <Text style={{
                                fontFamily: 'Manrope_500Medium',
                                fontSize: 12,
                                color: selectedFlag === reason ? 'white' : '#64748B',
                            }}>
                                {reason}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
