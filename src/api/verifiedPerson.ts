import { IVerifiedPersonPayload, IVerifiedPersonResponse } from '../types/delivery.types';
import { apiClient } from './client';

export const createVerifiedPerson = async (payload: IVerifiedPersonPayload): Promise<{ data: IVerifiedPersonResponse }> => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
            formData.append(key, value as any);
        }
    });

    const { data } = await apiClient.post('/verified-person', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
};

export const getVerifiedPersons = async (userId?: string): Promise<{ data: IVerifiedPersonResponse[]; total: number }> => {
    const { data } = await apiClient.get('/verified-person', { params: { userId } });
    return data;
};
