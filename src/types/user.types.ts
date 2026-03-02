export type UserRole = 'admin' | 'delivery_person';

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
