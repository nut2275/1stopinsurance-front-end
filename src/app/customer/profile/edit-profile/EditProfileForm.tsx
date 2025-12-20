"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Person, Email, Phone, Home, Cake, CloudUpload, CheckCircle } from '@mui/icons-material';
import api from '@/services/api'; // ✅ เรียกใช้ api ที่คุณสร้างไว้
import axios from 'axios'; // เอาไว้เช็ค Error type
import { mutate } from "swr"; // ✅ เพิ่มบรรทัดนี้
import { Customer } from '@/types/dataType';
import { jwtDecode } from "jwt-decode";

export default function EditProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. ตั้งค่าเริ่มต้น
  const [formData, setFormData] = useState<Customer>({
    _id: "",
    first_name: "",
    last_name: "",
    email: "",
    address: "",
    birth_date: new Date(),
    phone: "",
    username: "",
    password: "",
    imgProfile_customer: "/fotos/noPrafile.jpg",
  }
);

  const [profilePreview, setProfilePreview] = useState<string>("/fotos/noPrafile.jpg");
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. หา ID จาก URL
      const targetId = searchParams.get('_id');
      
      if (!targetId) return; // ถ้าไม่มี ID ไม่ต้องทำอะไร

      try {
        // 2. ยิง API ไปขอข้อมูล
        const response = await api.get(`/customers/${targetId}`);
        const apiData = response.data; // ข้อมูลที่ได้จาก Backend

        // 3. เอาข้อมูลยัดใส่ State (เชื่อมตามชื่อตัวแปร)
        setFormData(prev => ({
          ...prev,          // คงค่าเดิมไว้ก่อน (เผื่อบาง field ไม่มี)
          ...apiData,       // ✅ ทับด้วยค่าจาก API (เพราะชื่อตรงกัน!)
          
          // ⚠️ ข้อควรระวัง: ข้อมูลวันที่จาก API มักเป็น String ต้องแปลงเป็น Date Object
          birth_date: apiData.birth_date ? new Date(apiData.birth_date) : new Date(),
          
          // ไม่เอา password มาโชว์
          password: "" 
        }));

        // 4. อัปเดตรูปโปรไฟล์ตัวอย่าง
        if (apiData.imgProfile_customer) {
          setProfilePreview(apiData.imgProfile_customer);
        }

      } catch (error) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", error);
      }
    };

    fetchUserData();
  }, [searchParams]);


  // Helper Date
  const formatDateForInput = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'birth_date' ? new Date(value) : value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ handleSubmit ที่ใช้ api instance
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. หา ID (จาก State หรือ URL)
    const targetId = formData._id || searchParams.get('_id');
    if (!targetId) return alert("ไม่พบ User ID");

    try {
      // 2. ยิง API (ใช้ api.put แทน axios.put)
      // หมายเหตุ: ต้องใส่ /api นำหน้า ถ้า Backend Route อยู่ที่ /api/customers
      // เพราะ baseURL คือ http://localhost:5000 เฉยๆ
      const response = await api.put(`/customers/${targetId}`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        birth_date: formData.birth_date,
        imgProfile_customer: profilePreview
      });

      if (response.status === 200) {
        setShowModal(true);
      }

    } catch (error) {
      // 3. จัดการ Error
      if (axios.isAxiosError(error)) {
        console.error("Axios Error:", error.response?.data);
        alert(error.response?.data?.message || "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
      } else {
        console.error("Unknown Error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อ Server");
      }
    }
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    
    // ✅ สั่งให้ SWR ไปโหลดข้อมูลใหม่ทันที (Re-validate)
    // Key นี้ต้องตรงกับ useSWR("/customers/profile", ...) ในหน้า ProfilePage เป๊ะๆ
    mutate("/customers/profile"); 

    router.push("/customer/profile");
  };

  return (
    <div className='my-10'>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm text-center transform scale-100 transition-transform">
            <CheckCircle className="text-green-500 mx-auto mb-4" style={{ fontSize: '3rem' }} />
            <h2 className="text-xl font-bold mb-3 text-gray-800">บันทึกข้อมูลสำเร็จ!</h2>
            <p className="text-gray-600 mb-6">ข้อมูลโปรไฟล์ของคุณถูกอัปเดตเรียบร้อยแล้ว</p>
            <button
              onClick={handleModalConfirm}
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 lg:p-10 border-t-4 border-blue-600">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center tracking-tight">แก้ไขโปรไฟล์</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="text-center pb-4 border-b border-gray-100">
            <Image
              id="profilePreview"
              src={profilePreview}
              alt="profile preview"
              width={96}
              height={96}
              className="mx-auto h-24 w-24 rounded-full object-cover border-4 border-blue-200 shadow-md mb-4"
              priority
            />
            <label htmlFor="file-upload" className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition shadow-md">
              <CloudUpload style={{ fontSize: '1.2rem' }} />
              <span className="font-semibold text-sm">อัปโหลดรูปโปรไฟล์ใหม่</span>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block font-semibold mb-2 text-gray-700 flex items-center">
                <Person className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }} /> ชื่อจริง
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block font-semibold mb-2 text-gray-700 flex items-center">
                <Person className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }} /> นามสกุล
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                required
              />
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <label htmlFor="birth_date" className="block font-semibold mb-2 text-gray-700 flex items-center">
              <Cake className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }} /> วันเกิด
            </label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formatDateForInput(formData.birth_date)}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block font-semibold mb-2 text-gray-700 flex items-center">
                <Phone className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }} /> เบอร์โทรศัพท์
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-semibold mb-2 text-gray-700 flex items-center">
                <Email className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }} /> อีเมล
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block font-semibold mb-2 text-gray-700 flex items-center">
              <Home className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }} /> ที่อยู่
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <a
              onClick={() => router.push("/customer/profile")}
              className="px-8 py-3 bg-gray-300 rounded-lg font-bold hover:bg-gray-400 transition cursor-pointer text-gray-800"
            >
              ยกเลิก
            </a>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}