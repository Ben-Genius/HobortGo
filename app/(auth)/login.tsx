import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';
import { CustomInput } from '../../src/components/forms/CustomInput';
import { ActionButton } from '../../src/components/ui/ActionButton';
import { useAuthStore } from '../../src/store/authStore';

// For dynamic background shape rendering if needed, using Dimensions
const { width } = Dimensions.get('window');

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
            // ── Real API call would go here: const result = await loginAdmin(data);
            // For now, simulate: emails containing "driver" → delivery_person role
            const isDeliveryPerson = data.email.toLowerCase().includes('driver');
            const role = isDeliveryPerson ? 'delivery_person' : 'admin';
            setAuth('fake-token-123', { id: 'user1', email: data.email, role });

            // Route to the correct tab group based on role
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

            {/* Immersive Top Background Shape */}
            <View
                className="absolute top-0 w-full bg-[#1e4b69] rounded-b-[50px] overflow-hidden"
                style={{ height: 350, transform: [{ scaleX: 1.2 }] }}
            >
                {/* Decorative Accent Circles */}
                <View className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
                <View className="absolute top-40 -left-10 w-40 h-40 bg-[#f0782d]/20 rounded-full blur-xl" />
            </View>

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-center px-6"
                >
                    {/* Header Section over dark background */}
                    <View className="items-center mt-12 mb-12">
                        <View className="bg-white/10 p-4 rounded-lg mb-4 border border-white/20">
                            <Text className="text-4xl font-extrabold tracking-tight">
                                <Text className="text-white">Hobort</Text>
                                <Text className="text-[#f0782d]">Go</Text>
                            </Text>
                        </View>
                        <Text className="text-blue-100/80 font-medium text-sm tracking-widest uppercase">
                            Logistics Hub
                        </Text>
                    </View>

                    {/* Main Floating Login Card */}
                    <View className="bg-white rounded-lg p-8 shadow-2xl shadow-gray-200/60 border border-gray-50 z-10 w-full">

                        <View className="mb-8 items-center">
                            <Text className="text-3xl font-extrabold text-[#111827] mb-2 tracking-tight">Hello there</Text>
                            <Text className="text-gray-400 font-medium text-sm">Sign in to manage your fleet.</Text>
                        </View>

                        <View className="space-y-4">
                            <CustomInput
                                control={control}
                                name="email"
                                label="Admin Email"
                                placeholder="name@hobortgo.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email?.message}
                            />

                            <View className="mt-4">
                                <CustomInput
                                    control={control}
                                    name="password"
                                    label="Security Key"
                                    placeholder="••••••••"
                                    secureTextEntry
                                    error={errors.password?.message}
                                />
                            </View>
                        </View>

                        <TouchableOpacity className="self-end mt-4 mb-8">
                            <Text className="text-[#f0782d] font-bold text-sm tracking-wide">Recover Password</Text>
                        </TouchableOpacity>

                        <ActionButton
                            label="Login"
                            onPress={handleSubmit(onSubmit)}
                            isLoading={isSubmitting}
                        />
                    </View>

                    {/* Footer Info */}
                    <View className="mt-auto pt-8 pb-4 items-center flex-row justify-center flex-wrap">
                        <Text className="text-gray-400 text-xs font-medium text-center leading-5 px-10">
                            Secure login portal for authorized personnel. Read our{' '}
                            <Text className="text-[#1e4b69] font-bold">Data Policy</Text>.
                        </Text>
                    </View>

                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
