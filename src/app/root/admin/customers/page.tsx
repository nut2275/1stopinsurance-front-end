'use client';

import React, { useEffect, useState, useRef } from 'react';
import MenuAdmin from '@/components/element/MenuAdmin';
import { 
    Loader2, Search, User, Car, ShieldCheck, Edit3, UserCog, 
    X, Briefcase, ChevronDown, ChevronLeft, ChevronRight, 
    CheckCircle2, Clock, AlertTriangle, XCircle, Check, ListFilter
} from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

// ... (Interfaces เดิม)
interface CustomerAdminView {
    _id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    imgProfile_customer?: string;
    totalCars: number;
    activePolicies: number;
    agents?: { first_name: string; last_name: string; }[];
}

interface AgentOption {
    _id: string;
    first_name: string;
    last_name: string;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const AdminCustomerListPage = () => {
  const [customers, setCustomers] = useState<CustomerAdminView[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  
  // UI States
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState(''); 
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Fetch Agents
  useEffect(() => {
      const fetchAgents = async () => {
          try {
              const res = await api.get('/admin/agents-dropdown'); 
              setAgents(res.data);
          } catch (error) { console.error("Failed to load agents"); }
      };
      fetchAgents();
  }, []);

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (agentFilter) params.append('agentId', agentFilter);

      const res = await api.get(`/admin/customers?${params.toString()}`);
      
      setCustomers(res.data.data);
      setPagination(res.data.pagination);

    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if(page !== 1) setPage(1); 
      else fetchCustomers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, agentFilter]);

  useEffect(() => { fetchCustomers(); }, [page]);

  // Helpers UI
  const getStatusLabel = () => {
      switch(statusFilter) {
          case 'active': return { label: 'ประกัน Active', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500"/>, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
          case 'pending': return { label: 'รอชำระเงิน', icon: <Clock className="w-4 h-4 text-amber-500"/>, color: 'text-amber-700 bg-amber-50 border-amber-200' };
          case 'expired': return { label: 'หมดอายุ', icon: <AlertTriangle className="w-4 h-4 text-red-500"/>, color: 'text-red-700 bg-red-50 border-red-200' };
          case 'never': return { label: 'ไม่เคยซื้อ', icon: <XCircle className="w-4 h-4 text-slate-400"/>, color: 'text-slate-600 bg-slate-100 border-slate-200' };
          default: return { label: 'สถานะทั้งหมด', icon: <ShieldCheck className="w-4 h-4 text-slate-500"/>, color: 'text-slate-700 bg-white border-slate-200' };
      }
  };

  const filteredAgents = agents.filter(agent => 
    agent.first_name.toLowerCase().includes(agentSearchTerm.toLowerCase()) ||
    agent.last_name.toLowerCase().includes(agentSearchTerm.toLowerCase())
  );

  const selectedAgentObj = agents.find(a => a._id === agentFilter);
  const selectedStatus = getStatusLabel();

  return (
    <>
      <MenuAdmin activePage='/root/admin/customers' />

      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans" onClick={() => { setIsStatusOpen(false); setIsAgentOpen(false); }}>
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <UserCog className="w-8 h-8 text-indigo-600" />
                จัดการข้อมูลลูกค้า (Global)
              </h1>
              <p className="text-slate-500 mt-1">ดูรายชื่อ ตรวจสอบสถานะ และจัดการข้อมูลลูกค้าทั้งระบบ</p>
            </div>
          </div>

          {/* --- Advanced Filter Bar --- */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 relative z-20">
             
             {/* 1. Search Main */}
             <div className="flex items-center gap-3 flex-[2] w-full bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..." 
                    className="flex-1 outline-none bg-transparent text-slate-700 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && <X className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => setSearchTerm('')} />}
             </div>

             {/* 2. Status Dropdown */}
             <div className="flex-[1] w-full relative" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => { setIsStatusOpen(!isStatusOpen); setIsAgentOpen(false); }}
                    className={`w-full px-3 py-2.5 rounded-lg border flex items-center justify-between transition-all ${selectedStatus.color}`}
                >
                    <div className="flex items-center gap-2">
                        {selectedStatus.icon}
                        <span className="text-sm font-medium">{selectedStatus.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}/>
                </button>

                {isStatusOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Options */}
                        <div onClick={() => { setStatusFilter(''); setIsStatusOpen(false); }} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-2 text-sm text-slate-600"><ShieldCheck className="w-4 h-4"/> สถานะทั้งหมด</div>
                        <div onClick={() => { setStatusFilter('active'); setIsStatusOpen(false); }} className="px-4 py-2.5 hover:bg-emerald-50 cursor-pointer flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="w-4 h-4"/> ประกัน Active</div>
                        <div onClick={() => { setStatusFilter('pending'); setIsStatusOpen(false); }} className="px-4 py-2.5 hover:bg-amber-50 cursor-pointer flex items-center gap-2 text-sm text-amber-700"><Clock className="w-4 h-4"/> รอชำระเงิน</div>
                        <div onClick={() => { setStatusFilter('expired'); setIsStatusOpen(false); }} className="px-4 py-2.5 hover:bg-red-50 cursor-pointer flex items-center gap-2 text-sm text-red-700"><AlertTriangle className="w-4 h-4"/> หมดอายุ</div>
                        <div onClick={() => { setStatusFilter('never'); setIsStatusOpen(false); }} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-2 text-sm text-slate-500"><XCircle className="w-4 h-4"/> ไม่เคยซื้อ</div>
                    </div>
                )}
             </div>

             {/* 3. Agent Dropdown */}
             <div className="flex-[1] w-full relative" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => { setIsAgentOpen(!isAgentOpen); setIsStatusOpen(false); setTimeout(() => document.getElementById('agent-search-input')?.focus(), 100); }}
                    className={`w-full px-3 py-2.5 rounded-lg border flex items-center justify-between transition-all bg-white border-slate-200 hover:border-indigo-300 ${isAgentOpen ? 'ring-2 ring-indigo-500/20 border-indigo-400' : ''}`}
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Briefcase className={`w-4 h-4 ${agentFilter ? 'text-indigo-600' : 'text-slate-400'}`}/>
                        <span className={`text-sm truncate ${agentFilter ? 'font-medium text-indigo-700' : 'text-slate-600'}`}>
                            {selectedAgentObj ? `${selectedAgentObj.first_name} ${selectedAgentObj.last_name}` : 'Agent ทุกคน'}
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isAgentOpen ? 'rotate-180' : ''}`}/>
                </button>

                {isAgentOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col max-h-[300px]">
                        <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/>
                                <input id="agent-search-input" type="text" placeholder="พิมพ์ชื่อ Agent..." className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors bg-white placeholder:text-slate-400 text-slate-700" value={agentSearchTerm} onChange={(e) => setAgentSearchTerm(e.target.value)} autoComplete="off" />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <div onClick={() => { setAgentFilter(''); setIsAgentOpen(false); setAgentSearchTerm(''); }} className={`px-4 py-2.5 cursor-pointer flex items-center justify-between text-sm transition-colors ${agentFilter === '' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}>
                                <span>แสดงทุกคน</span>
                                {agentFilter === '' && <Check className="w-4 h-4"/>}
                            </div>
                            {filteredAgents.length > 0 ? (
                                filteredAgents.map(agent => (
                                    <div key={agent._id} onClick={() => { setAgentFilter(agent._id); setIsAgentOpen(false); setAgentSearchTerm(''); }} className={`px-4 py-2.5 cursor-pointer flex items-center justify-between text-sm transition-colors border-t border-slate-50 ${agentFilter === agent._id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}>
                                        <span className="truncate">{agent.first_name} {agent.last_name}</span>
                                        {agentFilter === agent._id && <Check className="w-4 h-4"/>}
                                    </div>
                                ))
                            ) : (<div className="p-4 text-center text-xs text-slate-400">ไม่พบรายชื่อ</div>)}
                        </div>
                    </div>
                )}
             </div>

             {(statusFilter || agentFilter) && (
                 <button onClick={() => { setStatusFilter(''); setAgentFilter(''); }} className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap font-medium">ล้างตัวกรอง</button>
             )}
          </div>

          {/* Table List Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
             
             {/* ✅ [เพิ่ม] Header ของตาราง (แสดงยอดรวมตรงนี้!) */}
             <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                 <div className="flex items-center gap-2">
                    <ListFilter className="w-5 h-5 text-slate-400"/>
                    <span className="font-bold text-slate-700">รายชื่อลูกค้า</span>
                    {pagination && (
                        <span className="ml-2 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">
                            {pagination.total.toLocaleString()} คน
                        </span>
                    )}
                 </div>
                 
                 {/* Summary Text (Showing X-Y of Z) */}
                 {pagination && (
                    <p className="text-xs text-slate-500">
                        แสดงลำดับที่ {pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </p>
                 )}
             </div>

             {/* Content */}
             <div className="flex-1 overflow-x-auto">
                 {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <p className="text-slate-400 text-sm">กำลังโหลดข้อมูล...</p>
                    </div>
                 ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                                <th className="px-6 py-4 font-medium">ลูกค้า</th>
                                <th className="px-6 py-4 font-medium">ติดต่อ</th>
                                <th className="px-6 py-4 font-medium">Agent ที่ดูแล</th>
                                <th className="px-6 py-4 font-medium text-center">สถานะ</th>
                                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.map((customer) => (
                                <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                {customer.imgProfile_customer ? (
                                                    <img src={customer.imgProfile_customer} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <p className="font-bold text-slate-800">{customer.first_name} {customer.last_name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="flex flex-col">
                                            <span>{customer.phone}</span>
                                            <span className="text-slate-400 text-xs">{customer.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {customer.agents && customer.agents.length > 0 ? (
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-sm text-slate-700">{customer.agents[0].first_name} {customer.agents[0].last_name}</span>
                                                {customer.agents.length > 1 && (
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{customer.agents.length - 1} คนอื่น</span>
                                                )}
                                            </div>
                                        ) : <span className="text-xs text-slate-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <div className="flex items-center justify-center gap-2">
                                            <div className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 flex items-center gap-1" title="จำนวนรถ">
                                                <Car className="w-3 h-3"/> {customer.totalCars}
                                            </div>
                                            {customer.activePolicies > 0 && (
                                                <div className="px-2 py-1 bg-emerald-100 rounded text-xs font-bold text-emerald-700 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3"/> Active
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/root/admin/customers/${customer._id}`} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                                            <Edit3 className="w-4 h-4" /> ดู/แก้ไข
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-400">ไม่พบข้อมูลลูกค้า</td></tr>
                            )}
                        </tbody>
                    </table>
                 )}
             </div>

             {/* Footer: Pagination Only (เพราะยอดรวมไปอยู่ข้างบนแล้ว) */}
             {pagination && (
                <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-white">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={pagination.page === 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
                        >
                            ถัดไป <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
             )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCustomerListPage;