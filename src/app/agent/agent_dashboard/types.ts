// src/app/agent/agent_dashboard/types.ts

// 1. ลูกค้า Top Spender
export interface TopCustomer {
  _id: string;
  name: string;
  phone: string;
  imgProfile?: string;
  totalSpent: number;
  policiesCount: number;
}

// 2. ข้อมูลสัดส่วนแบรนด์
export interface BrandStat {
  _id: string; // ชื่อแบรนด์
  count: number;
}

// 3. ข้อมูลลูกค้าใกล้หมดอายุ
export interface RenewingCustomer {
  _id: string;
  status: string;
  customer_id: {
    first_name: string;
    last_name: string;
    phone: string;
    imgProfile_customer?: string;
  };
  car_id: {
    registration: string;
    brand: string;
    carModel: string;
  };
  end_date?: string;
}

// 4. ข้อมูลสรุปยอดรวม
export interface SummaryStats {
  totalRevenue: number;
  totalPolicies: number;
}

// 5. ข้อมูลแยกตามชั้นประกัน
export interface LevelStat {
  _id: string; // "ชั้น 1", "2+", "3"
  count: number;
  totalSales: number;
}

// 6. ข้อมูลสถานะงาน
export interface StatusStat {
  _id: string; // "pending_payment", "active"
  count: number;
}

// 7. ข้อมูลแนวโน้มยอดขาย (Trend)
export interface SalesTrendStat {
    _id: string; // "2025-12-22"
    sales: number;
    count: number;
}

// ✅ Main Interface
export interface DashboardData {
  summary: SummaryStats;
  topCustomers: TopCustomer[];
  brandPreference: BrandStat[];
  renewingCustomers: RenewingCustomer[];
  levelStats: LevelStat[];
  statusStats: StatusStat[];
  salesTrend: SalesTrendStat[];
}