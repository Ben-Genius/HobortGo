export type UserRole = 'admin' | 'super_admin' | 'delivery_person' | 'staff';

export interface IAdminUser {
    id: string;
    email: string;
    name?: string;
    role?: UserRole;
}

export interface ILoginResponse {
    token: string;
    user: IAdminUser;
}
