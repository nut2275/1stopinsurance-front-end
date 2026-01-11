
// src/app/results/page.tsx (หรือไฟล์ที่คุณก๊อปมา)
"use client"; // ใส่ไว้กันเหนียว

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ✅ เปลี่ยนจาก import ปกติ เป็น dynamic import + ปิด SSR
const InsuranceResultsPage = dynamic(
  () => import("@/app/customer/car-insurance/insurance/CarInsurance"),
  { 
    ssr: false, // 👈 พระเอกขี่ม้าขาว: สั่งห้ามรันบน Server (เลี่ยง localStorage error)
    loading: () => <div>Loading...</div> // component ที่จะโชว์ระหว่างรอโหลด
  }
);

export default function Results() {
    return (
    <Suspense fallback={<div>Loading summary...</div>}>
        <InsuranceResultsPage />
    </Suspense>
    );
}

// // src/app/results/page.tsx
// import InsuranceResultsPage from "@/app/customer/car-insurance/insurance/CarInsurance";
// import { Suspense } from 'react';

// export default function Results() {
//     return (
//     <Suspense fallback={<div>Loading summary...</div>}>
//         <InsuranceResultsPage />
//     </Suspense>
//     );
// }
