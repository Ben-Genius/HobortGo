export interface IAdminUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

export interface ILoginResponse {
    token: string;
    user: IAdminUser;
}
