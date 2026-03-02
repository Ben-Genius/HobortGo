// ─── Centralized Shipment Data ──────────────────────────────────────────────
// Single source of truth for all shipment dummy data used across the app.

export type ShipmentStatus =
    | 'Received'
    | 'In Transit'
    | 'Arrived'
    | 'Ready'
    | 'Delivered'
    | 'Pending'
    | 'Failed';

export type DeliveryStatus =
    | 'Pending'
    | 'Assigned'
    | 'Out'
    | 'Completed'
    | 'Failed';

export interface TimelineStep {
    status: string;
    time: string;
    actor: string;
    done: boolean;
}

export interface Shipment {
    id: string;
    trackingId: string;
    sender: string;
    recipient: string;
    recipientPhone: string;
    address: string;
    origin: string;
    weight: number;
    declaredValue: number;
    status: ShipmentStatus;
    deliveryStatus: DeliveryStatus;
    assignedTo: string | null;
    date: string;
    window: string;
    flagged: boolean;
    notes: string;
    timeline: TimelineStep[];
}

export const SHIPMENTS: Shipment[] = [
    {
        id: '1',
        trackingId: 'HB-10041',
        sender: 'Amazon US',
        recipient: 'Kofi Asante',
        recipientPhone: '+233 24 000 0001',
        address: '14 Ring Rd Central, Accra',
        origin: 'USA',
        weight: 2.3,
        declaredValue: 180,
        status: 'Received',
        deliveryStatus: 'Assigned',
        assignedTo: 'Kwame Asare',
        date: 'Today, 2:15 PM',
        window: 'Morning (8–12)',
        flagged: false,
        notes: 'Handle with care — electronics',
        timeline: [
            { status: 'Received at USA Warehouse', time: 'Feb 24, 2:15 PM', actor: 'K. Asante', done: true },
            { status: 'Added to Master Shipment', time: 'Feb 24, 3:00 PM', actor: 'System', done: true },
            { status: 'In Transit', time: 'Feb 25, 8:00 AM', actor: 'A. Mensah', done: true },
            { status: 'Arrived at Destination', time: 'Mar 1, 6:30 AM', actor: 'System', done: false },
            { status: 'Ready for Pickup / Delivery', time: '—', actor: '—', done: false },
        ],
    },
    {
        id: '2',
        trackingId: 'HB-10039',
        sender: 'Shein',
        recipient: 'Abena Mensah',
        recipientPhone: '+233 50 000 0002',
        address: '7 Tema Motorway, Accra',
        origin: 'China',
        weight: 0.8,
        declaredValue: 65,
        status: 'In Transit',
        deliveryStatus: 'Pending',
        assignedTo: null,
        date: 'Today, 1:47 PM',
        window: 'Afternoon (12–5)',
        flagged: false,
        notes: '',
        timeline: [
            { status: 'Received at China Warehouse', time: 'Feb 22, 9:00 AM', actor: 'System', done: true },
            { status: 'In Transit', time: 'Feb 23, 6:00 AM', actor: 'System', done: true },
            { status: 'Arrived at Destination', time: '—', actor: '—', done: false },
            { status: 'Ready for Pickup / Delivery', time: '—', actor: '—', done: false },
        ],
    },
    {
        id: '3',
        trackingId: 'HB-10035',
        sender: 'eBay',
        recipient: 'Kwame Boateng',
        recipientPhone: '+233 27 000 0003',
        address: 'Osu Oxford St, Accra',
        origin: 'UK',
        weight: 5.1,
        declaredValue: 290,
        status: 'Arrived',
        deliveryStatus: 'Out',
        assignedTo: 'Yaw Mensah',
        date: 'Yesterday',
        window: 'Evening (5–8)',
        flagged: false,
        notes: 'Fragile — glass item inside',
        timeline: [
            { status: 'Received at UK Warehouse', time: 'Feb 20, 10:00 AM', actor: 'System', done: true },
            { status: 'In Transit', time: 'Feb 21, 8:00 AM', actor: 'System', done: true },
            { status: 'Arrived at Destination', time: 'Feb 28, 7:00 AM', actor: 'System', done: true },
            { status: 'Ready for Pickup / Delivery', time: '—', actor: '—', done: false },
        ],
    },
    {
        id: '4',
        trackingId: 'HB-10029',
        sender: 'AliExpress',
        recipient: 'Ama Darko',
        recipientPhone: '+233 24 000 0004',
        address: 'East Legon, Accra',
        origin: 'China',
        weight: 1.2,
        declaredValue: 45,
        status: 'Ready',
        deliveryStatus: 'Pending',
        assignedTo: null,
        date: 'Mon, 24th',
        window: 'Morning (8–12)',
        flagged: true,
        notes: 'Customer called — prefers evening delivery',
        timeline: [
            { status: 'Received at China Warehouse', time: 'Feb 18, 9:00 AM', actor: 'System', done: true },
            { status: 'In Transit', time: 'Feb 19, 6:00 AM', actor: 'System', done: true },
            { status: 'Arrived at Destination', time: 'Feb 23, 8:00 AM', actor: 'System', done: true },
            { status: 'Ready for Pickup / Delivery', time: 'Feb 24, 10:00 AM', actor: 'K. Asante', done: true },
        ],
    },
    {
        id: '5',
        trackingId: 'HB-10023',
        sender: 'Nike US',
        recipient: 'John Doe',
        recipientPhone: '+233 24 000 0005',
        address: '5 Airport Rd, Accra',
        origin: 'USA',
        weight: 0.5,
        declaredValue: 120,
        status: 'Delivered',
        deliveryStatus: 'Completed',
        assignedTo: 'Abena Boateng',
        date: 'Fri, 21st',
        window: 'Morning (8–12)',
        flagged: false,
        notes: '',
        timeline: [
            { status: 'Received at USA Warehouse', time: 'Feb 15, 2:00 PM', actor: 'System', done: true },
            { status: 'In Transit', time: 'Feb 16, 8:00 AM', actor: 'System', done: true },
            { status: 'Arrived at Destination', time: 'Feb 20, 6:00 AM', actor: 'System', done: true },
            { status: 'Ready for Pickup / Delivery', time: 'Feb 21, 9:00 AM', actor: 'K. Asante', done: true },
            { status: 'Delivered', time: 'Feb 21, 11:42 AM', actor: 'Abena Boateng', done: true },
        ],
    },
    {
        id: '6',
        trackingId: 'HB-10018',
        sender: 'Apple',
        recipient: 'Yaw Osei',
        recipientPhone: '+233 50 000 0006',
        address: 'Labone, Accra',
        origin: 'USA',
        weight: 1.8,
        declaredValue: 999,
        status: 'Received',
        deliveryStatus: 'Pending',
        assignedTo: null,
        date: 'Fri, 21st',
        window: 'Afternoon (12–5)',
        flagged: true,
        notes: 'High-value item — requires signature on delivery',
        timeline: [
            { status: 'Received at USA Warehouse', time: 'Feb 21, 11:00 AM', actor: 'K. Asante', done: true },
            { status: 'Added to Master Shipment', time: 'Feb 21, 12:00 PM', actor: 'System', done: false },
            { status: 'In Transit', time: '—', actor: '—', done: false },
            { status: 'Arrived at Destination', time: '—', actor: '—', done: false },
            { status: 'Ready for Pickup / Delivery', time: '—', actor: '—', done: false },
        ],
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getShipmentById(id: string): Shipment | undefined {
    return SHIPMENTS.find(s => s.id === id);
}

export function getShipmentByTrackingId(trackingId: string): Shipment | undefined {
    return SHIPMENTS.find(s => s.trackingId.toLowerCase() === trackingId.toLowerCase());
}

// Delivery persons data
export const DELIVERY_PERSONS = [
    { id: 'dp1', name: 'Kwame Asare', active: 3, completed: 8 },
    { id: 'dp2', name: 'Abena Boateng', active: 1, completed: 12 },
    { id: 'dp3', name: 'Yaw Mensah', active: 5, completed: 5 },
];
