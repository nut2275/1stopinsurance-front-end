"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api"; // เรียกใช้ axios ตัวกลางที่มีอยู่
import MenuLogin from "@/components/element/MenuLogin";

// --- 1. Types & Interfaces (กำหนดโครงสร้างข้อมูลให้ชัดเจน) ---
type VerificationStatus = 'in_review' | 'approved' | 'rejected';

interface IAgent {
  _id: string;
  first_name: string;
  last_name: string;
  agent_license_number: string;
  card_expiry_date: string;
  birth_date: string;
  address: string;
  phone: string;
  idLine?: string;
  imgProfile?: string; // Base64 string
  note?: string;
  username: string;
  verification_status: VerificationStatus;
  assigned_count: number;
}

// --- 2. Helper Components (แยกส่วนย่อยเพื่อให้โค้ดหลักอ่านง่าย) ---

// ป้ายสถานะ (Badge)
const StatusBadge = ({ status }: { status: VerificationStatus }) => {
  const styles = {
    approved: "bg-green-100 text-green-700 border border-green-200",
    in_review: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    rejected: "bg-red-100 text-red-700 border border-red-200",
  };

  const labels = {
    approved: "อนุมัติแล้ว",
    in_review: "รอการตรวจสอบ",
    rejected: "ไม่อนุมัติ",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// แถวแสดงข้อมูล (Data Row)
const InfoRow = ({ label, value, icon }: { label: string; value: string | undefined; icon?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-3 transition-colors rounded-lg">
    <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
      {icon}
      {label}
    </div>
    <span className="text-gray-900 font-semibold text-right mt-1 sm:mt-0 break-words max-w-md">
      {value || "-"}
    </span>
  </div>
);

// ฟังก์ชันแปลงวันที่ให้เป็นไทย
const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// --- 3. Main Component ---
export default function AgentProfilePage() {
  const router = useRouter();
  const [agent, setAgent] = useState<IAgent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log(localStorage.getItem("token"));
    
    // fetchAgentData(localStorage.getItem("agent_id") || "");
  }, [router]);

  const fetchAgentData = async (id: string) => {
    try {
      setLoading(true);
      // ยิง API ไปดึงข้อมูล (Endpoint ตาม Backend ที่คุยกัน: /agents/:id)
      const response = await api.get<IAgent>(`/agents/${id}`);
      setAgent(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("ไม่สามารถโหลดข้อมูลได้ กรุณาเข้าสู่ระบบใหม่");
      router.push("/agent/login");
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    // ล้างข้อมูลทั้งหมด
    localStorage.removeItem("token");
    router.push("/agent/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f6ff]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        <p className="mt-4 text-blue-800 font-medium">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

//   if (!agent) return null;

  return (
    <div className="min-h-screen bg-[#f0f6ff] font-sans text-gray-800">
      <MenuLogin />

    </div>
  );
}