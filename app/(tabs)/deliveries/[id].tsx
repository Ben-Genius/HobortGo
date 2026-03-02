import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CustomInput } from '../../../src/components/forms/CustomInput';
import { ImagePickerComponent } from '../../../src/components/forms/ImagePickerComponent';
import { SignaturePadComponent } from '../../../src/components/forms/SignaturePadComponent';

export default function DeliveryDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const { control, handleSubmit } = useForm({
        defaultValues: { receivedBy: '', idNumber: '', notes: '' },
    });

    const onSubmit = (data: any) => {
        Alert.alert('Success', 'Delivery updated successfully!');
        router.back();
    };

    return (
        <ScrollView className="flex-1 bg-gray-50 px-4 pt-12">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
                <Text className="text-blue-600 font-medium">← Back to Deliveries</Text>
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-gray-900 mb-2">Delivery #{id}</Text>
            <Text className="text-gray-500 mb-6">Scan QR to Auto-Fill Tracking Data or Update Manually.</Text>

            <View className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6">
                <Text className="font-semibold text-lg border-b border-gray-100 pb-2 mb-4">Proof of Delivery</Text>

                <CustomInput control={control} name="receivedBy" label="Receiver Name" placeholder="John Doe" />
                <CustomInput control={control} name="idNumber" label="Receiver ID Number" placeholder="GHA-123456789-0" />

                <ImagePickerComponent label="Photo Proof" onImageSelected={() => { }} />
                <SignaturePadComponent label="Receiver Signature" onSignatureCaptured={() => { }} />
                <CustomInput control={control} name="notes" label="Delivery Notes" placeholder="Left at front desk..." multiline numberOfLines={3} />

                <TouchableOpacity
                    className="bg-green-600 py-4 items-center rounded-xl mt-4"
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text className="text-white font-bold text-lg">Confirm Delivery</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
