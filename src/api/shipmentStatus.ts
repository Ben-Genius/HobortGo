import { IShipmentStatus, IShipmentStatusPayload } from '../types/shipment.types';
import { apiClient } from './client';

/** POST /api/v1/shipmentstatus — Create a new shipment status */
export const createShipmentStatus = async (payload: IShipmentStatusPayload): Promise<IShipmentStatus> => {
    const { data } = await apiClient.post('/shipmentstatus', payload);
    return data;
};

/** GET /api/v1/shipmentstatus — Get all shipment statuses */
export const getShipmentStatuses = async (params: { offset: number; limit: number }): Promise<{
    data: IShipmentStatus[];
    total: number;
}> => {
    const { data } = await apiClient.get('/shipmentstatus', { params });
    return data;
};

/** GET /api/v1/shipmentstatus/{id} — Get single shipment status */
export const getShipmentStatusById = async (id: string): Promise<IShipmentStatus> => {
    const { data } = await apiClient.get(`/shipmentstatus/${id}`);
    return data;
};
