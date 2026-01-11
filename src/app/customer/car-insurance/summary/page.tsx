// src/app/results/page.tsx
import InsuranceSummaryPage from "@/app/customer/car-insurance/summary/SummaryInsurance";
import { Suspense } from 'react';

export default function Results() {
    return (
        <Suspense fallback={<div>Loading summary...</div>}>
            <InsuranceSummaryPage />
        </Suspense>
    )
    ;
}