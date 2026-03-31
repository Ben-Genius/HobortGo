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
export const getShipmentMastersByStatus = async (params: { statusId: string; offset: number; limit: number }): Promise<{ data: IShipmentMaster[]; total: number }> => {
    const { data } = await apiClient.get('/shipmentmaster/shipments-status', { params });
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

/** GET /api/v1/shipmentmaster/items/{trackingCode} — Lookup by tracking code (scan flow) */
export const getShipmentMasterByTrackingCode = async (trackingCode: string): Promise<IShipmentMaster> => {
    const { data } = await apiClient.get(`/shipmentmaster/items/${trackingCode}`);
    return data;
};

/** PATCH /api/v1/shipmentmaster/items/status — Update status by tracking code */
export const updateShipmentMasterStatusByCode = async (payload: {
    trackingCode: string;
    statusCode: string;
}): Promise<IShipmentMaster> => {
    const { data } = await apiClient.patch('/shipmentmaster/items/status', payload);
    return data;
};

export interface IUpdateStatusPayload {
    notes?: string;
    timestamp: string;
    location?: string;
    imageUri?: string; // local file URI for upload
}

/** PATCH /api/v1/shipmentmaster/update-statuses/{masterId}/{statusId} — multipart */
export const updateShipmentMasterStatus = async (
    masterId: string,
    statusId: string,
    payload: IUpdateStatusPayload
): Promise<IShipmentMaster> => {
    const form = new FormData();
    form.append('location', payload.location ?? '');
    form.append('timestamp', payload.timestamp);
    form.append('notes', payload.notes ?? '');
    if (payload.imageUri) {
        const filename = payload.imageUri.split('/').pop() ?? 'photo.jpg';
        const ext = filename.split('.').pop() ?? 'jpg';
        form.append('imageUrl', {
            uri: payload.imageUri,
            name: filename,
            type: `image/${ext}`,
        } as any);
    }
    const { data } = await apiClient.patch(
        `/shipmentmaster/update-statuses/${masterId}/${statusId}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
};
