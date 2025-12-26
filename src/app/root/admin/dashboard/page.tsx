'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AdminDashboardData } from './types';
import { Loader2, RefreshCw, LayoutDashboard } from 'lucide-react';

// Admin Components
import AdminStatsCards from './components/AdminStatsCards';
import TopAgentsTable from './components/TopAgentsTable';
import RecentTransactions from './components/RecentTransactions';

// Shared Components (Reuse จาก Agent)
import DateFilter from '../../../agent/agent_dashboard/components/DateFilter';
import SalesTrendChart from '../../../agent/agent_dashboard/components/SalesTrendChart';
import BrandPieChart from '../../../agent/agent_dashboard/components/BrandPieChart';
import LevelBarChart from '../../../agent/agent_dashboard/components/LevelBarChart'; // ✅ Import มาเพิ่ม

import MenuAdmin from '@/components/element/MenuAdmin';

const AdminDashboardPage = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('last_30_days');

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Filter Logic
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

      const res = await axios.get<AdminDashboardData>(`http://localhost:5000/admin/dashboard${queryParams}`);
      setData(res.data);

    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [filter]);

  if (loading) {
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-slate-50 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium">Loading Admin Dashboard...</p>
        </div>
    );
  }

  return (
    <>
      <MenuAdmin activePage='/root/admin/dashboard' />

      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-2 border-b border-slate-200">
              <div>
                  <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <LayoutDashboard className="w-8 h-8 text-indigo-600" />
                      Admin Portal
                  </h1>
                  <p className="text-slate-500 mt-1">ภาพรวมธุรกิจและประสิทธิภาพ Agent ทั้งหมด</p>
              </div>

              <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                  <DateFilter currentFilter={filter} onFilterChange={setFilter} />
                  <div className="w-px h-8 bg-slate-200 mx-1"></div>
                  <button 
                      onClick={fetchAdminData}
                      className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95"
                      title="Refresh Data"
                  >
                      <RefreshCw className="w-5 h-5" />
                  </button>
              </div>
          </div>

          {/* 1. Cards */}
          {data && <AdminStatsCards summary={data.summary} statusStats={data.statusStats} />}

          {/* 2. Charts Row (Sales Trend + Brand Pie) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                  {data && data.salesTrend && <SalesTrendChart data={data.salesTrend} />}
              </div>
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                  {data && data.brandPreference && <BrandPieChart data={data.brandPreference} />}
              </div>
          </div>

          {/* 3. Detailed Row (Level Stats + Top Agents + Transactions) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ✅ เพิ่มใหม่: กราฟแยกตามชั้นประกัน */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[450px]">
                  {data && data.levelStats && <LevelBarChart data={data.levelStats} />}
              </div>

              {/* ตาราง Top Agents */}
              <div className="lg:col-span-1 h-[450px]">
                  {data && data.topAgents && <TopAgentsTable agents={data.topAgents} />}
              </div>

              {/* รายการ Real-time */}
              <div className="lg:col-span-1 h-[450px]">
                  {data && data.recentTransactions && <RecentTransactions transactions={data.recentTransactions} />}
              </div>
          </div>

        </div>
      </div>
    </>

  );
};

export default AdminDashboardPage;