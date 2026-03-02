import { IShipmentMaster, IShipmentMasterPayload } from '../types/shipment.types';
import { apiClient } from './client';

/** GET /api/v1/shipmentmaster — All masters */
export const getShipmentMasters = async (params: { offset: number; limit: number }): Promise<{
    data: IShipmentMaster[];
    total: number;
}> => {
    const { data } = await apiClient.get('/shipmentmaster', { params });
    return data;
};

/** GET /api/v1/shipmentmaster/{id} */
export const getShipmentMasterById = async (id: string): Promise<IShipmentMaster> => {
    const { data } = await apiClient.get(`/shipmentmaster/${id}`);
    return data;
};

/** GET /api/v1/shipmentmaster/shipments-status */
export const getShipmentMastersByStatus = async (): Promise<{ data: IShipmentMaster[]; total: number }> => {
    const { data } = await apiClient.get('/shipmentmaster/shipments-status');
    return data;
};

/** POST /api/v1/shipmentmaster/create-shipment */
export const createShipmentMaster = async (
    statusId: string,
    payload: IShipmentMasterPayload
): Promise<IShipmentMaster> => {
    const { data } = await apiClient.post('/shipmentmaster/create-shipment', payload, {
        params: { statusId },
    });
    return data;
};

/** PATCH /api/v1/shipmentmaster/update-shipment/{id} */
export const updateShipmentMaster = async (id: string, payload: Partial<IShipmentMasterPayload>): Promise<IShipmentMaster> => {
    const { data } = await apiClient.patch(`/shipmentmaster/update-shipment/${id}`, payload);
    return data;
};

/** DELETE /api/v1/shipmentmaster/delete-shipment/{id} */
export const deleteShipmentMaster = async (id: string): Promise<boolean> => {
    const { data } = await apiClient.delete(`/shipmentmaster/delete-shipment/${id}`);
    return data;
};

/** PATCH /api/v1/shipmentmaster/assign-shipment/{id} */
export const assignShipmentMaster = async (id: string): Promise<IShipmentMaster> => {
    const { data } = await apiClient.patch(`/shipmentmaster/assign-shipment/${id}`);
    return data;
};
