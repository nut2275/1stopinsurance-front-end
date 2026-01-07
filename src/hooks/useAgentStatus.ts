// src/hooks/useAgentStatus.ts
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "@/services/api"; // path api ของคุณ

// Interface (ถ้ามีไฟล์ type แยก import มาใช้ได้เลยครับ)
interface DecodedToken {
  id: string;
  // ... field อื่นๆ
}

interface AgentData {
  first_name: string;
  verification_status: string;
  // ... field อื่นๆ
}

export const AgentStatus = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // ถ้าไม่มี token อาจจะ redirect ไป login หรือไม่ทำอะไร (แล้วแต่ logic)
        if (!token) return;


        const decoded = jwtDecode<DecodedToken>(token);

        if (decoded && decoded.id) {
          // 1. ดึงข้อมูล Agent
          const agentRes = await api.get<AgentData>(`/agents/${decoded.id}`);
          const agent = agentRes.data;

          // Set ชื่อ
          if (agent.first_name) {
            setDisplayName(agent.first_name);
          }

          // เช็ค Status
          if (agent.verification_status === 'in_review' || agent.verification_status === 'rejected') {
            // ป้องกัน Redirect loop ถ้าอยู่หน้า status อยู่แล้ว
            if (pathname !== '/agent/status') {
              router.replace('/agent/status');
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize agent data:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router, pathname]); // dependency array

  // Return ค่าที่ Component ต้องใช้
  return { displayName, loading };
};