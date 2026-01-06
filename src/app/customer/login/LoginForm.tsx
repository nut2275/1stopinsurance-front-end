"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import MenuLogin from "@/components/element/MenuLogin";
import { routesCustomersSession, routesAgentsSession } from "@/routes/session";

// --- SVG Icons ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

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
      // router.push("/customer/profile");
      window.location.assign("/customer/profile");
      return;
    } else if (agentSession) {
      // router.push("/agent/agent_dashboard");
      window.location.assign("/agent/agent_dashboard");
      return;
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage(""); // Clear error on typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/customers/login", form);

      // ตรวจสอบว่ามี data ส่งกลับมาหรือไม่
      if (!res.data || !res.data.token) {
         setMessage("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
         setLoading(false);
         return;
      }

      // ✅ 1. ดึง token และข้อมูล customer
      const { token, customer } = res.data;

      // ✅ 2. เก็บ Token
      localStorage.setItem("token", token);

      // ✅ 3. เก็บข้อมูล Customer
      if (customer) {
         localStorage.setItem("customer", JSON.stringify(customer));
         
         const customerId = customer._id || customer.id;
         if (customerId) {
             localStorage.setItem("customerBuyId", customerId);
         }
      }

      // ✅ 4. Redirect
      // alert(`ยินดีต้อนรับคุณ ${customer?.first_name || 'ผู้ใช้งาน'}`); // Optional: ตัด alert ออกเพื่อให้ flow ลื่นไหลเหมือนเว็บสมัยใหม่
      window.location.assign("/customer/mainpage");

    } catch (err: unknown) {
      console.error("Login error:", err);
      const error = err as AxiosError<{ message: string }>;
      setMessage(error.response?.data?.message || "เกิดข้อผิดพลาดที่ Server");
    } finally {
        setLoading(false);
    }
  };

  return (
    // ✨ Outer Wrapper: พื้นหลังใส่รูป + Overlay ให้ดูพรีเมียม
    <div className="relative min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* 1. Background Layer */}


      {/* 2. Menu: วางลอยด้านบน */}
      <div className="absolute top-0 left-0 w-full z-20">
        <MenuLogin />
      </div>

      {/* 3. Card Component: กล่องสีขาวลอยตรงกลาง */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/20">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">เข้าสู่ระบบสมาชิก</h2>
            <p className="mt-2 text-sm text-gray-500">
              ยินดีต้อนรับสู่บริการประกันภัยออนไลน์ครบวงจร
            </p>
        </div>

        {/* Error Message */}
        {message && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-pulse">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700 font-medium">{message}</p>
                    </div>
                </div>
            </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
                {/* Username */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อผู้ใช้</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                            <UserIcon />
                        </div>
                        <input
                            name="username"
                            type="text"
                            required
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                            placeholder="ระบุชื่อผู้ใช้"
                            value={form.username}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">รหัสผ่าน</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                            <LockIcon />
                        </div>
                        <input
                            name="password"
                            type="password"
                            required
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                            placeholder="ระบุรหัสผ่าน"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'} transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
                {loading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังเข้าสู่ระบบ...
                    </span>
                ) : (
                    "เข้าสู่ระบบ"
                )}
            </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-8">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">หรือ</span>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                <Link href="/customer/register" className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    ลงทะเบียนสมาชิกใหม่
                </Link>

                <Link href="/agent/login" className="w-full flex items-center justify-center px-4 py-2 border border-blue-50 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                    สำหรับตัวแทนประกันภัย <BriefcaseIcon />
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
};

export default LoginForm;