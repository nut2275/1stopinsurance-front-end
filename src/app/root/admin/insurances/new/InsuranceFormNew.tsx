'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { AxiosError } from 'axios';

// --- Styles (Inline Tailwind CSS for Standard UI) ---
const CustomStyles = `
  html, body { margin: 0; height: 100%; background: #f0f6ff; font-family: 'Inter', sans-serif; }
  .navbar { background: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 1rem 2.5rem; display: flex; justify-content: space-between; align-items: center; }
  .admin-badge { border: 1px solid #1d4ed8; padding: 0.25rem 1rem; border-radius: 9999px; color: #1d4ed8; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
  .form-container { padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); margin-top: 2.5rem; margin-bottom: 2.5rem; }
  .form-input, .form-select, .form-textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.75rem 1rem; transition: all 0.2s; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3); }
  .form-label { display: block; font-weight: 500; margin-bottom: 0.3rem; color: #374151; }
  .section-header { font-size: 1.25rem; font-weight: 600; color: #1e3a8a; margin-top: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 1rem; }
`;

// --- Interfaces & Constants ---
interface InsuranceForm {
  carBrand: string;
  carModel: string;
  subModel: string;
  year: number;
  insuranceBrand: string;
  level: string;
  repairType: string;
  hasFireCoverage: boolean;
  hasFloodCoverage: boolean;
  hasTheftCoverage: boolean;
  personalAccidentCoverageOut: number;
  personalAccidentCoverageIn: number;
  propertyDamageCoverage: number;
  perAccidentCoverage: number;
  fireFloodCoverage: number;
  firstLossCoverage: number;
  premium: number;
  // status: string; // Keep status in state but won't show in UI
}

const LEVELS = ["ชั้น 1", "ชั้น 2+", "ชั้น 2", "ชั้น 3+", "ชั้น 3"];
const REPAIR_TYPES = ["อู่", "ห้าง", "อู่ หรือ ห้าง"];
const INSURANCE_BRANDS = ["วิริยะประกันภัย", "ธนชาตประกันภัย", "เมืองไทยประกันภัย", "อาคเนย์", "กรุงเทพประกันภัย", "คุ้มภัยโตเกียวมารีน"];
const CAR_BRANDS = ["Toyota", "Honda", "Mazda", "Mitsubishi", "Isuzu", "Nissan", "Ford", "MG"];

// --- Main Component ---
export default function InsuranceFormNew() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Initial State
  const [formData, setFormData] = useState<InsuranceForm>({
    carBrand: "",
    carModel: "",
    subModel: "",
    year: new Date().getFullYear(),
    insuranceBrand: "",
    level: "ชั้น 1",
    repairType: "อู่",
    hasFireCoverage: false,
    hasFloodCoverage: false,
    hasTheftCoverage: false,
    personalAccidentCoverageOut: 0,
    personalAccidentCoverageIn: 0,
    propertyDamageCoverage: 0,
    perAccidentCoverage: 0,
    fireFloodCoverage: 0,
    firstLossCoverage: 0,
    premium: 0,
    // status: "ใช้งาน", // Default status
  });

  // 1. Fetch Data for Edit Mode
  useEffect(() => {
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (action === "edit" && id) {
      setIsEditMode(true);
      setEditId(id);
      // fetchInsuranceData(id);
    }
  }, [searchParams]);


  // 2. Handle Inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Convert numbers automatically
    const isNumberField = ['year', 'premium', 'personalAccidentCoverageOut', 'personalAccidentCoverageIn', 'propertyDamageCoverage', 'perAccidentCoverage', 'fireFloodCoverage', 'firstLossCoverage'].includes(name) || e.target.type === 'number';
    
    setFormData(prev => ({
      ...prev,
      [name]: isNumberField ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  // 3. Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.premium <= 0) {
      alert('กรุณาระบุเบี้ยประกันมากกว่า 0');
      return;
    }

    setLoading(true);
    console.log("formData = \n" + formData);
    
    try {
      await api.post('/api/insurance', formData);
      alert('บันทึกข้อมูลสำเร็จ!');
      
      router.push('/root/admin/insurances');
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
        alert(`เกิดข้อผิดพลาด: ${message}`);
      } else {
        alert('เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
      }
    } finally {
      setLoading(false);
    }
  };

  const formTitle = "เพิ่มอัตราเบี้ยประกันใหม่";
  const submitButtonText = loading ? "กำลังบันทึก..." :  "บันทึกข้อมูล";

  // --- Render Helpers ---
  const renderPriceInput = (name: keyof InsuranceForm, label: string) => (
    <div>
      <label htmlFor={name} className="form-label text-sm">{label}</label>
      <input
        type="number"
        id={name}
        name={name}
        min="0"
        value={formData[name] as number}
        onChange={handleInputChange}
        className="form-input text-right"
        placeholder="ระบุจำนวนเงินเป็นบาท"
      />
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CustomStyles }} />

      <div className="font-sans flex flex-col min-h-screen text-gray-800">

        <main className="flex-grow p-6 w-full max-w-6xl mx-auto">
          <div className="max-w-4xl mx-auto form-container">
            <h1 className="text-center text-3xl font-bold text-blue-900 mb-8">{formTitle}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- Section 1: รายละเอียดสินค้า --- */}
              <h2 className="section-header">1. รายละเอียดสินค้า</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">บริษัทประกัน</label>
                  <select name="insuranceBrand" value={formData.insuranceBrand} onChange={handleInputChange} className="form-select" required>
                    <option value="">-- เลือกบริษัท --</option>
                    {INSURANCE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">ชั้นประกัน</label>
                  <select name="level" value={formData.level} onChange={handleInputChange} className="form-select">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">ประเภทการซ่อม</label>
                  <select name="repairType" value={formData.repairType} onChange={handleInputChange} className="form-select">
                    {REPAIR_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">ยี่ห้อรถ</label>
                  <select name="carBrand" value={formData.carBrand} onChange={handleInputChange} className="form-select">
                    <option value="">-- เลือกยี่ห้อ --</option>
                    {CAR_BRANDS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">รุ่นรถ</label>
                  <input type="text" name="carModel" value={formData.carModel} onChange={handleInputChange} placeholder="เช่น Civic" className="form-input" required />
                </div>

                <div>
                  <label className="form-label">รุ่นย่อย</label>
                  <input type="text" name="subModel" value={formData.subModel} onChange={handleInputChange} placeholder="เช่น EL" className="form-input" required />
                </div>

                <div>
                  <label className="form-label">ปีรถ (ค.ศ.)</label>
                  <input type="number" name="year" value={formData.year} onChange={handleInputChange} min={1990} max={new Date().getFullYear() + 1} className="form-input" required />
                </div>
              </div>

              {/* --- Section 2: ความคุ้มครอง --- */}
              <h2 className="section-header">2. รายละเอียดความคุ้มครอง</h2>
              
              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 transition hover:bg-white">
                  <label htmlFor="hasFireCoverage" className="form-label mb-0 cursor-pointer">ศูนย์หาย ไฟไหม้</label>
                  <input type="checkbox" id="hasFireCoverage" name="hasFireCoverage" checked={formData.hasFireCoverage} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 transition hover:bg-white">
                  <label htmlFor="hasFloodCoverage" className="form-label mb-0 cursor-pointer">รถชนรถ</label>
                  <input type="checkbox" id="hasFloodCoverage" name="hasFloodCoverage" checked={formData.hasFloodCoverage} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 transition hover:bg-white">
                  <label htmlFor="hasTheftCoverage" className="form-label mb-0 cursor-pointer">คุ้มครองเฉพาะคู่กรณี</label>
                  <input type="checkbox" id="hasTheftCoverage" name="hasTheftCoverage" checked={formData.hasTheftCoverage} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </div>
              </div>

              {/* Numeric Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Accident Group */}
                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-blue-800 font-semibold mb-3 border-b border-blue-200 pb-2">ความคุ้มครองผู้ประสบภัย (Personal Accident)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderPriceInput('personalAccidentCoverageOut', 'PA คุ้มครองบุคคลภายนอก (บาท)')}
                    {renderPriceInput('personalAccidentCoverageIn', 'คุ้มครองบุคคลภายใน (บาท)')}
                  </div>
                </div>

                {/* Other Coverages */}
                {renderPriceInput('propertyDamageCoverage', 'คุ้มครองทรัพสินทร์บุคคลภายนอก (บาท)')}
                {renderPriceInput('perAccidentCoverage', 'คุ้มครองรถยนต์ต่อครั้ง (บาท)')}
                {renderPriceInput('fireFloodCoverage', 'คุ้มครองรถยนต์สูญหาย ไฟไหม้ (บาท)')}
                {renderPriceInput('firstLossCoverage', 'คุ้มครองรถยนต์ค่าเสียหายส่วนแรก (Excess) (บาท)')}
              </div>

              {/* --- Section 3: ราคา --- */}
              <h2 className="section-header">3. ราคา</h2>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <label className="form-label text-xl font-bold text-gray-800 mb-2">เบี้ยประกันสุทธิ (บาท)</label>
                <input
                  type="number"
                  name="premium"
                  value={formData.premium}
                  onChange={handleInputChange}
                  className="form-input text-3xl font-bold text-red-600 border-red-300 focus:border-red-500 focus:ring-red-200 text-right py-4 h-16"
                  placeholder="0"
                  required
                />
                <p className="text-gray-500 text-sm mt-2 text-right">* ราคาสุทธิ</p>
              </div>

              {/* --- Action Buttons --- */}
              <div className="flex justify-between items-center pt-6 border-t mt-8">
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`bg-blue-700 text-white px-10 py-3 rounded-lg font-bold text-lg transition shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800 hover:-translate-y-0.5'}`}
                >
                  {submitButtonText}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </>
  );
}