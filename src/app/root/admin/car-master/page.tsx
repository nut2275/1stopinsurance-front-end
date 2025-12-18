"use client";

import React, { useState, useRef, useEffect } from 'react';
import api from '@/services/api'; 
import { AxiosError } from 'axios';
import MenuAdmin from '@/components/element/MenuAdmin';

// UI Components: ไอคอน SVG (ไม่ต้องลง lib เพิ่ม)
const Icons = {
  Car: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Tag: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
};

export default function CarMasterManagePage() {
  const [activeTab, setActiveTab] = useState<'smart' | 'excel'>('smart');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [smartForm, setSmartForm] = useState({
    brand: '', 
    carModel: '', 
    start_year: new Date().getFullYear(), 
    end_year: new Date().getFullYear(), 
    sub_model_input: '', 
    sub_models: [] as string[]
  });

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAddSubModel = (e: React.KeyboardEvent) => {
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
        setNotification({ type: 'error', message: "กรุณากรอก ยี่ห้อ, รุ่น และ เพิ่มรุ่นย่อยอย่างน้อย 1 รุ่น" });
        return;
    }

    setLoading(true);
    setNotification(null);
    try {
      const res = await api.post('/car-master/bulk', smartForm); 
      setNotification({ type: 'success', message: `บันทึกสำเร็จ! ${res.data.message}` });
      
      setSmartForm({
          brand: '', 
          carModel: '', 
          start_year: new Date().getFullYear(), end_year: new Date().getFullYear(),
          sub_model_input: '', sub_models: []
      });
    } catch (err: unknown) {
        console.error(err);
        setNotification({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
        setLoading(false);
    }
  };

  const submitExcel = async () => {
    if (!file) {
        setNotification({ type: 'error', message: 'กรุณาเลือกไฟล์ Excel ก่อนครับ' });
        return;
    }
    
    setLoading(true);
    setNotification(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/car-master/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNotification({ type: 'success', message: `Import สำเร็จ! ${res.data.message}` });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
        console.error(err);
        const error = err as AxiosError<{message: string}>;
        setNotification({ type: 'error', message: `Import ล้มเหลว: ${error.response?.data?.message || error.message}` });
    } finally {
        setLoading(false);
    }
  };

  // คำนวณจำนวนข้อมูลที่จะถูกสร้าง (UX Bonus)
  const totalItems = (Math.abs(smartForm.end_year - smartForm.start_year) + 1) * smartForm.sub_models.length;

  return (
    <>
        <MenuAdmin activePage='/root/admin/car-master'/>

        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
            <main className="flex-grow p-6 lg:p-10 flex justify-center items-start">
                <div className="w-full max-w-5xl animate-fade-in-up">
                    
                    {/* Header Section */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">จัดการข้อมูลรุ่นรถ</h1>
                            <p className="text-gray-500 mt-1">เพิ่มฐานข้อมูลรถยนต์ (Car Master Data) สำหรับระบบ Dropdown</p>
                        </div>
                    </div>

                    {/* Notification Banner */}
                    {notification && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center shadow-sm border-l-4 transition-all duration-300 transform ${notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                            <div className={`mr-3 p-1 rounded-full ${notification.type === 'success' ? 'bg-green-200' : 'bg-red-200'}`}>
                                {notification.type === 'success' ? <Icons.Check /> : <Icons.Trash /* Error Icon substitute */ />}
                            </div>
                            <span className="font-medium">{notification.message}</span>
                            <button onClick={() => setNotification(null)} className="ml-auto opacity-50 hover:opacity-100">×</button>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        
                        {/* Modern Tabs */}
                        <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex gap-2">
                            <button 
                                onClick={() => setActiveTab('smart')} 
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-200 ${activeTab === 'smart' ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                <span>🚀</span> เพิ่มแบบกลุ่ม (Smart Form)
                            </button>
                            <button 
                                onClick={() => setActiveTab('excel')} 
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-200 ${activeTab === 'excel' ? 'bg-white text-green-600 shadow-md ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                <span>📊</span> นำเข้าจาก Excel
                            </button>
                        </div>

                        <div className="p-8 lg:p-10 min-h-[500px]">
                            {activeTab === 'smart' && (
                                <div className="space-y-8">
                                    {/* Brand & Model Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                                                <Icons.Car /> ยี่ห้อ (Brand) <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-300" 
                                                placeholder="เช่น Toyota, Honda"
                                                value={smartForm.brand}
                                                onChange={e => setSmartForm({...smartForm, brand: e.target.value})}
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                                                <Icons.Car /> รุ่น (Model) <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-300" 
                                                placeholder="เช่น Yaris, Civic"
                                                value={smartForm.carModel}
                                                onChange={e => setSmartForm({...smartForm, carModel: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {/* Year Range */}
                                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                        <h3 className="text-blue-800 font-bold mb-4 flex items-center gap-2"><Icons.Calendar /> ช่วงปีที่ผลิต (Year Range)</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wider">ตั้งแต่ปี</label>
                                                <input type="number" className="w-full bg-white border border-blue-200 p-3 rounded-lg text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" value={smartForm.start_year} onChange={e => setSmartForm({...smartForm, start_year: parseInt(e.target.value)})} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wider">ถึงปี</label>
                                                <input type="number" className="w-full bg-white border border-blue-200 p-3 rounded-lg text-center font-bold text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none" value={smartForm.end_year} onChange={e => setSmartForm({...smartForm, end_year: parseInt(e.target.value)})} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sub Models */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                            <Icons.Tag /> รุ่นย่อย (Sub Models) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-2 mb-4">
                                            <input 
                                                type="text" 
                                                className="flex-grow bg-gray-50 border border-gray-200 p-4 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm" 
                                                placeholder="พิมพ์ชื่อรุ่นย่อย... (เช่น Sport, Entry) แล้วกด Enter" 
                                                value={smartForm.sub_model_input} 
                                                onChange={e => setSmartForm({...smartForm, sub_model_input: e.target.value})} 
                                                onKeyDown={handleAddSubModel} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => { if(smartForm.sub_model_input.trim()) setSmartForm(prev => ({...prev, sub_models: [...prev.sub_models, prev.sub_model_input.trim()], sub_model_input: ''}))}} 
                                                className="bg-gray-900 text-white px-8 rounded-xl font-bold hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                                            >
                                                <Icons.Plus /> เพิ่ม
                                            </button>
                                        </div>

                                        {/* Tags Display */}
                                        <div className="min-h-[100px] p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-wrap content-start gap-3 transition-all hover:border-gray-300 hover:bg-gray-100/50">
                                            {smartForm.sub_models.length === 0 ? (
                                                <p className="text-gray-400 text-sm w-full text-center py-4">ยังไม่ได้เพิ่มรุ่นย่อย...</p>
                                            ) : (
                                                smartForm.sub_models.map((sub, idx) => (
                                                    <span key={idx} className="animate-pop-in bg-white border border-gray-200 pl-4 pr-2 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm flex items-center gap-2 group hover:border-blue-300 hover:text-blue-600 transition-all">
                                                        {sub} 
                                                        <button onClick={() => removeSubModel(idx)} className="bg-gray-100 text-gray-400 hover:bg-red-500 hover:text-white rounded-full p-1 transition-all group-hover:bg-red-100 group-hover:text-red-500 group-hover:hover:bg-red-500 group-hover:hover:text-white">
                                                            <Icons.Trash />
                                                        </button>
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Summary & Submit Button */}
                                    <div className="pt-4 border-t border-gray-100">
                                        {totalItems > 0 && (
                                            <p className="text-center text-sm text-gray-500 mb-4">
                                                ระบบจะทำการสร้างข้อมูลทั้งหมด <span className="font-bold text-blue-600">{totalItems}</span> รายการ
                                            </p>
                                        )}
                                        <button 
                                            onClick={submitSmartForm} 
                                            disabled={loading} 
                                            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-200 transform transition-all active:scale-[0.98] ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-1'}`}
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
                            )}

                            {activeTab === 'excel' && (
                                <div className="flex flex-col items-center justify-center py-10 animate-fade-in-up">
                                    <div className="w-full max-w-md text-center">
                                        <div className="mb-8">
                                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4 shadow-sm ring-8 ring-green-50">
                                            <Icons.Upload />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800">อัปโหลดไฟล์ Excel</h3>
                                            <p className="text-gray-500 mt-2 text-sm">รองรับไฟล์นามสกุล .xlsx หรือ .xls</p>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left text-sm text-yellow-800">
                                            <p className="font-bold mb-1">📌 สิ่งที่ต้องมีในไฟล์ Excel:</p>
                                            <p>หัวตาราง (Header) ต้องมีชื่อคอลัมน์ดังนี้ (ภาษาอังกฤษหรือไทยก็ได้):</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {['brand', 'model', 'sub_model', 'year'].map(col => (
                                                    <span key={col} className="bg-yellow-100 px-2 py-1 rounded text-xs font-mono font-bold border border-yellow-300">{col}</span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <label className={`block w-full border-3 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 group ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}`}>
                                            <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
                                            
                                            {file ? (
                                                <div>
                                                    <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-2 text-green-600">
                                                        <Icons.Check />
                                                    </div>
                                                    <p className="font-bold text-green-700 break-words">{file.name}</p>
                                                    <p className="text-xs text-green-600 mt-1">คลิกเพื่อเปลี่ยนไฟล์</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-gray-500 font-medium group-hover:text-green-600 transition-colors">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</p>
                                                    <p className="text-xs text-gray-400 mt-2">ขนาดไม่เกิน 50MB</p>
                                                </div>
                                            )}
                                        </label>

                                        <button 
                                            onClick={submitExcel} 
                                            disabled={!file || loading} 
                                            className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg shadow-lg transform transition-all ${!file || loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-1 shadow-green-200'}`}
                                        >
                                            {loading ? 'กำลังนำเข้า...' : 'เริ่ม Import ข้อมูล'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </>

  );
}