// src/components/ResultPageLayout.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  KeyboardArrowDown,
  CheckCircle,
  FilterList,
  Search,
} from "@mui/icons-material";
import MenuLogined from "@/components/element/MenuLogined";
import InsuranceCard from "@/app/customer/car-insurance/insurance/InsuranceCard";

interface InsurancePlan {
  id: number;
  company: string;
  logoSrc: string;
  level: string;
  repairType: "อู่" | "ห้าง";
  features: string[];
  premium: number;
  coverageAmount: number;
  installment: string;
}

const mockPlans: InsurancePlan[] = [
  {
    id: 1,
    company: "วิริยะประกันภัย",
    logoSrc: "/fotos/Insur5.png",
    level: "ชั้น 1",
    repairType: "อู่",
    features: ["น้ำท่วม", "ไฟไหม้", "สุขภาพ"],
    premium: 19500,
    coverageAmount: 500500,
    installment: "ผ่อน 0% 10 เดือน",
  },
  {
    id: 2,
    company: "กรุงเทพประกันภัย",
    logoSrc: "/fotos/Insur4.png",
    level: "ชั้น 1",
    repairType: "ห้าง",
    features: ["น้ำท่วม", "ไฟไหม้", "สุขภาพ"],
    premium: 22000,
    coverageAmount: 550000,
    installment: "ผ่อน 0% 10 เดือน",
  },
  {
    id: 3,
    company: "เมืองไทยประกันภัย",
    logoSrc: "/fotos/Insur4.png",
    level: "ชั้น 2+",
    repairType: "อู่",
    features: ["ไฟไหม้", "สูญหาย"],
    premium: 10500,
    coverageAmount: 300000,
    installment: "จ่ายรายปี",
  },
];

export default function InsuranceResultsPage() {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    level: "",
    repair: "",
    price: "",
    sort: "default",
    search: "",
    companies: new Set<string>(),
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (window.innerWidth < 768) {
      setOpenDropdown(null);
    }
  };

  const handleSortClick = (sortType: string) => {
    setFilters((prev) => ({ ...prev, sort: sortType }));
    setOpenDropdown(null);
  };

  const FilterDropdown = ({
    title,
    name,
    options,
  }: {
    title: string;
    name: keyof typeof filters;
    options: { label: string; value: string }[];
  }) => {
    const isActive = openDropdown === name;
    const currentLabel =
      options.find((opt) => opt.value === filters[name])?.label || title;

    return (
      <div className="relative">
        <button
          className={`filter-btn rounded-full px-4 py-2 text-sm font-medium transition flex items-center space-x-1 whitespace-nowrap 
            ${isActive || filters[name] ? "bg-blue-600 text-white shadow-md" : "bg-white text-blue-700 border border-blue-600 hover:bg-blue-50"}
          `}
          onClick={() => setOpenDropdown(isActive ? null : name)}
        >
          <span>{currentLabel}</span>
          <KeyboardArrowDown
            className={`w-5 h-5 ml-1 transition-transform duration-300 ${
              isActive ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        <div
          className={`absolute top-full mt-2 left-0 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg transition-transform transform origin-top ${
            isActive
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0 pointer-events-none"
          }`}
        >
          {options.map((option) => (
            <label
              key={option.value}
              onClick={() => handleFilterChange(name, option.value)}
              className="w-full flex justify-between items-center px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
            >
              <span>{option.label}</span>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={filters[name] === option.value}
                onChange={() => {}}
                className="accent-blue-600"
              />
            </label>
          ))}
        </div>
      </div>
    );
  };

  const levelOptions = [
    { label: "ชั้น 1", value: "ชั้น 1" },
    { label: "ชั้น 2+", value: "ชั้น 2+" },
    { label: "ชั้น 2", value: "ชั้น 2" },
    { label: "ชั้น 3+", value: "ชั้น 3+" },
    { label: "ชั้น 3", value: "ชั้น 3" },
  ];
  const repairOptions = [
    { label: "ซ่อมอู่", value: "อู่" },
    { label: "ซ่อมห้าง/ศูนย์", value: "ห้าง" },
  ];
  const priceOptions = [
    { label: "น้อยกว่า 10,000 บาท", value: "low" },
    { label: "10,000 - 20,000 บาท", value: "mid" },
    { label: "มากกว่า 20,000 บาท", value: "high" },
  ];
  const sortOptions = [
    { label: "ราคาเบี้ย น้อย→มาก", value: "premium_asc" },
    { label: "ราคาเบี้ย มาก→น้อย", value: "premium_desc" },
    { label: "ทุนประกัน น้อย→มาก", value: "coverage_asc" },
    { label: "ทุนประกัน มาก→น้อย", value: "coverage_desc" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#cfe2ff]">
      {/* Menu */}
      <MenuLogined activePage="/customer/car-insurance/insurance" />

      <main className="flex-grow max-w-7xl mx-auto py-10 px-4 w-full">
        <h1 className="text-3xl font-extrabold text-blue-900 text-center mb-10 tracking-wide">
          แผนประกันที่เหมาะกับคุณ 🥇
        </h1>

        {/* Desktop Filters */}
        <div className="hidden md:flex flex-wrap justify-center gap-3 mb-6">
          <FilterDropdown
            title="ประเภทประกัน"
            name="level"
            options={levelOptions}
          />
          <FilterDropdown
            title="ประเภทการซ่อม"
            name="repair"
            options={repairOptions}
          />
          <FilterDropdown
            title="ค่าเบี้ยประกัน"
            name="price"
            options={priceOptions}
          />
          <div className="relative">
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                openDropdown === "sort"
                  ? "bg-blue-700 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() =>
                setOpenDropdown(openDropdown === "sort" ? null : "sort")
              }
            >
              <FilterList className="w-5 h-5" />
              <span>เรียงตาม</span>
              <KeyboardArrowDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  openDropdown === "sort" ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            <div
              className={`absolute top-full mt-2 left-0 z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg transition-transform transform origin-top ${
                openDropdown === "sort"
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0 pointer-events-none"
              }`}
            >
              {sortOptions.map((opt) => (
                <label
                  key={opt.value}
                  onClick={() => handleSortClick(opt.value)}
                  className="w-full flex justify-between items-center px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                >
                  <span>{opt.label}</span>
                  <input
                    type="radio"
                    name="sort"
                    value={opt.value}
                    checked={filters.sort === opt.value}
                    onChange={() => {}}
                    className="accent-blue-600"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6">
          <button
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-blue-600 transition"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <FilterList className="w-5 h-5" />
            <span>
              {isMobileSidebarOpen ? "ซ่อนตัวกรอง" : "เปิดตัวกรองและเรียงลำดับ"}
            </span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside
            className={`bg-white rounded-2xl shadow-xl p-6 w-full md:w-1/4 flex-shrink-0 transition-all duration-300 ${
              isMobileSidebarOpen ? "block" : "hidden md:block"
            }`}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
              กรองตามบริษัท
            </h2>

            {/* Search */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาบริษัทประกัน..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>

            {/* Company Filter */}
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {[
                "วิริยะประกันภัย",
                "เมืองไทยประกันภัย",
                "กรุงเทพประกันภัย",
                "ธนชาตประกันภัย",
                "มิตรแท้ประกันภัย",
                "ทิพยประกันภัย",
                "ไทยศรีประกันภัย",
              ].map((company) => (
                <li key={company}>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox accent-blue-600"
                    />
                    <span>{company}</span>
                  </label>
                </li>
              ))}
            </ul>

            {/* Mobile Filter Options */}
            <div className="md:hidden mt-6 pt-4 border-t border-gray-200 space-y-4">
              <FilterDropdown
                title="ประเภทประกัน"
                name="level"
                options={levelOptions}
              />
              <FilterDropdown
                title="ประเภทการซ่อม"
                name="repair"
                options={repairOptions}
              />
              <FilterDropdown
                title="ค่าเบี้ยประกัน"
                name="price"
                options={priceOptions}
              />
              <FilterDropdown
                title="เรียงตาม"
                name="sort"
                options={sortOptions}
              />
            </div>
          </aside>

          {/* Cards */}
          <section className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPlans.map((plan) => (
              <InsuranceCard key={plan.id} plan={plan} />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
