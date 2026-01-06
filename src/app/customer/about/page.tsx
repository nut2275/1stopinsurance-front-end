// path: /app/customer/car-insurance/car-Insurance-form/page.tsx
'use client'; // ✅ 1. ต้องใส่บรรทัดนี้เพื่อให้ใช้ useState, useEffect ได้

import React, { useState, useEffect } from 'react';
import AboutPage from '@/app/customer/about/AboutPage';
import MenuLogined from '@/components/element/MenuLogined';
import MenuLogin from '@/components/element/MenuLogin'; // ✅ 2. Import MenuLogin เข้ามา

export default function CarInsurancePage() {
    // ✅ 3. สร้าง State เพื่อเก็บสถานะการ Login
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // เพิ่ม loading state กันหน้าเว็บกระพริบ

    useEffect(() => {
        // ✅ 4. เช็ค localStorage เมื่อหน้าเว็บโหลดเสร็จ (Client-side only)
        const customer = localStorage.getItem("customer");
        if (customer) {
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, []);

    // (Optional) แสดง Loading ระหว่างเช็คสถานะ เพื่อไม่ให้ Layout ขยับ
    if (isLoading) {
        return <div className="min-h-screen bg-[#cfe2ff]"></div>; 
    }

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800" style={{ backgroundColor: '#cfe2ff' }}>
            
            {/* ✅ 5. เขียนเงื่อนไขเลือก Menu */}
            {isLoggedIn ? (
                <MenuLogined activePage='/customer/about' />
            ) : (
                <MenuLogin activePage='/customer/about'/>
            )}

            <main className="flex-grow py-10">
                <AboutPage />
            </main>
        </div>
    );
}