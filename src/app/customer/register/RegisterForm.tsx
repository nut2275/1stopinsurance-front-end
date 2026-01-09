"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import api from "@/services/api";
import MenuLogin from "@/components/element/MenuLogin";
import { Loader2, AlertCircle } from "lucide-react"; // แนะนำให้ลง lucide-react เพิ่มเพื่อความสวยงาม

const RegisterForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
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
    
    // Clear error message เมื่อ user เริ่มพิมพ์แก้ไข
    if (errorMessage) setErrorMessage("");

    if (id === "phone") {
        const numeric = value.replace(/\D/g, "").slice(0, 10);
        setForm({ ...form, [id]: numeric });
    } else {
        setForm({ ...form, [id]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {   
      e.preventDefault();
      setErrorMessage(""); // เคลียร์ error เก่า

      // --- Validation Logic ---
      const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
      if (!usernameRegex.test(form.username)) {
         setErrorMessage("Username ต้องเป็นภาษาอังกฤษหรือตัวเลข (4-20 ตัวอักษร) ห้ามมีอักขระพิเศษ");
         return;
      }

      if (form.password.length < 8) {
         setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
         return;
      }

      if (form.password !== form.confirmPassword) {
         setErrorMessage("รหัสผ่าน และ ยืนยันรหัสผ่าน ไม่ตรงกัน");
         return;
      }

      if (form.phone.length !== 10) {
         setErrorMessage("เบอร์โทรศัพท์ต้องมี 10 หลัก");
         return;
      }

      // --- API Call ---
      try {
          setLoading(true);
          await api.post("/customers/register", form);
          
          // Redirect หรือแสดง Success UI
          // แนะนำ: อาจจะส่งไปหน้า Login หรือหน้า Success
          router.push("/customer/login"); 
      } catch (err) {
          const error = err as AxiosError<{ message: string }>;
          setErrorMessage(error.response?.data?.message || "เกิดข้อผิดพลาดที่ Server กรุณาลองใหม่");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50">
      <MenuLogin />

      <main className="flex-grow flex justify-center items-center px-4 py-12">
        <section className="w-full max-w-lg">
          
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10 transition-all">
            
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                    สมัครสมาชิก
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                    กรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบ
                </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{errorMessage}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* ชื่อ - นามสกุล (จัดให้อยู่แถวเดียวกันบนจอใหญ่) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700">
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="สมชาย"
                      required
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700">
                      นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="ใจดี"
                      required
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100"
                    />
                  </div>
              </div>

              {/* วันเกิด */}
              <div className="space-y-1.5">
                <label htmlFor="birth_date" className="block text-sm font-semibold text-slate-700">
                  วันเกิด <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="birth_date"
                  value={form.birth_date}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100"
                />
              </div>

              {/* อีเมล */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100"
                />
              </div>

              {/* เบอร์มือถือ */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">
                  เบอร์มือถือ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="08XXXXXXXX"
                  maxLength={10}
                  inputMode="numeric"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100 tracking-wide"
                />
              </div>

              {/* ที่อยู่ */}
              <div className="space-y-1.5">
                <label htmlFor="address" className="block text-sm font-semibold text-slate-700">
                  ที่อยู่ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={handleChange}
                  placeholder="บ้านเลขที่ / ถนน / แขวง / เขต / จังหวัด"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100 resize-none"
                />
              </div>

              {/* Separator */}
              <div className="py-2 flex items-center gap-4">
                 <div className="h-px bg-slate-200 flex-1"></div>
                 <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">บัญชีผู้ใช้</span>
                 <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="ภาษาอังกฤษหรือตัวเลข 4-20 ตัว"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                      รหัสผ่าน <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="ขั้นต่ำ 8 ตัวอักษร"
                      required
                      minLength={8}
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                      ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      required
                      minLength={8}
                      disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-100"
                    />
                  </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        กำลังสมัครสมาชิก...
                    </>
                ) : (
                    "สมัครสมาชิก"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                มีบัญชีอยู่แล้ว?{" "}
                <Link href="/customer/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  เข้าสู่ระบบที่นี่
                </Link>
              </p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

export default RegisterForm;