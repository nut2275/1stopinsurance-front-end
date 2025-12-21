"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import MenuLogin from "@/components/element/MenuLogin";
import Link from "next/link";
import {AxiosError} from 'axios'

interface DecodedToken {
  username: string;
  id: string;
  role: string;
  exp?: number;
  iat?: number;
}

const Login_AgentPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/agent/agent_dashboard");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/agents/login", form);

      // console.log("res = \n" + res.data.Agent);
      if(res.data){
        const { token } = res.data;
        localStorage.setItem("token", token);
        const decoded = jwtDecode<DecodedToken>(token);
        // console.log(decoded.id);
        // console.log(decoded.role);
        // console.log(decoded.username);
        
        router.push("/agent/agent_dashboard");
      }
      
      

    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      setMessage(error.response?.data?.message || "เกิดข้อผิดพลาดที่ server")
      // alert(error.response?.data?.message || "เกิดข้อผิดพลาดที่ server");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      <MenuLogin />

      <main className="flex-grow flex justify-center items-center">
        <section className="w-full flex justify-center items-center">
          <div className="bg-white border-2 border-blue-900 rounded-xl shadow p-8 w-full max-w-md text-center">
            <h2 className="text-lg font-bold text-blue-900 mb-6">เข้าสู่ระบบนายหน้า</h2>

            <form onSubmit={handleSubmit} className="text-start">
              <label className="px-2">ชื่อผู้ใช้</label>
              <input
                type="text"
                name="username"
                placeholder="ชื่อผู้ใช้"
                value={form.username}
                onChange={handleChange}
                className="w-full border mt-3 border-blue-900 rounded-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-full font-bold hover:bg-blue-700 transition">
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            {message && <p className="text-red-600 mt-2">{message}</p>}
            {/* <Link href="/forgot" className="block mt-4 text-blue-600 hover:underline">ลืมรหัสผ่าน</Link> */}
            <Link href="/agent/register" className="block mt-2 text-blue-600 hover:underline">ลงทะเบียน</Link>
          </div>
        </section>
      </main>

    </div>
  );
};

export default Login_AgentPage;
