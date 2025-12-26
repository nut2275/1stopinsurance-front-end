import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Reuse Type หรือสร้างใหม่ก็ได้
interface LevelStat {
  _id: string;
  count: number;
  totalSales?: number;
}

interface Props {
  data: LevelStat[];
}

const LevelBarChart: React.FC<Props> = ({ data }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    // ✅ เพิ่ม h-full และ flex flex-col เพื่อให้การ์ดยืดเต็มความสูงพ่อแม่
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-1">ยอดขายแยกตามประเภท</h3>
      <p className="text-sm text-slate-500 mb-6">สัดส่วนกรมธรรม์แต่ละประเภท (ชั้น 1, 2+, 3)</p>
      
      {/* ✅ ส่วนกราฟใช้ flex-1 เพื่อให้กินพื้นที่ที่เหลือทั้งหมด */}
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="_id" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }} 
            />
            <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
};

export default LevelBarChart;