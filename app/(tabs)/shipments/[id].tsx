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
    photos: [],
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
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Header */}
            <View className="pt-16 pb-8 px-8">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center border border-slate-100 mb-8">
                    <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
                </TouchableOpacity>

                <View className="flex-row justify-between items-start mb-4">
                    <View>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tracking ID</Text>
                        <Text className="text-brand-slate text-3xl font-black mt-1">{SHIPMENT.id}</Text>
                    </View>
                    <View className="bg-brand-orange px-4 py-2 rounded-2xl">
                        <Text className="text-white text-xs font-black uppercase tracking-tighter">{SHIPMENT.status}</Text>
                    </View>
                </View>

                {flagged && (
                    <View className="bg-red-50 border border-red-100 p-4 rounded-2xl flex-row items-center">
                        <View className="w-8 h-8 bg-red-100 rounded-xl items-center justify-center mr-3">
                            <Ionicons name="flag" size={14} color="#EF4444" />
                        </View>
                        <View>
                            <Text className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Shipment Flagged</Text>
                            <Text className="text-red-600 font-bold text-sm">{selectedFlag}</Text>
                        </View>
                    </View>
                )}
            </View>

            <View className="px-8 mt-2">
                {/* Shipment Info Card */}
                <View className="bg-slate-50 rounded-4xl p-8 mb-6 border border-slate-100">
                    <Text className="text-brand-slate font-black text-xl mb-6">Details</Text>
                    <View className="space-y-6">
                        {[
                            { icon: 'person-outline', label: 'Recipient', value: SHIPMENT.recipient },
                            { icon: 'call-outline', label: 'Phone', value: SHIPMENT.recipientPhone },
                            { icon: 'cube-outline', label: 'Sender', value: SHIPMENT.sender },
                            { icon: 'earth-outline', label: 'Origin', value: SHIPMENT.origin },
                            { icon: 'scale-outline', label: 'Weight', value: `${SHIPMENT.weight} kg` },
                            { icon: 'cash-outline', label: 'Value', value: `$${SHIPMENT.declaredValue}` },
                            { icon: 'document-text-outline', label: 'Notes', value: SHIPMENT.notes },
                        ].map(row => (
                            <View key={row.label} className="flex-row items-start">
                                <View className="w-9 h-9 bg-white rounded-xl items-center justify-center border border-slate-100 mr-4">
                                    <Ionicons name={row.icon as any} size={16} color="#64748B" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{row.label}</Text>
                                    <Text className="text-brand-slate font-bold text-sm mt-0.5">{row.value}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Status Timeline */}
                <View className="bg-slate-50 rounded-4xl p-8 mb-6 border border-slate-100">
                    <Text className="text-brand-slate font-black text-xl mb-6">Timeline</Text>
                    {TIMELINE.map((step, idx) => (
                        <View key={idx} className="flex-row">
                            <View className="items-center mr-4">
                                <View className={`w-9 h-9 rounded-xl items-center justify-center border ${step.done ? 'bg-brand-slate border-brand-slate' : 'bg-white border-slate-200'}`}>
                                    {step.done
                                        ? <Ionicons name="checkmark" size={16} color="white" />
                                        : <View className="w-2 h-2 bg-slate-200 rounded-full" />}
                                </View>
                                {idx < TIMELINE.length - 1 && (
                                    <View className={`w-0.5 h-8 my-1 ${step.done ? 'bg-brand-slate/20' : 'bg-slate-100'}`} />
                                )}
                            </View>
                            <View className="flex-1 pt-1.5 pb-6">
                                <Text className={`font-black text-sm uppercase tracking-tight ${step.done ? 'text-brand-slate' : 'text-slate-400'}`}>
                                    {step.status}
                                </Text>
                                <Text className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-tighter">
                                    {step.time} • {step.actor}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Actions */}
                <View className="bg-slate-900 rounded-4xl p-8 mb-6">
                    <Text className="text-white font-black text-xl mb-6">Terminal Actions</Text>
                    <View className="space-y-4">
                        <TouchableOpacity
                            className="bg-brand-orange py-5 rounded-2xl flex-row items-center justify-center gap-3"
                            onPress={handleMarkReady}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                            <Text className="text-white font-black uppercase tracking-widest text-sm">Mark Ready</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-white/10 py-5 rounded-2xl flex-row items-center justify-center gap-3"
                            onPress={handleStatusOverride}>
                            <Ionicons name="refresh-outline" size={20} color="white" />
                            <Text className="text-white font-black uppercase tracking-widest text-sm">Override Status</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-white/10 py-5 rounded-2xl flex-row items-center justify-center gap-3">
                            <Ionicons name="camera-outline" size={20} color="white" />
                            <Text className="text-white font-black uppercase tracking-widest text-sm">Upload Photos</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Flag Shipment */}
                <View className="bg-slate-50 rounded-4xl p-8 border border-slate-100">
                    <Text className="text-brand-slate font-black text-xl mb-6">Flag Issue</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {FLAG_REASONS.map(reason => (
                            <TouchableOpacity
                                key={reason}
                                onPress={() => handleFlag(reason)}
                                className={`px-4 py-3 rounded-2xl border ${selectedFlag === reason ? 'bg-red-500 border-red-500' : 'bg-white border-slate-200'}`}>
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedFlag === reason ? 'text-white' : 'text-slate-400'}`}>
                                    {reason}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
