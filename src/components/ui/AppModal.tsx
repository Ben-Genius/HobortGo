import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type ModalType = 'success' | 'error' | 'info' | 'warning';

interface AppModalButton {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'ghost';
}

interface AppModalProps {
    visible: boolean;
    type: ModalType;
    title: string;
    message: string;
    buttons?: AppModalButton[];
    onClose?: () => void;
}

const TYPE_CONFIG: Record<ModalType, { icon: string; iconBg: string; iconColor: string; btnColor: string; iconBgDark: string; iconColorDark: string; btnColorDark: string }> = {
    success: { icon: 'checkmark-circle',   iconBg: '#dcfce7', iconColor: '#16a34a', btnColor: '#16a34a', iconBgDark: '#14532d', iconColorDark: '#4ade80', btnColorDark: '#16a34a' },
    error:   { icon: 'close-circle',       iconBg: '#fee2e2', iconColor: '#dc2626', btnColor: '#dc2626', iconBgDark: '#7f1d1d', iconColorDark: '#f87171', btnColorDark: '#dc2626' },
    info:    { icon: 'information-circle', iconBg: '#e0f2fe', iconColor: '#0369a1', btnColor: '#1e4b69', iconBgDark: '#0c4a6e', iconColorDark: '#38bdf8', btnColorDark: '#1e4b69' },
    warning: { icon: 'warning',            iconBg: '#fef9c3', iconColor: '#a16207', btnColor: '#a16207', iconBgDark: '#713f12', iconColorDark: '#fbbf24', btnColorDark: '#a16207' },
};

export function AppModal({ visible, type, title, message, buttons, onClose }: AppModalProps) {
    const { colors, scheme } = useTheme();
    const cfg = TYPE_CONFIG[type];
    const isDark = scheme === 'dark';

    const iconBg = isDark ? cfg.iconBgDark : cfg.iconBg;
    const iconColor = isDark ? cfg.iconColorDark : cfg.iconColor;
    const btnColor = isDark ? cfg.btnColorDark : cfg.btnColor;

    const resolvedButtons: AppModalButton[] = buttons?.length
        ? buttons
        : [{ label: 'OK', onPress: onClose ?? (() => {}), variant: 'primary' }];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
                <View style={{ backgroundColor: colors.card, borderRadius: 24, width: '100%', maxHeight: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 10, overflow: 'hidden' }}>
                    {/* Scrollable content */}
                    <ScrollView
                        contentContainerStyle={{ alignItems: 'center', padding: 28, paddingBottom: 8 }}
                        showsVerticalScrollIndicator={false}>
                        {/* Icon */}
                        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name={cfg.icon as any} size={32} color={iconColor} />
                        </View>

                        {/* Text */}
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.text, textAlign: 'center', marginBottom: 8 }}>
                            {title}
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: colors.mutedText, textAlign: 'center', lineHeight: 21 }}>
                            {message}
                        </Text>
                    </ScrollView>

                    {/* Buttons — pinned at bottom */}
                    <View style={{ padding: 28, paddingTop: 16, gap: 10 }}>
                        {resolvedButtons.map((btn, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={btn.onPress}
                                activeOpacity={0.8}
                                style={{
                                    paddingVertical: 14,
                                    borderRadius: 14,
                                    alignItems: 'center',
                                    backgroundColor: btn.variant === 'ghost' ? 'transparent' : btnColor,
                                    borderWidth: btn.variant === 'ghost' ? 1.5 : 0,
                                    borderColor: colors.border,
                                }}>
                                <Text style={{
                                    fontFamily: 'Poppins_600SemiBold',
                                    fontSize: 14,
                                    color: btn.variant === 'ghost' ? colors.mutedText : 'white',
                                }}>
                                    {btn.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
