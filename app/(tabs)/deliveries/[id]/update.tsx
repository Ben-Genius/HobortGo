import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ActionButton } from '../../../../src/components/ui/ActionButton';
import { Card } from '../../../../src/components/ui/Card';
// import { updateDeliveryStatus } from '../../../../src/api/deliveries';

export default function DeliveryUpdateScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const idsRaw = Array.isArray(id) ? id[0] : id || '';
    const idArray = idsRaw.split(',').filter(Boolean);
    const isMultiple = idArray.length > 1;

    const [status, setStatus] = useState('In Transit');
    const [receiveType, setReceiveType] = useState('Self');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Mocks for Image and Signature captures
    const [imageCaptured, setImageCaptured] = useState(false);
    const [signatureCaptured, setSignatureCaptured] = useState(false);

    const handleSubmit = async () => {
        if (status === 'Delivered' && (!imageCaptured || !signatureCaptured)) {
            Alert.alert('Missing Proof', 'Please capture both an image and signature for a delivered status.');
            return;
        }

        setSubmitting(true);
        // Mock API Call
        setTimeout(() => {
            setSubmitting(false);
            Alert.alert(
                'Status Updated',
                isMultiple
                    ? `Successfully updated ${idArray.length} deliveries to ${status}.`
                    : `Delivery ${idsRaw} is now ${status}.`,
                [{ text: 'OK', onPress: () => router.push('/(tabs)/deliveries' as any) }]
            );
        }, 1500);
    };

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            {/* Header */}
            <View className="bg-[#1e4b69] pt-16 pb-6 px-4 flex-row items-center border-b border-white/10 shadow-sm relative z-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 bg-white/10 rounded-full">
                    <Text className="text-white font-bold text-lg leading-5">{'<'}</Text>
                </TouchableOpacity>
                <View>
                    <Text className="text-white font-bold text-xl tracking-tight">
                        {isMultiple ? 'Batch Update Shipments' : 'Update Shipment'}
                    </Text>
                    <Text className="text-blue-100 text-sm font-medium">
                        {isMultiple ? `${idArray.length} packages selected` : `Tracking ID: ${idsRaw}`}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                <Card className="mb-6">
                    <Text className="text-gray-900 font-extrabold text-lg mb-4">Set New Status</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {['Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'].map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setStatus(s)}
                                className={`w-[48%] py-3 px-2 rounded-xl mb-3 border-2 items-center justify-center ${status === s
                                    ? 'border-[#f0782d] bg-[#fff0e6]'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <Text className={`font-bold text-center ${status === s ? 'text-[#f0782d]' : 'text-gray-500'
                                    }`}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                {status === 'Delivered' && (
                    <Card className="mb-6">
                        <Text className="text-gray-900 font-extrabold text-lg mb-4">Delivery Proof</Text>

                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Receiver Type</Text>
                            <View className="flex-row">
                                {['Self', 'VerifiedPerson', 'Other'].map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setReceiveType(type)}
                                        className={`mr-2 py-2 px-4 rounded-full border ${receiveType === type
                                            ? 'bg-[#1e4b69] border-[#1e4b69]'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text className={receiveType === type ? 'text-white font-bold' : 'text-gray-600'}>
                                            {PlatformFriendlyName(type)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row justify-between mb-2">
                            <TouchableOpacity
                                onPress={() => setImageCaptured(!imageCaptured)}
                                className={`flex-1 py-8 rounded-2xl items-center justify-center border-2 border-dashed mr-2 ${imageCaptured ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300'
                                    }`}
                            >
                                <Text className="text-3xl mb-2">{imageCaptured ? '✅' : '📷'}</Text>
                                <Text className="text-gray-600 font-medium">
                                    {imageCaptured ? 'Photo Captured' : 'Take Photo'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setSignatureCaptured(!signatureCaptured)}
                                className={`flex-1 py-8 rounded-2xl items-center justify-center border-2 border-dashed ml-2 ${signatureCaptured ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300'
                                    }`}
                            >
                                <Text className="text-3xl mb-2">{signatureCaptured ? '✍️' : '📝'}</Text>
                                <Text className="text-gray-600 font-medium">
                                    {signatureCaptured ? 'Signed' : 'Get Signature'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                )}

                <View className="mb-6">
                    <Text className="text-gray-900 font-extrabold text-lg mb-2">Courier Notes (Optional)</Text>
                    <TextInput
                        className="bg-white border border-gray-200 rounded-2xl min-h-[100px] p-4 text-gray-800"
                        placeholder="Location details, customer requests, etc."
                        multiline
                        textAlignVertical="top"
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

            </ScrollView>

            <View className="p-4 bg-white border-t border-gray-100 pb-8">
                <ActionButton
                    label={isMultiple ? `Update ${idArray.length} Shipments` : "Update Shipment"}
                    onPress={handleSubmit}
                    isLoading={submitting}
                />
            </View>
        </View>
    );
}

const PlatformFriendlyName = (t: string) => {
    switch (t) {
        case 'Self': return 'Client (Self)';
        case 'VerifiedPerson': return 'Verified Handler';
        default: return 'Other/Neighbors';
    }
}
