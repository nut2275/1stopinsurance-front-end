'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ⭐ MUI ICONS
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';

// -----------------------------
// Types
// -----------------------------
type PolicyStatus = 'คุ้มครอง' | 'หมดอายุ' | 'กำลังดำเนินการ';

interface CustomerPolicy {
  id: number;
  name: string;
  type: string;
  company: string;
  policy: string;
  status: PolicyStatus;
}

// -----------------------------
// Style mapping
// -----------------------------
const getStatusStyles = (status: PolicyStatus) => {
  switch (status) {
    case 'คุ้มครอง':
      return 'bg-green-600 shadow-md shadow-green-200';
    case 'หมดอายุ':
      return 'bg-yellow-500 shadow-md shadow-yellow-200';
    case 'กำลังดำเนินการ':
      return 'bg-blue-600 shadow-md shadow-blue-200';
    default:
      return 'bg-gray-500';
  }
};

// -----------------------------
// Component
// -----------------------------
export default function AgentTable() {
  const [customers, setCustomers] = useState<CustomerPolicy[]>(
     [
      { id: 1, name: "นาย พลอย สุขภาพ", type: "รถยนต์ ชั้น 1", company: "วิริยะ", policy: "0123-49BAS01", status: "คุ้มครอง" },
      { id: 2, name: "นาง สวย สุดใจดี", type: "สุขภาพ", company: "ธนชาต", policy: "0456-88THAI", status: "หมดอายุ" },
      { id: 3, name: "นาย วีรวัฒน์ ขยันขาย", type: "ชีวิต", company: "เมืองไทย", policy: "0977-11LIFE", status: "กำลังดำเนินการ" },
      { id: 4, name: "น.ส. มินตรา เก่งกาจ", type: "รถยนต์ พ.ร.บ.", company: "อาคเนย์", policy: "0012-77PRB", status: "คุ้มครอง" },
      { id: 5, name: "นาย สมชาย รักชาติ", type: "สุขภาพ", company: "กรุงเทพ", policy: "0333-22MED", status: "กำลังดำเนินการ" },
    ]
  );

  const [searchTerm, setSearchTerm] = useState('');

  // -----------------------------
  // Filter Logic
  // -----------------------------
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;

    const keyword = searchTerm.toLowerCase();

    return customers.filter(c =>
      c.name.toLowerCase().includes(keyword) ||
      c.policy.toLowerCase().includes(keyword)
    );
  }, [customers, searchTerm]);

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDelete = (id: number) => {
    if (window.confirm('ต้องการลบข้อมูลลูกค้ารายนี้หรือไม่?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <>
      {/* ---------------- Search Bar ---------------- */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full md:w-1/2">
          <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า / เลขกรมธรรม์..."
            className="w-full border border-gray-300 rounded-full pl-12 pr-4 py-2 shadow-lg
                       focus:ring focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* ---------------- Table ---------------- */}
      <div className="w-full px-4">
        <div className="max-w-6xl mx-auto overflow-x-auto border border-gray-200 rounded-xl shadow-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-900 text-white sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left min-w-[150px]">ชื่อ - นามสกุล</th>
                <th className="px-4 py-3 text-left min-w-[120px]">ประเภทประกัน</th>
                <th className="px-4 py-3 text-left min-w-[100px]">บริษัท</th>
                <th className="px-4 py-3 text-left min-w-[120px]">เลขกรมธรรม์</th>
                <th className="px-4 py-3 text-left min-w-[130px]">สถานะ</th>
                <th className="px-4 py-3 text-center min-w-[80px]">เอกสาร</th>
                <th className="px-4 py-3 text-center min-w-[120px]">ตั้งค่า</th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-gray-300 hover:bg-[#eef6ff] transition-colors duration-200"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.type}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.company}</td>
                    <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">{c.policy}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-white text-xs font-semibold whitespace-nowrap 
                        ${getStatusStyles(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* เอกสาร */}
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/agent/agent_manage_customer/document?name=${c.name}&policy=${c.policy}`}
                        title="ดูเอกสาร"
                        className="text-gray-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition"
                      >
                        <DescriptionOutlined />
                      </Link>
                    </td>

                    {/* ตั้งค่า */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <Link
                          href={`/agent/agent_manage_customer/insurance/${c.id}/edit`}
                          title="แก้ไข"
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition"
                        >
                          <EditOutlined />
                        </Link>

                        <button
                          title="ลบ"
                          onClick={() => handleDelete(c.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition"
                        >
                          <DeleteOutline />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-lg text-gray-500 bg-gray-50"
                  >
                    ไม่พบข้อมูลลูกค้าที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </>
  );
}
