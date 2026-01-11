// src/app/survey/page.tsx
import SurveyForm from "@/app/customer/car-insurance/questionnaire/SurveyForm";
import MenuLogined from "@/components/element/MenuLogined";
import { Suspense } from 'react';

export default function SurveyPage() {
    return (
        <Suspense fallback={<div>Loading summary...</div>}>
            <div className="flex flex-col min-h-screen bg-blue-50 font-sans">
                {/* 1. Navbar (ใช้ Component จากโค้ดเดิม) */}
                <MenuLogined activePage="/customer/car-insurance/questionnaire" />

                {/* 2. Main Content */}
                <main className="flex-grow py-10 px-6">
                    <SurveyForm />
                </main>

            </div>
        </Suspense>

    );
}