// src/app/admin/dashboard/types.ts

// 1. ภาพรวม (Cards)
export interface AdminSummary {
  totalRevenue: number;
  totalPolicies: number;
  activeAgentsCount: number;
}

// 2. กราฟยอดขาย (ใช้โครงสร้างเดียวกับ Agent เพื่อ Reuse Component ได้)
export interface SalesTrendStat {
  _id: string;
  sales: number;
  count: number;
}

// 3. Top Agent (สำหรับตารางจัดอันดับ)
export interface TopAgent {
  _id: string;
  name: string;
  imgProfile?: string;
  totalSales: number;
  policiesCount: number;
}

// 4. สัดส่วนแบรนด์ (ใช้โครงสร้างเดียวกับ Agent)
export interface BrandStat {
  _id: string;
  count: number;
}

// 5. สถานะงาน
export interface StatusStat {
  _id: string;
  count: number;
}

// 6. ธุรกรรมล่าสุด (ต้องระบุ Type ของ Object ที่ Populate มาให้ครบ)
export interface AgentInfo {
  first_name: string;
  last_name: string;
  imgProfile?: string;
}

export interface CustomerInfo {
  first_name: string;
  last_name: string;
}

export interface InsuranceInfo {
  insuranceBrand: string;
  premium: number;
}

export interface RecentTransaction {
  _id: string;
  agent_id: AgentInfo;        // Backend populate มาแล้ว
  customer_id: CustomerInfo;  // Backend populate มาแล้ว
  carInsurance_id: InsuranceInfo; // Backend populate มาแล้ว
  status: string;
  createdAt: string;
}

// 7. สถิติแยกตามชั้นความคุ้มครอง
export interface LevelStat {
  _id: string; // "ชั้น 1", "2+", "3"
  count: number;
  totalSales: number;
}

// ✅ Main Interface รวมทุกอย่าง
export interface AdminDashboardData {
  summary: AdminSummary;
  salesTrend: SalesTrendStat[];
  topAgents: TopAgent[];
  brandPreference: BrandStat[];
  levelStats: LevelStat[]; 
  
  statusStats: StatusStat[];
  recentTransactions: RecentTransaction[];
}