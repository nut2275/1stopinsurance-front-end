import React from 'react';
import { StatusBadgeProps } from '../types';

interface BadgeStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs: Record<string, BadgeStyle> = {
    in_review: { label: "รอตรวจสอบ", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
    approved: { label: "อนุมัติ", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    rejected: { label: "ไม่ผ่าน", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
  };
  const c = configs[status] || { label: status, bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
       <span className={`w-1.5 h-1.5 rounded-full mr-2 ${c.dot}`}></span>
       {c.label}
    </span>
  );
};

export default StatusBadge;