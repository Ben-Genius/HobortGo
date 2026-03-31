import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDeliveryById } from '../../../src/api/delivery';
import { IDelivery } from '../../../src/types/delivery.types';

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; icon: string }> = {
    Pending: { bg: '#fef3c7', text: '#92400e', dot: '#d97706', icon: 'time-outline' },
    Scheduled: { bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69', icon: 'calendar-outline' },
    'In-transit': { bg: '#fff0e6', text: '#f0782d', dot: '#f0782d', icon: 'bicycle-outline' },
    Delivered: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', icon: 'checkmark-circle-outline' },
    Failed: { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626', icon: 'close-circle-outline' },
};

function SectionLabel({ label }: { label: string }) {
    return (
        <Text
            style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }}
            className="text-slate-400 uppercase tracking-widest mb-3 mt-6">
            {label}
        </Text>
    );
}

function InfoRow({
    icon,
    label,
    value,
    tappable,
    onPress,
}: {
    icon: string;
    label: string;
    value: string | null | undefined;
    tappable?: boolean;
    onPress?: () => void;
}) {
    if (!value) return null;
    return (
        <TouchableOpacity
            disabled={!tappable}
            onPress={onPress}
            activeOpacity={tappable ? 0.7 : 1}
            className="flex-row items-center py-3 border-b border-slate-50">
            <View className="w-8 h-8 bg-slate-100 rounded-lg items-center justify-center mr-3">
                <Ionicons name={icon as any} size={15} color="#94A3B8" />
            </View>
            <View className="flex-1">
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }} className="text-slate-400 mb-0.5">
                    {label}
                </Text>
                <Text
                    style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: tappable ? '#f0782d' : '#1e4b69' }}>
                    {value}
                </Text>
            </View>
            {tappable && <Ionicons name="chevron-forward" size={14} color="#94A3B8" />}
        </TouchableOpacity>
    );
}

export default function DeliveryDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [delivery, setDelivery] = useState<IDelivery | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await getDeliveryById(id as string);
                setDelivery(res.data ?? res);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#F0782D" />
                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 mt-3">
                    Loading delivery…
                </Text>
            </SafeAreaView>
        );
    }

    if (error || !delivery) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <Ionicons name="alert-circle-outline" size={52} color="#CBD5E1" />
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-lg text-center mt-4">
                    Delivery Not Found
                </Text>
                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mt-2">
                    We couldn't load the delivery details. Please try again.
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 bg-brand-secondary px-6 py-3 rounded-lg">
                    <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-white">
                        Go Back
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const shipment = delivery.shipmentId;
    const statusLabel = delivery.statusId?.status ?? 'Pending';
    const cfg = STATUS_CONFIG[statusLabel] ?? STATUS_CONFIG.Pending;
    const canUpdate = ['Pending', 'Scheduled', 'In-transit'].includes(statusLabel);

    const rb = delivery.receivedBy;
    const recipientName = rb
        ? [rb.firstname?.trim(), rb.lastname?.trim()].filter(Boolean).join(' ') || rb.email || null
        : null;

    const formattedTimestamp = delivery.timestamp
        ? new Date(delivery.timestamp).toLocaleString([], {
            weekday: 'short', year: 'numeric', month: 'short',
            day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        : null;

    const formattedCreated = new Date(delivery.createdAt).toLocaleString([], {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const receiveTypeLabel: Record<string, string> = {
        Self: 'Self / Client',
        VerifiedPerson: 'Verified Person',
        Other: 'Other / Neighbour',
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* ── Top bar ── */}
            <View className="flex-row items-center px-5 pt-4 pb-3 border-b border-slate-100 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 bg-slate-100 rounded-lg items-center justify-center mr-3">
                    <Ionicons name="arrow-back" size={18} color="#1e4b69" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-widest">
                        Delivery Details
                    </Text>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15 }} className="text-brand-secondary">
                        {shipment?.trackingId ?? shipment?.code ?? `#${(id as string).slice(-6)}`}
                    </Text>
                </View>
                {/* Update button — opens scan result flow */}
                {canUpdate && (
                    <TouchableOpacity
                        onPress={() => router.push(`/(tabs)/deliveries/${id}/update` as any)}
                        className="bg-brand-orange px-4 py-2 rounded-lg flex-row items-center gap-1.5">
                        <Ionicons name="create-outline" size={13} color="white" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12 }} className="text-white">
                            Update
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: canUpdate ? 120 : 40 }}
                showsVerticalScrollIndicator={false}>

                {/* ── Status hero card ── */}
                <View
                    style={{ backgroundColor: cfg.bg }}
                    className="rounded-xl p-5 mt-5 overflow-hidden">
                    <View className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
                        style={{ backgroundColor: cfg.dot, opacity: 0.08 }} />
                    <View className="flex-row items-center gap-3 mb-3">
                        <View className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: cfg.dot + '22' }}>
                            <Ionicons name={cfg.icon as any} size={20} color={cfg.dot} />
                        </View>
                        <View>
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: cfg.text, opacity: 0.7 }}>
                                Current Status
                            </Text>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: cfg.text }}>
                                {statusLabel}
                            </Text>
                        </View>
                    </View>
                    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: cfg.text, opacity: 0.75 }}>
                        {delivery.statusId?.description ?? ''}
                    </Text>
                </View>

                {/* ── Shipment info ── */}
                <SectionLabel label="Shipment" />
                <View className="bg-slate-50 rounded-xl px-4 pb-1">
                    <InfoRow icon="cube-outline" label="Shipment Code" value={shipment?.code} />
                    <InfoRow icon="locate-outline" label="Tracking ID" value={shipment?.trackingId} />
                    <InfoRow icon="airplane-outline" label="Shipment Type" value={shipment?.shipmentType} />
                </View>

                {/* ── Delivery info ── */}
                <SectionLabel label="Delivery Info" />
                <View className="bg-slate-50 rounded-xl px-4 pb-1">
                    <InfoRow icon="swap-horizontal-outline" label="Type" value={delivery.type} />
                    <InfoRow icon="person-circle-outline" label="Received By" value={receiveTypeLabel[delivery.receiveType] ?? delivery.receiveType} />
                    <InfoRow icon="calendar-outline" label="Scheduled For" value={formattedTimestamp} />
                    <InfoRow icon="bicycle-outline" label="Courier" value={delivery.deliveredBy} />
                </View>

                {/* ── Recipient ── */}
                {(recipientName || rb?.email || rb?.phoneNumber) && (
                    <>
                        <SectionLabel label="Recipient" />
                        <View className="bg-slate-50 rounded-xl px-4 pb-1">
                            <InfoRow icon="person-outline" label="Name" value={recipientName} />
                            <InfoRow
                                icon="mail-outline"
                                label="Email"
                                value={rb?.email}
                                tappable
                                onPress={() => rb?.email && Linking.openURL(`mailto:${rb.email}`)}
                            />
                            <InfoRow
                                icon="call-outline"
                                label="Phone"
                                value={rb?.phoneNumber}
                                tappable
                                onPress={() => rb?.phoneNumber && Linking.openURL(`tel:${rb.phoneNumber}`)}
                            />
                        </View>
                    </>
                )}

                {/* ── Address ── */}
                <SectionLabel label="Delivery Address" />
                <View className="bg-slate-50 rounded-xl px-4 pb-1">
                    <InfoRow icon="home-outline" label="Address" value={delivery.address} />
                    <InfoRow icon="flag-outline" label="Landmark" value={delivery.landmark} />
                    <InfoRow icon="navigate-outline" label="Digital Address" value={delivery.digitalAddress} />
                    <InfoRow icon="location-outline" label="GPS Coordinates" value={delivery.location || null} />
                </View>

                {/* ── Notes ── */}
                {delivery.notes ? (
                    <>
                        <SectionLabel label="Notes" />
                        <View className="bg-slate-50 rounded-xl p-4">
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13 }} className="text-slate-600 leading-5">
                                {delivery.notes}
                            </Text>
                        </View>
                    </>
                ) : null}

                {/* ── Meta ── */}
                <SectionLabel label="Record" />
                <View className="bg-slate-50 rounded-xl px-4 pb-1">
                    <InfoRow icon="time-outline" label="Created" value={formattedCreated} />
                </View>
            </ScrollView>

            {/* ── Sticky Complete Delivery bar ── */}
            {canUpdate && (
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-3 pb-6">
                    <TouchableOpacity
                        className="bg-brand-orange py-4 rounded-lg flex-row items-center justify-center gap-2"
                        activeOpacity={0.85}
                        onPress={() => router.push(`/(tabs)/deliveries/${id}/update` as any)}>
                        <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white text-base">
                            Update Delivery Status
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
