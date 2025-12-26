import React from 'react';
import { Wallet, FileText, Users, AlertCircle } from 'lucide-react';
import { AdminSummary, StatusStat } from '../types';

interface Props {
  summary: AdminSummary;
  statusStats: StatusStat[];
}

const AdminStatsCards: React.FC<Props> = ({ summary, statusStats }) => {
  // Safe Find: หา count ของ status 'pending' ถ้าไม่เจอให้เป็น 0
  const pendingStat = statusStats.find((s) => s._id === 'pending');
  const pendingCount = pendingStat ? pendingStat.count : 0;

  const cards = [
    {
      title: 'รายได้รวมทั้งระบบ',
      value: `฿${summary.totalRevenue.toLocaleString()}`,
      subtext: 'ยอดขายจาก Agent ทุกคน',
      icon: <Wallet className="w-6 h-6 text-white" />,
      bg: 'bg-indigo-500',
      border: 'border-indigo-500'
    },
    {
      title: 'กรมธรรม์ทั้งหมด',
      value: `${summary.totalPolicies}`,
      unit: 'ฉบับ',
      subtext: 'ที่ขายสำเร็จแล้ว',
      icon: <FileText className="w-6 h-6 text-white" />,
      bg: 'bg-blue-500',
      border: 'border-blue-500'
    },
    {
      title: 'Active Agents',
      value: `${summary.activeAgentsCount}`,
      unit: 'คน',
      subtext: 'Agent ที่มียอดขายช่วงนี้',
      icon: <Users className="w-6 h-6 text-white" />,
      bg: 'bg-emerald-500',
      border: 'border-emerald-500'
    },
    {
      title: 'รออนุมัติ (Global)',
      value: `${pendingCount}`,
      unit: 'รายการ',
      subtext: 'งานค้างทั้งระบบที่ต้องตรวจ',
      icon: <AlertCircle className="w-6 h-6 text-white" />,
      bg: 'bg-orange-500',
      border: 'border-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${card.border} flex justify-between items-start hover:shadow-md transition-shadow`}>
          <div>
            <p className="text-slate-500 text-sm font-medium">{card.title}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                {card.unit && <span className="text-sm text-slate-400">{card.unit}</span>}
            </div>
            <p className="text-xs text-slate-400 mt-2">{card.subtext}</p>
          </div>
          <div className={`p-3 rounded-lg ${card.bg} shadow-sm`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsCards;