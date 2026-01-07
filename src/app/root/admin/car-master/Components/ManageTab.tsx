"use client";
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import api from '@/services/api';
import { AxiosError } from 'axios';
import { Icons } from './Icons';
import { CarMaster, PaginatedResponse, TabProps } from '../types';

export default function ManageTab({ onNotify }: TabProps) {
  const [dataList, setDataList] = useState<CarMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // ✅ State สำหรับ Filter (แยก year_from, year_to)
  const [filters, setFilters] = useState({ 
      brand: '', 
      carModel: '', 
      subModel: '', 
      year_from: '', // เปลี่ยนจาก year_range
      year_to: ''    // เพิ่ม year_to
  });

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarMaster | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ สร้าง query param สำหรับ year_range
      let year_range_param = '';
      if (filters.year_from && filters.year_to) {
          year_range_param = `${filters.year_from}-${filters.year_to}`;
      } else if (filters.year_from) {
          year_range_param = filters.year_from;
      } else if (filters.year_to) {
          year_range_param = filters.year_to;
      }

      const res = await api.get<PaginatedResponse<CarMaster>>('/car-master', {
        params: {
          page: pagination.page,
          limit: 20,
          brand: filters.brand,
          carModel: filters.carModel,
          subModel: filters.subModel,
          year_range: year_range_param // ✅ ส่งค่าที่สร้างไว้
        }
      });
      setDataList(res.data.data);
      setPagination(prev => ({ ...prev, totalPages: res.data.totalPages, total: res.data.total }));
    } catch (err) {
      console.error(err);
      onNotify('error', 'ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters, onNotify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้? (ลบถาวร)")) return;
    try {
      await api.delete(`/car-master/${id}`);
      onNotify('success', 'ลบข้อมูลสำเร็จ');
      fetchData();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      onNotify('error', `ลบไม่สำเร็จ: ${error.response?.data?.message || error.message}`);
    }
  };

  const openEditModal = (item: CarMaster) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const submitEdit = async () => {
    if (!editingItem) return;
    try {
      await api.put(`/car-master/${editingItem._id}`, editingItem);
      onNotify('success', 'แก้ไขข้อมูลสำเร็จ');
      setIsEditModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      onNotify('error', `แก้ไขไม่สำเร็จ: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* === Search Bar (ปรับปรุงใหม่) === */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Brand */}
        <div className="md:col-span-3">
            <label className="text-sm font-bold text-gray-700 mb-1 block">ยี่ห้อ (Brand)</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Icons.Car /></div>
                <input type="text" className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-300" 
                    value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})} placeholder="เช่น Toyota"/>
            </div>
        </div>

        {/* Model */}
        <div className="md:col-span-3">
            <label className="text-sm font-bold text-gray-700 mb-1 block">รุ่น (Model)</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Icons.Car /></div>
                <input type="text" className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-300" 
                    value={filters.carModel} onChange={(e) => setFilters({...filters, carModel: e.target.value})} placeholder="เช่น Yaris"/>
            </div>
        </div>

        {/* Sub Model */}
        <div className="md:col-span-3">
            <label className="text-sm font-bold text-gray-700 mb-1 block">รุ่นย่อย (Sub Model)</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Icons.Tag /></div>
                <input type="text" className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-300" 
                    value={filters.subModel} onChange={(e) => setFilters({...filters, subModel: e.target.value})} placeholder="เช่น Sport"/>
            </div>
        </div>

        {/* ✅ Year Range (ปรับปรุงใหม่: 2 ช่อง) */}
        <div className="md:col-span-3">
            <label className="text-sm font-bold text-gray-700 mb-1 block">ช่วงปี (Year Range)</label>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Icons.Calendar /></div>
                    <input type="number" className="w-full pl-10 p-2 bg-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-300 text-center" 
                        value={filters.year_from} onChange={(e) => setFilters({...filters, year_from: e.target.value})} placeholder="จากปี"/>
                </div>
                <span className="text-gray-400 font-bold">-</span>
                <div className="relative flex-grow">
                     {/* เอา icon ออกช่องหลัง เพื่อความสะอาดตา */}
                    <input type="number" className="w-full p-2 bg-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-300 text-center" 
                        value={filters.year_to} onChange={(e) => setFilters({...filters, year_to: e.target.value})} placeholder="ถึงปี"/>
                </div>
            </div>
        </div>
      </form>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-500">ทั้งหมด {pagination.total} รายการ (หน้า {pagination.page} / {pagination.totalPages})</p>
          <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition-all bg-white shadow-sm">ก่อนหน้า</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition-all bg-white shadow-sm">ถัดไป</button>
          </div>
      </div>

      {/* Table (เหมือนเดิม) */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 font-bold">ปี</th>
              <th className="p-4 font-bold">ยี่ห้อ</th>
              <th className="p-4 font-bold">รุ่น</th>
              <th className="p-4 font-bold">รุ่นย่อย</th>
              <th className="p-4 font-bold text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">
                  <div className="flex justify-center items-center gap-2"><svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> กำลังโหลดข้อมูล...</div>
              </td></tr>
            ) : dataList.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">ไม่พบข้อมูลตามเงื่อนไข</td></tr>
            ) : (
              dataList.map((item) => (
                <tr key={item._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4 font-mono text-blue-600 font-bold">{item.year}</td>
                  <td className="p-4 font-medium">{item.brand}</td>
                  <td className="p-4">{item.carModel}</td>
                  <td className="p-4 text-gray-600"><span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 group-hover:border-blue-200 group-hover:text-blue-600 transition-all">{item.subModel}</span></td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button onClick={() => openEditModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md" title="แก้ไข">
                        <Icons.Edit />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all shadow-sm hover:shadow-md" title="ลบ">
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

       {/* Pagination */}
       <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-500">ทั้งหมด {pagination.total} รายการ (หน้า {pagination.page} / {pagination.totalPages})</p>
            <div className="flex gap-2">
                <button disabled={pagination.page <= 1} onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition-all bg-white shadow-sm">ก่อนหน้า</button>
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition-all bg-white shadow-sm">ถัดไป</button>
            </div>
        </div>

      {/* === ✅ Edit Modal (ปรับปรุงใหม่: Grid 2 คอลัมน์ + UI สวยงาม) === */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Icons.Edit /></span> แก้ไขข้อมูลรุ่นรถ
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body (Grid Layout) */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Column 1 */}
               <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Icons.Calendar /> ปี (Year)</label>
                        <input type="number" className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-lg font-bold text-blue-600 bg-blue-50/30" 
                            value={editingItem.year} onChange={(e) => setEditingItem({...editingItem, year: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Icons.Car /> ยี่ห้อ (Brand)</label>
                        <input type="text" className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg font-medium" 
                            value={editingItem.brand} onChange={(e) => setEditingItem({...editingItem, brand: e.target.value})} />
                    </div>
               </div>

               {/* Column 2 */}
               <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Icons.Car /> รุ่น (Model)</label>
                        <input type="text" className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg font-medium" 
                            value={editingItem.carModel} onChange={(e) => setEditingItem({...editingItem, carModel: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Icons.Tag /> รุ่นย่อย (Sub Model)</label>
                        <input type="text" className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg font-medium" 
                            value={editingItem.subModel} onChange={(e) => setEditingItem({...editingItem, subModel: e.target.value})} />
                    </div>
               </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/80">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-xl text-gray-700 hover:bg-gray-200 font-bold transition-all">ยกเลิก</button>
              <button onClick={submitEdit} className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1">บันทึกการแก้ไข</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}