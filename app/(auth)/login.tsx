import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';
import { CustomInput } from '../../src/components/forms/CustomInput';
import { ActionButton } from '../../src/components/ui/ActionButton';
// import { loginAdmin } from '../../src/api/auth';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
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
            // Simulating a successful login
            setAuth('fake-token-123', { id: 'admin1', email: data.email, role: 'Admin' });
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-6 justify-center"
            >
                <View className="items-center mb-10">
                    <Image
                        source={require('../../assets/images/logo.f85da2ff.webp')}
                        style={{ width: 120, height: 120, resizeMode: 'contain', marginBottom: 16 }}
                    />
                    <Text className="text-4xl font-extrabold text-[#111827] mb-2 tracking-tight">HobortGo</Text>
                    <Text className="text-[#6B7280] font-medium text-base text-center">
                        Logistics Management Panel
                    </Text>
                </View>

                <Card noPadding className="p-6">
                    <Text className="text-2xl font-bold text-[#111827] mb-6">Admin Sign In</Text>

                    <CustomInput
                        control={control}
                        name="email"
                        label="Email Address"
                        placeholder="admin@hobortgo.com"
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

                    <TouchableOpacity className="self-end mb-6 mt-1">
                        <Text className="text-[#f0782d] font-semibold text-sm">Forgot password?</Text>
                    </TouchableOpacity>

                    <ActionButton
                        label="Sign In"
                        onPress={handleSubmit(onSubmit)}
                        isLoading={isSubmitting}
                    />
                </Card>

                {/* Guest/Client Quick Track Entry Point (Optional concept depending on needs) */}
                <View className="mt-10 items-center">
                    <Text className="text-[#6B7280]">Looking to track a package?</Text>
                    <TouchableOpacity className="mt-2" onPress={() => Alert.alert('WIP', 'Client facing tracking coming soon')}>
                        <Text className="text-[#f0782d] font-bold">Track Shipment Here</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
