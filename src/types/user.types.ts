export type UserRole = 'admin' | 'super_admin' | 'delivery_person' | 'staff';

export interface IAdminUser {
    id: string;
    email: string;
    name?: string;
    firstname?: string;
    lastname?: string;
    role?: UserRole;
}

export interface ILoginResponse {
    verified: boolean;
    active: boolean;
    firstname: string;
    lastname: string;
    accessToken: {
        accessToken: string;
        refreshToken: string;
    };
}
