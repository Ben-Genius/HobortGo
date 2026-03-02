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
                <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-500 text-xs uppercase tracking-wider mb-2 ml-1">
                    {label}
                </Text>
            )}
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        className={`rounded-lg px-6 py-4 bg-slate-50 text-brand-secondary text-base border-2 ${error ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-brand-orange/20 focus:bg-white'
                            }`}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholderTextColor="#94A3B8"
                        {...textInputProps}
                    />
                )}
            />
            {error && <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-[10px] text-red-500 mt-2 ml-1">{error}</Text>}
        </View>
    );
}
