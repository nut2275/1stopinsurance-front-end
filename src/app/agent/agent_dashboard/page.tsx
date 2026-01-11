'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ ใช้สำหรับ Redirect ถ้าไม่มี Token
import { DashboardData } from './types';
import { Loader2, RefreshCw } from 'lucide-react';
import api from "@/services/api";
import axios from "axios";

// Components
import StatsCards from './components/StatsCards';
import TaskSummary from './components/TaskSummary';
import LevelBarChart from './components/LevelBarChart';
import BrandPieChart from './components/BrandPieChart';
import TopCustomers from './components/TopCustomers';
import RenewalList from './components/RenewalList';
import DateFilter from './components/DateFilter';
import SalesTrendChart from './components/SalesTrendChart';

import MenuAgent from '@/components/element/MenuAgent';
import { routesAgentsSession } from '@/routes/session'; 
import { AgentStatus } from "@/hooks/useAgentStatus";

// ✅ สร้าง Interface สำหรับ Token เพื่อเลี่ยง any


const AgentDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('last_30_days');
  
  // ✅ เรียกใช้ Router
  const router = useRouter();
  const { loading: authLoading } = AgentStatus();
  


    const fetchDashboardData = async () => {
        try {
        setLoading(true);

        // ---------------------------------------------------------
        // ✅ 1. เตรียม Token และ ID
        // ---------------------------------------------------------
        const session = routesAgentsSession();
        if (!session) {
            router.push("/agent/login");
            return;
        }
        // สมมติว่า session มี type รองรับอยู่แล้ว (ถ้าไม่มีให้สร้าง Interface มารับ)
        const myAgentId = session.id; 

        const token = localStorage.getItem("token"); 

        if (!myAgentId || !token) {
            throw new Error("ข้อมูลยืนยันตัวตนไม่ถูกต้อง");
        }

        // ---------------------------------------------------------
        // ✅ 2. เตรียม Query Params
        // ---------------------------------------------------------
        let queryParams = "";
        const now = new Date();
        let startDate: Date | null = null;
        const endDate: Date | null = new Date(); 

        if (filter === 'this_month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (filter === 'last_30_days') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 30);
        } else if (filter === 'last_7_days') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
        }
        
        if (startDate && endDate && filter !== 'all') {
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];
            queryParams = `?startDate=${startStr}&endDate=${endStr}`;
        }

        // ---------------------------------------------------------
        // ✅ 3. ยิง API
        // ---------------------------------------------------------
        const res = await api.get(
            `/purchase/agent/customer-stats/${myAgentId}${queryParams}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        setData(res.data);

        } catch (error: unknown) { // 👈 ใช้ unknown แทน any
        
        // ✅ ใช้ Type Guard เช็คว่าเป็น Error จาก Axios หรือไม่
        if (axios.isAxiosError(error)) {
            console.error("Axios Error:", error.message);
            
            // ตอนนี้ TypeScript รู้จัก error.response แล้ว
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                router.push("/login");
            }
        } else if (error instanceof Error) {
            // กรณีเป็น Error ทั่วไป (เช่น throw new Error ด้านบน)
            console.error("General Error:", error.message);
        } else {
            // กรณี error เป็นอะไรก็ไม่รู้ (เช่น string หรือ object แปลกๆ)
            console.error("Unknown Error:", error);
        }

        } finally {
        setLoading(false);
        }
    };

  // ✅ 2. useEffect ต้องประกาศก่อนการ return ใดๆ
  useEffect(() => {
    // เพิ่มเงื่อนไข: ถ้าเช็ค Auth เสร็จแล้ว (authLoading = false) ค่อยดึงข้อมูล
    if (!authLoading) {
        fetchDashboardData();
    }
  }, [filter, authLoading]); // เพิ่ม authLoading ใน dependency


  if (authLoading) {
      return (
          <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="mt-4 text-slate-500">กำลังตรวจสอบสิทธิ์...</p>
          </div>
      );
  }

  if (loading) {
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-slate-50 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
    );
  }

  return (
    <>
      <MenuAgent activePage='/agent/agent_dashboard'/>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* --- Header Section --- */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-2">
              <div>
                  <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
                  <p className="text-slate-500 mt-1">ยินดีต้อนรับ, ติดตามยอดขายและงานของคุณได้ที่นี่</p>
              </div>

              <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                  <DateFilter currentFilter={filter} onFilterChange={setFilter} />
                  <div className="w-px h-8 bg-slate-200 mx-1"></div>
                  <button 
                      onClick={fetchDashboardData}
                      className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95"
                      title="รีเฟรชข้อมูล"
                  >
                      <RefreshCw className="w-5 h-5" />
                  </button>
              </div>
          </div>

          {/* --- 1. Key Tasks --- */}
          <section>
              <h3 className="text-lg font-bold text-slate-700 mb-4 px-1">สถานะงานปัจจุบัน</h3>
              {data && data.statusStats && <TaskSummary stats={data.statusStats} />}
          </section>

          {/* --- 2. Stats Overview --- */}
          <section>
              {data && data.summary && <StatsCards stats={data.summary} />}
          </section>

          {/* --- 3. Analytics Charts --- */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
                  {data && data.salesTrend && <SalesTrendChart data={data.salesTrend} />}
              </div>

              <div className="lg:col-span-1 shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
                  {data && data.brandPreference && <BrandPieChart data={data.brandPreference} />}
              </div>
          </section>

          {/* --- 4. Breakdown & Details --- */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
                  {data && data.levelStats && <LevelBarChart data={data.levelStats} />}
              </div>

              <div className="lg:col-span-1 shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
                  {data && data.topCustomers && <TopCustomers customers={data.topCustomers} />}
              </div>
              <div className="lg:col-span-1 shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
                  {data && data.renewingCustomers && <RenewalList customers={data.renewingCustomers} />}
              </div>
          </section>

        </div>
      </div>
    </>

  );
};

export default AgentDashboard;