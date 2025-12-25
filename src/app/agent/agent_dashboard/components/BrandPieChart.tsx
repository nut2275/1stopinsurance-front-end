import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BrandStat } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface Props {
  data: BrandStat[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: BrandStat & { percent: string };
    value?: number;
    name?: string;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-left z-50">
        <p className="font-bold text-slate-800 mb-1">{data._id}</p>
        <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">จำนวน:</span>
            <span className="font-bold text-blue-600">{data.count} ฉบับ</span>
        </div>
        <div className="flex items-center gap-4 text-xs mt-1">
            <span className="text-slate-400">สัดส่วน:</span>
            <span className="font-medium text-slate-600">{data.percent}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const BrandPieChart: React.FC<Props> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const processedData = data.map(item => ({
    ...item,
    percent: total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
       <h3 className="text-lg font-bold text-slate-800 mb-2">สัดส่วนยอดขาย (แบ่งตามแบรนด์)</h3>
       <p className="text-sm text-slate-500 mb-4">บริษัทประกันที่ลูกค้าเลือกซื้อมากที่สุด</p>

       <div className="flex flex-col items-center justify-between flex-1 gap-6">
          
          <div className="relative w-48 h-48 flex-shrink-0">
             {/* ✅ 1. ย้ายตัวหนังสือมาไว้ตรงนี้ (ก่อน ResponsiveContainer) เพื่อให้มันอยู่เลเยอร์ล่างสุด */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-3xl font-bold text-slate-800">{total}</span>
                <span className="text-xs text-slate-400">ฉบับรวม</span>
             </div>

             {/* ✅ 2. กราฟ (ResponsiveContainer) จะมาทับตัวหนังสือ ทำให้ Tooltip ลอยเหนือตัวเลขได้ */}
             <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <PieChart>
                   <Pie
                      data={processedData as unknown as Record<string, string | number>[]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="count"
                      stroke="none"
                   >
                      {processedData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Pie>
                   <Tooltip content={<CustomTooltip />} />
                </PieChart>
             </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="w-full space-y-2 overflow-y-auto max-h-[150px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
             {processedData.length > 0 ? (
                 processedData.map((item, index) => (
                    <div key={item._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-default border border-transparent hover:border-slate-100">
                       <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <p className="text-sm font-medium text-slate-700 truncate" title={item._id}>
                             {item._id}
                          </p>
                       </div>
                       
                       <div className="flex items-center gap-3 text-right flex-shrink-0">
                          <span className="text-sm font-bold text-slate-900">{item.count}</span>
                          <span className="text-xs text-slate-400 w-12 text-right">({item.percent}%)</span>
                       </div>
                    </div>
                 ))
             ) : (
                 <p className="text-center text-slate-400 text-sm py-4">ยังไม่มีข้อมูลยอดขาย</p>
             )}
          </div>
       </div>
    </div>
  );
};

export default BrandPieChart;