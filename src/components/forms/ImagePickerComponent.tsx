import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
// import * as ImagePicker from 'expo-image-picker'; // To be installed/configured

interface ImagePickerComponentProps {
    label: string;
    onImageSelected: (uri: string) => void;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({ label, onImageSelected }) => {
    return (
        <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1">{label}</Text>
            <TouchableOpacity
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center bg-gray-50 bg-opacity-50"
                onPress={() => console.log('Pick image logic here')}
            >
                <Text className="text-gray-500 text-base">Tap to select or capture {label.toLowerCase()}</Text>
            </TouchableOpacity>
        </View>
    );
};
