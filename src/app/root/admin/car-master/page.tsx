"use client";
import React, { useState, useEffect } from 'react';
import MenuAdmin from '@/components/element/MenuAdmin';
import { Icons } from './Components/Icons';
import { NotificationState } from './types';

// Import Components
import ManageTab from './Components/ManageTab';
import SmartCreateTab from './Components/SmartCreateTab';
import ExcelImportTab from './Components/ExcelImportTab';

// นิยาม Interface สำหรับปุ่ม Tab ตรงนี้เลย (หรือจะไปแก้ใน types.ts ก็ได้ครับ)
interface CustomTabButtonProps {
    isActive: boolean;
    onClick: () => void;
    icon: string;
    label: string;
    colorClass: string;
    bgClass: string;   // ✅ เพิ่มสีพื้นหลัง
    ringClass: string; // ✅ เพิ่มสีขอบ
}

export default function CarMasterManagePage() {
  const [activeTab, setActiveTab] = useState<'manage' | 'smart' | 'excel'>('manage');
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Central Notification Handler
  const handleNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <>
      <MenuAdmin activePage='/root/admin/car-master'/>

      <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
        <main className="flex-grow p-6 lg:p-10 flex justify-center items-start">
          <div className="w-full max-w-6xl animate-fade-in-up">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">จัดการข้อมูลรุ่นรถ</h1>
              <p className="text-gray-500 mt-1">ฐานข้อมูลกลาง (Master Data) สำหรับระบบประกันภัย</p>
            </div>

            {/* Notification Banner */}
            {notification && (
              <div className={`mb-6 p-4 rounded-xl flex items-center shadow-sm border-l-4 transition-all duration-300 transform ${notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                <div className={`mr-3 p-1 rounded-full ${notification.type === 'success' ? 'bg-green-200' : 'bg-red-200'}`}>
                  {notification.type === 'success' ? <Icons.Check /> : <Icons.Trash />}
                </div>
                <span className="font-medium">{notification.message}</span>
                <button onClick={() => setNotification(null)} className="ml-auto opacity-50 hover:opacity-100">×</button>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px]">
              
              {/* Tabs Navigation (Blue Theme Applied) */}
              <div className="bg-gray-50/50 p-2 border-b border-gray-100 flex flex-wrap gap-2">
                
                {/* 1. จัดการข้อมูล (สีน้ำเงินเข้ม) */}
                <TabButton 
                    isActive={activeTab === 'manage'} 
                    onClick={() => setActiveTab('manage')} 
                    icon="🛠️" 
                    label="จัดการข้อมูล" 
                    colorClass="text-blue-700"
                    bgClass="bg-white"
                    ringClass="ring-blue-100"
                />

                {/* 2. เพิ่มแบบกลุ่ม (เปลี่ยนจากม่วง -> ฟ้า Sky Blue) */}
                <TabButton 
                    isActive={activeTab === 'smart'} 
                    onClick={() => setActiveTab('smart')} 
                    icon="🚀" 
                    label="เพิ่มแบบกลุ่ม" 
                    colorClass="text-sky-600" 
                    bgClass="bg-white"
                    ringClass="ring-sky-100"
                />

                {/* 3. นำเข้า Excel (เขียว Excel) */}
                <TabButton 
                    isActive={activeTab === 'excel'} 
                    onClick={() => setActiveTab('excel')} 
                    icon="📊" 
                    label="นำเข้า Excel" 
                    colorClass="text-green-600"
                    bgClass="bg-white"
                    ringClass="ring-green-100"
                />
              </div>

              <div className="p-6 lg:p-8">
                {activeTab === 'manage' && <ManageTab onNotify={handleNotify} />}
                {activeTab === 'smart' && <SmartCreateTab onNotify={handleNotify} />}
                {activeTab === 'excel' && <ExcelImportTab onNotify={handleNotify} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// Sub-component: TabButton (อัปเกรดรับค่า bgClass และ ringClass)
const TabButton = ({ isActive, onClick, icon, label, colorClass, bgClass, ringClass }: CustomTabButtonProps) => (
    <button 
        onClick={onClick} 
        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-200 
        ${isActive 
            ? `${bgClass} ${colorClass} shadow-md ring-1 ${ringClass}` 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}
    >
        <span className="text-xl">{icon}</span> {label}
    </button>
);