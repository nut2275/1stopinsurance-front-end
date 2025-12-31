'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; 
import { AdminDashboardData } from './types';
import { Loader2, RefreshCw, LayoutDashboard, Download } from 'lucide-react';

// Admin Components
import AdminStatsCards from './components/AdminStatsCards';
import TopAgentsTable from './components/TopAgentsTable';
import RecentTransactions from './components/RecentTransactions';

// Shared Components
import DateFilter from '../../../agent/agent_dashboard/components/DateFilter';
import SalesTrendChart from '../../../agent/agent_dashboard/components/SalesTrendChart';
import BrandPieChart from '../../../agent/agent_dashboard/components/BrandPieChart';
import LevelBarChart from '../../../agent/agent_dashboard/components/LevelBarChart';

import MenuAdmin from '@/components/element/MenuAdmin';

// ✅ Define Interface สำหรับข้อมูล Export (เพื่อไม่ต้องใช้ any)
interface ExportTransaction {
  createdAt: string;
  policy_number?: string;
  status: string;
  agent_id?: {
    first_name: string;
    last_name: string;
  };
  customer_id?: {
    first_name: string;
    last_name: string;
  };
  carInsurance_id?: {
    insuranceBrand: string;
    premium: number;
    level: string;
  };
}

const AdminDashboardPage = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState('last_30_days');

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Filter Logic
      let queryParams = "";
      const now = new Date();
      let startDate: Date | null = null;
      const endDate: Date | null = new Date(); 

      if (filter === 'this_year') {
           startDate = new Date(now.getFullYear(), 0, 1);
      } 
      // else if (filter === 'this_month') {
      //     startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      // } 
      else if (filter === 'last_30_days') {
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

  // -------------------------------------------------------
  // ✅ ฟังก์ชัน Export Excel (Strict Typed)
  // -------------------------------------------------------
  const handleExport = async () => {
    try {
      setExporting(true);

      // 1. เตรียม Query Params
      let queryParams = "";
      const now = new Date();
      let startDate: Date | null = null;
      const endDate: Date | null = new Date(); 

      if (filter === 'this_year') { 
           startDate = new Date(now.getFullYear(), 0, 1);
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

      // 2. 🚀 ยิง API เส้นใหม่ (รับข้อมูลเป็น Array ของ ExportTransaction)
      const res = await axios.get<ExportTransaction[]>(`http://localhost:5000/admin/dashboard/export${queryParams}`);
      const allTransactions = res.data;

      // 3. แปลงข้อมูลเป็น Excel (Type Safe)
      const transactionsData = allTransactions.map((tx) => ({
          'วันที่': new Date(tx.createdAt).toLocaleDateString('th-TH'),
          'เวลา': new Date(tx.createdAt).toLocaleTimeString('th-TH'),
          'เลขกรมธรรม์': tx.policy_number || '-',
          'Agent': `${tx.agent_id?.first_name || ''} ${tx.agent_id?.last_name || ''}`,
          'ลูกค้า': `${tx.customer_id?.first_name || ''} ${tx.customer_id?.last_name || ''}`,
          'แบรนด์ประกัน': tx.carInsurance_id?.insuranceBrand || '',
          'ประเภท': `ชั้น ${tx.carInsurance_id?.level || ''}`,
          'เบี้ยประกัน (บาท)': tx.carInsurance_id?.premium || 0,
          'สถานะ': tx.status
      }));

      // ข้อมูล Summary กับ Top Agents
      const summaryData = [
          { รายการ: 'รายได้รวมทั้งระบบ', ค่า: data?.summary.totalRevenue || 0 },
          { รายการ: 'จำนวนกรมธรรม์ทั้งหมด', ค่า: data?.summary.totalPolicies || 0 },
          { รายการ: 'ข้อมูล ณ วันที่', ค่า: new Date().toLocaleDateString('th-TH') }
      ];
      
      const topAgentsData = data?.topAgents.map(agent => ({
        'ชื่อ Agent': agent.name,
        'ยอดขายรวม (บาท)': agent.totalSales,
        'จำนวนกรมธรรม์ (ฉบับ)': agent.policiesCount
      })) || [];

      // สร้าง Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topAgentsData), "Top Agents");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(transactionsData), "All Transactions");
      
      // Download
      XLSX.writeFile(wb, `Full_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (error) {
      console.error("Export Error:", error);
      alert("เกิดข้อผิดพลาดในการ Export ข้อมูล");
    } finally {
      setExporting(false);
    }
  };

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

                  {/* ✅ ปุ่ม Export Excel */}
                  <button 
                      onClick={handleExport}
                      disabled={exporting}
                      className={`flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-sm ${exporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      title="Export All Data"
                  >
                      {exporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}
                      <span className="hidden sm:inline">{exporting ? 'กำลังโหลด...' : 'Export All'}</span>
                  </button>

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

          {/* 2. Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                  {data && data.salesTrend && <SalesTrendChart data={data.salesTrend} />}
              </div>
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                  {data && data.brandPreference && <BrandPieChart data={data.brandPreference} />}
              </div>
          </div>

          {/* 3. Detailed Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[450px]">
                  {data && data.levelStats && <LevelBarChart data={data.levelStats} />}
              </div>
              <div className="lg:col-span-1 h-[450px]">
                  {data && data.topAgents && <TopAgentsTable agents={data.topAgents} />}
              </div>
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