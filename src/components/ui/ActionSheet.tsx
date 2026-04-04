import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

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
    const { colors } = useTheme();

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

                <View style={{ backgroundColor: colors.sheet, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: MAX_SHEET_HEIGHT }}>
                    {/* Handle + Header — fixed */}
                    <View style={{ paddingTop: 12, paddingHorizontal: 20 }}>
                        <View style={{ width: 40, height: 4, backgroundColor: colors.sheetHandle, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.text, marginBottom: subtitle ? 4 : 16 }}>
                            {title}
                        </Text>
                        {subtitle ? (
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: colors.subtleText, marginBottom: 16 }}>
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
                                    backgroundColor: opt.danger ? colors.dangerBg : colors.optionBg,
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    borderColor: opt.danger ? colors.dangerBorder : colors.optionBorder,
                                    gap: 14,
                                }}>
                                {opt.icon ? (
                                    <View style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: opt.danger ? colors.dangerIconBg : colors.normalIconBg,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Ionicons name={opt.icon as any} size={18} color={opt.danger ? colors.dangerText : colors.normalIconColor} />
                                    </View>
                                ) : null}
                                <Text style={{
                                    fontFamily: 'Manrope_600SemiBold',
                                    fontSize: 14,
                                    color: opt.danger ? colors.dangerText : colors.text,
                                    flex: 1,
                                }}>
                                    {opt.label}
                                </Text>
                                {!opt.danger ? (
                                    <Ionicons name="chevron-forward" size={16} color={colors.subtleText} />
                                ) : null}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Cancel — fixed at bottom */}
                    <View style={{ padding: 20, paddingTop: 12 }}>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.75}
                            style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: colors.cancelBg }}>
                            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.mutedText }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
