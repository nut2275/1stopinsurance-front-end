"use client";

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Person, Email, Phone, Home, Cake, CloudUpload, CheckCircle } from '@mui/icons-material'; // ใช้ MUI Icons

// Interface สำหรับข้อมูลผู้ใช้ (ควรมาจาก types/dataType.ts)
interface UserProfile {
    fullName: string;
    age: number;
    phone: string;
    email: string;
    address: string;
    profileUrl: string;
}

// ข้อมูล Mock User (สมมติว่าดึงมาจาก Context/API)
const mockUser: UserProfile = {
    fullName: "คุณนัท สุดหล่อ",
    age: 21,
    phone: "089-999-9998",
    email: "nut@email.com",
    address: "123 ถนนกรุงเทพ เขตดินแดง",
    profileUrl: "/fotos/profile.png", // Path รูปภาพเดิม
};

export default function EditProfileForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<UserProfile>(mockUser);
    const [profilePreview, setProfilePreview] = useState<string>(mockUser.profileUrl);
    const [showModal, setShowModal] = useState<boolean>(false); // State สำหรับ Modal

    // 1. Handle Input Changes
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' ? parseInt(value) || 0 : value,
        }));
    };

    // 2. Handle Image Preview
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result as string);
                // ในโค้ดจริง: คุณควรเก็บไฟล์นี้ไว้ใน state หรืออัปโหลดไปยัง Firebase Storage/S3
            };
            reader.readAsDataURL(file);
        }
    };

    // 3. Handle Submit
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        // ** Logic การบันทึกข้อมูล (Save to API/Database) ควรอยู่ที่นี่ **
        console.log("Saving data:", formData);

        // แสดง Modal แทน alert()
        setShowModal(true);
    };
    
    // 4. Handle Modal Confirmation
    const handleModalConfirm = () => {
        setShowModal(false);
        router.push("/customer/profile"); // นำทางกลับไปหน้า Profile
    };

    return (
        <div className='my-10'>
            {/* ------------------- Custom Success Modal ------------------- */}
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
            {/* ------------------- End Modal ------------------- */}


            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 lg:p-10 border-t-4 border-blue-600">
                <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center tracking-tight">แก้ไขโปรไฟล์</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture Upload */}
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
                            <CloudUpload style={{ fontSize: '1.2rem' }}/>
                            <span className="font-semibold text-sm">อัปโหลดรูปโปรไฟล์ใหม่</span>
                        </label>
                        <input 
                            id="file-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="hidden" // ซ่อน input จริง
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="fullName" className="block font-semibold mb-2 text-gray-700 flex items-center">
                            <Person className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }}/> ชื่อ - นามสกุล
                        </label>
                        <input 
                            type="text" 
                            id="fullName"
                            name="fullName" 
                            value={formData.fullName} 
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Age (ใช้ Birthdate แทน Age จะ Professional กว่า) */}
                    <div>
                        <label htmlFor="age" className="block font-semibold mb-2 text-gray-700 flex items-center">
                            <Cake className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }}/> อายุ
                        </label>
                        <input 
                            type="number" 
                            id="age"
                            name="age" 
                            value={formData.age} 
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
                        />
                    </div>
                    
                    {/* Phone & Email (Grid Layout) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="phone" className="block font-semibold mb-2 text-gray-700 flex items-center">
                                <Phone className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }}/> เบอร์โทรศัพท์
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
                                <Email className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }}/> อีเมล
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
                            <Home className="mr-2 text-blue-500" style={{ fontSize: '1.2rem' }}/> ที่อยู่
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
                            className="px-8 py-3 bg-gray-300 rounded-lg font-bold hover:bg-gray-400 transition cursor-pointer"
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