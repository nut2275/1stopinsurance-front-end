import React from 'react';
import { User, Trophy, Crown } from 'lucide-react';
import { TopCustomer } from '../types';

interface Props {
  customers: TopCustomer[];
}

const TopCustomers: React.FC<Props> = ({ customers }) => {
  // ฟังก์ชันเลือกสีเหรียญรางวัล
  const getRankStyle = (index: number) => {
    switch(index) {
        case 0: return 'bg-yellow-400 text-yellow-900 border-yellow-200 ring-4 ring-yellow-50'; // ทอง
        case 1: return 'bg-slate-300 text-slate-800 border-slate-200 ring-4 ring-slate-50';   // เงิน
        case 2: return 'bg-orange-400 text-orange-900 border-orange-200 ring-4 ring-orange-50'; // ทองแดง
        default: return 'bg-slate-100 text-slate-500 border-slate-200'; // ทั่วไป
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top Spender
         </h3>
         <p className="text-sm text-slate-500 mt-1">ลูกค้าที่มียอดซื้อสะสมสูงสุด 5 อันดับแรก</p>
      </div>
      
      {/* List Content */}
      <div className="p-2 overflow-y-auto">
        <div className="space-y-1">
            {customers.map((cust, index) => (
            <div key={cust._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                    {/* ลำดับ + รูป */}
                    <div className="relative pt-1 pl-1">
                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 ${index === 0 ? 'scale-110' : ''} transition-transform`}>
                            {cust.imgProfile ? (
                                <img src={cust.imgProfile} alt={cust.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500">
                                    <User className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                        {/* Rank Badge */}
                        <div className={`absolute -top-1 -left-1 w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-full border shadow-sm z-10 ${getRankStyle(index)}`}>
                            {index + 1}
                        </div>
                    </div>

                    {/* ชื่อ */}
                    <div>
                        <p className={`text-sm font-bold ${index === 0 ? 'text-slate-900 text-base' : 'text-slate-700'}`}>
                            {cust.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {cust.policiesCount} กรมธรรม์
                        </p>
                    </div>
                </div>

                {/* ยอดเงิน */}
                <div className="text-right">
                    <p className={`font-bold ${index === 0 ? 'text-blue-600 text-lg' : 'text-slate-700'}`}>
                        ฿{cust.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">ยอดสะสม</p>
                </div>
            </div>
            ))}
        </div>

        {customers.length === 0 && (
            <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
                ยังไม่มีข้อมูลการซื้อขาย
            </div>
        )}
      </div>
    </div>
  );
};

export default TopCustomers;