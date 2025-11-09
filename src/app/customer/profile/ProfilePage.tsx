"use client"; // จำเป็นต้องใช้ "use client" หากใช้ <style jsx>

import Script from "next/script";

import MenuLogined from "@/components/element/MenuLogined";
import ProfileCard from "./ProfileCard";
import api from "@/services/api";
import useSWR from 'swr';
import { jwtDecode } from "jwt-decode";
import InsuranceCard,{prompt, policies} from "./InsuranceCard";
import { GlobalStyles } from "./GlobalStyles";
import Link from "next/link";


type DecodedToken = {
  username: string;
  _id: string; // ID ควรเป็น string
  role: string;
};


const checkCookie = (): DecodedToken | null => { // (คืนค่า null ถ้าไม่มี Token)
  try {
    const token = localStorage.getItem("token");
    if (token) {
      // decode token เพื่อดูข้อมูล user
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded;
    }
    return null; // คืนค่า null ถ้าไม่มี token

  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token"); // ลบ token ที่พังทิ้ง
    return null;
  }
};


//================================================================
// 6. MAIN PAGE COMPONENT (จาก page.tsx + layout.tsx)
//================================================================

const fetcher = async (url: string) => {
  const userData = checkCookie(); // ดึง token จาก localStorage
  if (!userData) throw new Error("กรุณาเข้าสู่ระบบ");

  const { username, _id, role} = userData;
  const res = await api.post(url, { username, _id, role });
  return res.data; // คืนข้อมูลโปรไฟล์
};

import { useRouter } from "next/navigation";
export default function ProfilePage() {
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("token");
    // setIsMenuOpen(false); // ปิดเมนูก่อน
    router.push("/customer/login");
  };

  const { data: profile, error, isLoading } = useSWR("/customers/profile", fetcher, {
    dedupingInterval: 60000, // กันโหลดซ้ำภายใน 60 วิ
    revalidateOnFocus: false, // ไม่รีโหลดเมื่อกลับมาหน้าเว็บ
  });

  if (isLoading) return <p className="text-center mt-10" >กำลังโหลดข้อมูล...</p>;
  if (error) return <p  className="text-center text-red-600 mt-10" onClick={logout}>{error.message}</p>;

  return (
    <>
      {/* นี่คือส่วนสำคัญที่ทำให้ไฟล์เดียวทำงานได้:
        1. โหลด Global Styles
        2. โหลด Font Awesome Script
        3. ใช้ div หุ้มทั้งหมดแล้วกำหนด font-sans (จากตัวแปร Font)
      */}
      <GlobalStyles />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js"
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      ></Script>
      
      {/* เราใช้ <main> แทน <div> เพื่อ semantic HTML ที่ดี
        และใช้ className จาก 'prompt'
      */}
      <main className={`${prompt.variable} font-sans text-gray-800`}>
        {/* 1. ส่วน Header (Navbar) */}
        <MenuLogined activePage="/customer/profile"/>

        {/* 2. ส่วนโปรไฟล์ */}
        <ProfileCard user={profile} />

        {/* 3. ส่วนการ์ดประกัน (.map()) */}
        <section className="max-w-5xl mx-auto grid sm:grid-cols-1 md:grid-cols-2 gap-6 mb-10 px-4 md:px-0">
          {policies.map((policy) => (
            <InsuranceCard
              key={policy.id}
              policy={policy}
              className={
                policy.status === "pending_payment" ? "md:col-span-2" : ""
              }
            />
          ))}
        </section>

        <div className="flex justify-center mb-10">
          <Link href={"/customer/car-insurance/car-Insurance-form"} className="bg-amber-400 w-40 h-10 flex justify-center items-center rounded-3xl">ยังไม่มีประกัน</Link>
          {/* <Link href={"/customer/car-insurance/questionnaire"}>ยังไม่มีประกัน</Link> */}
        </div>
        

      </main>
    </>
  );
}