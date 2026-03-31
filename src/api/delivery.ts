import { IScanToUpdatePayload } from '../types/delivery.types';
import { apiClient } from './client';

export const getDeliveries = async (params?: { offset?: number; limit?: number }) => {
    const { data } = await apiClient.get('/delivery', { params });
    return data;
};

export const getDeliveryById = async (id: string) => {
    const { data } = await apiClient.get(`/delivery/${id}`);
    return data;
};

export const getDeliveryByTrackingCode = async (trackingCode: string) => {
    const { data } = await apiClient.get(`/delivery/tracking/${trackingCode}`);
    return data;
};

export const getDeliveriesByShipmentId = async (shipmentId: string) => {
    const { data } = await apiClient.get(`/delivery/shipment/${shipmentId}`);
    return data;
};

export const getDeliveryStatuses = async () => {
    const { data } = await apiClient.get('/delivery-status');
    return data;
};

export const scanToUpdateDelivery = async (trackingCode: string, payload: IScanToUpdatePayload) => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (key === 'photo' && Array.isArray(value)) {
                value.forEach((v) => formData.append('photo', v));
            } else {
                formData.append(key, value as any);
            }
        }
    });

    const { data } = await apiClient.patch(`/delivery/${trackingCode}/scan-to-update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
};
