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
  const [filters, setFilters] = useState({ brand: '', carModel: '', subModel: '', year_range: '' });

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarMaster | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<CarMaster>>('/car-master', {
        params: {
          page: pagination.page,
          limit: 20,
          brand: filters.brand,
          carModel: filters.carModel,
          subModel: filters.subModel,
          year_range: filters.year_range
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
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* ... Inputs for Search (Brand, Model, etc.) ... */}
        {/* เพื่อความกระชับ ขอละ input ไว้ (ใช้โค้ดเดิมได้เลย แค่เปลี่ยน Icons.Search เป็น <Icons.Search />) */}
         <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase">ยี่ห้อ</label>
            <input type="text" className="w-full mt-1 p-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none" 
                value={filters.brand} onChange={(e) => setFilters({...filters, brand: e.target.value})} placeholder="เช่น Toyota"/>
        </div>
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase">รุ่น</label>
            <input type="text" className="w-full mt-1 p-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none" 
                value={filters.carModel} onChange={(e) => setFilters({...filters, carModel: e.target.value})} placeholder="เช่น Yaris"/>
        </div>
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase">รุ่นย่อย</label>
            <input type="text" className="w-full mt-1 p-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none" 
                value={filters.subModel} onChange={(e) => setFilters({...filters, subModel: e.target.value})} placeholder="เช่น Sport"/>
        </div>
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase">ช่วงปี</label>
            <input type="text" className="w-full mt-1 p-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none" 
                value={filters.year_range} onChange={(e) => setFilters({...filters, year_range: e.target.value})} placeholder="2020-2024"/>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2">
          <Icons.Search /> ค้นหา
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
              <th className="p-4 font-bold border-b">ปี</th>
              <th className="p-4 font-bold border-b">ยี่ห้อ</th>
              <th className="p-4 font-bold border-b">รุ่น</th>
              <th className="p-4 font-bold border-b">รุ่นย่อย</th>
              <th className="p-4 font-bold border-b text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
            ) : dataList.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">ไม่พบข้อมูล</td></tr>
            ) : (
              dataList.map((item) => (
                <tr key={item._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4 font-mono text-blue-600 font-bold">{item.year}</td>
                  <td className="p-4 font-medium">{item.brand}</td>
                  <td className="p-4">{item.carModel}</td>
                  <td className="p-4 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-sm">{item.subModel}</span></td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"><Icons.Edit /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"><Icons.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

       {/* Pagination */}
       <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">ทั้งหมด {pagination.total} รายการ (หน้า {pagination.page} / {pagination.totalPages})</p>
            <div className="flex gap-2">
                <button disabled={pagination.page <= 1} onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))} className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium">ก่อนหน้า</button>
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))} className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium">ถัดไป</button>
            </div>
        </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">แก้ไขข้อมูล</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-8 space-y-4">
               {/* Form Fields for Edit */}
               <div><label className="block text-sm font-bold mb-1">ปี</label><input type="number" className="w-full border p-3 rounded-lg" value={editingItem.year} onChange={(e) => setEditingItem({...editingItem, year: parseInt(e.target.value)})} /></div>
               <div><label className="block text-sm font-bold mb-1">ยี่ห้อ</label><input type="text" className="w-full border p-3 rounded-lg" value={editingItem.brand} onChange={(e) => setEditingItem({...editingItem, brand: e.target.value})} /></div>
               <div><label className="block text-sm font-bold mb-1">รุ่น</label><input type="text" className="w-full border p-3 rounded-lg" value={editingItem.carModel} onChange={(e) => setEditingItem({...editingItem, carModel: e.target.value})} /></div>
               <div><label className="block text-sm font-bold mb-1">รุ่นย่อย</label><input type="text" className="w-full border p-3 rounded-lg" value={editingItem.subModel} onChange={(e) => setEditingItem({...editingItem, subModel: e.target.value})} /></div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-bold">ยกเลิก</button>
              <button onClick={submitEdit} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}