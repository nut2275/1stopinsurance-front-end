import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { LevelStat } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

interface Props {
  data: LevelStat[];
}

const LevelBarChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[400px]">
      <h3 className="text-lg font-bold text-slate-800 mb-1">ยอดขายแยกตามประเภท</h3>
      <p className="text-sm text-slate-500 mb-6">สัดส่วนกรมธรรม์แต่ละประเภท (ชั้น 1, 2+, 3)</p>
      
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={50}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="_id" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            formatter={(value: number | string | Array<number | string> | undefined) => [
                `${value ?? 0} ฉบับ`, 
                'จำนวน'
            ]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LevelBarChart;