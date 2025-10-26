"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import api from "@/services/api";
import MenuLogin from "@/components/element/MenuLogin";

// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

const RegisterForm = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    birth_date: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };


  const handleSubmit = async (e: React.FormEvent) => {   
      e.preventDefault();
      // check pass with confirm pass
      if (form.password !== form.confirmPassword) return alert("ช่องกรอกยืนยันรหัสผ่าน ไม่ตรงกับ รหัสผ่าน");

      try {
          await api.post("/customers/register", form);
          alert("สมัครสมาชิกสำเร็จ!");
          router.push("/customer/login"); // ไปหน้า logins
      } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          alert(error.response?.data?.message || "เกิดข้อผิดพลาดที่ server");
      }
  };


return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      {/* Header */}
      <MenuLogin />

      {/* Main */}
      <main className="flex-grow flex justify-center items-center px-4 my-10">
        <section className="w-full flex justify-center items-center">
          <div className="bg-white border border-blue-900 rounded-2xl shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">
              สมัครสมาชิก
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ชื่อ */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="กรอกชื่อจริง"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* นามสกุล */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="กรอกนามสกุล"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* วันเกิด */}
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                  วัน / เดือน / ปีเกิด
                </label>
                <input
                  type="date"
                  id="birth_date"
                  value={form.birth_date}
                  onChange={handleChange}
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* อีเมล */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* เบอร์มือถือ */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์มือถือ
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="กรอกเบอร์มือถือ"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* ที่อยู่ */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  ที่อยู่
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="บ้านเลขที่ / ถนน / เขต / จังหวัด"
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="ชื่อผู้ใช้"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="รหัสผ่าน"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="ยืนยันรหัสผ่าน"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                สมัครสมาชิก
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-600 text-center">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/customer/login" className="text-blue-600 font-semibold hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </section>
      </main>

    </div>
  );
}

export default RegisterForm;




