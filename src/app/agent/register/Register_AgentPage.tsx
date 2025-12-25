"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import api from "@/services/api";
import MenuLogin from "@/components/element/MenuLogin";

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
  [key: string]: string;
}

interface ApiErrorResponse {
  message: string;
  error?: string;
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
    imgProfile: "",
    note: "",
    birth_date: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });

  const [isEdit, setIsEdit] = useState<boolean>(false);

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
    if (id === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [id]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  // ✅ แก้ไข: เพิ่ม Logic ส่ง Notification ในนี้
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      return alert("รหัสผ่าน และ ยืนยันรหัสผ่าน ไม่ตรงกัน");
    }

    try {
      if (isEdit) {
        alert("ระบบแก้ไขยังไม่เปิดใช้งานในตัวอย่างนี้");
      } else {
        // 1. ส่งข้อมูลสมัครสมาชิก
        await api.post("/agents/register", form);

        // 2. ✅ สร้าง Notification ส่งหา Admin
        try {
            // ใช้รหัสนี้แทน 'ADMIN' (เป็นรหัส 0 ยาว 24 ตัว เพื่อหลอกระบบว่าเป็น ObjectId)
            const fakeAdminId = "000000000000000000000000"; 

            await api.post("/api/notifications", {
                recipientType: 'admin',
                recipientId: fakeAdminId,  // ✅ แก้ตรงนี้
                message: `มีตัวแทนใหม่สมัครสมาชิก: ${form.first_name} ${form.last_name}`,
                type: 'info', // ✅ ลองเปลี่ยนเป็น 'info' ก่อน (เผื่อ backend ยังไม่รู้จัก 'primary')
                sender: {
                    name: `${form.first_name} ${form.last_name}`,
                    role: 'agent' // ✅ ลองเปลี่ยนเป็น 'agent' ไปก่อน (เผื่อ backend ยังไม่รู้จัก 'guest')
                }
            });
        } catch (notiError: any) {
            // ✅ เพิ่มบรรทัดนี้ เพื่อดูว่า Backend ตอบว่าผิดตรงไหน
            console.log("Notification Error Detail:", notiError.response?.data);
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
          
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              {form.imgProfile ? (
                <img
                  src={form.imgProfile}
                  alt="Profile Preview"
                  className="w-full h-full object-cover rounded-full border-4 border-blue-100 shadow-sm"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-100 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
              
              <label 
                htmlFor="imgProfileInput" 
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-colors"
                title="อัปโหลดรูปโปรไฟล์"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </label>
              <input
                id="imgProfileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>
            <p className="text-sm text-gray-500">รูปโปรไฟล์ (ไม่เกิน 5MB)</p>
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
                className="w-full border border-gray-300 rounded-md p-2"
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
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
          </div>

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
                className="w-full border border-gray-300 rounded-md p-2"
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
                placeholder="เลขที่ใบอนุญาตนายหน้า"
                value={form.agent_license_number}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
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
              className="w-full border border-gray-300 rounded-md p-2"
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
                pattern="[0-9]*"
                placeholder="08XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="idLine" className="block font-medium mb-1">
                LINE ID
              </label>
              <input
                id="idLine"
                type="text"
                placeholder="ไอดีไลน์ (ถ้ามี)"
                value={form.idLine}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
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
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
              <label htmlFor="note" className="block font-medium mb-1">
                หมายเหตุ
              </label>
              <input
                id="note"
                type="text"
                placeholder="บันทึกเพิ่มเติม..."
                value={form.note}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
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
                  placeholder="ตั้งชื่อผู้ใช้"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
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
                  placeholder="รหัสผ่าน"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
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
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-700 w-full mt-6 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-800 transition shadow-md"
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