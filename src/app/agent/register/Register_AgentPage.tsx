"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import api from "@/services/api";
import MenuLogin from "@/components/element/MenuLogin";
import { Camera, AlertCircle } from "lucide-react"; // เพิ่ม Icon

// --- Types ---
interface RegisterFormState {
  first_name: string;
  last_name: string;
  agent_license_number: string;
  card_expiry_date: string;
  address: string;
  phone: string;
  idLine: string;
  imgProfile: string;
  note: string;
  birth_date: string;
  username: string;
  password: string;
  passwordConfirm: string;
  [key: string]: string; // Index signature for dynamic access
}

interface ApiErrorResponse {
  message: string;
  error?: string;
}

// ✅ Type ที่ชัดเจนขึ้น
interface NotificationPayload {
    recipientType: string;
    recipientId: string;
    message: string;
    type: string;
    sender: {
        name: string;
        role: string;
    }
}

export default function RegisterAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<RegisterFormState>({
    first_name: "",
    last_name: "",
    agent_license_number: "",
    card_expiry_date: "",
    address: "",
    phone: "",
    idLine: "",
    imgProfile: "", // ต้องมีค่า Base64
    note: "",
    birth_date: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [errorImg, setErrorImg] = useState<string>(""); // ✅ State เก็บ Error รูปภาพ

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "edit") {
      setIsEdit(true);
      const getParam = (key: string): string => searchParams.get(key) || "";

      setForm((prev) => ({
        ...prev,
        first_name: getParam("first_name"),
        last_name: getParam("last_name"),
        agent_license_number: getParam("agent_license_number"),
        card_expiry_date: getParam("card_expiry_date")?.split("T")[0] || "",
        address: getParam("address"),
        phone: getParam("phone"),
        idLine: getParam("idLine"),
        imgProfile: getParam("imgProfile"),
        note: getParam("note"),
        birth_date: getParam("birth_date")?.split("T")[0] || "",
        username: getParam("username"),
        password: "",
        passwordConfirm: "",
      }));
    }
  }, [searchParams]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    
    if (id === "phone" || id === "agent_license_number") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, [id]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorImg(""); // เคลียร์ Error เมื่อมีการเลือกไฟล์

    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        alert("ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setForm((prev) => ({ ...prev, imgProfile: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorImg("");

    // ✅ Validate 1: รูปโปรไฟล์ต้องมี
    if (!form.imgProfile) {
        setErrorImg("กรุณาอัปโหลดรูปโปรไฟล์");
        // เลื่อนหน้าจอไปหาจุดที่ Error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    if (form.agent_license_number.length !== 10) {
      return alert("เลขที่ใบอนุญาตต้องเป็นตัวเลข 10 หลักเท่านั้น");
    }

    if (form.phone.length !== 10) {
      return alert("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น");
    }

    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    if (!usernameRegex.test(form.username)) {
      return alert("Username ต้องเป็นภาษาอังกฤษหรือตัวเลข ความยาว 4-20 ตัวอักษร และไม่มีอักขระพิเศษ");
    }

    if (form.password.length < 8) {
      return alert("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
    }

    if (form.password !== form.passwordConfirm) {
      return alert("รหัสผ่าน และ ยืนยันรหัสผ่าน ไม่ตรงกัน");
    }

    try {
      if (isEdit) {
        alert("ระบบแก้ไขยังไม่เปิดใช้งานในตัวอย่างนี้");
      } else {
        await api.post("/agents/register", form);

        // ✅ Notification Logic (Type Safe)
        try {
            const fakeAdminId = "000000000000000000000000"; 
            const notiPayload: NotificationPayload = {
                recipientType: 'admin',
                recipientId: fakeAdminId, 
                message: `มีตัวแทนใหม่สมัครสมาชิก: ${form.first_name} ${form.last_name}`,
                type: 'info', 
                sender: {
                    name: `${form.first_name} ${form.last_name}`,
                    role: 'agent' 
                }
            };
            
            await api.post("/api/notifications", notiPayload);
        } catch (error) {
            console.error("Notification Error:", error);
        }

        alert("สมัครสมาชิกสำเร็จ! กรุณารอการอนุมัติ");
        router.push("/agent/login");
      }
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      console.error(err);
      const errorMessage =
        err.response?.data?.message ||
        "การสมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
      alert(errorMessage);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f6ff] text-gray-800 font-sans">
      <MenuLogin />

      <main className="max-w-4xl w-full mx-auto bg-white shadow rounded-xl mt-10 px-8 sm:px-15 py-8">
        <h1 className="text-center text-2xl font-bold text-blue-900 mb-6">
          {isEdit ? "แก้ไขข้อมูลตัวแทน" : "สมัครสมาชิกนายหน้า"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- Profile Image Upload Section --- */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className={`relative w-32 h-32 mb-2 group ${errorImg ? 'animate-pulse' : ''}`}>
              {form.imgProfile ? (
                
                <img
                  src={form.imgProfile}
                  alt="Profile Preview"
                  className={`w-full h-full object-cover rounded-full border-4 shadow-sm ${errorImg ? 'border-red-400' : 'border-blue-100'}`}
                />
              ) : (
                <div className={`w-full h-full rounded-full flex items-center justify-center border-4 text-gray-400 transition-colors ${errorImg ? 'bg-red-50 border-red-300 text-red-300' : 'bg-gray-200 border-gray-100'}`}>
                  <Camera className="w-12 h-12" />
                </div>
              )}
              
              <label 
                htmlFor="imgProfileInput" 
                className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer shadow-md transition-all hover:scale-110 ${errorImg ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                title="อัปโหลดรูปโปรไฟล์"
              >
                <Camera className="w-5 h-5" />
              </label>
              <input
                id="imgProfileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>
            
            <p className="text-sm text-gray-500">รูปโปรไฟล์ (ไม่เกิน 5MB) <span className="text-red-500">*</span></p>
            
            {/* 🚩 Error Message */}
            {errorImg && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1 bg-red-50 px-3 py-1 rounded-full border border-red-200 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorImg}</span>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block font-medium mb-1">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                placeholder="ชื่อจริง"
                value={form.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block font-medium mb-1">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                placeholder="นามสกุล"
                value={form.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          {/* ... (ส่วนอื่นๆ ของ Form เหมือนเดิม) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="birth_date" className="block font-medium mb-1">
                วันเกิด <span className="text-red-500">*</span>
              </label>
              <input
                id="birth_date"
                type="date"
                value={form.birth_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label
                htmlFor="agent_license_number"
                className="block font-medium mb-1"
              >
                เลขที่ใบอนุญาต <span className="text-red-500">*</span>
              </label>
              <input
                id="agent_license_number"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="เลขที่ใบอนุญาตนายหน้า (10 หลัก)"
                value={form.agent_license_number}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="card_expiry_date"
              className="block font-medium mb-1"
            >
              วันหมดอายุบัตรนายหน้า <span className="text-red-500">*</span>
            </label>
            <input
              id="card_expiry_date"
              type="date"
              value={form.card_expiry_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block font-medium mb-1">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[0-9]*"
                placeholder="08XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="idLine" className="block font-medium mb-1">
                LINE ID <span className="text-red-500">*</span>
              </label>
              <input
                id="idLine"
                type="text"
                placeholder="ไอดีไลน์"
                value={form.idLine}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block font-medium mb-1">
              ที่อยู่ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              rows={3}
              placeholder="ที่อยู่ปัจจุบัน"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
              <label htmlFor="note" className="block font-medium mb-1">
                หมายเหตุ (ไม่บังคับ)
              </label>
              <input
                id="note"
                type="text"
                placeholder="บันทึกเพิ่มเติม..."
                value={form.note}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              ข้อมูลสำหรับเข้าสู่ระบบ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block font-medium mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="ตั้งชื่อผู้ใช้ (อังกฤษ/ตัวเลข 4-20 ตัว)"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="password" className="block font-medium mb-1">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="รหัสผ่าน (ขั้นต่ำ 8 ตัว)"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label
                  htmlFor="passwordConfirm"
                  className="block font-medium mb-1"
                >
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                  minLength={8}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-700 w-full mt-6 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-800 transition shadow-md active:scale-[0.98]"
          >
            {isEdit ? "บันทึกการแก้ไข" : "สมัครสมาชิก"}
          </button>

          <p className="mt-4 text-sm text-gray-600 text-center">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/agent/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </main>

      <div className="mt-20 w-full"></div>
    </div>
  );
}