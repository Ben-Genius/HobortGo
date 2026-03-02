import React from 'react';
import { Text, View } from 'react-native';

interface StatusBadgeProps {
    status: 'Pending' | 'In Transit' | 'Delivered' | 'Returned' | 'Processing';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    let bgClass = '';
    let textClass = '';
    let dotClass = '';

    switch (status) {
        case 'Delivered':
            bgClass = 'bg-green-100';
            textClass = 'text-green-800';
            dotClass = 'bg-green-500';
            break;
        case 'In Transit':
            bgClass = 'bg-blue-100';
            textClass = 'text-blue-800';
            dotClass = 'bg-blue-500';
            break;
        case 'Pending':
        case 'Processing':
            bgClass = 'bg-amber-100';
            textClass = 'text-amber-800';
            dotClass = 'bg-amber-500';
            break;
        case 'Returned':
            bgClass = 'bg-red-100';
            textClass = 'text-red-800';
            dotClass = 'bg-red-500';
            break;
        default:
            bgClass = 'bg-gray-100';
            textClass = 'text-gray-800';
            dotClass = 'bg-gray-500';
    }

    return (
        <View className={`px-3 py-1.5 rounded-full flex-row items-center self-start ${bgClass}`}>
            <View className={`w-2 h-2 rounded-full mr-2 ${dotClass}`} />
            <Text className={`font-semibold text-xs ${textClass}`}>{status}</Text>
        </View>
    );
}
