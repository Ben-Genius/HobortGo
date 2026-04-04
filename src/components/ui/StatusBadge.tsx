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
            bgClass = 'bg-green-100 dark:bg-green-900/40';
            textClass = 'text-green-800 dark:text-green-300';
            dotClass = 'bg-green-500 dark:bg-green-400';
            break;
        case 'In Transit':
            bgClass = 'bg-blue-100 dark:bg-blue-900/40';
            textClass = 'text-blue-800 dark:text-blue-300';
            dotClass = 'bg-blue-500 dark:bg-blue-400';
            break;
        case 'Pending':
        case 'Processing':
            bgClass = 'bg-amber-100 dark:bg-amber-900/40';
            textClass = 'text-amber-800 dark:text-amber-300';
            dotClass = 'bg-amber-500 dark:bg-amber-400';
            break;
        case 'Returned':
            bgClass = 'bg-red-100 dark:bg-red-900/40';
            textClass = 'text-red-800 dark:text-red-300';
            dotClass = 'bg-red-500 dark:bg-red-400';
            break;
        default:
            bgClass = 'bg-gray-100 dark:bg-gray-800';
            textClass = 'text-gray-800 dark:text-gray-300';
            dotClass = 'bg-gray-500 dark:bg-gray-400';
    }

    return (
        <View className={`px-3 py-1.5 rounded-full flex-row items-center self-start ${bgClass}`}>
            <View className={`w-2 h-2 rounded-full mr-2 ${dotClass}`} />
            <Text className={`font-semibold text-xs ${textClass}`}>{status}</Text>
        </View>
    );
}
