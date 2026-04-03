import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const MAX_SHEET_HEIGHT = Dimensions.get('window').height * 0.72;

export interface ActionSheetOption {
    label: string;
    icon?: string;
    onPress: () => void;
    danger?: boolean;
}

interface ActionSheetProps {
    visible: boolean;
    title: string;
    subtitle?: string;
    options: ActionSheetOption[];
    onClose: () => void;
}

export function ActionSheet({ visible, title, subtitle, options, onClose }: ActionSheetProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                {/* Dismiss backdrop */}
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

                <View style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: MAX_SHEET_HEIGHT }}>
                    {/* Handle + Header — fixed */}
                    <View style={{ paddingTop: 12, paddingHorizontal: 20 }}>
                        <View style={{ width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1e4b69', marginBottom: subtitle ? 4 : 16 }}>
                            {title}
                        </Text>
                        {subtitle ? (
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>

                    {/* Scrollable options */}
                    <ScrollView
                        contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 4 }}
                        showsVerticalScrollIndicator={false}>
                        {options.map((opt, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => { onClose(); setTimeout(opt.onPress, 350); }}
                                activeOpacity={0.75}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 14,
                                    paddingHorizontal: 16,
                                    backgroundColor: opt.danger ? '#fff5f5' : '#f8fafc',
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    borderColor: opt.danger ? '#fee2e2' : '#f1f5f9',
                                    gap: 14,
                                }}>
                                {opt.icon ? (
                                    <View style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: opt.danger ? '#fee2e2' : '#e0f2fe',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Ionicons name={opt.icon as any} size={18} color={opt.danger ? '#dc2626' : '#1e4b69'} />
                                    </View>
                                ) : null}
                                <Text style={{
                                    fontFamily: 'Manrope_600SemiBold',
                                    fontSize: 14,
                                    color: opt.danger ? '#dc2626' : '#1e4b69',
                                    flex: 1,
                                }}>
                                    {opt.label}
                                </Text>
                                {!opt.danger ? (
                                    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                                ) : null}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Cancel — fixed at bottom */}
                    <View style={{ padding: 20, paddingTop: 12 }}>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.75}
                            style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: '#f1f5f9' }}>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#64748b' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
