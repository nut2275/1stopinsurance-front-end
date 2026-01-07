"use client";

import React, { useEffect, useMemo, useState, FormEvent, ChangeEvent, ElementType } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, 
  DirectionsCar, 
  CalendarToday, 
  Style, 
  Category, 
  KeyboardArrowDown 
} from "@mui/icons-material";
import api from "@/services/api";

// Interface สำหรับ Query Params ของ API
interface CarQueryParams {
  brand?: string;
  model?: string;
  year?: string;
}

// Interface สำหรับ Props ของ Component SelectField
interface SelectFieldProps {
  label: string;
  icon: ElementType; // ✅ เปลี่ยนจาก any เป็น ElementType
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void; // ✅ ระบุ Event Type ชัดเจน
  disabled: boolean;
  options: string[];
  placeholder: string;
}

export default function CarInsuranceForm() {
  const router = useRouter();

  /* ===================== State ===================== */
  const [insuranceType, setInsuranceType] = useState<string>("ชั้น 1");
  const [year, setYear] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [variant, setVariant] = useState<string>("");

  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [variants, setVariants] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  /* ===================== Year Options ===================== */
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: currentYear - 2004 },
      (_, i) => (currentYear - i).toString()
    );
  }, []);

  /* ===================== Effects ===================== */
  // 1. Load Brands
  useEffect(() => {
    setBrand("");
    setModel("");
    setVariant("");
    setModels([]);
    setVariants([]);

    const params = year ? { year } : {};
    api
      .get<string[]>("/car-master/brands", { params })
      .then((res) => setBrands(res.data))
      .catch((err) => console.error("Failed to load brands:", err));
  }, [year]);

  // 2. Load Models
  useEffect(() => {
    if (!brand) return;
    setModel("");
    setVariant("");
    setVariants([]);

    const params: CarQueryParams = { brand };
    if (year) params.year = year;

    api
      .get<string[]>("/car-master/models", { params })
      .then((res) => setModels(res.data))
      .catch((err) => console.error("Failed to load models:", err));
  }, [brand, year]);

  // 3. Load Variants
  useEffect(() => {
    if (!brand || !model) return;
    setVariant("");

    const params: CarQueryParams = { brand, model };
    if (year) params.year = year;

    api
      .get<string[]>("/car-master/sub-models", { params })
      .then((res) => setVariants(res.data))
      .catch((err) => console.error("Failed to load variants:", err));
  }, [brand, model, year]);

  /* ===================== Submit ===================== */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!year || !brand || !model || !variant) {
      alert("กรุณาเลือกข้อมูลรถให้ครบถ้วน");
      return;
    }

    setLoading(true);

    const params: Record<string, string> = {
      year,
      brand,
      model,
      variant,
    };

    if (insuranceType !== "ไม่ระบุ") {
      params.level = insuranceType;
    }

    try {
      const res = await api.get("/api/plans", { params });

      localStorage.setItem(
        "searchCriteria",
        JSON.stringify({
          year,
          carBrand: brand,
          model,
          subModel: variant,
          insuranceType,
        })
      );

      localStorage.setItem("recommendedPlans", JSON.stringify(res.data));
      router.push("/customer/car-insurance/insurance");
    } catch (err) {
      console.error(err);
      localStorage.setItem("recommendedPlans", JSON.stringify([]));
      router.push("/customer/car-insurance/insurance");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI Component Helper ===================== */
  // ✅ ใช้ Interface SelectFieldProps ที่นิยามไว้ด้านบน
  const SelectField = ({
    label,
    icon: Icon, // Rename prop to PascalCase for JSX rendering
    value,
    onChange,
    disabled,
    options,
    placeholder,
  }: SelectFieldProps) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-600 ml-1">{label}</label>
      <div className={`relative group ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
          <Icon fontSize="small" />
        </div>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-base rounded-xl py-3 pl-10 pr-10 appearance-none outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer disabled:cursor-not-allowed hover:bg-white"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <KeyboardArrowDown fontSize="small" />
        </div>
      </div>
    </div>
  );

  /* ===================== Main Render ===================== */
  return (
    <div className="min-h-screen bg-gradient-to-br   py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Card Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Decorative Top Bar */}
          <div className="h-2 w-full bg-gradient-to-r bg-blue-600 " />

          <div className="p-8 md:p-12 lg:p-14">
            
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                เช็คเบี้ยประกันรถยนต์ <span className="text-blue-600">ออนไลน์</span>
              </h1>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                เปรียบเทียบแผนประกันภัยที่คุ้มค่าที่สุดสำหรับคุณ ง่าย ครบ จบในที่เดียว
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* 1. Insurance Type Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                  <h3 className="text-lg font-bold text-gray-800">เลือกประเภทความคุ้มครอง</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {["ชั้น 1", "ชั้น 2+", "ชั้น 2", "ชั้น 3+", "ชั้น 3", "ไม่ระบุ"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInsuranceType(type)}
                      className={`relative overflow-hidden group py-3 px-2 rounded-xl border-2 transition-all duration-200 ease-in-out flex flex-col items-center justify-center gap-1 ${
                        insuranceType === type
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:bg-gray-50"
                      }`}
                    >
                      {insuranceType === type && (
                        <div className="absolute top-1 right-1 text-blue-600">
                          <CheckCircle style={{ fontSize: 16 }} />
                        </div>
                      )}
                      <span className="font-bold text-sm md:text-base">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 my-8" />

              {/* 2. Car Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">2</div>
                  <h3 className="text-lg font-bold text-gray-800">ระบุข้อมูลรถยนต์</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="ปีรถยนต์ (Year)"
                    icon={CalendarToday}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    disabled={false}
                    options={yearOptions}
                    placeholder="เลือกปีผลิต"
                  />

                  <SelectField
                    label="ยี่ห้อ (Brand)"
                    icon={DirectionsCar}
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    disabled={!year}
                    options={brands}
                    placeholder="เลือกยี่ห้อรถ"
                  />

                  <SelectField
                    label="รุ่น (Model)"
                    icon={Style}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={!brand}
                    options={models}
                    placeholder="เลือกรุ่นรถ"
                  />

                  <SelectField
                    label="รุ่นย่อย (Variant)"
                    icon={Category}
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    disabled={!model}
                    options={variants}
                    placeholder="เลือกรุ่นย่อย"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังค้นหาข้อมูล...
                    </>
                  ) : (
                    "ค้นหาแผนประกันที่ดีที่สุด"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}