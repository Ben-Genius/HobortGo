import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';
import { CustomInput } from '../../src/components/forms/CustomInput';
import { ActionButton } from '../../src/components/ui/ActionButton';
import { useAuthStore } from '../../src/store/authStore';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const isDeliveryPerson = data.email.toLowerCase().includes('driver');
            const role = isDeliveryPerson ? 'delivery_person' : 'admin';
            setAuth('fake-token-123', { id: 'user1', email: data.email, role });
            if (role === 'delivery_person') {
                router.replace('/(tabs-delivery)');
            } else {
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* ── Immersive Header: teal + round bubbles + curved bottom ── */}
            <View
                className="absolute top-0 w-full overflow-hidden"
                style={{ height: 340 }}>

                {/* Base teal fill */}
                <View className="absolute inset-0 bg-brand-secondary" />

                {/* Large top-right bubble */}
                <View
                    className="absolute bg-white/10 rounded-full"
                    style={{ width: 280, height: 280, top: -80, right: -70 }}
                />
                {/* Medium top-left bleed bubble */}
                <View
                    className="absolute bg-white/5 rounded-full"
                    style={{ width: 200, height: 200, top: -50, left: -60 }}
                />
                {/* Orange accent bubble — lower-left */}
                <View
                    className="absolute bg-brand-orange/25 rounded-full"
                    style={{ width: 160, height: 160, bottom: 30, left: 20 }}
                />
                {/* Small orange dot — upper-right inner */}
                <View
                    className="absolute bg-brand-orange/40 rounded-full"
                    style={{ width: 80, height: 80, top: 60, right: 90 }}
                />
                {/* Cubic curved bottom edge */}
                <View
                    className="absolute bg-white rounded-full"
                    style={{
                        height: 80,
                        left: -40,
                        right: -40,
                        bottom: -42,
                        borderRadius: 9999,
                    }}
                />
            </View>

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-center px-6"
                >
                    {/* Logo block over the teal header */}
                    <View className="items-center mb-10 mt-4">
                        <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-4xl text-white">
                            Hobort<Text className="text-brand-orange">Go</Text>
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-white/70 text-xs tracking-widest uppercase mt-1">
                            Smart Logistics Platform
                        </Text>
                    </View>

                    {/* Login card */}
                    <View className="bg-white rounded-lg p-7 border border-gray-100">
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-2xl text-gray-900 mb-1">
                            Welcome back
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-gray-400 text-sm mb-7">
                            Sign in to continue to your dashboard
                        </Text>

                        <View className="gap-4">
                            <CustomInput
                                control={control}
                                name="email"
                                label="Email Address"
                                placeholder="name@hobortgo.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email?.message}
                            />

                            <CustomInput
                                control={control}
                                name="password"
                                label="Password"
                                placeholder="••••••••"
                                secureTextEntry
                                error={errors.password?.message}
                            />
                        </View>

                        <TouchableOpacity className="self-end mt-4 mb-7">
                            <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-brand-secondary text-sm">
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        <ActionButton
                            label="Sign In"
                            onPress={handleSubmit(onSubmit)}
                            isLoading={isSubmitting}
                        />
                    </View>

                    {/* Footer */}
                    <View className="pb-4 pt-6 items-center">
                        <Text style={{ fontFamily: 'Manrope_400Regular' }} className="text-gray-400 text-xs text-center">
                            Authorized access only
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
