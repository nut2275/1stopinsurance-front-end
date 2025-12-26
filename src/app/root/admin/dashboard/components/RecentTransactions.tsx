import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { RecentTransaction } from '../types';

interface Props {
  transactions: RecentTransaction[];
}

const RecentTransactions: React.FC<Props> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            ธุรกรรมล่าสุด (Real-time Feed)
        </h3>
      </div>
      <div className="divide-y divide-slate-100 overflow-y-auto flex-1 max-h-[400px]">
        {transactions.map((tx) => (
            <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                     {/* Agent Info */}
                    <div className="flex flex-col items-center min-w-[40px]">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 overflow-hidden">
                            {tx.agent_id.imgProfile ? <img src={tx.agent_id.imgProfile} alt="agent" className="w-full h-full object-cover"/> : tx.agent_id.first_name[0]}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Agent</span>
                    </div>

                    <div className="text-slate-300"><ArrowRight className="w-4 h-4"/></div>

                    {/* Transaction Info */}
                    <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">
                            {tx.carInsurance_id.insuranceBrand}
                        </p>
                        <p className="text-xs text-slate-500">
                            ลูกค้า: {tx.customer_id.first_name} {tx.customer_id.last_name}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                        +฿{tx.carInsurance_id.premium.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}
                    </p>
                </div>
            </div>
        ))}
        {transactions.length === 0 && (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">ยังไม่มีรายการเคลื่อนไหว</div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;