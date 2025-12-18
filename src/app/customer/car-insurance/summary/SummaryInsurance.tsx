"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import MenuLogined from "@/components/element/MenuLogined";
import api from "@/services/api";
import axios from "axios";

interface InsurancePlan {
  id: number | string;
  company: string;
  logoSrc: string;
  level: string;
  repairType: string;
  features: string[];
  premium: number;
  installment: string;
  coverageAmount: number;
  personalAccidentCoverageOut: number;
  personalAccidentCoverageIn: number;
  propertyDamageCoverage: number;
  perAccidentCoverage: number;
  fireFloodCoverage: number;
  firstLossCoverage: number;
}

interface AgentProfile {
  _id: string;
  first_name: string;
  last_name: string;
  agent_license_number: string;
  imgProfile?: string;
}

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("id");

  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);


  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentCode, setAgentCode] = useState("");

  const [agentQuery, setAgentQuery] = useState("");
  const [agentResults, setAgentResults] = useState<AgentProfile[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);


  const getBrandLogo = (brandName: string) => {
    if (!brandName) return "/fotos/Insur1.png";
    const name = brandName.toLowerCase();
    if (name.includes("วิริยะ")) return "/fotos/Insur5.png";
    if (name.includes("กรุงเทพ")) return "/fotos/Insur6.png";
    if (name.includes("เมืองไทย")) return "/fotos/Insur2.png";
    if (name.includes("ธนชาต")) return "/fotos/Insur3.png";
    if (name.includes("ทิพย")) return "/fotos/Insur1.png";
    return "/fotos/Insur1.png";
  };

  useEffect(() => {
    
    if (!planId) {
        setLoading(false);
        return;
    }
    const storedData = localStorage.getItem("recommendedPlans");
    if (storedData) {
      const allPlans = JSON.parse(storedData);
      const foundRaw = allPlans.find((p: any) => String(p._id || p.id) === String(planId));

      if (foundRaw) {
         const mappedPlan: InsurancePlan = {
            id: foundRaw._id || foundRaw.id,
            company: foundRaw.insuranceBrand || foundRaw.company || "ไม่ระบุ",
            logoSrc: foundRaw.img || foundRaw.logoSrc || getBrandLogo(foundRaw.insuranceBrand),
            level: foundRaw.level || "-",
            repairType: foundRaw.repairType || "อู่",
            features: foundRaw.coverage || [], 
            premium: foundRaw.premium || 0,
            installment: "ผ่อน 0% 10 เดือน",
            coverageAmount: foundRaw.propertyDamageCoverage || foundRaw.coverageAmount || 0,
            personalAccidentCoverageOut: foundRaw.personalAccidentCoverageOut || 0,
            personalAccidentCoverageIn: foundRaw.personalAccidentCoverageIn || 0,
            propertyDamageCoverage: foundRaw.propertyDamageCoverage || 0,
            perAccidentCoverage: foundRaw.perAccidentCoverage || 0,
            fireFloodCoverage: foundRaw.fireFloodCoverage || 0,
            firstLossCoverage: foundRaw.firstLossCoverage || 0,
         };
         setSelectedPlan(mappedPlan);
      }
    }
    setLoading(false);
  }, [planId]);

//   useEffect(() => {
//   if (!agentCode || agentCode.length < 3) {
//     setAgentProfile(null);
//     setAgentError(null);
//     return;
//   }

//   const controller = new AbortController();

//   const fetchAgent = async () => {
//     try {
//       setAgentLoading(true);
//       setAgentError(null);

//       const res = await api.get(`/agents/by-license/${agentCode}`, {
//         signal: controller.signal, // ✅ axios รองรับ AbortController
//       });

//       setAgentProfile(res.data);
//     } catch (err) {
//       if (axios.isCancel(err)) return;

//       setAgentProfile(null);
//       setAgentError("ไม่พบข้อมูลตัวแทน");
//     } finally {
//       setAgentLoading(false);
//     }
//   };

//   fetchAgent();
//   return () => controller.abort();
// }, [agentCode]);

useEffect(() => {
  if (agentQuery.length < 2) {
    setAgentResults([]);
    setShowDropdown(false);
    return;
  }

  const controller = new AbortController();

  const fetchAgents = async () => {
    try {
      const res = await api.get(`/agents/search?q=${agentQuery}`, {
        signal: controller.signal,
      });
      setAgentResults(res.data);
      setShowDropdown(true);
    } catch (err) {
      setAgentResults([]);
    }
  };

  fetchAgents();
  return () => controller.abort();
}, [agentQuery]);



  const handleProceed = () => {
      if (planId) {
          router.push(`/customer/car-insurance/upload-documents?id=${planId}&agent=${agentCode}`);
      }
  };

  if (loading) return <div className="text-center py-20">กำลังโหลดข้อมูล...</div>;
  if (!selectedPlan) return <div className="text-center py-20 text-red-500">ไม่พบข้อมูลแผนประกัน</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MenuLogined activePage="/customer/car-insurance" />
      <div className="max-w-5xl mx-auto mt-10 px-4">
        <button onClick={() => router.back()} className="mb-4 text-gray-500 hover:text-blue-600 flex items-center gap-1">← ย้อนกลับ</button>
        <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">สรุปแผนประกันที่คุณเลือก</h1>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          {/* ข้อมูลหลัก */}
          <div className="bg-blue-50 p-8 md:w-1/3 flex flex-col items-center justify-start border-r border-blue-100">
            <div className="relative w-32 h-32 mb-4">
               <Image src={selectedPlan.logoSrc} alt={selectedPlan.company} fill className="object-contain"/>
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{selectedPlan.company}</h2>
            <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm mb-6">
                {selectedPlan.level} | ซ่อม{selectedPlan.repairType}
            </div>
            <div className="text-center w-full mb-6">
                <p className="text-gray-500 text-sm">เบี้ยประกันรวม</p>
                <p className="text-3xl font-bold text-red-600">{selectedPlan.premium.toLocaleString()} บ.</p>
                <p className="text-xs text-gray-400 mt-2">{selectedPlan.installment}</p>
            </div>
            <div className="w-full">
                <p className="text-gray-500 text-sm mb-2 text-center">จุดเด่นความคุ้มครอง</p>
                <div className="flex gap-2 flex-wrap justify-center">
                    {selectedPlan.features.length > 0 ? selectedPlan.features.map((f, i) => (
                        <span key={i} className="bg-white border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">✅ {f}</span>
                    )) : <span className="text-gray-400 text-sm">- ไม่มีข้อมูลจุดเด่น -</span>}
                </div>
            </div>
          </div>

          {/* รายละเอียดความคุ้มครอง */}
          <div className="p-8 md:w-2/3">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">📄 รายละเอียดความคุ้มครอง</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                <div className="col-span-1 sm:col-span-2 bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-200">
                    <span className="text-gray-700 font-medium">ทุนประกันภัยรถยนต์</span>
                    <span className="font-bold text-blue-800 text-xl">{selectedPlan.coverageAmount.toLocaleString()} บาท</span>
                </div>
                <DetailItem label="ความรับผิดต่อบุคคลภายนอก" value={selectedPlan.personalAccidentCoverageOut} />
                <DetailItem label="อุบัติเหตุส่วนบุคคล (คนในรถ)" value={selectedPlan.personalAccidentCoverageIn} />
                <DetailItem label="ความเสียหายต่อทรัพย์สิน" value={selectedPlan.propertyDamageCoverage} />
                <DetailItem label="ความคุ้มครองต่อครั้ง" value={selectedPlan.perAccidentCoverage} />
                <DetailItem label="คุ้มครองไฟไหม้/น้ำท่วม" value={selectedPlan.fireFloodCoverage} />
                <DetailItem label="ความรับผิดส่วนแรก" value={selectedPlan.firstLossCoverage} />
            </div>

            {/* ช่องกรอกเลขตัวแทน */}
            <div className="relative bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
              <label className="block text-sm font-semibold text-yellow-800 mb-2">
                ค้นหาตัวแทน (ชื่อ / นามสกุล / เลขใบอนุญาต)
              </label>

              <input
                type="text"
                value={agentQuery}
                onChange={(e) => setAgentQuery(e.target.value)}
                placeholder="พิมพ์ชื่อหรือตัวเลข..."
                className="w-full pl-4 pr-4 py-3 rounded-lg border border-yellow-300 focus:outline-none"
              />

              {showDropdown && agentResults.length > 0 && (
                <div className="absolute z-20 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {agentResults.map((agent) => (
                    <div
                      key={agent._id}
                      onClick={() => {
                        setAgentProfile(agent);
                        setAgentCode(agent._id);
                        setAgentQuery(
                          `${agent.first_name} ${agent.last_name}`
                        );
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <Image
                        src={agent.imgProfile || "/fotos/avatar-default.png"}
                        alt="agent"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-semibold">
                          {agent.first_name} {agent.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          เลขตัวแทน: {agent.agent_license_number}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>


             {/* ================= AGENT CARD ================= */}
              <div className="mt-4 mb-6">
                {agentLoading && (
                  <p className="text-gray-500 text-sm">กำลังค้นหาตัวแทน...</p>
                )}

                {agentError && (
                  <p className="text-red-500 text-sm">{agentError}</p>
                )}

                {agentProfile && (
                  <div className="flex items-center gap-4 bg-green-50 border p-4 rounded-xl">
                    <Image
                      src={agentProfile.imgProfile || "/fotos/avatar-default.png"}
                      alt="agent"
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-bold text-green-800">
                        {agentProfile.first_name} {agentProfile.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        เลขตัวแทน: {agentProfile.agent_license_number}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleProceed}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:-translate-y-1 transition-all"
              >
                ดำเนินการต่อ
              </button>

          </div>
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ label, value }: { label: string, value: number }) => (
    <div className="flex flex-col border-b border-gray-100 pb-2">
        <span className="text-sm text-gray-500 mb-1">{label}</span>
        <span className="font-semibold text-gray-800 text-lg">{value > 0 ? `${value.toLocaleString()} บาท` : "-"}</span>
    </div>
);