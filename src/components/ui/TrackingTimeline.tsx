import React from 'react';
import { Text, View } from 'react-native';

interface TrackingEvent {
    id: string;
    title: string;
    description: string;
    time: string;
    isCompleted: boolean;
    isCurrent: boolean;
}

interface TrackingTimelineProps {
    events: TrackingEvent[];
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
    return (
        <View className="px-2 mt-4">
            {events.map((event, index) => (
                <View key={event.id} className="flex-row">
                    {/* Left Column: Timeline Line & Dot */}
                    <View className="items-center mr-4">
                        <View
                            className={`w-6 h-6 rounded-full border-4 items-center justify-center 
              ${event.isCompleted || event.isCurrent ? 'border-blue-600 bg-white' : 'border-gray-200 bg-white'}`}
                        >
                            {event.isCompleted && (
                                <View className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            )}
                        </View>
                        {/* The Line connecting dots */}
                        {index !== events.length - 1 && (
                            <View
                                className={`w-0.5 h-16 
                ${event.isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`}
                            />
                        )}
                    </View>

                    {/* Right Column: Event Details */}
                    <View className="flex-1 pb-8">
                        <Text className={`font-bold text-base ${event.isCurrent ? 'text-blue-600' : 'text-gray-800'}`}>
                            {event.title}
                        </Text>
                        <Text className="text-gray-500 text-sm mt-0.5">{event.description}</Text>
                        <Text className="text-gray-400 text-xs mt-1 font-medium bg-gray-50 self-start px-2 py-1 rounded-md">
                            {event.time}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}
