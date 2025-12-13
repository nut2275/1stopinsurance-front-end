'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
// import axios from 'axios';
import api from '@/services/api';

// ⭐ MUI ICONS
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// -----------------------------
// Types (ตรงกับ Backend Response)
// -----------------------------
interface PurchaseData {
  _id: string;
  policy_number: string;
  status: string;
  customer_name: string;
  insurance_company: string;
  insurance_type: string;
  purchase_date: string;
  // ✅ เพิ่ม field วันที่
  startDate?: string;
  endDate?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// -----------------------------
// Helper Functions
// -----------------------------

// 1. ฟังก์ชันแปลงวันที่เป็นไทยแบบสั้น (DD/MM/YYYY)
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    return dateString; // ถ้าแปลงไม่ได้ให้โชว์ค่าเดิม
  }
};

// 2. ฟังก์ชันสีสถานะ
const getStatusStyles = (status: string) => {
  switch (status) {
    case 'คุ้มครอง':
    case 'Active':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'หมดอายุ':
    case 'Expired':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case 'กำลังดำเนินการ':
    case 'Pending':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'ยกเลิก':
    case 'Cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
};

// -----------------------------
// Component
// -----------------------------
export default function CustomerTable() {
  // State สำหรับข้อมูล
  const [data, setData] = useState<PurchaseData[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State สำหรับ Pagination & Search
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // -----------------------------
  // Fetch Data Function
  // -----------------------------
  const fetchData = useCallback(async (currentPage: number, search: string) => {
    try {
      setLoading(true);
      // ✅ เรียก API Backend
      const response = await api.get('/admin/customer-purchases', {
          params: {
            page: currentPage,
            limit: 10,
            search: search
          }
        });

      if (response.data.success) {
        setData(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // Effects
  // -----------------------------
  
  // Effect 1: Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); 
      fetchData(1, searchTerm);
    }, 600); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchData]);

  // Effect 2: เปลี่ยนหน้า
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
        setPage(newPage);
        fetchData(newPage, searchTerm);
    }
  };

  // -----------------------------
  // Actions
  // -----------------------------
  const handleDelete = async (id: string) => {
    if (window.confirm('ยืนยันที่จะลบรายการนี้? (การลบนี้จะมีผลทันที)')) {
      try {
        // await api.delete(`/admin/customer-purchases/${id}`); // ตัวอย่างถ้ามี API ลบ
        alert(`จำลองการลบ ID: ${id}`);
        // fetchData(page, searchTerm); // โหลดใหม่หลังลบ
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบ');
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* ---------------- Header & Search ---------------- */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        
        {/* Title & Total Count */}
        <div>
            <h2 className="text-xl font-bold text-slate-800">จัดการกรมธรรม์ลูกค้า</h2>
            <p className="text-sm text-slate-500">ทั้งหมด {pagination.total} รายการ</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:flex-1 md:mr-10">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, เลขกรมธรรม์..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
             <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
             >
                ล้างคำค้น
             </button>
          )}
        </div>
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">ชื่อ - นามสกุล</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">ประเภทประกัน</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">บริษัท</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">เลขกรมธรรม์</th>
                
                {/* ✅ เพิ่ม Header วันที่ */}
                <th className="px-6 py-4 text-left font-semibold text-slate-700 whitespace-nowrap">วันเริ่ม</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700 whitespace-nowrap">วันสิ้นสุด</th>
                
                <th className="px-6 py-4 text-center font-semibold text-slate-700">สถานะ</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-700">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // --- Loading Skeleton ---
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-16 mx-auto"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-20 mx-auto"></div></td>
                  </tr>
                ))
              ) : data.length > 0 ? (
                // --- Real Data ---
                data.map((row) => (
                  <tr key={row._id} className="hover:bg-blue-50/50 transition-colors">
                    
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{row.customer_name}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-slate-600">{row.insurance_type}</td>
                    
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-600">
                            {row.insurance_company}
                        </span>
                    </td>
                    
                    <td className="px-6 py-4 font-mono text-slate-600">{row.policy_number}</td>

                    {/* ✅ เพิ่ม Column วันที่ */}
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatDate(row.startDate)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {formatDate(row.endDate)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusStyles(row.status)}`}>
                        {row.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Link
                          href={`/admin/documents/${row._id}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="ดูเอกสาร"
                        >
                          <DescriptionOutlined fontSize="small" />
                        </Link>
                        
                        <Link
                          href={`/admin/insurance/edit/${row._id}`}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="แก้ไข"
                        >
                          <EditOutlined fontSize="small" />
                        </Link>

                        <button
                          onClick={() => handleDelete(row._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="ลบ"
                        >
                          <DeleteOutline fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // --- Not Found ---
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <SearchOutlined style={{ fontSize: 48, opacity: 0.2 }} className="mb-2" />
                        <p>ไม่พบข้อมูลที่ค้นหา</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ---------------- Pagination Footer ---------------- */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <span className="text-sm text-slate-500">
                แสดงหน้า <span className="font-semibold text-slate-700">{pagination.page}</span> จาก {pagination.totalPages}
            </span>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                    <ArrowBackIosNewIcon fontSize="small" />
                </button>

                <div className="hidden sm:flex gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, pagination.page - 3), Math.min(pagination.totalPages, pagination.page + 2))
                        .map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 text-sm rounded-lg transition ${
                                pageNum === pagination.page 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || loading}
                    className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                    <ArrowForwardIosIcon fontSize="small" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}