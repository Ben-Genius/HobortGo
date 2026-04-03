import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDeliveries } from '../../../../src/api/delivery';
import { getDeliveryStatuses } from '../../../../src/api/delivery';

// ─── Status colour map ────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string; icon: string }> = {
    'Pending':   { bg: '#fef3c7', text: '#92400e', dot: '#d97706', icon: 'time-outline' },
    'Scheduled': { bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69', icon: 'calendar-outline' },
    'Assigned':  { bg: '#ede9fe', text: '#7c3aed', dot: '#7c3aed', icon: 'person-add-outline' },
    'Out':       { bg: '#fff0e6', text: '#f0782d', dot: '#f0782d', icon: 'bicycle-outline' },
    'In Transit':{ bg: '#fff0e6', text: '#f0782d', dot: '#f0782d', icon: 'bicycle-outline' },
    'Delivered': { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', icon: 'checkmark-circle-outline' },
    'Failed':    { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626', icon: 'close-circle-outline' },
    'Confiscated':{ bg: '#fee2e2', text: '#dc2626', dot: '#dc2626', icon: 'alert-circle-outline' },
};

function getCfg(status: string) {
    return STATUS_COLOR[status] ?? { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8', icon: 'help-circle-outline' };
}

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─── Delivery card ────────────────────────────────────────────────────────────
function DeliveryCard({ item, onPress }: { item: any; onPress: () => void }) {
    const statusLabel = item.statusId?.status || 'Pending';
    const cfg = getCfg(statusLabel);
    const shipment = item.shipmentId || {};

    const deliveredByName = typeof item.deliveredBy === 'object' && item.deliveredBy
        ? [item.deliveredBy.firstname?.trim(), item.deliveredBy.lastname?.trim()].filter(Boolean).join(' ')
        : (item.deliveredBy as string | undefined) ?? null;
    const receiverName = [item.receivedBy?.firstname?.trim(), item.receivedBy?.lastname?.trim()]
        .filter(Boolean).join(' ') || deliveredByName || null;

    const address = item.address || '—';
    const landmark = item.landmark || null;
    const date = item.timestamp ? fmtDate(item.timestamp) : fmtDate(item.createdAt);
    const time = item.timestamp ? fmtTime(item.timestamp) : null;
    const hasMedia = (item.media ?? []).length > 0;
    const shipType = shipment.shipmentType as string | undefined;
    const shipCode = shipment.code || null;
    const digitalAddress = item.digitalAddress || null;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={{
                backgroundColor: 'white',
                borderRadius: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 2,
                overflow: 'hidden',
            }}>
            {/* Status accent strip */}
            <View style={{ height: 3, backgroundColor: cfg.dot }} />

            <View style={{ padding: 16 }}>
                {/* Row 1 — code + status badge */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: cfg.bg, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name={cfg.icon as any} size={18} color={cfg.dot} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1e4b69' }} numberOfLines={1}>
                                {shipCode ?? item._id.slice(-8).toUpperCase()}
                            </Text>
                            {shipType ? (
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11, color: '#94a3b8' }}>
                                    {shipType}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.dot }} />
                        <Text style={{ fontFamily: 'Manrope_700Bold', color: cfg.text, fontSize: 11 }}>{statusLabel}</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 10 }} />

                {/* Receiver */}
                {receiverName ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Ionicons name="person-circle-outline" size={15} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#334155' }}>{receiverName}</Text>
                    </View>
                ) : null}

                {/* Address */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: landmark ? 4 : 10 }}>
                    <Ionicons name="location-outline" size={15} color="#94A3B8" style={{ marginTop: 1 }} />
                    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#64748b', flex: 1 }} numberOfLines={1}>{address}</Text>
                </View>

                {/* Landmark */}
                {landmark ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginLeft: 23 }}>
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11, color: '#94a3b8' }} numberOfLines={1}>
                            Near {landmark}
                        </Text>
                    </View>
                ) : null}

                {/* Digital address */}
                {digitalAddress ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginLeft: 23 }}>
                        <Ionicons name="grid-outline" size={11} color="#94A3B8" />
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: '#94a3b8' }}>{digitalAddress}</Text>
                    </View>
                ) : null}

                {/* Footer row — date/time + badges + chevron */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }}>
                            <Ionicons name="calendar-outline" size={10} color="#64748B" />
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: '#64748b' }}>{date}</Text>
                        </View>
                        {time ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }}>
                                <Ionicons name="time-outline" size={10} color="#64748B" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: '#64748b' }}>{time}</Text>
                            </View>
                        ) : null}
                        {hasMedia ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }}>
                                <Ionicons name="images-outline" size={10} color="#16a34a" />
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: '#16a34a' }}>Proof</Text>
                            </View>
                        ) : null}
                        {item.receiveType && item.receiveType !== 'Self' ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }}>
                                <Ionicons name="people-outline" size={10} color="#7c3aed" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: '#7c3aed' }}>{item.receiveType}</Text>
                            </View>
                        ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DeliveryPersonCompletedScreen() {
    const router = useRouter();
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [statuses, setStatuses]     = useState<any[]>([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter]         = useState<string>('All');

    const fetchData = async () => {
        try {
            const [deliveryRes, statusRes] = await Promise.all([
                getDeliveries({ offset: 0, limit: 100 }),
                getDeliveryStatuses(),
            ]);
            setDeliveries(deliveryRes.data ?? []);
            // statusRes may be { data: [] } or []
            setStatuses(Array.isArray(statusRes) ? statusRes : (statusRes.data ?? []));
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);
    const onRefresh = () => { setRefreshing(true); fetchData(); };

    // Build stat cards from real statuses
    const statCards = [
        { label: 'Total', count: deliveries.length, bg: '#e6f0f5', text: '#1e4b69', dot: '#1e4b69', icon: 'layers-outline' },
        ...statuses.map(s => ({
            label: s.status,
            count: deliveries.filter(d => (d.statusId?.status || 'Pending') === s.status).length,
            ...getCfg(s.status),
            icon: getCfg(s.status).icon,
        })),
    ];

    // Filter pills: All + each status that has at least one delivery, plus any active filter
    const filterOptions = ['All', ...statuses.map((s: any) => s.status)];

    const filtered = filter === 'All'
        ? deliveries
        : deliveries.filter(d => (d.statusId?.status || 'Pending') === filter);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
            {/* ── Header ── */}
            <View style={{ backgroundColor: 'white', paddingTop: 24, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
                    <View>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>
                            History
                        </Text>
                        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 24, color: '#1e4b69', marginTop: 2 }}>
                            Deliveries
                        </Text>
                    </View>
                    <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: '#64748b' }}>
                            {deliveries.length} total
                        </Text>
                    </View>
                </View>

                {/* Horizontal stat cards */}
                {!loading && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, gap: 10 }}>
                        {statCards.map(s => (
                            <TouchableOpacity
                                key={s.label}
                                activeOpacity={0.8}
                                onPress={() => setFilter(s.label === 'Total' ? 'All' : s.label)}
                                style={{
                                    backgroundColor: s.bg,
                                    borderRadius: 14,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    minWidth: 88,
                                    alignItems: 'center',
                                    borderWidth: 1.5,
                                    borderColor: (filter === s.label || (filter === 'All' && s.label === 'Total'))
                                        ? s.dot
                                        : 'transparent',
                                }}>
                                <Ionicons name={s.icon as any} size={18} color={s.dot} style={{ marginBottom: 4 }} />
                                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 20, color: s.text }}>{s.count}</Text>
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: s.text, opacity: 0.8, textAlign: 'center', marginTop: 1 }}>
                                    {s.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Filter pills */}
                <FlatList
                    data={filterOptions}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12, gap: 8 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setFilter(item)}
                            style={{
                                paddingHorizontal: 14,
                                paddingVertical: 7,
                                borderRadius: 20,
                                backgroundColor: filter === item ? '#1e4b69' : 'white',
                                borderWidth: 1,
                                borderColor: filter === item ? '#1e4b69' : '#e2e8f0',
                            }}>
                            <Text style={{
                                fontFamily: filter === item ? 'Manrope_700Bold' : 'Manrope_500Medium',
                                fontSize: 12,
                                color: filter === item ? 'white' : '#64748B',
                            }}>
                                {item}
                                {item !== 'All' ? ` (${deliveries.filter(d => (d.statusId?.status || 'Pending') === item).length})` : ''}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* ── List ── */}
            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#F0782D" />
                    <Text style={{ fontFamily: 'Manrope_500Medium', color: '#94a3b8', marginTop: 12, fontSize: 14 }}>
                        Loading deliveries...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <DeliveryCard
                            item={item}
                            onPress={() => router.push({
                                pathname: '/(tabs-delivery)/delivery/[id]' as any,
                                params: { id: item._id, data: JSON.stringify(item) },
                            })}
                        />
                    )}
                    contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F0782D" colors={['#F0782D']} />
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 64, paddingHorizontal: 48 }}>
                            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Ionicons name="bicycle-outline" size={36} color="#CBD5E1" />
                            </View>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: '#1e4b69', textAlign: 'center' }}>
                                No {filter === 'All' ? '' : filter} Deliveries
                            </Text>
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
                                {filter === 'All'
                                    ? 'Your delivery history will appear here.'
                                    : `No deliveries with status "${filter}" found.`}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
