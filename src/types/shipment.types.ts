// ─── Shipment Status ──────────────────────────────────────────────────────────

export interface IShipmentStatus {
    _id: string;
    status: string;
    code: string;
    description: string;
    isVisible: boolean;
    createdBy?: any;
    updatedBy?: any;
    deletedBy?: any;
}

// ─── Shipment ─────────────────────────────────────────────────────────────────

export type ShipmentType = 'Air Freight' | 'Sea Freight';

export interface IShipment {
    _id: string;
    trackingId: string;
    sender?: string;
    recipient?: string;
    originCountry?: string;
    weight?: number;
    declaredValue?: number;
    notes?: string;
    statusId: string;
    status?: IShipmentStatus;
    createdAt: string;
    updatedAt: string;
    photos?: string[];
    flagged?: boolean;
    flagReason?: string;
}

export interface IShipmentListResponse {
    data: IShipment[];
    total: number;
    offset: number;
    limit: number;
}

// ─── Shipment Master ──────────────────────────────────────────────────────────

export interface ITimelineEvent {
    status: string;
    location?: string;
    notes?: string;
    timestamp: string;
    picture?: string;
}

export interface IShipmentMaster {
    _id: string;
    name: string;
    code?: string;
    description?: string;
    shipmentType: ShipmentType;
    scheduleArrival: string;
    shipmentNote?: string;
    statusId: string;
    status?: IShipmentStatus;
    shipments?: IShipment[];
    timeline?: ITimelineEvent[];
    flagged?: boolean;
    flagReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IShipmentMasterPayload {
    name: string;
    description?: string;
    shipmentType: ShipmentType;
    scheduleArrival: string;
    shipmentNote?: string;
}

export interface IShipmentStatusPayload {
    status: string;
    code: string;
    description: string;
    isVisible: boolean;
}

// ─── Scan / Tracking-code lookup response ────────────────────────────────────

export interface IPackageItemDimension {
    width: number;
    length: number;
    height: number;
}

export interface IPackageItem {
    name: string;
    quantity: number;
    weight: number;
    price: number;
    trackingCode: string;
    description: string;
    dimension: IPackageItemDimension;
}

export interface IScannedShipment {
    _id: string;
    code: string;
    country: string;
    shipmentType: ShipmentType;
    destinationAddress: string;
    delivery: string;
    status: IShipmentStatus;
    items: IPackageItem[];
    businessItems: any[];
    createdBy: {
        _id: string;
        code: string;
        firstname: string;
        lastname: string;
        id: string;
    };
    id: string;
}
