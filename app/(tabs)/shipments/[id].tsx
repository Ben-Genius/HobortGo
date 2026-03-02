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
        <ScrollView className="flex-1 bg-[#F9FAFB]" contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Header */}
            <View className="bg-[#1e4b69] pt-14 pb-6 px-6">
                <TouchableOpacity onPress={() => router.back()} className="mb-4 flex-row items-center">
                    <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.8)" />
                    <Text className="text-white/80 ml-2 font-medium">Shipments</Text>
                </TouchableOpacity>
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-white/60 text-xs mb-1">TRACKING ID</Text>
                        <Text className="text-white font-extrabold text-2xl">{SHIPMENT.id}</Text>
                    </View>
                    {flagged && (
                        <View className="bg-red-400 px-3 py-1.5 rounded-full flex-row items-center">
                            <Ionicons name="flag" size={12} color="white" />
                            <Text className="text-white text-xs font-bold ml-1">{selectedFlag}</Text>
                        </View>
                    )}
                </View>
                <View className="bg-[#f0782d] self-start px-3 py-1 rounded-full mt-2">
                    <Text className="text-white text-xs font-bold">{SHIPMENT.status}</Text>
                </View>
            </View>

            <View className="px-6 mt-4">
                {/* Shipment Info Card */}
                <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                    <Text className="text-gray-900 font-bold text-base mb-3">Shipment Details</Text>
                    {[
                        { icon: 'person-outline', label: 'Recipient', value: SHIPMENT.recipient },
                        { icon: 'call-outline', label: 'Phone', value: SHIPMENT.recipientPhone },
                        { icon: 'cube-outline', label: 'Sender', value: SHIPMENT.sender },
                        { icon: 'earth-outline', label: 'Origin', value: SHIPMENT.origin },
                        { icon: 'scale-outline', label: 'Weight', value: `${SHIPMENT.weight} kg` },
                        { icon: 'cash-outline', label: 'Declared Value', value: `$${SHIPMENT.declaredValue}` },
                        { icon: 'document-text-outline', label: 'Notes', value: SHIPMENT.notes },
                    ].map(row => (
                        <View key={row.label} className="flex-row items-center py-2.5 border-b border-gray-50 last:border-b-0">
                            <View className="w-7 h-7 bg-gray-100 rounded-full items-center justify-center mr-3">
                                <Ionicons name={row.icon as any} size={14} color="#6B7280" />
                            </View>
                            <Text className="text-gray-400 text-xs w-28">{row.label}</Text>
                            <Text className="text-gray-800 font-semibold text-sm flex-1">{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Status Timeline */}
                <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                    <Text className="text-gray-900 font-bold text-base mb-4">Status Timeline</Text>
                    {TIMELINE.map((step, idx) => (
                        <View key={idx} className="flex-row mb-3">
                            <View className="items-center mr-3">
                                <View className={`w-8 h-8 rounded-full items-center justify-center ${step.done ? 'bg-[#1e4b69]' : 'bg-gray-100'}`}>
                                    {step.done
                                        ? <Ionicons name="checkmark" size={14} color="white" />
                                        : <View className="w-2 h-2 bg-gray-300 rounded-full" />}
                                </View>
                                {idx < TIMELINE.length - 1 && (
                                    <View className={`w-0.5 h-6 mt-1 ${step.done ? 'bg-[#1e4b69]/30' : 'bg-gray-200'}`} />
                                )}
                            </View>
                            <View className="flex-1 pb-3">
                                <Text className={`font-semibold text-sm ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.status}
                                </Text>
                                <Text className="text-gray-400 text-xs">{step.time} · {step.actor}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Actions */}
                <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                    <Text className="text-gray-900 font-bold text-base mb-3">Actions</Text>
                    <TouchableOpacity
                        className="flex-row items-center py-3 border-b border-gray-100"
                        onPress={handleMarkReady}>
                        <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        </View>
                        <Text className="text-gray-800 font-semibold flex-1">Mark Ready for Pickup / Delivery</Text>
                        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-row items-center py-3 border-b border-gray-100"
                        onPress={handleStatusOverride}>
                        <View className="w-8 h-8 bg-[#fff0e6] rounded-full items-center justify-center mr-3">
                            <Ionicons name="refresh" size={16} color="#f0782d" />
                        </View>
                        <Text className="text-gray-800 font-semibold flex-1">Manual Status Override</Text>
                        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center py-3">
                        <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                            <Ionicons name="camera" size={16} color="#7c3aed" />
                        </View>
                        <Text className="text-gray-800 font-semibold flex-1">Upload Damage Photos</Text>
                        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                {/* Flag Shipment */}
                <View className="bg-white rounded-2xl p-4 border border-gray-100">
                    <Text className="text-gray-900 font-bold text-base mb-3">Flag Shipment</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {FLAG_REASONS.map(reason => (
                            <TouchableOpacity
                                key={reason}
                                onPress={() => handleFlag(reason)}
                                className={`px-3 py-2 rounded-xl border ${selectedFlag === reason ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                                <Text className={`text-sm font-semibold ${selectedFlag === reason ? 'text-red-600' : 'text-gray-600'}`}>
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
