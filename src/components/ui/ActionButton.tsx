import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ActionButtonProps extends TouchableOpacityProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
    className?: string;
}

export function ActionButton({
    label,
    variant = 'primary',
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ActionButtonProps) {

    let bgClass = '';
    let textClass = '';

    switch (variant) {
        case 'primary':
            bgClass = 'bg-[#f0782d]'; // HobortGo Orange
            textClass = 'text-white';
            break;
        case 'secondary':
            bgClass = 'bg-[#e6f0f5]'; // Light Blue
            textClass = 'text-[#1e4b69]';
            break;
        case 'outline':
            bgClass = 'bg-transparent border-2 border-gray-200';
            textClass = 'text-gray-700';
            break;
        case 'danger':
            bgClass = 'bg-red-500';
            textClass = 'text-white';
            break;
    }

    const opacity = disabled || isLoading ? 'opacity-60' : 'opacity-100';

    return (
        <TouchableOpacity
            className={`py-4 rounded-2xl items-center justify-center flex-row ${bgClass} ${opacity} ${className}`}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? 'white' : '#f0782d'} />
            ) : (
                <Text className={`font-bold text-lg ${textClass}`}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}
