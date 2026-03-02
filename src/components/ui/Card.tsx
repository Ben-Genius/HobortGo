import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false, ...props }: CardProps) {
    return (
        <View
            className={`bg-white rounded-3xl shadow-sm border border-gray-50 ${noPadding ? '' : 'p-5'} ${className}`}
            {...props}
        >
            {children}
        </View>
    );
}
