// services/agentService.ts
import api from "./api"; // import จากไฟล์ที่คุณมี
import { Agent } from "@/types/agent"; // ต้องมี Type Definition
import { DashboardData } from "@/app/agent/agent_dashboard/types";

export const getAgentById = async (id: string) => {
  try {
    const response = await api.get<Agent>(`/agents/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// สร้าง Type สำหรับ Response ที่มีเลขคิวแถมมาด้วย
export interface AgentWithQueue extends Agent {
  queue_number?: number;
}

export const getAgentStatus = async (id: string): Promise<AgentWithQueue> => {
  try {
    const response = await api.get(`/agents/${id}`); // เรียก Backend ตามที่คุณขอ
    return response.data;
  } catch (error) {
    throw error;
  }
};




// ✅ เพิ่มฟังก์ชันนี้สำหรับ Dashboard
export const getAgentCustomerStats = async (id: string): Promise<DashboardData> => {
  try {
    // ยิงไปที่ route ที่เราแก้ใหม่: /purchase/agent/customer-stats/ไอดี
    const response = await api.get<DashboardData>(`/purchase/agent/customer-stats/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};