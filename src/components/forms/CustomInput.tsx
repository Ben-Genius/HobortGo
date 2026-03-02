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
        <View className="mb-2">
            {label && (
                <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2 ml-1">
                    {label}
                </Text>
            )}
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        className={`rounded-3xl px-6 py-4 bg-slate-50 text-brand-slate text-base border-2 ${error ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-brand-orange/20 focus:bg-white'
                            }`}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholderTextColor="#94A3B8"
                        {...textInputProps}
                    />
                )}
            />
            {error && <Text className="text-[10px] uppercase font-bold text-red-500 mt-2 ml-4 tracking-tighter">{error}</Text>}
        </View>
    );
}
