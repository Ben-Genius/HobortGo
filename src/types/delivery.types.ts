export type ReceiveType = 'Self' | 'VerifiedPerson' | 'Other';
export type DeliveryType = 'Delivery' | 'Pickup';
export type IDType = 'Passport' | 'National ID' | "Driver's License" | 'Voter ID' | 'SSNIT';

export interface IDeliveryPayload {
    shipmentId: string;
    type: DeliveryType;
    statusId: string;
    timestamp: string;
    receiveType: ReceiveType;
    receivedBy?: string;
    address?: string;
    digitalAddress?: string;
    landmark?: string;
    location?: string;
    deliveredBy?: string;
    notes?: string;
}

export interface IScanToUpdatePayload {
    receiveType: ReceiveType;
    receivedBy?: string;
    signature: any; // Blob, File, or { uri, type, name } for React Native
    photo: any;
    idType?: IDType;
    idNumber: string;
    phoneNumber: string;
    email?: string;
    address?: string;
    digitalAddress?: string;
    landmark?: string;
    location?: string;
    notes?: string;
}

export interface IVerifiedPersonPayload {
    relation: 'Spouse' | 'Sibling' | 'Child' | 'Friend' | 'Other';
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    idType: IDType;
    idNumber: string;
    photo?: any;
}

export interface IVerifiedPersonResponse {
    _id: string;
    userId: string;
    relation: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    idType: string;
    idNumber: string;
    photo: string;
    statusId: string;
    isVisible: boolean;
    createdAt: string;
    updatedAt: string;
}
