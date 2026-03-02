import { IScanToUpdatePayload } from '../types/delivery.types';
import { apiClient } from './client';

export const getDeliveries = async (params?: { offset?: number; limit?: number }) => {
    const { data } = await apiClient.get('/delivery', { params });
    return data; // Typically contains data array and total
};

export const getDeliveryById = async (id: string) => {
    const { data } = await apiClient.get(`/delivery/${id}`);
    return data;
};

export const scanToUpdateDelivery = async (id: string, payload: IScanToUpdatePayload) => {
    // Using multipart/form-data because of photo and signature
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
            // If signature or photo is a file/blob, FormData handles it automatically in browser/React Native (if using `{uri, type, name}`)
            formData.append(key, value as any);
        }
    });

    const { data } = await apiClient.patch(`/delivery/${id}/scan-to-update`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return data;
};
