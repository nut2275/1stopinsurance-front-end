import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SalesTrendStat } from '../types';

interface Props {
  data: SalesTrendStat[];
}

const SalesTrendChart: React.FC<Props> = ({ data }) => {
  return (
    // ✅ เปลี่ยนจาก h-[400px] เป็น h-full min-h-[400px] เพื่อให้ยืดตามเพื่อนข้างๆ (BrandPieChart)
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
            <h3 className="text-lg font-bold text-slate-800">แนวโน้มยอดขาย (Sales Trend)</h3>
            <p className="text-sm text-slate-500">ภาพรวมรายได้รายวัน</p>
        </div>
      </div>
      
      {/* flex-1 เพื่อให้กราฟยืดเต็มพื้นที่ที่เหลือในกล่อง */}
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
            <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="_id" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(str) => {
                    const date = new Date(str);
                    return !isNaN(date.getTime()) 
                    ? date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) 
                    : str;
                }}
                dy={10}
            />
            <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`} 
                dx={-10}
            />
            
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}
                cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                formatter={(value: number | string | Array<number | string> | undefined) => {
                    const val = Number(value) || 0;
                    return [`฿${val.toLocaleString()}`, 'ยอดขาย'];
                }}
                labelFormatter={(label) => {
                    const date = new Date(label);
                    return !isNaN(date.getTime()) 
                        ? date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
                        : label;
                }}
            />
            
            <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSales)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
            />
            </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesTrendChart;