// src/hooks/useAgentStatus.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "@/services/api";

interface DecodedToken {
  id: string;
}

interface AgentData {
  first_name: string;
  verification_status: string;
}

export const AgentStatus = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // เริ่มต้นเป็น true
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // กรณีไม่มี Token
        if (!token) {
           setLoading(false); // หยุดโหลดเพื่อให้ Dashboard ไปจัดการ Redirect Login ต่อ
           return;
        }

        const decoded = jwtDecode<DecodedToken>(token);

        if (decoded && decoded.id) {
          const agentRes = await api.get<AgentData>(`/agents/${decoded.id}`);
          const agent = agentRes.data;

          if (agent.first_name) {
            setDisplayName(agent.first_name);
          }

          // --- จุดแก้ไขสำคัญ ---
          if (agent.verification_status === 'in_review' || agent.verification_status === 'rejected') {
            if (pathname !== '/agent/status') {
              router.replace('/agent/status');
              // ❌ ห้ามสั่ง setLoading(false) ตรงนี้
              // ปล่อยให้ loading ค้างเป็น true ไว้ หน้า Dashboard จะได้แสดง Loading Spinner รอจนกว่าจะเปลี่ยนหน้าเสร็จ
              return; 
            }
          }
        }
        
        // ✅ ถ้าผ่านมาถึงตรงนี้แปลว่า Status ปกติ (หรืออยู่ที่หน้า status แล้ว)
        // ค่อยสั่งหยุดโหลด
        setLoading(false);

      } catch (error) {
        console.error("Failed to initialize agent data:", error);
        setLoading(false); // Error ก็หยุดโหลด เพื่อให้ UI แสดงผล (หรือแสดง Error)
      } 
      // ❌ ลบ finally block ทิ้งไปเลย เพราะเราคุม setLoading เองแล้ว
    };

    initData();
  }, [router, pathname]);

  return { displayName, loading };
};