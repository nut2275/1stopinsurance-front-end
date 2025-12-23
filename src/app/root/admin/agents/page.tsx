'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Agent } from '@/types/agent'; 
import api from '@/services/api'; 
import { TabStatus, SortOrder, UpdateAgentResponse } from './types';

// Components
import AgentFilters from './components/AgentFilters';
import AgentTable from './components/AgentTable';
import EditAgentModal from './components/EditAgentModal';

// MenuAdmin import
import MenuAdmin from '@/components/element/MenuAdmin';

export default function AdminAgentManagement() {
  // --- States ---
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters State
  const [activeTab, setActiveTab] = useState<TabStatus>('in_review');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>(''); 
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Modal States
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // --- API Functions ---
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get<Agent[]>('/api/admin/agents'); 
      setAgents(res.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  // --- Handlers ---
  const handleApprove = async (id: string) => {
    if (!confirm('ยืนยันการอนุมัติตัวแทนท่านนี้?')) return;
    try {
      await api.put(`/api/admin/agents/verify/${id}`, { status: 'approved' });
      setAgents(prev => prev.map(a => a._id === id ? { ...a, verification_status: 'approved' } : a));
    } catch (error) { alert('เกิดข้อผิดพลาด'); }
  };

  const openRejectModal = (id: string) => {
    setSelectedAgentId(id);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedAgentId) return;
    try {
      await api.put(`/api/admin/agents/verify/${selectedAgentId}`, { status: 'rejected', note: rejectReason });
      setAgents(prev => prev.map(a => a._id === selectedAgentId ? { ...a, verification_status: 'rejected', note: rejectReason } : a));
      setIsRejectModalOpen(false);
    } catch (error) { alert('เกิดข้อผิดพลาด'); }
  };

  const openEditModal = (agent: Agent) => {
      setSelectedAgent(agent);
      setIsEditModalOpen(true);
  };

  const handleSaveAgent = async (updatedData: Partial<Agent>) => {
      if (!selectedAgent?._id) return;
      try {
          const res = await api.put<UpdateAgentResponse>(`/api/admin/agents/update/${selectedAgent._id}`, updatedData);
          const updatedAgent = res.data.data;
          setAgents(prev => prev.map(a => a._id === updatedAgent._id ? updatedAgent : a));
          alert('บันทึกข้อมูลเรียบร้อย');
      } catch (error) {
          console.error(error);
          alert('บันทึกไม่สำเร็จ');
          throw error; // Re-throw to let modal know it failed
      }
  };

  const resetFilters = () => {
      setSearchTerm('');
      setFilterDate('');
      setSortOrder('newest');
  };

  // --- Logic การกรองข้อมูล ---
  const filteredAgents = agents.filter(agent => {
    const matchesTab = activeTab === 'all' || agent.verification_status === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (agent.first_name || '').toLowerCase().includes(searchLower) ||
      (agent.last_name || '').toLowerCase().includes(searchLower) ||
      (agent.agent_license_number || '').includes(searchTerm);

    let matchesDate = true;
    if (filterDate) {
        const agentDate = new Date(agent.createdAt).toISOString().split('T')[0];
        matchesDate = agentDate === filterDate;
    }
    
    return matchesTab && matchesSearch && matchesDate;
  }).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const tabs: { key: TabStatus; label: string; count: number }[] = [
    { key: 'in_review', label: 'รอตรวจสอบ', count: agents.filter(a => a.verification_status === 'in_review').length },
    { key: 'approved', label: 'อนุมัติแล้ว', count: agents.filter(a => a.verification_status === 'approved').length },
    { key: 'rejected', label: 'ไม่ผ่าน', count: agents.filter(a => a.verification_status === 'rejected').length },
    { key: 'all', label: 'ทั้งหมด', count: agents.length },
  ];

  return (
    <>
      <MenuAdmin activePage='/root/admin/agents' />
      <div className="min-h-screen bg-gray-50/50 p-6 font-sans text-slate-800">
        
        {/* Page Header */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">จัดการข้อมูลตัวแทน</h1>
            <p className="text-slate-500 text-sm mt-1">ระบบตรวจสอบ แก้ไข และอนุมัติใบสมัครตัวแทนประกันภัย</p>
        </div>

        {/* Filters */}
        <AgentFilters 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filterDate={filterDate} setFilterDate={setFilterDate}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          onReset={resetFilters}
        />

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-0 border-b border-slate-200 overflow-x-auto no-scrollbar px-2">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.key ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-slate-200 border-t-0 overflow-hidden">
          <AgentTable 
              agents={filteredAgents} 
              loading={loading}
              onEdit={openEditModal}
              onApprove={handleApprove}
              onReject={openRejectModal}
              onClearFilters={resetFilters}
          />
        </div>

        {/* Reject Modal (ยังเล็กอยู่เลยไม่แยกไฟล์ก็ได้ หรือจะแยกก็ได้) */}
        {isRejectModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-down border border-slate-100">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-red-50 p-3 rounded-xl text-red-600 border border-red-100"><ShieldAlert size={24} /></div>
                  <div><h3 className="text-lg font-bold text-slate-900">ปฏิเสธคำขอสมัครตัวแทน</h3><p className="text-sm text-slate-500 mt-1">การดำเนินการนี้จะไม่สามารถย้อนกลับได้ กรุณาระบุเหตุผล</p></div>
                </div>
                <div className="mb-6">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">เหตุผลการปฏิเสธ</label>
                  <textarea className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all" rows={4} placeholder="เช่น เอกสารไม่ชัดเจน..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}></textarea>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setIsRejectModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors">ยกเลิก</button>
                  <button onClick={handleRejectConfirm} disabled={!rejectReason.trim()} className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium text-sm shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:shadow-none transition-all">ยืนยันการปฏิเสธ</button>
                </div>
            </div>
          </div>
        )}

        {/* Edit Modal (แยกไปแล้ว) */}
        <EditAgentModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          agent={selectedAgent}
          onSave={handleSaveAgent}
        />

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        `}</style>
      </div>
    </>
  );
}