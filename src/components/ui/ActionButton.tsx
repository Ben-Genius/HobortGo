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
            bgClass = 'bg-brand-orange';
            textClass = 'text-white';
            break;
        case 'secondary':
            bgClass = 'bg-brand-secondary';
            textClass = 'text-white';
            break;
        case 'outline':
            bgClass = 'bg-transparent border-2 border-slate-200';
            textClass = 'text-brand-secondary';
            break;
        case 'danger':
            bgClass = 'bg-red-500';
            textClass = 'text-white';
            break;
    }

    const opacity = disabled || isLoading ? 'opacity-60' : 'opacity-100';

    return (
        <TouchableOpacity
            className={`py-5 rounded-lg items-center justify-center flex-row ${bgClass} ${opacity} ${className}`}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className={`text-base ${textClass}`}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}
