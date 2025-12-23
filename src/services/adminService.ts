import api from './api';
import { Agent } from '@/types/agent';

export const getAgentsByStatus = async (status?: string): Promise<Agent[]> => {
  // สมมติว่า Backend มี endpoint รับ query param ?status=...
  // หรือถ้ายังไม่มี ให้ดึงทั้งหมดแล้วมา filter ที่หน้าบ้านแทนได้ครับ
  try {
    const url = status ? `/agents?status=${status}` : '/agents'; 
    // หมายเหตุ: ถ้า Backend คุณแยก route เป็น /pending ก็ให้เขียน logic สลับ path เอาครับ
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateAgentStatus = async (id: string, status: 'approved' | 'rejected', note?: string) => {
  try {
    const res = await api.put(`/agents/verify/${id}`, { status, note });
    return res.data;
  } catch (error) {
    throw error;
  }
};