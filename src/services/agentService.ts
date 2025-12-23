// services/agentService.ts
import api from "./api"; // import จากไฟล์ที่คุณมี
import { Agent } from "@/types/agent"; // ต้องมี Type Definition

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