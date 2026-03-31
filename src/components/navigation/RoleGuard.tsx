import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user.types';

interface RoleGuardProps {
    allowedRoles: UserRole[];
    children: React.ReactNode;
}

/**
 * Wraps a layout and redirects to the correct section if the current
 * user's role is not in `allowedRoles`. Also redirects to login when
 * the token is cleared (logout / 401 expiry via axios interceptor).
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { token, role } = useAuthStore();

    useEffect(() => {
        if (!token) {
            router.replace('/(auth)/login');
            return;
        }
        if (role && !allowedRoles.includes(role)) {
            if (role === 'delivery_person' || role === 'staff') {
                router.replace('/(tabs-delivery)' as any);
            } else {
                router.replace('/(tabs)' as any);
            }
        }
    }, [token, role]);

    return <>{children}</>;
}
