"use client";

import React, { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DriveEta, CalendarToday, Build, CheckCircle } from "@mui/icons-material";
import api from "@/services/api";

/* ===================== Types ===================== */

interface CarDataDoc {
  brand: string;
  models: {
    name: string;
    variants: string[];
  }[];
}

interface SearchCriteria {
  year: string;
  brand: string;
  model: string;
  variant: string;
  level: string;
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

  /* ===================== Load Brands ===================== */

  useEffect(() => {
    api
      .get<string[]>("/api/car-data/brands")
      .then((res) => setBrands(res.data))
      .catch(console.error);
  }, []);

  /* ===================== Load Models ===================== */

  useEffect(() => {
    if (!brand) return;

    setModel("");
    setVariant("");
    setModels([]);
    setVariants([]);

    api
      .get<string[]>("/api/car-data/models", {
        params: { brand },
      })
      .then((res) => setModels(res.data))
      .catch(console.error);
  }, [brand]);

  /* ===================== Load Variants ===================== */

  useEffect(() => {
    if (!brand || !model) return;

    setVariant("");
    setVariants([]);

    api
      .get<string[]>("/api/car-data/variants", {
        params: { brand, model },
      })
      .then((res) => setVariants(res.data))
      .catch(console.error);
  }, [brand, model]);

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

    // ✅ เก็บข้อมูลรถไว้ใช้หน้าถัดไป
    localStorage.setItem(
      "searchCriteria",
      JSON.stringify({
        year,
        carBrand: brand,
        model,
        subModel: variant,
        insuranceType
      })
    );

    localStorage.setItem(
      "recommendedPlans",
      JSON.stringify(res.data)
    );

    router.push("/customer/car-insurance/insurance");
  } catch (err) {
    console.error(err);
    localStorage.setItem("recommendedPlans", JSON.stringify([]));
    router.push("/customer/car-insurance/insurance");
  } finally {
    setLoading(false);
  }
};

  

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-[2.5rem] shadow-[0_10px_50px_rgba(0,0,0,0.08)] p-8 md:p-14 relative border border-gray-50">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
              เช็คเบี้ย เปรียบเทียบ ประกันรถยนต์
            </h1>
            <p className="text-gray-400 text-lg">
              กรอกข้อมูล 4 ขั้นตอนเพื่อค้นหาแผนประกันที่เหมาะกับคุณ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* ประเภทประกัน */}
            <div>
              <label className="font-bold text-blue-600 flex items-center mb-5 text-lg">
                <CheckCircle className="mr-2" fontSize="small" />
                เลือกความคุ้มครองหลัก *
              </label>

              <div className="flex flex-wrap gap-3">
                {["ชั้น 1", "ชั้น 2+", "ชั้น 2", "ชั้น 3+", "ชั้น 3", "ไม่ระบุ"].map(
                  (t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setInsuranceType(t)}
                      className={`px-7 py-2.5 rounded-full border-2 font-semibold text-sm transition-all ${
                        insuranceType === t
                          ? "bg-blue-600 text-white border-blue-600"
                          : "text-blue-500 border-blue-100 hover:border-blue-300"
                      }`}
                    >
                      {t}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Selects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Year */}
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input"
              >
                <option value="">เลือกปี</option>
                {yearOptions.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>

              {/* Brand */}
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                disabled={!year}
                className="input"
              >
                <option value="">เลือกยี่ห้อ</option>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>

              {/* Model */}
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!brand}
                className="input"
              >
                <option value="">เลือกรุ่น</option>
                {models.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>

              {/* Variant */}
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                disabled={!model}
                className="input"
              >
                <option value="">เลือกรุ่นย่อย</option>
                {variants.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl text-lg hover:bg-blue-700 transition"
            >
              {loading ? "กำลังค้นหา..." : "ค้นหาแผนประกัน"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
