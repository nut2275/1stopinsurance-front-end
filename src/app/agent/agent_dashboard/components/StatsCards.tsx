import React from 'react';
import { Wallet, FileCheck, TrendingUp, Target } from 'lucide-react';
import { SummaryStats } from '../types';

interface Props {
  stats: SummaryStats;
}

const StatsCards: React.FC<Props> = ({ stats }) => {
  // คำนวณคอมมิชชั่นสมมติ (12%)
  const commission = stats.totalRevenue * 0.12;

  const cards = [
    {
      title: 'ยอดขายรวม',
      value: `฿${stats.totalRevenue.toLocaleString()}`,
      subtext: 'รายได้ทั้งหมดในช่วงนี้',
      icon: <Wallet className="w-6 h-6 text-white" />,
      bgIcon: 'bg-blue-500',
      border: 'border-l-4 border-blue-500'
    },
    {
      title: 'คอมมิชชั่น (โดยประมาณ)',
      value: `฿${commission.toLocaleString()}`,
      subtext: 'คิดที่เรท 12%',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      bgIcon: 'bg-emerald-500',
      border: 'border-l-4 border-emerald-500'
    },
    {
      title: 'กรมธรรม์ทั้งหมด',
      value: `${stats.totalPolicies}`,
      unit: 'ฉบับ',
      subtext: 'ที่อนุมัติแล้ว',
      icon: <FileCheck className="w-6 h-6 text-white" />,
      bgIcon: 'bg-violet-500',
      border: 'border-l-4 border-violet-500'
    },
    {
      title: 'Conversion Rate',
      value: '85%', // ตัวเลขสมมติเพื่อ UI
      subtext: 'เป้าหมายเดือนนี้',
      icon: <Target className="w-6 h-6 text-white" />,
      bgIcon: 'bg-orange-500',
      border: 'border-l-4 border-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow ${card.border}`}>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
            <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                {card.unit && <span className="text-sm text-slate-400">{card.unit}</span>}
            </div>
            <p className="text-xs text-slate-400 mt-2">{card.subtext}</p>
          </div>
          <div className={`p-3 rounded-lg shadow-sm ${card.bgIcon}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;