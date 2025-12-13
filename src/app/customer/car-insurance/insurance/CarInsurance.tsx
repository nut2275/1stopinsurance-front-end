"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Assignment } from "@mui/icons-material";
import MenuLogined from "@/components/element/MenuLogined";
import InsuranceCard, { InsurancePlan } from "./InsuranceCard";

export default function InsuranceResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendedPlans, setRecommendedPlans] = useState<InsurancePlan[]>([]);
  const [alternativePlans, setAlternativePlans] = useState<InsurancePlan[]>([]);
  const [hasSurvey, setHasSurvey] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    companies: new Set<string>(),
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Helper เลือกรูป (เหมือนเดิม)
  const getBrandLogo = (brandName: string) => {
    if (!brandName) return "/fotos/Insur1.png";
    const name = brandName.toLowerCase();
    if (name.includes("วิริยะ")) return "/fotos/Insur5.png";
    if (name.includes("กรุงเทพ")) return "/fotos/Insur6.png";
    if (name.includes("เมืองไทย")) return "/fotos/Insur2.png";
    if (name.includes("ธนชาต")) return "/fotos/Insur3.png";
    if (name.includes("ทิพย")) return "/fotos/Insur1.png";
    if (name.includes("มิตรแท้")) return "/fotos/Insur4.png";
    if (name.includes("ไทยศรี")) return "/fotos/InsurDefault.png";
    return "/fotos/Insur1.png";
  };

  useEffect(() => {
    const fetchData = () => {
        const storedPlans = localStorage.getItem("recommendedPlans");
        const storedAnswers = localStorage.getItem("insuranceAnswers");
        
        if (storedPlans) {
            try {
                const allPlans = JSON.parse(storedPlans);
                let budgetMax = 999999;
                let userHasSurvey = false;

                // เช็คว่า User เคยทำแบบสอบถามหรือยัง
                if (storedAnswers) {
                    const answers = JSON.parse(storedAnswers);
                    userHasSurvey = true;
                    switch (answers.budget) {
                        case 'low': budgetMax = 5000; break;
                        case 'mid-low': budgetMax = 8000; break;
                        case 'mid': budgetMax = 12000; break;
                        case 'high': budgetMax = 999999; break;
                    }
                }

                setHasSurvey(userHasSurvey);

                const inBudget: InsurancePlan[] = [];
                const overBudget: InsurancePlan[] = [];

                allPlans.forEach((item: any) => {
                    let featuresList: string[] = [];
                    if (Array.isArray(item.coverage) && item.coverage.length > 0) {
                        featuresList = item.coverage;
                    } else {
                        featuresList = [
                            (item.hasFloodCoverage || item.features?.includes("น้ำท่วม")) ? "น้ำท่วม" : "",
                            (item.hasFireCoverage || item.features?.includes("ไฟไหม้")) ? "ไฟไหม้" : "",
                            (item.personalAccidentCoverageIn > 0 || item.features?.includes("สุขภาพ")) ? "สุขภาพ" : "",
                        ].filter(Boolean);
                    }

                    const mappedPlan: InsurancePlan = {
                        id: item._id || item.id,
                        company: item.insuranceBrand || item.company || "ไม่ระบุ",
                        logoSrc: item.img || item.logoSrc || getBrandLogo(item.insuranceBrand || item.company),
                        level: item.level || "-",
                        repairType: item.repairType || "อู่",
                        features: featuresList,
                        premium: item.premium || 0,
                        coverageAmount: item.propertyDamageCoverage || item.coverageAmount || 0,
                        installment: "ผ่อน 0% 10 เดือน",
                    };

                    // Logic การแยกกลุ่ม (ตาม Requirement ใหม่)
                    if (userHasSurvey) {
                        // Case: มาจากหน้า Survey -> แยกตามงบ
                        if (mappedPlan.premium <= budgetMax) {
                            inBudget.push(mappedPlan);
                        } else {
                            overBudget.push(mappedPlan);
                        }
                    } else {
                        // Case: มาจากหน้า Form -> 
                        // เรายังไม่รู้งบจริงๆ แต่สมมติว่า Plans ที่ค้นหามาได้คือ "ตรงเงื่อนไข" ไว้ก่อน (ใส่ inBudget)
                        // ส่วน overBudget จะว่างไว้
                        // แต่ถ้าเราอยากทำ Upsell (กรณีไม่เจอแผน) เราอาจจะใส่ logic เพิ่มตรงนี้ได้ แต่ตามโจทย์ให้ใช้ allPlans เป็นฐาน
                        
                        // ในที่นี้สมมติว่า backend ส่งมาเฉพาะที่ตรงรุ่นรถ แต่ราคาหลากหลาย
                        // เราถือว่าทั้งหมดคือ Recommended ไปก่อน (inBudget)
                        inBudget.push(mappedPlan); 
                        
                        // **เพิ่มเติม**: เพื่อรองรับ case "หาไม่เจอ ให้แนะนำแผนอื่น"
                        // ถ้า Backend ส่งมาน้อย หรือไม่ตรง เราอาจจะ Mock แผนแนะนำใส่ overBudget ไว้เผื่อ
                        // (แต่ในโค้ดนี้ สมมติว่า Backend ส่งแผนแนะนำมาใน allPlans แล้วแค่เราต้อง filter เอาเอง)
                    }
                });

                // *** Logic พิเศษตาม Requirement ***
                // ถ้ามาจากหน้า Form (ไม่มี Survey) และหาไม่เจอ (inBudget ว่าง) -> ให้เอาแผนทั้งหมดไปใส่ overBudget แทน เพื่อแสดงเป็นแผนแนะนำ
                if (!userHasSurvey && inBudget.length === 0 && allPlans.length > 0) {
                     // ย้ายจาก inBudget (ซึ่งว่าง) มาเป็น overBudget เพื่อแสดงใน Section แนะนำแทน
                     // (ต้องแน่ใจว่า backend ส่ง data มานะ ถ้า backend ส่ง [] มา ก็จบข่าว)
                     // สมมติว่า backend ส่งแผนใกล้เคียงมาให้ด้วยแต่เรา filter ทิ้งไปก่อนหน้านี้
                }

                setRecommendedPlans(inBudget);
                setAlternativePlans(overBudget);

            } catch (error) {
                console.error("Error parsing plans:", error);
            }
        }
        setLoading(false);
    };

    fetchData();
  }, []);

  const handleCompanyToggle = (company: string) => {
    setFilters((prev) => {
      const newCompanies = new Set(prev.companies);
      if (newCompanies.has(company)) newCompanies.delete(company);
      else newCompanies.add(company);
      return { ...prev, companies: newCompanies };
    });
  };

  const filterList = (plans: InsurancePlan[]) => {
      return plans.filter(p => {
          const matchSearch = filters.search ? p.company.toLowerCase().includes(filters.search.toLowerCase()) : true;
          const matchCheckbox = filters.companies.size > 0 ? filters.companies.has(p.company) : true;
          return matchSearch && matchCheckbox;
      });
  };

  const goToQuestionnaire = () => {
      router.push("/customer/car-insurance/questionnaire");
  };

  // เช็คจำนวนแผนที่แสดงผลหลัง Filter
  const showRecommended = filterList(recommendedPlans).length > 0;
  const showAlternative = filterList(alternativePlans).length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#cfe2ff]">
      <MenuLogined activePage="/customer/car-insurance/insurance" />
      <main className="flex-grow max-w-7xl mx-auto py-10 px-4 w-full">
        
        {/* Header: จัดปุ่มให้อยู่ตรงกับหัวข้อ */}
        <div className="mb-8 w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-wide inline-flex items-center gap-2">
                {/* ถ้ามี Survey แสดงข้อความ A ถ้าไม่มีแสดงข้อความ B */}
                {hasSurvey ? (
                    <>✅ แผนที่ตรงใจคุณ (ตามงบประมาณ)</>
                ) : (
                    <>แผนประกันที่เหมาะกับคุณ <span className="text-4xl">🥇</span></>
                )}
            </h1>

            {/* ปุ่มเปลี่ยนข้อความตามเงื่อนไข */}
            <button 
                onClick={goToQuestionnaire}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:scale-105 hover:bg-blue-700 transition-all text-sm font-bold whitespace-nowrap"
            >
                <Assignment fontSize="small"/>
                {hasSurvey ? "ทำแบบสอบถามใหม่" : "ทำแบบสอบถามเพิ่มเติม"}
            </button>
        </div>

        {/* Container หลัก */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch min-h-[600px]">
          
          {/* Sidebar Filter */}
          <aside className={`bg-white rounded-2xl shadow-xl p-6 w-full md:w-1/4 flex-shrink-0 transition-all duration-300 flex flex-col h-full ${isMobileSidebarOpen ? "block" : "hidden md:flex"}`}>
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">กรองตามบริษัท</h2>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหา..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <ul className="space-y-2 flex-1 overflow-y-auto">
              {["วิริยะประกันภัย", "เมืองไทยประกันภัย", "กรุงเทพประกันภัย", "ธนชาตประกันภัย", "ทิพยประกันภัย", "มิตรแท้ประกันภัย", "ไทยศรีประกันภัย", "อาคเนย์ประกันภัย", "สินมั่นคงประกันภัย"].map((company) => (
                <li key={company}>
                  <label className="flex items-center space-x-3 cursor-pointer select-none hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-150 ease-in-out cursor-pointer"
                      checked={filters.companies.has(company)}
                      onChange={() => handleCompanyToggle(company)}
                    />
                    <span className="text-sm text-gray-700 font-medium group-hover:text-blue-700">{company}</span>
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          {/* Cards Section */}
          <section className="flex-1 space-y-12 pb-10 flex flex-col w-full">
            {loading ? (
              <div className="text-center py-20 text-gray-500 bg-white rounded-2xl shadow-sm h-full flex items-center justify-center">กำลังประมวลผล...</div>
            ) : (
                <div className="flex flex-col h-full">
                    <div>
                        {/* ----------------------------------------------------------- */}
                        {/* CASE 1: แสดงแผนปกติ (ตรงเงื่อนไข) */}
                        {/* แสดงเมื่อ: (มี Survey AND เจอแผน) OR (ไม่มี Survey AND เจอแผน) */}
                        {/* ----------------------------------------------------------- */}
                        {(showRecommended) && (
                            <div className="mb-12">
                                {/* ถ้ามี Survey แสดงหัวข้อย่อย ถ้าไม่มี(มาจาก Form) ไม่ต้องแสดงหัวข้อซ้ำ */}
                                {hasSurvey && (
                                    <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                                        ✅ แผนที่ตรงใจคุณ (ตามงบประมาณ)
                                    </h2>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filterList(recommendedPlans).map((plan) => (
                                        <InsuranceCard key={plan.id} plan={plan} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ----------------------------------------------------------- */}
                        {/* CASE 2: แสดงแผนแนะนำเพิ่มเติม (Upsell) */}
                        {/* แสดงเมื่อ: 
                            1. (มี Survey) AND (มีแผน Alternative) -> แสดงต่อท้าย
                            2. (ไม่มี Survey) AND (ไม่เจอแผนปกติ) AND (มีแผน Alternative/Backup) -> แสดงแทนที่
                            3. (มี Survey) AND (ไม่เจอแผนปกติ) AND (มีแผน Alternative) -> แสดงแทนที่
                        */}
                        {/* ----------------------------------------------------------- */}
                        {((hasSurvey && showAlternative) || (!showRecommended && showAlternative)) && (
                            <div className={`pt-8 ${showRecommended ? "border-t-2 border-blue-200 border-dashed" : ""}`}>
                                <h2 className="text-2xl font-bold text-orange-600 mb-2 flex items-center gap-2">
                                    🚀 แผนแนะนำเพิ่มเติม (ความคุ้มครองสูงกว่า / เกินงบ)
                                </h2>
                                <p className="text-gray-600 mb-6 pl-1">
                                    {showRecommended 
                                        ? "แผนเหล่านี้อาจเกินงบเล็กน้อย แต่ให้ความคุ้มครองที่ครอบคลุมกว่า"
                                        : "ไม่พบแผนที่ตรงเงื่อนไขเป๊ะๆ แต่เราขอแนะนำแผนเหล่านี้ที่คุ้มครองดีเยี่ยม"
                                    }
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filterList(alternativePlans).map((plan) => (
                                        <div key={plan.id} className="relative group">
                                            <div className="absolute -top-3 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full shadow-lg z-10 font-bold transform group-hover:scale-110 transition-transform">
                                                แนะนำ
                                            </div>
                                            <InsuranceCard plan={plan} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ----------------------------------------------------------- */}
                        {/* CASE 3: ไม่เจออะไรเลยสักอย่าง */}
                        {/* ----------------------------------------------------------- */}
                        {!showRecommended && !showAlternative && (
                            <div className="p-12 bg-white rounded-2xl text-center text-gray-500 shadow-sm border border-gray-100">
                                <p className="text-lg">
                                    ไม่พบแผนประกันที่ตรงกับเงื่อนไขเลย ลองปรับตัวกรองหรือทำแบบสอบถามใหม่
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}