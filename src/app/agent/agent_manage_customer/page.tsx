'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MenuAgent from '@/components/element/MenuAgent';
import { Loader2, Search, User, Phone, Car, ShieldCheck, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

import { routesAgentsSession } from '@/routes/session'; // ✅ นำเข้าฟังก์ชันตรวจสอบ Session ถ้าจำเป็น


// ✅ Import api ที่คุณสร้างไว้ (เช็ค Path ให้ถูกนะครับว่า services อยู่ตรงไหน)
import api from '@/services/api'; 


interface CustomerList {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  imgProfile_customer?: string;
  totalCars: number;       
  activePolicies: number;  
  lastPurchaseDate: string | null;
}

const AgentManageCustomerPage = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const session = routesAgentsSession();
      if (!session) {
         router.push('/agent/login'); // เปลี่ยน path ตามที่คุณใช้จริง
         return;
      }
      const agentId = session.id;

      if (!agentId) {
        console.error("Token invalid: Missing Agent ID");
        router.push('/agent/login');
        return;
      }

      // ✅ ใช้ api.get แทน axios.get
      // ✅ ตัด http://localhost:5000 ออก เพราะอยู่ใน api.ts แล้ว
      // ✅ แก้ Path เป็น 'agents' (เติม s) ตามที่คุณแจ้ง
      const res = await api.get<CustomerList[]>(`/agents/my-customers/${agentId}?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${session}` } // (Optional: ถ้าใน api.ts ใส่ interceptor แล้วก็ไม่ต้องใส่ตรงนี้ซ้ำ)
      });

      setCustomers(res.data);

    } catch (error: unknown) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <>
      <MenuAgent activePage='/agent/agent_manage_customer' />

      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ลูกค้าของฉัน</h1>
              <p className="text-slate-500 mt-1">บริหารจัดการข้อมูลลูกค้า ประวัติ และยานพาหนะ</p>
            </div>
            
            {/* <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
                <Plus className="w-4 h-4" /> เพิ่มลูกค้าใหม่
            </button> */}
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
             <Search className="w-5 h-5 text-slate-400" />
             <input 
                type="text" 
                placeholder="ค้นหาชื่อ, เบอร์โทร, หรืออีเมล..." 
                className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          {/* Table List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-slate-400 text-sm">กำลังโหลดรายชื่อ...</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                                <th className="px-6 py-4 font-medium">ชื่อลูกค้า</th>
                                <th className="px-6 py-4 font-medium">เบอร์โทร / ติดต่อ</th>
                                <th className="px-6 py-4 font-medium text-center">ยานพาหนะ</th>
                                <th className="px-6 py-4 font-medium text-center">กรมธรรม์ Active</th>
                                <th className="px-6 py-4 font-medium text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.map((customer) => (
                                <tr key={customer._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                {customer.imgProfile_customer ? (
                                                    <img src={customer.imgProfile_customer} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{customer.first_name} {customer.last_name}</p>
                                                <p className="text-xs text-slate-400">{customer.email || '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm">{customer.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-slate-600 text-xs font-bold">
                                            <Car className="w-3 h-3" /> {customer.totalCars} คัน
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {customer.activePolicies > 0 ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                                                <ShieldCheck className="w-3 h-3" /> {customer.activePolicies} ฉบับ
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={`/agent/agent_manage_customer/${customer._id}`}
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors"
                                        >
                                            ดูข้อมูล <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400">
                                        ไม่พบข้อมูลลูกค้า
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentManageCustomerPage;