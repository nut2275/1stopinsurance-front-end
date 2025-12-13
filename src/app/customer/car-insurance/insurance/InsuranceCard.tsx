// src/components/InsuranceCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@mui/icons-material";

// ประกาศ Interface ตรงนี้เลย
export interface InsurancePlan {
  id: number | string;
  company: string;
  logoSrc: string;
  level: string;
  repairType: string; // "อู่" | "ห้าง"
  features: string[];
  premium: number;
  coverageAmount: number;
  installment: string;
  hasFloodCoverage?: boolean;
  hasFireCoverage?: boolean;
  personalAccidentCoverageIn?: number;
}

const InsuranceCard: React.FC<{ plan: InsurancePlan }> = ({ plan }) => {
  const router = useRouter();

  const handleDetailClick = () => {
    // ส่ง ID ไปที่หน้า Summary
    router.push(`/customer/car-insurance/summary?id=${plan.id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 hover:scale-105 border-t-4 border-blue-600 max-w-xs w-full mx-auto p-6 flex flex-col items-center h-full justify-between">
      
      {/* เนื้อหาการ์ด */}
      <div className="w-full flex flex-col items-center">
        <div className="w-20 h-20 mb-3 relative">
          <Image
            src={plan.logoSrc}
            alt={plan.company}
            fill
            className="object-contain"
          />
        </div>

        <h3 className="font-extrabold text-xl text-blue-900 text-center mb-1">
          {plan.company}
        </h3>

        <p className="text-sm text-gray-600 mb-3 text-center">
          {plan.level} | ซ่อม{plan.repairType}
        </p>
        <hr className="w-full border-blue-100 mb-3" />

        <p className="text-sm text-gray-700 font-medium mb-3 text-center">
          {plan.installment}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-3 min-h-[30px]">
          {plan.features.map((feature, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
            >
              <CheckCircle style={{ fontSize: "0.8rem" }} className="text-green-500" />
              {feature}
            </span>
          ))}
        </div>

        <div className="bg-blue-50 w-full p-4 rounded-xl mb-4 text-center">
          <p className="text-gray-700 text-sm">
            ทุนประกันภัย:{" "}
            <span className="font-bold text-blue-800 text-lg">
              {plan.coverageAmount.toLocaleString()} บาท
            </span>
          </p>
          <p className="text-gray-700 text-sm mt-1">
            เบี้ยประกัน/ปี:{" "}
            <span className="font-bold text-red-600 text-2xl">
              {plan.premium.toLocaleString()} บาท
            </span>
          </p>
        </div>
      </div>

      {/* ปุ่มกด */}
      <button
        onClick={handleDetailClick}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-lg transition-shadow shadow-md hover:shadow-lg mt-auto"
      >
        สนใจแผนนี้
      </button>
    </div>
  );
};

export default InsuranceCard;