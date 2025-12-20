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

// ================================================================
// TYPES
// ================================================================
type DecodedToken = {
  username: string;
  _id: string;
  role: string;
};

type PurchaseStatus = 'active' | 'pending' | 'payment_due' | 'pending_payment' | 'about_to_expire' | 'expired' | 'rejected' | 'processing';

interface IFrontendPurchase {
  _id: string;
  status: PurchaseStatus;
  purchase_date: string;
  start_date: string;
  updatedAt: string;
  policy_number: string;
  reject_reason?: string; // ✅ เพิ่ม field
  
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
// FETCHERS
// ================================================================

const fetcherProfile = async (url: string) => {
  const userData = checkCookie();
  if (!userData) throw new Error("Please login");
  const { username, _id, role } = userData;
  const res = await api.post(url, { username, _id, role });
  return res.data;
};

const fetcherInsurance = async (url: string) => {
    const timestamp = new Date().getTime();
    const finalUrl = url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`;
    const res = await api.get(finalUrl);
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

  const { data: profile, error: profileError, isLoading: profileLoading } = useSWR(
    "/customers/profile", 
    fetcherProfile,
    { dedupingInterval: 60000, revalidateOnFocus: false }
  );

  const { data: insuranceList, error: insuranceError, isLoading: insuranceLoading } = useSWR(
    userToken?._id ? `/purchase/customer/${userToken._id}` : null, 
    fetcherInsurance,
    { revalidateOnFocus: true, dedupingInterval: 0 }
  );

  if (profileLoading) return <p className="text-center mt-10">กำลังโหลดข้อมูล...</p>;
  if (profileError) return <p className="text-center text-red-600 mt-10 cursor-pointer" onClick={logout}>เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่ ({profileError.message})</p>;

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

        <ProfileCard user={profile} />

        <section className="max-w-5xl mx-auto mb-10 px-4 md:px-0">
            <h2 className="text-xl font-bold mb-4 ml-1">กรมธรรม์ของฉัน</h2>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                
                {insuranceLoading && (
                    <div className="col-span-2 text-center py-10 text-gray-500">
                        กำลังโหลดข้อมูลกรมธรรม์...
                    </div>
                )}

                {!insuranceLoading && insuranceList && insuranceList.length === 0 && (
                    <div className="col-span-2 text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 mb-4">คุณยังไม่มีรายการประกันภัย</p>
                    </div>
                )}

                {!insuranceLoading && insuranceList && insuranceList.map((item: IFrontendPurchase) => {
                    
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
                        date: displayDateStr, // ✅ ส่งวันที่เสมอ
                        title: `ประกันรถยนต์: ${item.carInsurance_id?.company_name || ''} ${item.carInsurance_id?.level || 'ไม่ระบุแผน'}`,
                        registration: item.car_id?.registration || 'รอระบุ',
                        policyNumber: item.policy_number || '-',
                        rejectReason: item.reject_reason // ✅ ส่งเหตุผลไปแยกต่างหาก
                    };

                    return (
                        <InsuranceCard
                            key={mappedPolicy.id}
                            policy={mappedPolicy}
                            className="" 
                        />
                    );
                })}
            </div>
        </section>

        {!insuranceLoading && (!insuranceList || insuranceList.length === 0) && (
          <div className="flex flex-col items-center justify-center mb-10 gap-4">
            <h1 className="text-xl font-bold text-gray-600"> ไม่พบประวัติการซื้อประกัน </h1>
            <Link href={"/customer/car-insurance/car-Insurance-form"} className="text-blue-500 font-bold w-48 h-12 flex justify-center items-center rounded-full shadow-md hover:bg-blue-500 hover:text-white transition text-lg">
              คลิกเพื่อสั่งซื้อเลย!
            </Link>
          </div>
        )}

      </main>
    </>
  );
}