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
import InsuranceCard, { prompt, InsurancePolicy, InsuranceStatus } from "./InsuranceCard"; // Import Type มาด้วย
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

type PurchaseStatus = 'active' | 'pending' | 'payment_due' | 'about_to_expire' | 'expired' | 'rejected';

interface IFrontendPurchase {
  _id: string; // หน้าบ้านรับ ID เป็น String
  status: PurchaseStatus;
  purchase_date: string; // วันที่ส่งผ่าน JSON จะเป็น String (ISO format)
  start_date: string;
  policy_number: string;
  
  // ตรงนี้สำคัญ: เนื่องจากมีการ .populate() มา ข้อมูลจะเป็น Object ไม่ใช่ ObjectId
  carInsurance_id?: {
    company_name?: string;
    level?: string;
  };
  car_id?: {
    registration?: string;
  };
  
  // field อื่นๆ
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

// แปลงวันที่เป็นรูปแบบไทย dd/mm/yy (พ.ศ.)
const formatDateTh = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    // เพิ่มปีอีก 1 ปีสำหรับวันหมดอายุ (สมมติว่าประกัน 1 ปี) หรือใช้วันที่จริงถ้ามี
    // อันนี้แสดงแค่วันที่รับมา
    return date.toLocaleDateString("th-TH", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
};

// แปลง Status จาก Database ให้ตรงกับ UI (Tailwind colors ใน InsuranceCard)
const mapStatus = (dbStatus: string): InsuranceStatus => {
    switch (dbStatus) {
        case 'active': return 'active';
        case 'about_to_expire': return 'expiring';
        case 'expired': return 'expired';
        case 'pending': return 'processing';
        case 'payment_due': return 'pending_payment';
        case 'rejected': return 'expired'; // หรือสถานะอื่นตามต้องการ
        default: return 'processing';
    }
};

// ================================================================
// FETCHERS
// ================================================================

// Fetcher สำหรับ Profile (POST ตามโค้ดเดิม)
const fetcherProfile = async (url: string) => {
  const userData = checkCookie();
  if (!userData) throw new Error("กรุณาเข้าสู่ระบบ");
  const { username, _id, role } = userData;
  const res = await api.post(url, { username, _id, role });
  return res.data;
};

// ✅ Fetcher ใหม่สำหรับ Insurance (GET)
const fetcherInsurance = async (url: string) => {
    const res = await api.get(url);
    // console.log(res.data);
    
    return res.data;
};

// ================================================================
// MAIN COMPONENT
// ================================================================

export default function ProfilePage() {
  const router = useRouter();
  const [userToken, setUserToken] = useState<DecodedToken | null>(null);

  // 1. Check Token เมื่อโหลดหน้า
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

  // 2. Fetch Profile Data
  const { data: profile, error: profileError, isLoading: profileLoading } = useSWR(
    "/customers/profile", 
    fetcherProfile,
    {
        dedupingInterval: 60000,
        revalidateOnFocus: false,
    }
  );

  // 3. Fetch Insurance Data (ทำงานเมื่อมี userToken._id แล้ว)
  // ใช้ key เป็น null ถ้ายังไม่มี userToken เพื่อไม่ให้ fetch error
  const { data: insuranceList, error: insuranceError, isLoading: insuranceLoading } = useSWR(
    userToken?._id ? `/purchase/customer/${userToken._id}` : null, 
    fetcherInsurance
  );

  // Loading / Error States for Profile
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
        {/* 1. Header */}
        <MenuLogined activePage="/customer/profile"/>

        {/* 2. Profile */}
        <ProfileCard user={profile} />

        {/* 3. Insurance Cards Section */}
        <section className="max-w-5xl mx-auto mb-10 px-4 md:px-0">
            <h2 className="text-xl font-bold mb-4 ml-1">กรมธรรม์ของฉัน</h2>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* State: กำลังโหลดประกัน */}
                {insuranceLoading && (
                    <div className="col-span-2 text-center py-10 text-gray-500">
                        กำลังโหลดข้อมูลกรมธรรม์...
                    </div>
                )}

                {/* State: โหลดเสร็จแต่ไม่มีข้อมูล */}
                {!insuranceLoading && insuranceList && insuranceList.length === 0 && (
                    <div className="col-span-2 text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 mb-4">คุณยังไม่มีรายการประกันภัย</p>
                    </div>
                )}

                {/* State: มีข้อมูล -> Loop แสดงผล */}
                {!insuranceLoading && insuranceList && insuranceList.map((item: IFrontendPurchase) => {
                    
                    // Logic คำนวณวันที่ (ถ้ายืนยันแล้ว ให้แสดงวันหมดอายุ, ถ้ายัง ให้แสดงวันที่ทำรายการ)
                    // สมมติ: ถ้า active ให้ +1 ปี จาก start_date เป็นวันหมดอายุ
                    let displayDate = item.purchase_date;
                    if(item.status === 'active' && item.start_date) {
                         const start = new Date(item.start_date);
                         start.setFullYear(start.getFullYear() + 1); // บวก 1 ปี
                         displayDate = start.toISOString();
                    }

                    // Map ข้อมูลเข้า Object policy
                    const mappedPolicy: InsurancePolicy = {
                        id: item._id,
                        status: mapStatus(item.status),
                        date: formatDateTh(displayDate),
                        title: `ประกันรถยนต์: ${item.carInsurance_id?.company_name || ''} ${item.carInsurance_id?.level || 'ไม่ระบุแผน'}`,
                        registration: item.car_id?.registration || 'รอระบุ',
                        policyNumber: item.policy_number || '-'
                    };

                    return (
                        <InsuranceCard
                            key={mappedPolicy.id}
                            policy={mappedPolicy}
                            className={mappedPolicy.status === "pending_payment" ? "md:col-span-2" : ""}
                        />
                    );
                })}
            </div>
        </section>

        {/* ปุ่มซื้อประกันเพิ่ม */}

        {!insuranceList && (
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