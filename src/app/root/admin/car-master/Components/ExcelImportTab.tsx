"use client";
import React, { useState, useRef } from 'react';
import api from '@/services/api';
import { AxiosError } from 'axios';
import { Icons } from './Icons';
import { TabProps } from '../types';


//Tab นำเข้า Excel
export default function ExcelImportTab({ onNotify }: TabProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitExcel = async () => {
    if (!file) return onNotify('error', 'กรุณาเลือกไฟล์ Excel ก่อนครับ');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post<{ message: string }>('/car-master/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onNotify('success', `Import สำเร็จ! ${res.data.message}`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      onNotify('error', `Import ล้มเหลว: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 animate-fade-in-up">
       {/* UI ... (Copy code เดิมมาใส่) */}
       <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm ring-8 ring-green-50"><Icons.Upload /></div>
            <h3 className="text-2xl font-bold text-gray-800">อัปโหลดไฟล์ Excel</h3>
            <p className="text-gray-500 mt-2 text-sm">คอลัมน์: brand, model, sub_model, year</p>
        </div>
        <label className={`block w-full max-w-lg border-3 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}`}>
            <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
            {file ? <div className="font-bold text-green-700">{file.name}</div> : <div className="text-gray-500">คลิกเพื่อเลือกไฟล์</div>}
        </label>
        <button onClick={submitExcel} disabled={!file || loading} className={`w-full max-w-lg mt-8 py-4 rounded-2xl font-bold text-lg shadow-lg ${!file || loading ? 'bg-gray-300' : 'bg-green-600 text-white hover:bg-green-700'}`}>
            {loading ? 'กำลังนำเข้า...' : 'เริ่ม Import ข้อมูล'}
        </button>
    </div>
  );
}