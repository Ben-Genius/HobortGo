import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SignaturePadComponentProps {
    label: string;
    onSignatureCaptured: (dataUrl: string) => void;
}

export const SignaturePadComponent: React.FC<SignaturePadComponentProps> = ({ label }) => {
    return (
        <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1">{label}</Text>
            <View className="w-full h-40 border border-gray-300 rounded-lg bg-white items-center justify-center">
                <Text className="text-gray-400">Signature Pad Integration goes here...</Text>
            </View>
            <TouchableOpacity className="mt-2 self-end">
                <Text className="text-blue-500 font-medium">Clear Signature</Text>
            </TouchableOpacity>
        </View>
    );
};
