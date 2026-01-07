'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; // ✅ ใช้สำหรับ Redirect ถ้าไม่มี Token
import { jwtDecode } from 'jwt-decode';      // ✅ Import jwt-decode
import { DashboardData } from './types';
import { Loader2, RefreshCw } from 'lucide-react';

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

      // ดึงข้อมูลจาก localStorage และถอดรหัส Token
      const session = routesAgentsSession();
      if (!session) {
         router.push("/agent/login");
         return;
      }
      const myAgentId = session.id; // ✨ ได้ ID จริงมาใช้งานแล้ว!

      if (!myAgentId) {
          throw new Error("Token ไม่ถูกต้อง: ไม่พบ ID ผู้ใช้งาน");
      }


      // ---------------------------------------------------------
      // ✅ 2. เตรียม Query Params (Filter วันที่)
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
      // ✅ 3. ยิง API ด้วย Agent ID จริง
      // ---------------------------------------------------------
      // *หมายเหตุ: ควรส่ง Header Authorization ไปด้วยเพื่อความปลอดภัยขั้นสูง (Optional)
      const res = await axios.get(
        `http://localhost:5000/purchase/agent/customer-stats/${myAgentId}${queryParams}`,
        {
            headers: { Authorization: `Bearer ${session}` } // ส่ง Token ไปยืนยันตัวตนกับ Backend
        }
      );
      
      setData(res.data);

    } catch (error) {
      console.error("Error fetching stats:", error);
      // กรณี Token หมดอายุ (Backend ตอบกลับ 401)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
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