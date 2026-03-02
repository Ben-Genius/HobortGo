import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface CustomInputProps<T extends FieldValues> extends TextInputProps {
    control: Control<T>;
    name: Path<T>;
    label: string;
    error?: string;
}

export function CustomInput<T extends FieldValues>({
    control,
    name,
    label,
    error,
    ...textInputProps
}: CustomInputProps<T>) {
    return (
        <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1">{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        className={`border rounded-lg px-4 py-3 bg-white text-base ${error ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholderTextColor="#9ca3af"
                        {...textInputProps}
                    />
                )}
            />
            {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
        </View>
    );
}
