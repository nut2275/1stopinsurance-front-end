// path: /app/customer/car-insurance/car-Insurance-form/page.tsx
import React from 'react';
import CarInsuranceForm from '@/app/customer/car-insurance/car-Insurance-form/CarInsuranceForm';
import MenuLogined from '@/components/element/MenuLogined';

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
                <a href="#" className="hover:underline">สนใจเป็นตัวแทนจำหน่ายประกัน คลิก</a>
            </div>
        </div>
    </footer>
);

export default function CarInsurancePage() {
    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800" style={{ backgroundColor: '#cfe2ff' }}>
            <MenuLogined activePage='/customer/car-insurance/car-Insurance-form' />
            <main className="flex-grow py-10">
                <CarInsuranceForm />
            </main>
            <Footer />
        </div>
    );
}
