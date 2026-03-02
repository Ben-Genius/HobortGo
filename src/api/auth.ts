import { ILoginResponse } from '../types/user.types';
import { apiClient } from './client';

export const loginAdmin = async (credentials: { email: string; password?: string }): Promise<ILoginResponse> => {
    const { data } = await apiClient.post('/admin-authentication/login', credentials);
    return data;
};

// other auth related endpoints can go here
