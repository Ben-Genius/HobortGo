import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/store/authStore';
import { ActionSheet } from '@/src/components/ui/ActionSheet';
import { ThemePreference, useSettingsStore } from '@/src/store/settingsStore';

type SettingsRowProps = {
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
    label: string;
    onPress?: () => void;
    destructive?: boolean;
    value?: string;
};

function SettingsRow({ icon, iconBg, iconColor, label, onPress, destructive, value }: SettingsRowProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
        >
            <View className="w-9 h-9 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: iconBg }}>
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>
            <Text
                style={{ fontFamily: 'Manrope_500Medium' }}
                className={`flex-1 text-sm ${destructive ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}
            >
                {label}
            </Text>
            {value ? (
                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs mr-2">{value}</Text>
            ) : null}
            {!destructive && <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />}
        </TouchableOpacity>
    );
}

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <View className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden mb-4">
            {children}
        </View>
    );
}

function SectionLabel({ title }: { title: string }) {
    return (
        <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-xs text-slate-400 uppercase tracking-widest mb-2 px-1">
            {title}
        </Text>
    );
}

const APPEARANCE_LABELS: Record<ThemePreference, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
};

export default function AdminSettingsScreen() {
    const router = useRouter();
    const { user, role, logout } = useAuthStore();
    const { themePreference, setThemePreference } = useSettingsStore();
    const [appearanceSheetVisible, setAppearanceSheetVisible] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.charAt(0).toUpperCase() ?? 'A';

    const displayName = user?.name ?? user?.email ?? 'Admin';
    const displayRole = role === 'super_admin' ? 'Super Admin' : 'Admin';

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="pt-10 pb-6 px-5">
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-brand-secondary dark:text-white text-xl">
                        Settings
                    </Text>
                </View>

                <View className="px-5 pb-10">
                    {/* Profile Card */}
                    <SectionCard>
                        <View className="flex-row items-center p-4">
                            <View className="w-14 h-14 bg-brand-secondary rounded-full items-center justify-center mr-4">
                                <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-xl">
                                    {initials}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-slate-800 dark:text-slate-100 text-base" numberOfLines={1}>
                                    {displayName}
                                </Text>
                                <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
                                    {user?.email}
                                </Text>
                                <View className="mt-1.5 self-start bg-brand-orange/10 px-2 py-0.5 rounded">
                                    <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-brand-orange text-[10px]">
                                        {displayRole}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </SectionCard>

                    {/* Account */}
                    <SectionLabel title="Account" />
                    <SectionCard>
                        <SettingsRow icon="person-outline" iconBg="#EFF6FF" iconColor="#3B82F6" label="Edit Profile" />
                        <SettingsRow icon="lock-closed-outline" iconBg="#F0FDF4" iconColor="#16A34A" label="Change Password" />
                    </SectionCard>

                    {/* Preferences */}
                    <SectionLabel title="Preferences" />
                    <SectionCard>
                        <SettingsRow
                            icon="notifications-outline"
                            iconBg="#F5F3FF"
                            iconColor="#7C3AED"
                            label="Notifications"
                            onPress={() => router.push('/(tabs)/notifications/index' as any)}
                        />
                        <SettingsRow icon="language-outline" iconBg="#ECFDF5" iconColor="#059669" label="Language" value="English" />
                        <SettingsRow
                            icon="color-palette-outline"
                            iconBg="#FFF1F2"
                            iconColor="#E11D48"
                            label="Appearance"
                            value={APPEARANCE_LABELS[themePreference]}
                            onPress={() => setAppearanceSheetVisible(true)}
                        />
                    </SectionCard>

                    {/* Support */}
                    <SectionLabel title="Support" />
                    <SectionCard>
                        <SettingsRow icon="help-circle-outline" iconBg="#F0F9FF" iconColor="#0284C7" label="Help & Support" />
                        <SettingsRow icon="document-text-outline" iconBg="#F8FAFC" iconColor="#64748B" label="Privacy Policy" />
                        <SettingsRow icon="information-circle-outline" iconBg="#F8FAFC" iconColor="#64748B" label="About HobortGo" value="v1.0.0" />
                    </SectionCard>

                    {/* Danger zone */}
                    <SectionCard>
                        <SettingsRow
                            icon="log-out-outline"
                            iconBg="#FFF1F2"
                            iconColor="#E11D48"
                            label="Log Out"
                            destructive
                            onPress={handleLogout}
                        />
                    </SectionCard>
                </View>
            </ScrollView>

            <ActionSheet
                visible={appearanceSheetVisible}
                title="Appearance"
                subtitle="Choose how the app looks"
                onClose={() => setAppearanceSheetVisible(false)}
                options={[
                    {
                        label: 'Light',
                        icon: themePreference === 'light' ? 'checkmark-circle' : 'sunny-outline',
                        onPress: () => setThemePreference('light'),
                    },
                    {
                        label: 'Dark',
                        icon: themePreference === 'dark' ? 'checkmark-circle' : 'moon-outline',
                        onPress: () => setThemePreference('dark'),
                    },
                    {
                        label: 'System Default',
                        icon: themePreference === 'system' ? 'checkmark-circle' : 'phone-portrait-outline',
                        onPress: () => setThemePreference('system'),
                    },
                ]}
            />
        </SafeAreaView>
    );
}
