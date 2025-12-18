export interface CarMaster {
    _id: string;
    brand: string;
    carModel: string;
    subModel: string;
    year: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface NotificationState {
    type: 'success' | 'error';
    message: string;
}

// Prop พื้นฐานที่ทุก Tab ต้องใช้ (สำหรับส่งฟังก์ชันแจ้งเตือนลงไป)
export interface TabProps {
    onNotify: (type: 'success' | 'error', message: string) => void;
}

export interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon: string;
    label: string;
    colorClass: string;
}