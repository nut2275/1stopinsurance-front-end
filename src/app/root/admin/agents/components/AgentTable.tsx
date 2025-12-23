import React from 'react';
import { Edit, CheckCircle, XCircle, User, Calendar, Filter } from 'lucide-react';
import { Agent } from '@/types/agent';
import { formatDate } from '../utils';
import StatusBadge from './StatusBadge';

interface AgentTableProps {
    agents: Agent[];
    loading: boolean;
    onEdit: (agent: Agent) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onClearFilters: () => void;
}

const AgentTable: React.FC<AgentTableProps> = ({ agents, loading, onEdit, onApprove, onReject, onClearFilters }) => {
    
    if (loading) {
        return (
            <div className="p-6 space-y-4">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse flex items-center px-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full mr-4"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/6"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (agents.length === 0) {
        return (
            <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300"><Filter size={40} /></div>
                <h3 className="text-lg font-semibold text-slate-700">ไม่พบข้อมูลตัวแทน</h3>
                <p className="text-slate-400 text-sm mt-1">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรอง</p>
                <button onClick={onClearFilters} className="mt-4 text-blue-600 hover:underline text-sm font-medium">ล้างตัวกรองทั้งหมด</button>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                        <th className="px-6 py-4">ตัวแทน</th>
                        <th className="px-6 py-4">ข้อมูลใบอนุญาต</th>
                        <th className="px-6 py-4">วันที่สมัคร</th>
                        <th className="px-6 py-4 text-center">สถานะ</th>
                        <th className="px-6 py-4 text-right">ดำเนินการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {agents.map((agent) => (
                        <tr key={agent._id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                        {agent.imgProfile ? <img src={agent.imgProfile} className="w-full h-full object-cover" alt="Profile" /> : <User size={20} className="text-slate-400"/>}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{agent.first_name} {agent.last_name}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>User: {agent.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-mono font-medium text-slate-700">{agent.agent_license_number}</span>
                                    <span className="text-xs text-slate-400 mt-1">หมดอายุ: {formatDate(agent.card_expiry_date)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2 bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100"><Calendar size={14} className="text-slate-400" />{formatDate(agent.createdAt)}</div>
                            </td>
                            <td className="px-6 py-4 text-center"><StatusBadge status={agent.verification_status} /></td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEdit(agent)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไขข้อมูล"><Edit size={18} /></button>
                                    <div className="w-px h-5 bg-slate-200 mx-1"></div>
                                    
                                    {(agent.verification_status === 'in_review' || agent.verification_status === 'rejected') && (
                                        <button onClick={() => onApprove(agent._id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="อนุมัติ">
                                            <CheckCircle size={20} />
                                        </button>
                                    )}
                                    {(agent.verification_status === 'in_review' || agent.verification_status === 'approved') && (
                                        <button onClick={() => onReject(agent._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ปฏิเสธ">
                                            <XCircle size={20} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AgentTable;