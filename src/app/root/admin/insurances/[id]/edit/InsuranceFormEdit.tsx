'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import api from '@/services/api';
import { AxiosError } from 'axios';

// --- UI Components (Icons) ---
// ส่วนนี้เก็บไว้ได้เพราะเป็น SVG ภายใน Component เอง ไม่ได้ import จากข้างนอก
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

// --- Styles (Inline Tailwind CSS) ---
const CustomStyles = `
  html, body { margin: 0; height: 100%; background: #f0f6ff; font-family: 'Inter', sans-serif; }
  .form-container { padding: 2.5rem; background: white; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); margin-top: 2rem; margin-bottom: 3rem; border: 1px solid #e5e7eb; }
  .form-input, .form-select { width: 100%; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.75rem 1rem; transition: all 0.2s; background-color: #fff; }
  .form-input:focus, .form-select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
  .form-label { display: block; font-weight: 600; margin-bottom: 0.4rem; color: #374151; font-size: 0.9rem; }
  .section-header { font-size: 1.25rem; font-weight: 700; color: #1e3a8a; margin-top: 2rem; padding-bottom: 0.75rem; border-bottom: 2px solid #f3f4f6; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
  .checkbox-wrapper { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; transition: all 0.2s; cursor: pointer; }
  .checkbox-wrapper:hover { background-color: #f9fafb; border-color: #d1d5db; }
  .checkbox-wrapper input:checked + label { color: #2563eb; }
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
  img: string;
}

const LEVELS = ["ชั้น 1", "ชั้น 2+", "ชั้น 2", "ชั้น 3+", "ชั้น 3"];
const REPAIR_TYPES = ["ซ่อมอู่", "ซ่อมห้าง"];
const INSURANCE_BRANDS = ["วิริยะประกันภัย", "ธนชาตประกันภัย", "เมืองไทยประกันภัย", "อาคเนย์", "กรุงเทพประกันภัย", "คุ้มภัยโตเกียวมารีน"];
const CAR_BRANDS = ["Toyota", "Honda", "Mazda", "Mitsubishi", "Isuzu", "Nissan", "Ford", "MG"];

export default function InsuranceFormEdit() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string; // รับ ID จาก URL (Dynamic Route)

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Initial State
  const [formData, setFormData] = useState<InsuranceForm>({
    carBrand: "", carModel: "", subModel: "", year: new Date().getFullYear(),
    insuranceBrand: "", level: "ชั้น 1", repairType: "ซ่อมอู่",
    hasFireCoverage: false, hasFloodCoverage: false, hasTheftCoverage: false,
    personalAccidentCoverageOut: 0, personalAccidentCoverageIn: 0,
    propertyDamageCoverage: 0, perAccidentCoverage: 0,
    fireFloodCoverage: 0, firstLossCoverage: 0, premium: 0,
    img: "",
  });

  // 1. Fetch Data from Backend
  useEffect(() => {
    if (!id) return;

    const fetchInsuranceData = async () => {
      // console.log(id);
      // setFetching(false);
      
      try {
        // เรียก API: /car-insurance-rate/admin/insurance/:id
        const response = await api.get(`/api/admin/insurance/${id}`);
        
        if (response.data && response.data.success) {
          // นำข้อมูลที่ได้มาทับลงใน State
          setFormData(prev => ({
            ...prev,
            ...response.data.data
          }));
        } else {
          alert("ไม่พบข้อมูลประกันรายการนี้");
          router.push('/root/admin/insurances');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
        router.push('/root/admin/insurances');
      } finally {
        setFetching(false);
      }
    };

    fetchInsuranceData();
  }, [id, router]);

  // 2. Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // ตรวจสอบว่าเป็นฟิลด์ตัวเลขหรือไม่
    const isNumberField = [
      'year', 'premium', 'personalAccidentCoverageOut', 'personalAccidentCoverageIn', 
      'propertyDamageCoverage', 'perAccidentCoverage', 'fireFloodCoverage', 'firstLossCoverage'
    ].includes(name);
    
    setFormData(prev => ({
      ...prev,
      [name]: isNumberField ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // 3. Submit (Update Data)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.premium <= 0) {
      alert('กรุณาระบุเบี้ยประกันมากกว่า 0');
      return;
    }

    setLoading(true);
    try {
      // เรียก API PUT: /car-insurance-rate/admin/insurance/:id
      await api.put(`/api/admin/insurance/${id}`, formData);
      
      alert('บันทึกการแก้ไขสำเร็จ!');
      router.push('/root/admin/insurances'); // กลับไปหน้าตาราง
    } catch (error: unknown) {
      console.error("Update error:", error);
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

  // --- Render Helpers ---
  const renderPriceInput = (name: keyof InsuranceForm, label: string) => (
    <div>
      <label htmlFor={name} className="form-label text-gray-600">{label}</label>
      <div className="relative">
        <input
          type="number"
          id={name}
          name={name}
          min="0"
          value={formData[name] as number}
          onChange={handleInputChange}
          className="form-input text-right pr-12"
          placeholder="0"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">บาท</span>
      </div>
    </div>
  );

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-[#f0f6ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CustomStyles }} />

      <div className="font-sans flex flex-col min-h-screen text-gray-800">
        <main className="flex-grow p-4 md:p-8 w-full max-w-5xl mx-auto">
          
          <div className="mb-6">
             <Link href="/root/admin/insurances" className="text-gray-500 hover:text-blue-600 transition text-sm font-medium flex items-center gap-1">
               ← ย้อนกลับไปหน้าจัดการ
             </Link>
          </div>

          <div className="form-container">
            <h1 className="text-center text-3xl font-extrabold text-blue-900 mb-2">แก้ไขข้อมูลประกันภัย</h1>
            <p className="text-center text-gray-500 mb-10 text-sm">รหัสรายการ: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{id}</span></p>

            <form onSubmit={handleSubmit}>
              
              {/* --- 1. รายละเอียดรถยนต์ --- */}
              <h2 className="section-header">
                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2">1</span> 
                ข้อมูลรถยนต์และประกัน
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  <input type="text" name="carModel" value={formData.carModel} onChange={handleInputChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">รุ่นย่อย</label>
                  <input type="text" name="subModel" value={formData.subModel} onChange={handleInputChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">ปีรถ (ค.ศ.)</label>
                  <input type="number" name="year" value={formData.year} onChange={handleInputChange} className="form-input" required />
                </div>
              </div>

              {/* --- 2. ความคุ้มครองหลัก --- */}
              <h2 className="section-header">
                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                ความคุ้มครองหลัก
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="checkbox-wrapper">
                  <label htmlFor="hasFireCoverage" className="font-medium">คุ้มครองไฟไหม้</label>
                  <input type="checkbox" id="hasFireCoverage" name="hasFireCoverage" checked={formData.hasFireCoverage} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </div>
                <div className="checkbox-wrapper">
                  <label htmlFor="hasFloodCoverage" className="font-medium">คุ้มครองน้ำท่วม</label>
                  <input type="checkbox" id="hasFloodCoverage" name="hasFloodCoverage" checked={formData.hasFloodCoverage} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </div>
                <div className="checkbox-wrapper">
                  <label htmlFor="hasTheftCoverage" className="font-medium">คุ้มครองโจรกรรม</label>
                  <input type="checkbox" id="hasTheftCoverage" name="hasTheftCoverage" checked={formData.hasTheftCoverage} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                </div>
              </div>

              {/* --- 3. วงเงินความคุ้มครอง --- */}
              <h2 className="section-header">
                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                วงเงินความคุ้มครอง
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="md:col-span-2">
                   <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3">ความคุ้มครองผู้ประสบภัย (PA)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderPriceInput('personalAccidentCoverageOut', 'PA บุคคลภายนอก')}
                      {renderPriceInput('personalAccidentCoverageIn', 'PA บุคคลภายใน')}
                   </div>
                </div>
                
                <div className="md:col-span-2 border-t border-gray-200 my-2"></div>

                {renderPriceInput('perAccidentCoverage', 'ความคุ้มครองต่ออุบัติเหตุ')}
                {renderPriceInput('propertyDamageCoverage', 'ทรัพย์สินบุคคลภายนอก')}
                {renderPriceInput('fireFloodCoverage', 'ทุนประกันอัคคีภัย/น้ำท่วม')}
                {renderPriceInput('firstLossCoverage', 'ค่าเสียหายส่วนแรก (Excess)')}
              </div>

              {/* --- 4. ราคา (Highlight) --- */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                   <div className="bg-blue-600 text-white p-3 rounded-lg shadow-sm">
                      <span className="text-2xl font-bold">฿</span>
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-blue-900">เบี้ยประกันสุทธิ</h3>
                      <p className="text-sm text-blue-600">ราคารวมภาษีและอากรแสตมป์แล้ว</p>
                   </div>
                </div>
                <div className="w-full md:w-auto flex-grow max-w-xs">
                   <input
                      type="number"
                      name="premium"
                      value={formData.premium}
                      onChange={handleInputChange}
                      className="w-full text-3xl font-bold text-right text-red-600 bg-white border border-blue-200 rounded-lg p-3 focus:ring-4 focus:ring-blue-100 outline-none transition"
                      placeholder="0.00"
                      required
                    />
                </div>
              </div>

              {/* --- Buttons --- */}
              <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-100">
                <Link href="/root/admin/insurances" className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
                  ยกเลิก
                </Link>
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`px-8 py-3 rounded-lg bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </>
  );
}