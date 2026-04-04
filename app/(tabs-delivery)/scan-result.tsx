import { getDeliveriesByShipmentId, getDeliveryById, getDeliveryByTrackingCode, getDeliveryStatuses, scanToUpdateDelivery } from '@/src/api/delivery';
import SignaturePad from '@/src/components/forms/SignaturePad';
import { IDType, IDeliveryStatus, ReceiveType } from '@/src/types/delivery.types';
import { toast } from '@/src/utils/sonner';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const ID_TYPES: IDType[] = ['passport', 'driving-licence', 'id-card', 'voter-card'];
const ID_TYPE_LABELS: Record<IDType, string> = {
    'passport': 'Passport',
    'driving-licence': "Driver's License",
    'id-card': 'National ID',
    'voter-card': 'Voter ID',
};

const LockedField = ({ label, value }: { label: string; value: string }) => (
    <View>
        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">{label}</Text>
        <View className="bg-slate-100 rounded-lg px-4 py-3.5 border border-slate-200 flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-brand-secondary flex-1">{value || '—'}</Text>
            <Ionicons name="lock-closed-outline" size={13} color="#94A3B8" />
        </View>
    </View>
);

export default function ScanResultScreen() {
    const { trackingId, deliveryId } = useLocalSearchParams<{ trackingId: string; flow: string; deliveryId: string }>();
    const router = useRouter();

    const [delivery, setDelivery] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [statuses, setStatuses] = useState<IDeliveryStatus[]>([]);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    // Locked pre-filled fields (from response)
    const [receivedBy, setReceivedBy] = useState('');
    const [receivedById, setReceivedById] = useState<string | null>(null);
    const [receiveType, setReceiveType] = useState<ReceiveType>('Self');
    const [idType, setIdType] = useState<IDType>('id-card');
    const [idNumber, setIdNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [digitalAddress, setDigitalAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [location, setLocation] = useState('');

    const signatureRef = useRef<View>(null);

    // Editable fields
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [signature, setSignature] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const statusRes = await getDeliveryStatuses();
                setStatuses(statusRes?.data || []);

                let deliveryRes;
                if (deliveryId) {
                    deliveryRes = await getDeliveryById(deliveryId);
                } else if (trackingId) {
                    try {
                        deliveryRes = await getDeliveryByTrackingCode(trackingId);
                    } catch (err: any) {
                        if (err?.response?.status === 404) {
                            // Fallback: treat scanned code as a shipment ID
                            const fallback = await getDeliveriesByShipmentId(trackingId);
                            const list = fallback?.data ?? fallback;
                            deliveryRes = Array.isArray(list) ? list[0] : fallback;
                        } else {
                            throw err;
                        }
                    }
                }

                if (deliveryRes) {
                    const dData = deliveryRes.data || deliveryRes;
                    setDelivery(dData);

                    if (dData.statusId?.status) {
                        setSelectedStatus(dData.statusId.status);
                    }

                    const rb = dData.receivedBy;
                    const rxType: ReceiveType = dData.receiveType || 'Self';
                    setReceiveType(rxType);

                    // Name resolution depends on receive type
                    let fullName = '';
                    if (rxType === 'Self') {
                        // Self pickup — owner is identified via shipment creator
                        const cb = dData.shipmentId?.createdBy;
                        fullName = cb
                            ? `${cb.firstname || cb.firstName || ''} ${cb.lastname || cb.lastName || ''}`.trim()
                            : '';
                    } else {
                        // VerifiedPerson / Other — use receivedBy object if present
                        const firstName = rb?.firstName || rb?.firstname || '';
                        const lastName = rb?.lastName || rb?.lastname || '';
                        fullName = rb ? `${firstName} ${lastName}`.trim() : '';
                    }

                    setReceivedById(rb?._id || null);
                    setReceivedBy(fullName);
                    setPhoneNumber(rb?.phoneNumber || dData.phoneNumber || '');
                    setEmail(rb?.email || dData.email || '');

                    // Normalize incoming ID types from backend
                    const rawIdType = (rb?.idType || dData.idType || 'id-card').toLowerCase();
                    let normalizedIdType: IDType = 'id-card';

                    if (rawIdType.includes('passport')) normalizedIdType = 'passport';
                    else if (rawIdType.includes('driving') || rawIdType.includes('licence') || rawIdType.includes('license')) normalizedIdType = 'driving-licence';
                    else if (rawIdType.includes('voter')) normalizedIdType = 'voter-card';
                    else normalizedIdType = 'id-card';

                    setIdType(normalizedIdType);

                    setIdNumber(rb?.idNumber || dData.idNumber || '');
                    setAddress(dData.address || '');
                    setDigitalAddress(dData.digitalAddress || '');
                    setLandmark(dData.landmark || '');
                    setLocation(dData.location || '');
                }
            } catch (error: any) {
                const raw = error?.response?.data;
                const msg = raw?.message || (typeof raw === 'string' ? raw : null) || error?.message || 'Could not retrieve delivery details.';
                console.error('Error fetching scan data:', raw);
                setFetchError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [trackingId, deliveryId]);

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            toast.error('Permission required', {
                description: 'Camera access is needed to take photos.',
            });
            return;
        }
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                quality: 0.7,
                allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
                setPhotos(prev => [...prev, result.assets[0].uri]);
            }
        } catch {
            toast.error('Camera unavailable', {
                description: 'Cannot access camera. Please use the gallery instead.',
            });
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.5,
            allowsEditing: false,
        });
        if (!result.canceled && result.assets[0]) {
            setPhotos(prev => [...prev, result.assets[0].uri]);
        }
    };

    const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

    const handleSubmit = async () => {
        setErrorMsg(null);

        if (receiveType === 'Other' && !receivedBy.trim()) {
            setErrorMsg("Recipient name is required.");
            return;
        }
        if (!idNumber.trim()) {
            setErrorMsg("ID Number is required. Please enter the recipient's ID number.");
            return;
        }
        if (photos.length === 0) {
            setErrorMsg('At least one photo proof is required.');
            return;
        }

        setSubmitting(true);
        try {
            let signatureFileUri = '';
            if (signature && signatureRef.current) {
                try {
                    signatureFileUri = await captureRef(signatureRef, {
                        format: 'png',
                        quality: 0.9,
                        result: 'tmpfile',
                    });
                } catch (e) {
                    console.warn('Signature capture failed:', e);
                }
            }

            const payload: any = {
                status: selectedStatus,
                receiveType,
                receivedBy: receivedById || undefined,
                receiverName: receivedBy, // Fallback name if backend supports it elsewhere
                idType,
                idNumber,
                phoneNumber,
                email,
                address,
                digitalAddress,
                landmark,
                location,
                notes,
                ...(signatureFileUri ? {
                    signature: { uri: signatureFileUri, type: 'image/png', name: 'signature.png' },
                } : {}),
                photo: photos.map((p, i) => ({ uri: p, type: 'image/jpeg', name: `photo_${i}.jpg` })),
            };

            const trackingCode = delivery?.trackingId || delivery?.shipmentId?.trackingId || delivery?.shipmentId?.code || trackingId;
            await scanToUpdateDelivery(trackingCode, payload);
            toast.success('Success!', {
                description: 'Delivery updated successfully.',
            });
            setTimeout(() => router.replace('/(tabs-delivery)' as any), 500);
        } catch (error: any) {
            const raw = error?.response?.data?.message;
            const serverMsg = Array.isArray(raw)
                ? raw.join(' · ')
                : raw
                || (typeof error?.response?.data === 'string' ? error.response.data : null)
                || error?.message
                || 'Failed to update delivery.';
            console.error('Submit error response:', error?.response?.data || error);
            setErrorMsg(serverMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 items-center justify-center">
                <ActivityIndicator size="large" color="#F0782D" />
                <Text className="mt-4 text-slate-400">Fetching Details...</Text>
            </SafeAreaView>
        );
    }

    // ── Not found / fetch error ──────────────────────────────────────────────────

    if (!delivery) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 items-center justify-center px-6">
                <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-4">
                    <Ionicons name="alert-circle-outline" size={48} color="#f87171" />
                </View>
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-xl text-center mb-2">
                    Delivery Not Found
                </Text>
                {fetchError ? (
                    <View className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6 w-full">
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#dc2626', textAlign: 'center' }}>
                            {fetchError}
                        </Text>
                    </View>
                ) : (
                    <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-sm text-center mb-6">
                        No delivery matched "{trackingId || 'unknown'}".
                    </Text>
                )}
                <TouchableOpacity
                    className="bg-brand-secondary rounded-lg py-4 w-full items-center mb-3"
                    onPress={() => router.back()}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white">Scan Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace('/(tabs-delivery)' as any)}>
                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#94A3B8' }}>Go to Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const shipment = delivery.shipmentId || {};

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="flex-row items-center justify-between px-5 pt-2 mb-5">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg items-center justify-center border border-slate-100 dark:border-slate-700">
                    <Ionicons name="arrow-back-outline" size={20} color="#1e4b69" />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-slate-400 text-xs uppercase tracking-widest">Update Delivery</Text>
                <View className="w-10" />
            </View>

            <ScrollView scrollEnabled={scrollEnabled} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                <View className="px-5 pb-4">

                    {/* Delivery Context Card */}
                    <View style={{ backgroundColor: '#1e4b69', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
                        {/* Decorative circles */}
                        <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -30 }} />
                        <View style={{ position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 20 }} />

                        {/* Top row: code + status badge */}
                        <View style={{ padding: 18, paddingBottom: 14 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 }}>Shipment Code</Text>
                                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 22, color: 'white', letterSpacing: 0.5 }}>{shipment.code || shipment.trackingId || trackingId || '—'}</Text>
                                </View>
                                {delivery.statusId?.status ? (
                                    <View style={{ backgroundColor: 'rgba(240,120,45,0.25)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(240,120,45,0.4)' }}>
                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: '#f0782d' }}>{delivery.statusId?.status}</Text>
                                    </View>
                                ) : null}
                            </View>

                            {/* Divider */}
                            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />

                            {/* Info grid */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {/* Receiver */}
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Recipient</Text>
                                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: 'white' }} numberOfLines={1}>{receivedBy || '—'}</Text>
                                </View>

                                {/* Delivery Agent */}
                                {delivery.deliveredBy ? (
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Delivery Agent</Text>
                                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: 'white' }} numberOfLines={1}>
                                            {delivery.deliveredBy.firstname || delivery.deliveredBy.firstName} {delivery.deliveredBy.lastname || delivery.deliveredBy.lastName}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        {/* Bottom pill strip */}
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.25)', flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 10, gap: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Ionicons name="layers-outline" size={12} color="rgba(255,255,255,0.55)" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{shipment.shipmentType || 'N/A'}</Text>
                            </View>
                            {shipment.items?.length > 0 ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                    <Ionicons name="cube-outline" size={12} color="rgba(255,255,255,0.55)" />
                                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{shipment.items.length} item{shipment.items.length !== 1 ? 's' : ''}</Text>
                                </View>
                            ) : null}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Ionicons name="swap-horizontal-outline" size={12} color="rgba(255,255,255,0.55)" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{delivery.type || 'Self'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Shipment Contents */}
                    {shipment.items && shipment.items.length > 0 && (
                        <View className="mb-6">
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">Shipment Contents</Text>
                            <View className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 gap-3">
                                {shipment.items.map((item: any, idx: number) => (
                                    <View key={idx} className={`flex-row items-center justify-between ${idx !== shipment.items.length - 1 ? 'border-b border-slate-200/50 pb-3' : ''}`}>
                                        <View className="flex-1 pr-4">
                                            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13 }} className="text-brand-secondary mb-0.5">{item.name}</Text>
                                            <View className="flex-row items-center gap-2">
                                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-500">Qty: {item.quantity}</Text>
                                                <View className="w-1 h-1 rounded-full bg-slate-300" />
                                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }} className="text-slate-500">{item.weight}kg</Text>
                                            </View>
                                        </View>
                                        {item.trackingCode && (
                                            <View className="bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 10 }} className="text-brand-orange uppercase">{item.trackingCode}</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Status */}
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">Update Status</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {statuses.map((opt: IDeliveryStatus) => (
                            <TouchableOpacity
                                key={opt._id}
                                onPress={() => setSelectedStatus(opt.status)}
                                style={{
                                    backgroundColor: selectedStatus === opt.status ? '#1e4b69' : '#f1f5f9',
                                    borderWidth: 1,
                                    borderColor: selectedStatus === opt.status ? '#1e4b69' : '#e2e8f0'
                                }}
                                className="rounded-full px-4 py-2">
                                <Text style={{
                                    fontFamily: 'Manrope_600SemiBold',
                                    fontSize: 12,
                                    color: selectedStatus === opt.status ? 'white' : '#64748b'
                                }}>
                                    {opt.status}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Recipient Info — read-only */}
                    <View className="mb-6 gap-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">Recipient Info</Text>
                            <View className="flex-row items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                                <Ionicons name="lock-closed-outline" size={10} color="#94A3B8" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: '#94A3B8' }}>Pre-filled</Text>
                            </View>
                        </View>

                        <View>
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">Receive Type</Text>
                            <View className="flex-row gap-2">
                                <View className="px-3 py-2 rounded-lg border bg-brand-secondary/10 border-brand-secondary">
                                    <Text style={{ fontSize: 12, color: '#1e4b69', fontFamily: 'Manrope_600SemiBold' }}>{receiveType}</Text>
                                </View>
                            </View>
                        </View>

                        {receiveType === 'Self' || receiveType === 'VerifiedPerson' ? (
                            <LockedField label="Full Name" value={receivedBy} />
                        ) : (
                            <View>
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</Text>
                                <TextInput
                                    className="bg-white dark:bg-slate-800 rounded-lg px-4 py-3.5 border border-slate-200 dark:border-slate-700"
                                    style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#1e4b69' }}
                                    placeholder="Enter recipient's full name"
                                    placeholderTextColor="#94A3B8"
                                    value={receivedBy}
                                    onChangeText={setReceivedBy}
                                />
                            </View>
                        )}

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <LockedField label="Phone Number" value={phoneNumber} />
                            </View>
                            <View className="flex-1">
                                <LockedField label="Email" value={email} />
                            </View>
                        </View>

                        <View>
                            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">ID Type</Text>
                            <View className="flex-row gap-2 flex-wrap">
                                {ID_TYPES.map(type => (
                                    <View
                                        key={type}
                                        className={`px-3 py-2 rounded-lg border ${idType === type ? 'bg-brand-secondary/10 border-brand-secondary' : 'bg-slate-50 border-slate-100 opacity-40'}`}
                                    >
                                        <Text style={{ fontSize: 10, color: idType === type ? '#1e4b69' : '#64748b' }}>{ID_TYPE_LABELS[type]}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {idNumber ? (
                            <LockedField label="ID Number" value={idNumber} />
                        ) : (
                            <View>
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">ID Number *</Text>
                                <TextInput
                                    className="bg-white rounded-lg px-4 py-3.5 border border-orange-200"
                                    style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#1e4b69' }}
                                    placeholder="Enter ID number"
                                    placeholderTextColor="#94A3B8"
                                    value={idNumber}
                                    onChangeText={setIdNumber}
                                />
                                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11, color: '#f0782d' }} className="mt-1">Required — not on file</Text>
                            </View>
                        )}
                    </View>

                    {/* Location — read-only */}
                    <View className="mb-6 gap-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base">Location Details</Text>
                            <View className="flex-row items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                                <Ionicons name="lock-closed-outline" size={10} color="#94A3B8" />
                                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: '#94A3B8' }}>Pre-filled</Text>
                            </View>
                        </View>
                        <LockedField label="Delivery Address" value={address} />
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <LockedField label="Digital Address" value={digitalAddress} />
                            </View>
                            <View className="flex-1">
                                <LockedField label="Landmark" value={landmark} />
                            </View>
                        </View>
                    </View>

                    {/* Proof of Delivery */}
                    <View className="mb-6">
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary text-base mb-3">Proof of Delivery</Text>

                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">Customer Signature *</Text>
                        <View
                            onTouchStart={() => setScrollEnabled(false)}
                            onTouchEnd={() => setScrollEnabled(true)}
                            onTouchCancel={() => setScrollEnabled(true)}
                        >
                            <SignaturePad ref={signatureRef} height={160} onSave={setSignature} />
                        </View>

                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5 mt-4">Photo Evidence *</Text>
                        <View className="flex-row flex-wrap gap-2 mb-3">
                            {photos.map((uri, idx) => (
                                <View key={idx}>
                                    <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                                    <TouchableOpacity
                                        onPress={() => removePhoto(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                                    >
                                        <Ionicons name="close" size={12} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <View className="flex-row gap-3 mb-4">
                            <TouchableOpacity
                                onPress={takePhoto}
                                className="flex-1 flex-row items-center justify-center gap-2 bg-brand-secondary/10 border border-brand-secondary/20 rounded-lg py-3">
                                <Ionicons name="camera" size={18} color="#1e4b69" />
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#1e4b69' }}>Take Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={pickImage}
                                className="flex-1 flex-row items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3">
                                <Ionicons name="image-outline" size={18} color="#64748b" />
                                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#64748b' }}>Gallery</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10 }} className="text-slate-400 uppercase tracking-wider mb-1.5">Delivery Notes</Text>
                        <TextInput
                            className="bg-slate-50 rounded-lg px-4 py-3.5 border border-slate-100 min-h-[80px]"
                            placeholder="Add notes..."
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Sticky footer with inline error banner */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-3 pb-4">
                {errorMsg ? (
                    <View className="flex-row items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-3">
                        <Ionicons name="alert-circle-outline" size={16} color="#dc2626" style={{ marginTop: 1 }} />
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: '#dc2626', flex: 1, lineHeight: 18 }}>
                            {errorMsg}
                        </Text>
                        <TouchableOpacity onPress={() => setErrorMsg(null)} hitSlop={8}>
                            <Ionicons name="close" size={16} color="#dc2626" />
                        </TouchableOpacity>
                    </View>
                ) : null}
                <TouchableOpacity
                    className={`rounded-lg py-4 items-center ${submitting ? 'bg-brand-orange/60' : 'bg-brand-orange'}`}
                    onPress={handleSubmit}
                    disabled={submitting}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white">
                        {submitting ? 'Updating...' : 'Confirm Status Change'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
