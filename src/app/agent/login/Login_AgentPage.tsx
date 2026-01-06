"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from 'axios';
import { routesAgentsSession, routesCustomersSession } from "@/routes/session";
import MenuLogin from "@/components/element/MenuLogin";

// SVG Icons
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

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const Login_AgentPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const sessionAgentRoutes = routesAgentsSession();
    const customerSession = routesCustomersSession();

    if (sessionAgentRoutes) {
      window.location.assign("/agent/agent_dashboard")
      // router.push("/agent/agent_dashboard");
      return;
    } else if (customerSession) {
      window.location.assign("/customer/profile")
      // router.push("/customer/profile");
      return;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); 
    
    try {
      const res = await api.post("/agents/login", form);

      if (res.data) {
        const { token } = res.data;
        localStorage.setItem("token", token);

        const agentInfo = res.data.Agent || res.data.user;

        if (agentInfo) {
          localStorage.setItem('agentData', JSON.stringify(agentInfo));
          // router.push("/agent/agent_dashboard");
          window.location.assign("/agent/agent_dashboard");
        } else {
          setMessage("ไม่พบข้อมูลผู้ใช้งานในระบบ");
        }
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setMessage(error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
    setLoading(false);
  };

  return (
    // ✨ Outer Wrapper: พื้นหลังสีเทา จัดกึ่งกลาง
    <div className="min-h-screen flex items-center justify-center p-4 relative font-sans">
      
      {/* Menu: วางลอยด้านบน ไม่รบกวนการจัดกึ่งกลาง */}
      <div className="absolute top-0 left-0 w-full z-10">
         <MenuLogin /> 
      </div>

      {/* ✨ Card Component: กล่องสีขาวตรงกลาง */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100 z-0">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">เข้าสู่ระบบตัวแทนประกันภัย</h2>
            <p className="mt-2 text-sm text-gray-500">
                จัดการกรมธรรม์และลูกค้าของคุณ
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
                {/* Username Input */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">ชื่อผู้ใช้ </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-900 transition-colors">
                            <UserIcon />
                        </div>
                        <input
                            name="username"
                            type="text"
                            required
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent sm:text-sm transition-all"
                            placeholder="ระบุชื่อผู้ใช้"
                            value={form.username}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">รหัสผ่าน</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-900 transition-colors">
                            <LockIcon />
                        </div>
                        <input
                            name="password"
                            type="password"
                            required
                            className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent sm:text-sm transition-all"
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
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800 shadow-lg hover:shadow-xl'} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900`}
            >
                {loading ? (
                    <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังตรวจสอบข้อมูล...
                    </span>
                ) : (
                    "เข้าสู่ระบบตัวแทน"
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
                <Link href="/agent/register" className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    สมัครเป็นตัวแทนใหม่
                </Link>

                <Link href="/customer/login" className="w-full flex items-center justify-center px-4 py-2 border border-blue-100 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                    เข้าสู่ระบบสำหรับลูกค้า <ArrowRightIcon />
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Login_AgentPage;