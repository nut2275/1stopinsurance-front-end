// path: /app/customer/car-insurance/car-Insurance-form/page.tsx
import React from 'react';
import CarInsuranceForm from '@/app/customer/car-insurance/car-Insurance-form/CarInsuranceForm';
import MenuLogined from '@/components/element/MenuLogined';

export default function CarInsurancePage() {
    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800" style={{ backgroundColor: '#cfe2ff' }}>
            <MenuLogined activePage='/customer/car-insurance/car-Insurance-form' />
            <main className="flex-grow py-10">
                <CarInsuranceForm />
            </main>
        </div>
    );
}
