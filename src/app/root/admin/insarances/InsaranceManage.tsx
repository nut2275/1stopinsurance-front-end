'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

// --- MUI ICONS ---
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

// --- Styles (Inline Tailwind CSS) ---
const CustomStyles = `
  html, body {
    margin: 0;
    height: 100%;
    overflow-y: auto;
    background: #f0f6ff;
    font-family: 'Inter', sans-serif;
  }
  .tab-active {
    background: #1d4ed8;
    color: white;
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    font-weight: 600;
  }
  .tab-inactive:hover {
    color: #2563eb;
  }
  .badge {
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .table-cell {
    padding: 0.75rem 1rem;
    vertical-align: middle;
    border-top: 1px solid #e5e7eb;
    white-space: nowrap;
  }
  .table-row:hover {
    background-color: #f7fbff;
  }
`;

// --- Types ---
type PolicyStatus = 'ใช้งาน' | 'หมดอายุ' | 'รออนุมัติ';

interface CarInsuranceRate {
  id: number;
  carBrand: string;
  carModel: string;
  subModel: string;
  year: number;
  insuranceBrand: string;
  level: string;
  repairType: string;
  premium: number;
  status: PolicyStatus;
}

// --- Style Mapping ---
const getStatusStyles = (status: PolicyStatus) => {
  switch (status) {
    case 'ใช้งาน':
      return 'bg-green-600 shadow-lg shadow-green-300/50';
    case 'หมดอายุ':
      return 'bg-yellow-500 shadow-lg shadow-yellow-300/50';
    case 'รออนุมัติ':
      return 'bg-blue-600 shadow-lg shadow-blue-300/50';
    default:
      return 'bg-gray-500';
  }
};

// --- Mock Data ---
const MOCK_DATA: CarInsuranceRate[] = [
  { id: 1, carBrand: "Toyota", carModel: "Corolla", subModel: "Altis", year: 2022, insuranceBrand: "วิริยะประกันภัย", level: "ชั้น 1", repairType: "ซ่อมห้าง", premium: 19500, status: "ใช้งาน" },
  { id: 2, carBrand: "Honda", carModel: "Civic", subModel: "EL", year: 2020, insuranceBrand: "ธนชาตประกันภัย", level: "ชั้น 2+", repairType: "ซ่อมอู่", premium: 14500, status: "ใช้งาน" },
  { id: 3, carBrand: "Mazda", carModel: "2", subModel: "Sedan", year: 2018, insuranceBrand: "เมืองไทยประกันภัย", level: "ชั้น 3", repairType: "ซ่อมอู่", premium: 8900, status: "หมดอายุ" },
  { id: 4, carBrand: "Mitsubishi", carModel: "Pajero Sport", subModel: "GT", year: 2023, insuranceBrand: "อาคเนย์", level: "ชั้น 1", repairType: "ซ่อมห้าง", premium: 25000, status: "รออนุมัติ" },
  { id: 5, carBrand: "Isuzu", carModel: "D-Max", subModel: "Cab", year: 2021, insuranceBrand: "กรุงเทพประกันภัย", level: "ชั้น 2", repairType: "ซ่อมอู่", premium: 12000, status: "ใช้งาน" },
];

// --- Main Component ---
export default function InsuranceManage() {
  const [insuranceRates, setInsuranceRates] = useState<CarInsuranceRate[]>(MOCK_DATA);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Search Filter ---
  const filteredRates = useMemo(() => {
    if (!searchTerm) return insuranceRates;
    const keyword = searchTerm.toLowerCase();

    return insuranceRates.filter(rate =>
      rate.insuranceBrand.toLowerCase().includes(keyword) ||
      rate.carBrand.toLowerCase().includes(keyword) ||
      rate.carModel.toLowerCase().includes(keyword) ||
      rate.level.toLowerCase().includes(keyword)
    );
  }, [insuranceRates, searchTerm]);

  // --- CRUD (Mock) ---
  const handleDelete = (id: number) => {
    const confirmed = window.confirm("ต้องการลบข้อมูลนี้ใช่หรือไม่?");
    if (confirmed) {
      setInsuranceRates(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    console.log("Edit:", id);
  };

  const handleAdd = () => {
    console.log("Add new insurance");
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CustomStyles }} />

      <div className="font-sans min-h-screen flex flex-col">
        <main className="flex-grow w-full max-w-6xl mx-auto p-6">

          <h1 className="text-3xl font-extrabold text-blue-900 text-center mb-8">
            จัดการอัตราเบี้ยประกันภัยรถยนต์
          </h1>

          {/* Search + Add */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-3/5">
              <SearchOutlinedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="ค้นหาบริษัทประกัน / รุ่นรถ / ชั้นประกัน..."
                className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 shadow-md focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-green-700"
            >
              + เพิ่มประกันใหม่
            </button>
          </div>

          {/* TABLE */}
          <div className="w-full overflow-x-auto border border-gray-200 rounded-xl shadow-xl">
            <table className="min-w-full">
              <thead className="bg-blue-900 text-white text-sm">
                <tr>
                  <th className="py-3 px-4">ยี่ห้อ/รุ่น/ปี</th>
                  <th className="py-3 px-4">บริษัท</th>
                  <th className="py-3 px-4">ชั้น</th>
                  <th className="py-3 px-4">ซ่อม</th>
                  <th className="py-3 px-4 text-right">เบี้ยประกัน</th>
                  <th className="py-3 px-4 text-center">สถานะ</th>
                  <th className="py-3 px-4 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {filteredRates.map(rate => (
                  <tr key={rate.id} className="table-row">
                    <td className="table-cell font-semibold">
                      {rate.carBrand} {rate.carModel}
                      <div className="text-xs text-gray-500">{rate.subModel} ({rate.year})</div>
                    </td>

                    <td className="table-cell">{rate.insuranceBrand}</td>
                    <td className="table-cell">{rate.level}</td>
                    <td className="table-cell">{rate.repairType}</td>

                    <td className="table-cell text-right font-bold text-blue-700">
                      {rate.premium.toLocaleString()}
                    </td>

                    <td className="table-cell text-center">
                      <span className={`badge text-white ${getStatusStyles(rate.status)}`}>
                        {rate.status}
                      </span>
                    </td>

                    <td className="table-cell text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => handleEdit(rate.id)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                        >
                          <EditOutlinedIcon />
                        </button>

                        <button
                          onClick={() => handleDelete(rate.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                        >
                          <DeleteOutlineIcon />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}
