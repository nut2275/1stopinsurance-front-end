"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import MenuLogin from "@/components/element/MenuLogin";
import { routesCustomersSession, routesAgentsSession } from "@/routes/session"

interface DecodedToken {
  username: string;
  exp?: number;
  iat?: number;
}

const LoginForm = () => {

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const router = useRouter();



  useEffect(() => {
    // check if customer session
    const sessionRoutes = routesCustomersSession();
    
    // check if agent session 
    const agentSession = routesAgentsSession();

    if (sessionRoutes) {
      localStorage.setItem("customerId", JSON.stringify(sessionRoutes._id)); 
      localStorage.setItem("customerBuyId", JSON.stringify(sessionRoutes._id));
      router.push("/customer/profile");
      return;
    } 
    else if (agentSession) {
      router.push("/agent/profile");
      return;
    }

    // const token = localStorage.getItem("token");
    // if (token) {
    //     // คง type เป็น object ตามที่คุณบอก
    //     const decoded = jwtDecode<{ username: string, _id: object }>(token);

    //     const _id = decoded._id;
    //     console.log(decoded._id);
        
    //     // ✅ แก้ไข: แปลง Object เป็น String ก่อนเก็บ
    //     localStorage.setItem("customerId", JSON.stringify(_id)); 
    //     localStorage.setItem("customerBuyId", JSON.stringify(decoded._id));

    //     console.log("Logged in user:", jwtDecode(token));
    //     if(decoded) router.push("/customer/profile")
    // }
  }, [router]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/customers/login", form);

      // ตรวจสอบว่ามี data ส่งกลับมาหรือไม่ (ป้องกัน res.data เป็น null)
      if (!res.data || !res.data.token) {
         alert("Username หรือ Password ผิด");
         return;
      }

      // ✅ 1. ดึง token และข้อมูล customer
      const { token, customer } = res.data;

      // ✅ 2. เก็บ Token
      localStorage.setItem("token", token);

      // ✅ 3. เก็บข้อมูล Customer (สำคัญมาก! Navbar จะใช้ตัวนี้ถ้า Token มีปัญหา)
      if (customer) {
          // แปลงเป็น JSON string ก่อนเก็บ
          localStorage.setItem("customer", JSON.stringify(customer));
          
          // (Optional) เก็บ ID แยกเผื่อใช้ที่อื่น
          const customerId = customer._id || customer.id;
          if (customerId) {
              localStorage.setItem("customerBuyId", customerId);
          }
      }

      // ✅ 4. แจ้งเตือนและ Redirect (ใช้ window.location เพื่อให้ Navbar อัปเดตทันที)
      alert(`ยินดีต้อนรับคุณ ${customer?.first_name || 'ผู้ใช้งาน'}`);
      
      // ⚠️ เปลี่ยนจาก router.push เป็น window.location.assign
      // เพื่อบังคับให้หน้าเว็บโหลดใหม่ และ Navbar (MenuLogined) อ่านค่าจาก LocalStorage ใหม่
      window.location.assign("/customer/mainpage"); 

    } catch (err: unknown) {
      console.error("Login error:", err);
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดที่ server");
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      {/* Header */}
      <MenuLogin />

      {/* Main */}
      <main className="flex-grow flex justify-center items-center">
        <section className="w-full flex justify-center items-center">
          <div className="bg-white border-2 border-blue-900 rounded-xl shadow p-8 w-full max-w-md text-center">
            <h2 className="text-lg font-bold text-blue-900 mb-6">เข้าสู่ระบบสมาชิก</h2>

            <form onSubmit={handleSubmit} className="text-start">
              <label className="p-2">ชื่อผู้ใช้</label>
              <input
                type="text"
                name="username"
                placeholder="ชื่อผู้ใช้"
                value={form.username}
                onChange={handleChange}
                className="w-full mt-3 border border-blue-900 rounded-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <label className="p-2">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                placeholder="รหัสผ่าน"
                value={form.password}
                onChange={handleChange}
                className="w-full border mt-3 border-blue-900 rounded-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <button
                type="submit"
                // disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-full font-bold hover:bg-blue-700 transition"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            {/* <a href="/forgot" className="block mt-4 text-blue-600 hover:underline">ลืมรหัสผ่าน</a> */}
            <Link href="/customer/register" className="block mt-2 text-blue-600 hover:underline">ลงทะเบียน</Link>
          </div>
        </section>
      </main>

    </div>
  );
};

export default LoginForm;
