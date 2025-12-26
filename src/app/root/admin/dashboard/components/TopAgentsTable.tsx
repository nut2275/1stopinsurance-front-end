import React from 'react';
import { Trophy, User } from 'lucide-react';
import { TopAgent } from '../types';

interface Props {
  agents: TopAgent[];
}

const TopAgentsTable: React.FC<Props> = ({ agents }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Performing Agents
        </h3>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                    <th className="px-4 py-3">อันดับ</th>
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3 text-right">ยอดขาย</th>
                    <th className="px-4 py-3 text-center">จำนวน (ใบ)</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {agents.map((agent, index) => (
                    <tr key={agent._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                            <span className={`
                                inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                  index === 1 ? 'bg-slate-200 text-slate-700' : 
                                  index === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-400 bg-slate-100'}
                            `}>
                                {index + 1}
                            </span>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                    {agent.imgProfile ? (
                                        <img src={agent.imgProfile} alt={agent.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-4 h-4"/></div>
                                    )}
                                </div>
                                <span className="font-medium text-slate-700">{agent.name}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-600">
                            ฿{agent.totalSales.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                            {agent.policiesCount}
                        </td>
                    </tr>
                ))}
                {agents.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-slate-400">ยังไม่มีข้อมูลยอดขาย</td></tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopAgentsTable;