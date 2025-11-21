// app/agent-customer-form/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

// กำหนด Type สำหรับ State ของ Form
interface CustomerFormData {
  name: string;
  type: string;
  company: string;
  policy: string;
  status: string;
}

// ตัวเลือกสำหรับ Dropdown
const insuranceTypes = ["รถยนต์ ชั้น 1", "สุขภาพ", "ชีวิต"];
const insuranceCompanies = ["วิริยะ", "ธนชาต", "เมืองไทย"];
const policyStatuses = ["คุ้มครอง", "หมดอายุ", "กำลังดำเนินการ"];

export default function Insarance_insertPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ตรวจสอบ Action: "add" หรือ "edit"
  const action = searchParams.get('action');
  const isEditing = action === 'edit';
  const formTitle = isEditing ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่';

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    type: insuranceTypes[0],
    company: insuranceCompanies[0],
    policy: '',
    status: policyStatuses[0],
  });

  // Effect สำหรับดึงข้อมูลจาก URL เมื่อเป็นการ "แก้ไข"
  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: searchParams.get('name') || '',
        type: searchParams.get('type') || insuranceTypes[0],
        company: searchParams.get('company') || insuranceCompanies[0],
        policy: searchParams.get('policy') || '',
        status: searchParams.get('status') || policyStatuses[0],
      });
    }
  }, [isEditing, searchParams]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // โค้ดสำหรับส่งข้อมูลไปยัง API (ในแอปจริง)
    const apiUrl = isEditing ? `/api/customers/edit` : `/api/customers/add`;
    const message = isEditing ? 'แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว!' : 'เพิ่มข้อมูลลูกค้าใหม่เรียบร้อยแล้ว!';

    console.log(`Action: ${isEditing ? 'EDIT' : 'ADD'}`, formData);
    // await fetch(apiUrl, { method: 'POST', body: JSON.stringify(formData) }); // ตัวอย่างการเรียก API

    alert(message);
    
    // เปลี่ยนกลับไปหน้าจัดการลูกค้า
    router.push('/agent-manage-customer');
  };

  return (
    <>
      
      <main className="flex-grow max-w-3xl mx-auto w-full bg-white shadow rounded-xl mt-10 mb-10 p-4 md:p-8">
        <h1 id="formTitle" className="text-2xl font-bold text-blue-900 text-center mb-6">
            {formTitle}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ชื่อ - นามสกุล */}
          <div>
            <label htmlFor="name" className="block font-semibold mb-1">ชื่อ - นามสกุล</label>
            <input 
              type="text" 
              id="name" 
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* ประเภทประกัน */}
          <div>
            <label htmlFor="type" className="block font-semibold mb-1">ประเภทประกัน</label>
            <select 
              id="type" 
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {insuranceTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          
          {/* บริษัทประกัน */}
          <div>
            <label htmlFor="company" className="block font-semibold mb-1">บริษัทประกัน</label>
            <select 
              id="company" 
              value={formData.company}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {insuranceCompanies.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          
          {/* เลขกรมธรรม์ */}
          <div>
            <label htmlFor="policy" className="block font-semibold mb-1">เลขกรมธรรม์</label>
            <input 
              type="text" 
              id="policy" 
              value={formData.policy}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* สถานะ */}
          <div>
            <label htmlFor="status" className="block font-semibold mb-1">สถานะ</label>
            <select 
              id="status" 
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {policyStatuses.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* ปุ่มควบคุม */}
          <div className="text-center pt-2">
            <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition shadow-md">
              บันทึก
            </button>
            <Link href="/agent-manage-customer" className="ml-4 text-red-600 hover:underline px-4 py-2">
              ยกเลิก
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}