'use client'; // ✅ 1. เพิ่ม use client เพื่อให้ใช้ State และ useEffect ได้

import React, { useState, useEffect } from 'react';
import CarInsuranceForm from '@/app/customer/car-insurance/car-Insurance-form/CarInsuranceForm';
import MenuLogined from '@/components/element/MenuLogined';
import MenuLogin from '@/components/element/MenuLogin'; // ✅ 2. Import MenuLogin

export default function CarInsurancePage() {
    // ✅ 3. สร้าง State เช็คสถานะ Login
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // ✅ 4. ตรวจสอบ localStorage เมื่อโหลดหน้าเว็บ
        const customer = localStorage.getItem("customer");
        if (customer) {
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, []);

    // (Optional) แสดงหน้าเปล่าๆ ระหว่างโหลดเพื่อกัน Layout กระตุก
    if (isLoading) {
        return <div className="min-h-screen" style={{ backgroundColor: '#cfe2ff' }}></div>;
    }

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800" style={{ backgroundColor: '#cfe2ff' }}>
            
            {/* ✅ 5. เลือกแสดง Menu ตามสถานะ Login */}
            {isLoggedIn ? (
                <MenuLogined activePage='/customer/car-insurance/car-Insurance-form' />
            ) : (
                <MenuLogin activePage='/customer/car-insurance/car-Insurance-form' />
            )}

            <main className="flex-grow py-10">
                <CarInsuranceForm />
            </main>
        </div>
    );
}