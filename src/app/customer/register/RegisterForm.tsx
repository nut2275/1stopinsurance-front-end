"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import api from "@/services/api";
import MenuLogin from "@/components/element/MenuLogin";

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
    const { id, value } = e.target;
    
    // ✅ บังคับเบอร์โทรให้เป็นตัวเลขเท่านั้น และไม่เกิน 10 หลัก
    if (id === "phone") {
        const numeric = value.replace(/\D/g, "").slice(0, 10);
        setForm({ ...form, [id]: numeric });
    } else {
        setForm({ ...form, [id]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {   
      e.preventDefault();

      // ✅ 1. ตรวจสอบ Username (A-Z, 0-9, 4-20 ตัว)
      const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
      if (!usernameRegex.test(form.username)) {
          return alert("Username ต้องเป็นภาษาอังกฤษหรือตัวเลข (4-20 ตัวอักษร) ห้ามมีอักขระพิเศษ");
      }

      // ✅ 2. ตรวจสอบ Password (ขั้นต่ำ 8 ตัว)
      if (form.password.length < 8) {
          return alert("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      }

      // ✅ 3. ตรวจสอบ Confirm Password
      if (form.password !== form.confirmPassword) {
          return alert("รหัสผ่าน และ ยืนยันรหัสผ่าน ไม่ตรงกัน");
      }

      // ✅ 4. ตรวจสอบเบอร์โทร (ต้องครบ 10 หลัก)
      if (form.phone.length !== 10) {
          return alert("เบอร์โทรศัพท์ต้องมี 10 หลัก");
      }

      try {
          await api.post("/customers/register", form);
          alert("สมัครสมาชิกสำเร็จ!");
          router.push("/customer/login"); 
      } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          alert(error.response?.data?.message || "เกิดข้อผิดพลาดที่ server");
      }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      <MenuLogin />

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
                  ชื่อ <span className="text-red-500">*</span>
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
                  นามสกุล <span className="text-red-500">*</span>
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
                  วัน / เดือน / ปีเกิด <span className="text-red-500">*</span>
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
                  อีเมล <span className="text-red-500">*</span>
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
                  เบอร์มือถือ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="08XXXXXXXX"
                  maxLength={10} // ✅ Limit
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* ที่อยู่ */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  ที่อยู่ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="บ้านเลขที่ / ถนน / เขต / จังหวัด"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="ตั้งชื่อผู้ใช้ (อังกฤษ/ตัวเลข 4-20 ตัว)"
                  required
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="รหัสผ่าน (ขั้นต่ำ 8 ตัว)"
                  required
                  minLength={8}
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="ยืนยันรหัสผ่าน"
                  required
                  minLength={8}
                  className="w-full border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
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