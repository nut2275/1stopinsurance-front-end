import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
// สมมติว่าไฟล์ฟอร์มอยู่ตาม Path นี้
import CarInsuranceForm from '@/app/customer/car-insurance/car-Insurance-form/CarInsuranceForm'; 
import MenuLogined from '@/components/element/MenuLogined';


// ------------------- Footer Component -------------------
// อิงตามโครงสร้างจาก HTML เดิม
const Footer = () => (
    <footer className="bg-blue-900 text-white text-sm w-full mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div>
                <p className="font-bold">1StopInsurance</p>
                <p>วันสต๊อปอินชัวรันส์</p>
            </div>
            <div>
                <p>123 ถนน... แขวง...</p>
                <p>เขต... กรุงเทพฯ 10220</p>
            </div>
            <div>
                <p>โทร xxx-xxx-xxxx</p>
                <p>อีเมล xxx@bumail.net</p>
            </div>
            <div>
                <Link href="#" className="hover:underline">สนใจเป็นตัวแทนจำหน่ายประกัน คลิก</Link>
            </div>
        </div>
    </footer>
);


// ------------------- Main Page Component -------------------
export default function CarInsurancePage() {
    return (
        // ใช้ inline style สำหรับ background-color ตามที่กำหนดใน HTML เดิม
        <div className="flex flex-col min-h-screen font-sans text-gray-800" style={{ backgroundColor: '#cfe2ff' }}>
            <MenuLogined activePage='/customer/car-insurance/car-Insurance-form' />
            <main className="flex-grow py-10">
                {/* Component ฟอร์มที่เราสร้างไว้ก่อนหน้า */}
                <CarInsuranceForm />
            </main>
            <Footer />
        </div>
    );
}