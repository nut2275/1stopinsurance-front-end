'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api'; // ✅ Import API Service of real

// --- MUI ICONS ---
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// --- Constants ---
const LEVELS = ["ชั้น 1", "ชั้น 2+", "ชั้น 2", "ชั้น 3+", "ชั้น 3"];
const REPAIR_TYPES = ["ซ่อมอู่", "ซ่อมห้าง"];
const INSURANCE_BRANDS = ["วิริยะประกันภัย", "ธนชาตประกันภัย", "เมืองไทยประกันภัย", "อาคเนย์", "กรุงเทพประกันภัย", "คุ้มภัยโตเกียวมารีน"];

// --- Styles (Inline Tailwind CSS) ---
import { CustomStyles } from './CustomStyles';

// --- Types ---
type PolicyStatus = 'ใช้งาน' | 'หมดอายุ' | 'รออนุมัติ';

interface CarInsuranceRate {
  _id: string;
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

// --- Main Component ---
export default function InsuranceManage() {
  const [insuranceRates, setInsuranceRates] = useState<CarInsuranceRate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [filterBrand, setFilterBrand] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterRepair, setFilterRepair] = useState('');
  const [sortPrice, setSortPrice] = useState(''); // 'asc' | 'desc' | ''

  // --- Pagination States ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Fetch Data from API with Pagination
  const fetchInsurances = async (currentPage = 1) => {
    try {   
      // Construct query string with pagination and search
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20', // Consistent with backend default
        keyword: searchTerm // Pass search term to backend for server-side filtering if supported
      });

      // Note: Assuming the backend route is correct based on previous discussions (/api/admin/insurance)
      const response = await api.get(`/api/admin/insurance?${queryParams.toString()}`);
      
      if (response.data && response.data.success) {
        setInsuranceRates(response.data.data);
        // Update pagination info from backend response
        if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages);
            setTotalCount(response.data.pagination.total);
        }
      } else if (Array.isArray(response.data)) {
         // Fallback for non-paginated response structure
         setInsuranceRates(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch insurances:", error);
    } 

  };

  // Trigger fetch when page changes
  useEffect(() => {
    fetchInsurances(page);
    // Note: If you want server-side search, add searchTerm to dependencies and debounce it
    // For now, keeping client-side filtering logic below as originally implemented, 
    // but fetching happens per page.
  }, [page]); 

  // If search term changes, reset to page 1 and fetch
  useEffect(() => {
      setPage(1);
      fetchInsurances(1);
  }, [searchTerm]);


  // --- Reset Filters ---
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterBrand('');
    setFilterLevel('');
    setFilterRepair('');
    setSortPrice('');
    setPage(1); // Reset page as well
    fetchInsurances(1);
  };

  // --- Advanced Filtering Logic (Client-Side on Current Page Data) ---
  // Note: Since we are now paginating on the server, this filtering only applies 
  // to the *current page* of data fetched. Ideally, all filtering should move to the backend.
  const filteredRates = useMemo(() => {
    let result = [...insuranceRates];

    // Client-side filtering logic remains for immediate feedback on the current 20 items
    // (If backend handles 'keyword', the search part here is redundant but harmless for visual consistency)
    
    // 2. Filters
    if (filterBrand) result = result.filter(r => r.insuranceBrand === filterBrand);
    if (filterLevel) result = result.filter(r => r.level === filterLevel);
    if (filterRepair) result = result.filter(r => r.repairType === filterRepair);

    // 3. Sort by Price
    if (sortPrice === 'asc') {
      result.sort((a, b) => a.premium - b.premium);
    } else if (sortPrice === 'desc') {
      result.sort((a, b) => b.premium - a.premium);
    }

    return result;
  }, [insuranceRates, filterBrand, filterLevel, filterRepair, sortPrice]);

  // --- CRUD ---
  const handleDelete = async (id: string) => {
    if (window.confirm("ต้องการลบข้อมูลนี้ใช่หรือไม่?")) {
      try {
        await api.delete(`/api/admin/insurance/${id}`); // Ensure correct endpoint
        // Refresh data after delete instead of just client-side filter to ensure pagination stays correct
        fetchInsurances(page);
      } catch (error) {
        console.error("Error deleting insurance:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setPage(newPage);
      }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CustomStyles }} />

      <div className="font-sans min-h-screen flex flex-col">
        <main className="flex-grow w-full max-w-7xl mx-auto p-6">

          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900">
                จัดการอัตราเบี้ยประกันภัย
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                บริหารจัดการแผนประกัน ข้อมูลความคุ้มครอง และราคา
              </p>
            </div>
            <Link href={"/root/admin/insurances/new"}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span className="text-xl leading-none">+</span> เพิ่มประกันใหม่
            </Link>
          </div>

          {/* --- Filters & Search Section --- */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
              <FilterListIcon className="text-blue-600" /> ตัวกรองข้อมูล
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <SearchOutlinedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหา (ยี่ห้อ, รุ่น, บริษัท)..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter: Company */}
              <select 
                className="form-select" 
                value={filterBrand} 
                onChange={e => setFilterBrand(e.target.value)}
              >
                <option value="">ทุกบริษัทประกัน</option>
                {INSURANCE_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              {/* Filter: Level */}
              <select 
                className="form-select"
                value={filterLevel} 
                onChange={e => setFilterLevel(e.target.value)}
              >
                <option value="">ทุกชั้นประกัน</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>

              {/* Sort: Price */}
              <div className="flex gap-2">
                 <select 
                    className="form-select"
                    value={filterRepair} 
                    onChange={e => setFilterRepair(e.target.value)}
                  >
                    <option value="">ทุกประเภทซ่อม</option>
                    {REPAIR_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
              </div>
            </div>

            {/* Row 2: Price Sort & Reset */}
            <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-gray-100">
               <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">เรียงลำดับราคา:</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSortPrice('asc')}
                      className={`px-3 py-1 text-xs rounded-full border ${sortPrice === 'asc' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      น้อย ➜ มาก
                    </button>
                    <button 
                      onClick={() => setSortPrice('desc')}
                      className={`px-3 py-1 text-xs rounded-full border ${sortPrice === 'desc' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      มาก ➜ น้อย
                    </button>
                  </div>
               </div>

               <button 
                  onClick={handleResetFilters}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition"
               >
                  <RestartAltIcon fontSize="small" /> ล้างตัวกรองทั้งหมด
               </button>
            </div>
          </div>

          {/* --- TABLE --- */}
          <div className="w-full overflow-hidden border border-gray-200 rounded-xl shadow-lg bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-900 text-white text-sm table-header">
                  <tr>
                    <th className="py-4 px-6 text-left w-[20%]">ยี่ห้อ / รุ่น / ปี</th>
                    <th className="py-4 px-4 text-left w-[15%]">บริษัทประกัน</th>
                    <th className="py-4 px-4 text-center w-[10%]">ชั้น</th>
                    <th className="py-4 px-4 text-center w-[10%]">ซ่อม</th>
                    <th className="py-4 px-6 text-right w-[15%]">เบี้ยประกัน</th>
                    <th className="py-4 px-4 text-center w-[15%]">จัดการ</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {
                  filteredRates.length > 0 ? (
                    filteredRates.map(rate => (
                      <tr key={rate._id} className="table-row group">
                        {/* Car Info */}
                        <td className="table-cell px-6">
                          <div className="font-bold text-gray-800 text-base">{rate.carBrand} {rate.carModel}</div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{rate.year}</span> {rate.subModel}
                          </div>
                        </td>

                        {/* Insurance Brand */}
                        <td className="table-cell px-4">
                          <span className="font-medium text-gray-700">{rate.insuranceBrand}</span>
                        </td>

                        {/* Level */}
                        <td className="table-cell px-4 text-center">
                          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100">
                            {rate.level}
                          </span>
                        </td>

                        {/* Repair Type */}
                        <td className="table-cell px-4 text-center">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${rate.repairType === 'ซ่อมห้าง' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'}`}>
                            {rate.repairType}
                          </span>
                        </td>

                        {/* Premium */}
                        <td className="table-cell px-6 text-right">
                          <div className="font-bold text-blue-900 text-lg">
                            {rate.premium.toLocaleString()}
                            <span className="text-xs text-gray-400 ml-1 font-normal">บาท</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="table-cell px-4 text-center">
                          <div className="flex justify-center gap-2 opacity-100 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link href={`/root/admin/insurances/${rate._id}/edit`}>
                              <button
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"
                                title="แก้ไข"
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </button>
                            </Link>

                            <button
                              onClick={() => handleDelete(rate._id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition shadow-sm"
                              title="ลบ"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <SearchOutlinedIcon style={{ fontSize: 48, marginBottom: 8, opacity: 0.3 }} />
                          <p className="text-lg font-medium">ไม่พบข้อมูลประกัน</p>
                          <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                          <button 
                            onClick={handleResetFilters}
                            className="mt-4 text-blue-600 hover:underline text-sm font-medium"
                          >
                            ล้างการค้นหา
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer of Table: Pagination Controls */}
            {  (
               <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                  <span>
                    แสดงผลหน้า {page} จาก {totalPages} (ทั้งหมด {totalCount} รายการ)
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className={`p-1 rounded ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-blue-600'}`}
                        title="ก่อนหน้า"
                    >
                        <ChevronLeftIcon fontSize="small"/>
                    </button>
                    
                    {/* Simple page numbers - can be enhanced for many pages */}
                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic to show a sliding window of pages could go here
                            // For simplicity, just showing first 5 or current page logic would be needed for full implementation
                            // Here is a simple version showing current page context
                            let p = page; 
                            if (page < 3) p = i + 1;
                            else if (page > totalPages - 2) p = totalPages - 4 + i;
                            else p = page - 2 + i;
                            
                            if(p > 0 && p <= totalPages) {
                                return (
                                    <button 
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`w-6 h-6 flex items-center justify-center rounded ${page === p ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <button 
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className={`p-1 rounded ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-blue-600'}`}
                        title="ถัดไป"
                    >
                        <ChevronRightIcon fontSize="small"/>
                    </button>
                  </div>
               </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}