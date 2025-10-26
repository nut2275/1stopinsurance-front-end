'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Edit, Trash2, FileText, Search } from 'lucide-react';
import { CustomerPolicy, PolicyStatus } from '@/types/dataType'; // ต้องสร้าง types.ts

interface CustomerTableProps {
  initialData: CustomerPolicy[];
}

const getStatusStyles = (status: PolicyStatus) => {
  // ใช้สีที่สว่างขึ้นสำหรับ Badge เพื่อให้ดูมีมิติ
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

export default function CustomerTable({ initialData }: CustomerTableProps) {
  const [customers, setCustomers] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;
    const keyword = searchTerm.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(keyword) ||
      c.policy.toLowerCase().includes(keyword)
    );
  }, [customers, searchTerm]);

  const handleDelete = (id: number) => {
    // ในแอปจริง ควรใช้ Modal แทน confirm()
    if (confirm("ต้องการลบข้อมูลลูกค้ารายนี้หรือไม่?")) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      // ในแอปจริง ควรเรียก API เพื่อลบข้อมูลจริงด้วย
    }
  };

  return (
    <>
      {/* Search Input */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full md:w-1/2">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า / เลขกรมธรรม์..."
            className="w-full border border-gray-300 rounded-full pl-12 pr-4 py-2 shadow-lg focus:ring focus:ring-blue-300 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table - ขอบรอบนอกยังคงเป็น border-gray-200 */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-900 text-white sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">ชื่อ - นามสกุล</th>
              <th className="px-4 py-3 text-left">ประเภทประกัน</th>
              <th className="px-4 py-3 text-left">บริษัท</th>
              <th className="px-4 py-3 text-left">เลขกรมธรรม์</th>
              <th className="px-4 py-3 text-left">สถานะ</th>
              <th className="px-4 py-3 text-center">เอกสาร</th>
              <th className="px-4 py-3 text-center">ตั้งค่า</th>
            </tr>
          </thead>
          <tbody className="bg-white" id="customerTable">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => (
                // ********** ส่วนที่แก้ไข: เพิ่ม border-gray-300 ให้เส้นแบ่งแถว **********
                <tr 
                  key={c.id} 
                  className="border-t border-gray-300 hover:bg-[#eef6ff] transition-colors duration-200"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.type}</td>
                  <td className="px-4 py-3 text-gray-600">{c.company}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{c.policy}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1.5 rounded-full text-white text-xs font-semibold ${getStatusStyles(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/agent/agent_manage_customer/document?name=${c.name}&policy=${c.policy}`}
                      className="text-gray-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition flex justify-center items-center"
                      title="ดูเอกสาร"
                    >
                      <FileText size={22} />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className='flex justify-center items-center space-x-2'>
                      <Link
                        // href={`/agent-customer-form?action=edit&id=${c.id}&name=${c.name}&type=${c.type}&company=${c.company}&policy=${c.policy}&status=${c.status}`}
                        href={`/agent/agent_manage_customer/Insarance_edit`}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition"
                        title="แก้ไข"
                      >
                        <Edit size={22} />
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition"
                        onClick={() => handleDelete(c.id)}
                        title="ลบ"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-lg text-gray-500 bg-gray-50">
                  ไม่พบข้อมูลลูกค้าที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
