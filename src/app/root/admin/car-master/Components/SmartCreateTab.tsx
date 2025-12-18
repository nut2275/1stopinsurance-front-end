"use client";
import React, { useState, KeyboardEvent } from 'react';
import api from '@/services/api';
import { AxiosError } from 'axios';
import { Icons } from './Icons';
import { TabProps } from '../types';

interface SmartFormState {
  brand: string;
  carModel: string;
  start_year: number;
  end_year: number;
  sub_model_input: string;
  sub_models: string[];
}

export default function SmartCreateTab({ onNotify }: TabProps) {
  const [loading, setLoading] = useState(false);
  const [smartForm, setSmartForm] = useState<SmartFormState>({
    brand: '', carModel: '', start_year: new Date().getFullYear(), end_year: new Date().getFullYear(), sub_model_input: '', sub_models: []
  });

  const handleAddSubModel = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (smartForm.sub_model_input.trim()) {
        setSmartForm(prev => ({
          ...prev,
          sub_models: [...prev.sub_models, prev.sub_model_input.trim()],
          sub_model_input: ''
        }));
      }
    }
  };

  const removeSubModel = (indexToRemove: number) => {
    setSmartForm(prev => ({
      ...prev,
      sub_models: prev.sub_models.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const submitSmartForm = async () => {
    if (!smartForm.brand || !smartForm.carModel || smartForm.sub_models.length === 0) {
      onNotify('error', "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ message: string }>('/car-master/bulk', smartForm);
      onNotify('success', `บันทึกสำเร็จ! ${res.data.message}`);
      setSmartForm({ brand: '', carModel: '', start_year: new Date().getFullYear(), end_year: new Date().getFullYear(), sub_model_input: '', sub_models: [] });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      onNotify('error', error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const totalItems = (Math.abs(smartForm.end_year - smartForm.start_year) + 1) * smartForm.sub_models.length;

  return (
    <div className="space-y-6 animate-fade-in-up">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    <Icons.Car /> ยี่ห้อ <span className="text-red-500">*</span>
                </label>
                <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-300" 
                    placeholder="เช่น Toyota" 
                    value={smartForm.brand} 
                    onChange={(e) => setSmartForm({...smartForm, brand: e.target.value})} 
                />
            </div>
            <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    <Icons.Car /> รุ่น <span className="text-red-500">*</span>
                </label>
                <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-300" 
                    placeholder="เช่น Yaris" 
                    value={smartForm.carModel} 
                    onChange={(e) => setSmartForm({...smartForm, carModel: e.target.value})} 
                />
            </div>
        </div>
        
        {/* Year Range Section: เปลี่ยนเป็นสีฟ้า */}
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 relative overflow-hidden">
             {/* Decorate Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <h3 className="text-blue-800 font-bold mb-4 flex items-center gap-2"><Icons.Calendar /> ช่วงปีที่ผลิต</h3>
            <div className="grid grid-cols-2 gap-6 relative z-10">
                <div>
                    <label className="block text-xs font-semibold text-blue-600 mb-1">ตั้งแต่ปี</label>
                    <input 
                        type="number" 
                        className="w-full bg-white border border-blue-200 p-3 rounded-lg text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" 
                        value={smartForm.start_year} 
                        onChange={(e) => setSmartForm({...smartForm, start_year: parseInt(e.target.value)})} 
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-blue-600 mb-1">ถึงปี</label>
                    <input 
                        type="number" 
                        className="w-full bg-white border border-blue-200 p-3 rounded-lg text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" 
                        value={smartForm.end_year} 
                        onChange={(e) => setSmartForm({...smartForm, end_year: parseInt(e.target.value)})} 
                    />
                </div>
            </div>
        </div>

        <div>
             <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Icons.Tag /> รุ่นย่อย <span className="text-red-500">*</span>
             </label>
             <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    className="flex-grow bg-gray-50 border border-gray-200 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                    placeholder="พิมพ์ชื่อรุ่นย่อย... (เช่น Sport) แล้วกด Enter" 
                    value={smartForm.sub_model_input} 
                    onChange={(e) => setSmartForm({...smartForm, sub_model_input: e.target.value})} 
                    onKeyDown={handleAddSubModel} 
                />
                <button 
                    type="button" 
                    onClick={() => { if(smartForm.sub_model_input.trim()) setSmartForm(prev => ({...prev, sub_models: [...prev.sub_models, prev.sub_model_input.trim()], sub_model_input: ''}))}} 
                    className="bg-gray-800 text-white px-8 rounded-xl font-bold hover:bg-gray-900 flex items-center gap-2 shadow-lg transition-all"
                >
                    <Icons.Plus /> เพิ่ม
                </button>
             </div>

             <div className="min-h-[100px] p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-wrap gap-3">
                {smartForm.sub_models.length === 0 ? (
                     <p className="text-gray-400 text-sm w-full text-center py-4">ยังไม่ได้เพิ่มรุ่นย่อย...</p>
                ) : (
                    smartForm.sub_models.map((sub, idx) => (
                        <span key={idx} className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm flex items-center gap-2 group hover:border-blue-300 hover:text-blue-600 transition-all">
                            {sub} 
                            <button onClick={() => removeSubModel(idx)} className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-full p-1 transition-all">
                                <span className="sr-only">Remove</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </span>
                    ))
                )}
             </div>
        </div>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-center text-sm text-gray-500 mb-4">
            ระบบจะสร้างข้อมูลทั้งหมด <span className="font-bold text-blue-600">{totalItems}</span> รายการ
        </p>
        <button 
            onClick={submitSmartForm} 
            disabled={loading} 
            className="w-full py-4 rounded-2xl text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-200 transition-all transform active:scale-[0.99]"
        >
          {loading ? (
             <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                กำลังบันทึก...
             </span>
          ) : 'บันทึกข้อมูลเข้าระบบ'}
        </button>
      </div>
    </div>
  );
}