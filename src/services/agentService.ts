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