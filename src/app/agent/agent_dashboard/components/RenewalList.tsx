import React from 'react';
import { CalendarClock, Phone, AlertCircle, Car } from 'lucide-react';
import { RenewingCustomer } from '../types';

interface Props {
  customers: RenewingCustomer[];
}

const RenewalList: React.FC<Props> = ({ customers }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-red-500" />
            แจ้งเตือนต่ออายุ
            </h3>
            <p className="text-sm text-slate-500 mt-1">รายการที่หมดอายุภายใน 30-60 วัน</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
            {customers.length} รายการ
        </span>
      </div>

      {/* List Content */}
      <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
        {customers.length > 0 ? (
          customers.map((item) => {
             // คำนวณวันเหลือ (Logic เสริมเพื่อ UX)
             const endDate = item.end_date ? new Date(item.end_date) : new Date();
             const today = new Date();
             const diffTime = Math.abs(endDate.getTime() - today.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             
             return (
                <div key={item._id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4">
                    {/* รูปโปรไฟล์ */}
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                        {item.customer_id.imgProfile_customer ? (
                            <img src={item.customer_id.imgProfile_customer} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold">?</div>
                        )}
                    </div>
                    
                    {/* ข้อมูล */}
                    <div>
                    <h4 className="font-bold text-slate-800 text-sm md:text-base">
                        {item.customer_id.first_name} {item.customer_id.last_name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                            <Car className="w-3 h-3" /> 
                            {item.car_id.brand}
                        </span>
                        <span>{item.car_id.registration}</span>
                    </div>
                    </div>
                </div>

                {/* Status & Action */}
                <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                        <span className="text-[10px] font-medium text-slate-400 uppercase">หมดอายุ</span>
                        <p className="text-sm font-bold text-red-600 leading-none mt-1">
                            {item.end_date ? new Date(item.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-'}
                        </p>
                    </div>
                    
                    {/* ปุ่มโทร (โผล่เมื่อ Hover หรือจอเล็ก) */}
                    <button 
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
                        title="โทรหาลูกค้า"
                    >
                        <Phone className="w-3 h-3" />
                        <span className="hidden md:inline">โทรติดตาม</span>
                    </button>
                </div>
                </div>
             );
          })
        ) : (
          // Empty State
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">ไม่มีลูกค้าที่ต้องต่ออายุเร็วๆ นี้</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenewalList;