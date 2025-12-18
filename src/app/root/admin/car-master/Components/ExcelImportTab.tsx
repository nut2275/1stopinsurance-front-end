"use client";
import React, { useState, useRef } from 'react';
import api from '@/services/api';
import { AxiosError } from 'axios';
import { Icons } from './Icons';
import { TabProps } from '../types';

export default function ExcelImportTab({ onNotify }: TabProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitExcel = async () => {
    if (!file) {
        onNotify('error', 'กรุณาเลือกไฟล์ Excel หรือ CSV ก่อนครับ');
        return;
    }
    
    // Validate File Size (ห้ามเกิน 50MB)
    const MAX_SIZE_MB = 50;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        onNotify('error', `ไฟล์มีขนาดใหญ่เกินไป (ต้องไม่เกิน ${MAX_SIZE_MB}MB)`);
        return;
    }

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
       <div className="w-full max-w-md text-center">
            {/* Header Icon */}
            <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm ring-8 ring-green-50">
                   <Icons.Upload />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">อัปโหลดไฟล์ Excel / CSV</h3>
                {/* ✅ แก้ไขข้อความให้ User รู้ว่ารับ CSV */}
                <p className="text-gray-500 mt-2 text-sm">รองรับไฟล์ .xlsx, .xls และ .csv</p>
            </div>

            {/* Instruction Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left text-sm text-yellow-800">
                <p className="font-bold mb-1">📌 สิ่งที่ต้องมีในไฟล์:</p>
                <p>หัวตาราง (Header) ต้องมีชื่อคอลัมน์ดังนี้:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    {['brand', 'model', 'sub_model', 'year'].map(col => (
                        <span key={col} className="bg-yellow-100 px-2 py-1 rounded text-xs font-mono font-bold border border-yellow-300">{col}</span>
                    ))}
                </div>
            </div>
            
            {/* Drop Zone Area */}
            <label className={`block w-full border-3 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 group ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}`}>
                
                {/* ✅ แก้ไข accept ให้เลือก .csv ได้ */}
                <input 
                    type="file" 
                    accept=".xlsx, .xls, .csv" 
                    ref={fileInputRef} 
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
                    className="hidden" 
                />
                
                {file ? (
                    <div className="animate-scale-in">
                        <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-2 text-green-600">
                            <Icons.Check />
                        </div>
                        <p className="font-bold text-green-700 break-words">{file.name}</p>
                        <p className="text-xs text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • คลิกเพื่อเปลี่ยนไฟล์</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-500 font-medium group-hover:text-green-600 transition-colors">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</p>
                        <p className="text-xs text-gray-400 mt-2">ขนาดไม่เกิน 50MB</p>
                    </div>
                )}
            </label>

            {/* Submit Button */}
            <button 
                onClick={submitExcel} 
                disabled={!file || loading} 
                className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg shadow-lg transform transition-all ${!file || loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-1 shadow-green-200'}`}
            >
                {loading ? 'กำลังนำเข้า...' : 'เริ่ม Import ข้อมูล'}
            </button>
       </div>
    </div>
  );
}