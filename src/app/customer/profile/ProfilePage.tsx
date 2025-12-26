"use client";

import Script from "next/script";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from 'swr';
import { jwtDecode } from "jwt-decode";

// Components
import MenuLogined from "@/components/element/MenuLogined";
import ProfileCard from "./ProfileCard";
import InsuranceCard, { prompt, InsurancePolicy, InsuranceStatus } from "./InsuranceCard";
import { GlobalStyles } from "./GlobalStyles";

// Services
import api from "@/services/api";
import { Customer } from "@/types/dataType"; // ✅ Import Type Customer มาใช้

// ================================================================
// TYPES
// ================================================================
type DecodedToken = {
  username: string;
  _id: string;
  role: string;
};

type PurchaseStatus = 'active' | 'pending' | 'payment_due' | 'pending_payment' | 'about_to_expire' | 'expired' | 'rejected' | 'processing';

// ✅ Interface นี้ถูกต้องแล้ว
interface IFrontendPurchase {
  _id: string;
  status: PurchaseStatus;
  purchase_date: string;
  start_date: string;
  updatedAt: string;
  policy_number: string;
  reject_reason?: string; 
  
  carInsurance_id?: {
    company_name?: string;
    level?: string;
  };
  car_id?: {
    registration?: string;
  };
  
  customer_id?: string;
  agent_id?: string | null;
  citizenCardImage?: string;
  carRegistrationImage?: string;
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

const checkCookie = (): DecodedToken | null => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      return jwtDecode<DecodedToken>(token);
    }
    return null;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    return null;
  }
};

const formatDateTh = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
};

const mapStatus = (dbStatus: string): InsuranceStatus => {
    switch (dbStatus) {
        case 'active': return 'active';
        case 'about_to_expire': return 'expiring';
        case 'expired': return 'expired';
        case 'pending': return 'processing';     
        case 'pending_payment': return 'pending_payment'; 
        case 'payment_due': return 'pending_payment';
        case 'processing': return 'processing';
        case 'rejected': return 'rejected';
        default: return 'processing';
    }
};

// ================================================================
// FETCHERS (✅ ปรับปรุงให้ Return Type ชัดเจน)
// ================================================================

// Fetcher สำหรับ Profile (Return Type: Customer)
const fetcherProfile = async (url: string) => {
  const userData = checkCookie();
  if (!userData) throw new Error("Please login");
  const { username, _id, role } = userData;
  // ✅ ระบุ Generic Type ให้ api.post
  const res = await api.post<Customer>(url, { username, _id, role });
  return res.data;
};

// Fetcher สำหรับ Insurance List (Return Type: IFrontendPurchase[])
const fetcherInsurance = async (url: string) => {
    const timestamp = new Date().getTime();
    const finalUrl = url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`;
    // ✅ ระบุ Generic Type ให้ api.get
    const res = await api.get<IFrontendPurchase[]>(finalUrl);
    return res.data;
};

// ================================================================
// MAIN COMPONENT
// ================================================================

export default function ProfilePage() {
  const router = useRouter();
  const [userToken, setUserToken] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const decoded = checkCookie();
    if (decoded) {
        setUserToken(decoded);
    } else {
        router.push("/customer/login");
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/customer/login");
  };

  // ✅ ระบุ Generic Type ให้ useSWR เพื่อให้ตัวแปร profile มี Type เป็น Customer (ไม่ใช่ any)
  const { data: profile, error: profileError, isLoading: profileLoading } = useSWR<Customer>(
    "/customers/profile", 
    fetcherProfile,
    { dedupingInterval: 60000, revalidateOnFocus: false }
  );

  // ✅ ระบุ Generic Type ให้ useSWR เพื่อให้ insuranceList มี Type เป็น IFrontendPurchase[] (ไม่ใช่ any)
  const { data: insuranceList, error: insuranceError, isLoading: insuranceLoading } = useSWR<IFrontendPurchase[]>(
    userToken?._id ? `/purchase/customer/${userToken._id}` : null, 
    fetcherInsurance,
    { revalidateOnFocus: true, dedupingInterval: 0 }
  );

  if (profileLoading) return <div className="text-center mt-20 text-gray-500 animate-pulse">กำลังโหลดข้อมูลโปรไฟล์...</div>;
  if (profileError) return <div className="text-center text-red-600 mt-20 cursor-pointer hover:underline" onClick={logout}>เซสชั่นหมดอายุ กรุณาคลิกเพื่อเข้าสู่ระบบใหม่</div>;

  return (
    <>
      <GlobalStyles />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js"
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      ></Script>
      
      <main className={`${prompt.variable} font-sans text-gray-800`}>
        <MenuLogined activePage="/customer/profile"/>

        {/* profile อาจจะเป็น undefined ได้ เลยต้องเช็คก่อน หรือปล่อยให้ ProfileCard จัดการ (ซึ่งมันรองรับ null/undefined แล้ว) */}
        <ProfileCard user={profile || null} />

        <section className="max-w-5xl mx-auto mb-10 px-4 md:px-0">
            <h2 className="text-xl font-bold mb-4 ml-1 border-l-4 border-blue-600 pl-3">กรมธรรม์ของฉัน</h2>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                
                {insuranceLoading && (
                    <div className="col-span-2 text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                        กำลังโหลดข้อมูลกรมธรรม์...
                    </div>
                )}

                {!insuranceLoading && insuranceList && insuranceList.length === 0 && (
                    <div className="col-span-2 text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                        <i className="fa-regular fa-folder-open text-4xl text-gray-300 mb-3"></i>
                        <p className="text-gray-500 mb-4">คุณยังไม่มีรายการประกันภัย</p>
                        <Link href={"/customer/car-insurance/car-Insurance-form"} className="inline-block text-blue-600 font-bold border border-blue-600 px-6 py-2 rounded-full hover:bg-blue-50 transition">
                           เลือกซื้อประกันภัย
                        </Link>
                    </div>
                )}

                {/* insuranceList ตอนนี้มี Type ชัดเจนแล้ว ไม่ต้อง cast any ใน map */}
                {!insuranceLoading && insuranceList && insuranceList.map((item) => {
                    
                    // Logic คำนวณวันที่
                    let displayDateStr = "";
                    
                    // 1. ถ้า Active -> แสดงวันหมดอายุ (Start + 1 ปี)
                    if (item.status === 'active' && item.start_date) {
                        const startDate = new Date(item.start_date);
                        startDate.setFullYear(startDate.getFullYear() + 1); 
                        displayDateStr = formatDateTh(startDate.toISOString());
                    } else {
                        // 2. ถ้า Rejected หรืออื่นๆ -> แสดงวันที่อัปเดต (updatedAt)
                        const rawDate = item.updatedAt || item.purchase_date;
                        displayDateStr = formatDateTh(rawDate);
                    }

                    const mappedStatus = mapStatus(item.status);
                    
                    const mappedPolicy: InsurancePolicy = {
                        id: item._id,
                        status: mappedStatus,
                        date: displayDateStr,
                        title: `ประกันรถยนต์: ${item.carInsurance_id?.company_name || ''} ${item.carInsurance_id?.level || 'ไม่ระบุแผน'}`,
                        registration: item.car_id?.registration || 'รอระบุ',
                        policyNumber: item.policy_number || '-',
                        rejectReason: item.reject_reason 
                    };

                    return (
                        <InsuranceCard
                            key={mappedPolicy.id}
                            policy={mappedPolicy}
                            className="hover:shadow-md transition-shadow" 
                        />
                    );
                })}
            </div>
        </section>

        {!insuranceLoading && (!insuranceList || insuranceList.length === 0) && (
          <div className="flex flex-col items-center justify-center mb-10 gap-4">
            {/* ส่วนนี้ซ้ำซ้อนกับด้านบน ผมรวม Logic ไว้ใน block เดียวกันด้านบนแล้วครับ */}
          </div>
        )}

      </main>
    </>
  );
}