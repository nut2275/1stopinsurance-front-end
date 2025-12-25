import React from 'react';
import { CreditCard, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { StatusStat } from '../types';

interface Props {
  stats: StatusStat[];
}

const TaskSummary: React.FC<Props> = ({ stats }) => {
  const statusMap = stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  // ✅ เรียงลำดับใหม่ตามที่ขอ
  const items = [
    {
      id: 'pending', // สถานะรอตรวจสอบ (Verification)
      label: 'รอตรวจสอบเอกสาร', // ✅ เปลี่ยนชื่อให้ชัดเจน
      count: statusMap['pending'] || 0,
      icon: <Clock className="w-6 h-6" />,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-100',
      borderClass: 'group-hover:border-blue-200'
    },
    {
      id: 'pending_payment', // สถานะรอจ่ายเงิน
      label: 'รอชำระเงิน',
      count: statusMap['pending_payment'] || 0,
      icon: <CreditCard className="w-6 h-6" />,
      colorClass: 'text-orange-600',
      bgClass: 'bg-orange-100',
      borderClass: 'group-hover:border-orange-200'
    },
    {
      id: 'active', // สถานะคุ้มครอง
      label: 'คุ้มครองแล้ว',
      count: statusMap['active'] || 0,
      icon: <CheckCircle2 className="w-6 h-6" />,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-100',
      borderClass: 'group-hover:border-emerald-200'
    },
    {
      id: 'rejected', // สถานะถูกปฏิเสธ
      label: 'ถูกปฏิเสธ',
      count: statusMap['rejected'] || 0,
      icon: <XCircle className="w-6 h-6" />,
      colorClass: 'text-red-600',
      bgClass: 'bg-red-100',
      borderClass: 'group-hover:border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item) => (
        <div 
            key={item.id} 
            className={`group bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer flex items-center justify-between ${item.borderClass}`}
        >
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{item.label}</p>
            <h4 className={`text-3xl font-bold ${item.colorClass}`}>{item.count}</h4>
          </div>
          
          <div className={`p-3 rounded-full ${item.bgClass} ${item.colorClass} bg-opacity-50`}>
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskSummary;