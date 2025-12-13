"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import MenuLogin from "@/components/element/MenuLogin";

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
      const token = localStorage.getItem("token");
      if (token) {
          const decoded = jwtDecode<{ username: string, _id:object }>(token);
          console.log(decoded._id);
          
          localStorage.setItem("customerId", decoded._id);
          console.log("Logged in user:", jwtDecode(token));
          if(decoded) router.push("/customer/profile")
          
          
          // router.push("/page2", {
          //   state: { userId: 123, username: "nutthapon" }
          // });
          // return
      } 

    }, []);

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const checkCookie = () => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     // decode token เพื่อดูข้อมูล user
  //     const decoded = jwtDecode<{ username: string }>(token);
  //     console.log("Logged in user:", jwtDecode(token));
  //     console.log("Logged in user:", decoded.username);
  //   }
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/customers/login", form);
      if(!res.data) alert("username หรือ password ผิด")
      // ✅ 1. ดึง token และข้อมูล customer ออกมา
      const { token, customer } = res.data;

      // เก็บ token
      localStorage.setItem("token", token);
      const customerId = customer._id || customer.id; 
      if (customerId) {
          localStorage.setItem("customerId", customerId);
          console.log("Saved Customer ID:", customerId);
      }

      /// ✅ 3. เก็บข้อมูล customer ใน localStorage ด้วย (สำหรับแสดงหน้า profile)
      localStorage.setItem("customer", JSON.stringify(customer));

      // ✅ 4. แจ้งเตือนและ redirect
      alert(`ยินดีต้อนรับคุณ ${customer.first_name} ${customer.last_name}`);
      // setMessage(`Login success ✅ Welcome ${decoded.username}`);
      router.push("/customer/profile")
    //   router.push("/profile");
    } 
    catch (err: unknown) {
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

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="username"
                placeholder="ชื่อผู้ใช้"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-blue-900 rounded-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="รหัสผ่าน"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-blue-900 rounded-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
