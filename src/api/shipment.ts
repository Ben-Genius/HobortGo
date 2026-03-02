import { IShipmentListResponse } from '../types/shipment.types';
import { apiClient } from './client';

/** GET /api/v1/shipment — All shipments */
export const getShipments = async (params: { offset: number; limit: number }): Promise<IShipmentListResponse> => {
    const { data } = await apiClient.get('/shipment', { params });
    return data;
};

/** GET /api/v1/shipment/shipments-status — Shipments filtered by statusId */
export const getShipmentsByStatus = async (params: {
    statusId: string;
    offset: number;
    limit: number;
}): Promise<IShipmentListResponse> => {
    const { data } = await apiClient.get('/shipment/shipments-status', { params });
    return data;
};

/** GET /api/v1/shipment/user-shipments — Shipments for the currently authenticated user */
export const getUserShipments = async (params: { offset: number; limit: number }): Promise<IShipmentListResponse> => {
    const { data } = await apiClient.get('/shipment/user-shipments', { params });
    return data;
};

/** GET /api/v1/shipment/user/{userId} — Shipments for a specific user ID */
export const getShipmentsByUserId = async (
    userId: string,
    params: { offset: number; limit: number }
): Promise<IShipmentListResponse> => {
    const { data } = await apiClient.get(`/shipment/user/${userId}`, { params });
    return data;
};
