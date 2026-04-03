import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

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

const TYPE_CONFIG: Record<ModalType, { icon: string; iconBg: string; iconColor: string; btnColor: string }> = {
    success: { icon: 'checkmark-circle',   iconBg: '#dcfce7', iconColor: '#16a34a', btnColor: '#16a34a' },
    error:   { icon: 'close-circle',       iconBg: '#fee2e2', iconColor: '#dc2626', btnColor: '#dc2626' },
    info:    { icon: 'information-circle', iconBg: '#e0f2fe', iconColor: '#0369a1', btnColor: '#1e4b69' },
    warning: { icon: 'warning',            iconBg: '#fef9c3', iconColor: '#a16207', btnColor: '#a16207' },
};

export function AppModal({ visible, type, title, message, buttons, onClose }: AppModalProps) {
    const cfg = TYPE_CONFIG[type];

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
                <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 10 }}>
                    {/* Icon */}
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: cfg.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Ionicons name={cfg.icon as any} size={32} color={cfg.iconColor} />
                    </View>

                    {/* Text */}
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: '#1e4b69', textAlign: 'center', marginBottom: 8 }}>
                        {title}
                    </Text>
                    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 21, marginBottom: 24 }}>
                        {message}
                    </Text>

                    {/* Buttons */}
                    <View style={{ width: '100%', gap: 10 }}>
                        {resolvedButtons.map((btn, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={btn.onPress}
                                activeOpacity={0.8}
                                style={{
                                    paddingVertical: 14,
                                    borderRadius: 14,
                                    alignItems: 'center',
                                    backgroundColor: btn.variant === 'ghost' ? 'transparent' : cfg.btnColor,
                                    borderWidth: btn.variant === 'ghost' ? 1.5 : 0,
                                    borderColor: '#e2e8f0',
                                }}>
                                <Text style={{
                                    fontFamily: 'Poppins_600SemiBold',
                                    fontSize: 14,
                                    color: btn.variant === 'ghost' ? '#64748b' : 'white',
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
