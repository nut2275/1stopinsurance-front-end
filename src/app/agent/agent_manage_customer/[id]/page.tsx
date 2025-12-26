'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MenuAgent from '@/components/element/MenuAgent';
import { 
  Loader2, Phone, Mail, Car, History, FileText, ArrowLeft, 
  ShieldCheck, Copy, ExternalLink, Plus, LucideIcon
} from 'lucide-react';

import api from '@/services/api'; 

// --- 1. Type Definitions (Strict Mode) ---

type TabType = 'garage' | 'history' | 'docs';

interface CustomerProfile {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  imgProfile_customer?: string;
  createdAt: string;
}

interface CarData {
  _id: string;
  brand: string;
  carModel: string;
  year: number;
  registration: string;
  province: string;
  color: string;
}

interface PurchaseHistory {
  _id: string;
  createdAt: string;
  policy_number?: string;
  status: string;
  carInsurance_id: {
    insuranceBrand: string;
    level: string;
    premium: number;
  };
  car_id: {
    registration: string;
    brand: string;
  };
}

interface CustomerStats {
  totalSpent: number;
  activePolicies: number;
  totalPolicies: number;
}

// Interface สำหรับ Response จาก API
interface CustomerDetailResponse {
  profile: CustomerProfile;
  garage: CarData[];
  history: PurchaseHistory[];
  stats: CustomerStats;
}

// Interface สำหรับ Tab Configuration
interface TabConfig {
  id: TabType;
  label: string;
  count?: number;
  icon: LucideIcon;
}

const AgentCustomerDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  
  // Type Assertion สำหรับ ID (เนื่องจาก params อาจจะเป็น string | string[])
  const customerId = typeof params.id === 'string' ? params.id : '';

  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('garage');
  
  // Data States (กำหนด Type ชัดเจน)
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [garage, setGarage] = useState<CarData[]>([]);
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [stats, setStats] = useState<CustomerStats>({ totalSpent: 0, activePolicies: 0, totalPolicies: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!customerId) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push('/login');
            return;
        }

        // Generic Type <CustomerDetailResponse> จะช่วยบอกว่า res.data มีหน้าตาเป็นยังไง
        const res = await api.get<CustomerDetailResponse>(`/agents/customer-profile/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data) {
            setProfile(res.data.profile);
            setGarage(res.data.garage || []);
            setHistory(res.data.history || []);
            setStats(res.data.stats || { totalSpent: 0, activePolicies: 0, totalPolicies: 0 });
        }
        
      } catch (error: unknown) {
        console.error("Error fetching customer detail:", error);
        // สามารถเพิ่ม Error Handling UI ได้ที่นี่
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, router]);

  const handleOfferInsurance = (car: CarData) => {
    const queryParams = new URLSearchParams();
    queryParams.append('brand', car.brand);
    queryParams.append('model', car.carModel);
    queryParams.append('year', car.year.toString());
    router.push(`/agent?${queryParams.toString()}`);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
        case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
        case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
        case 'expired': return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20';
        default: return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20';
    }
  };

  // Tabs Configuration Array (Strict Type)
  const tabs: TabConfig[] = [
    { id: 'garage', label: 'โรงรถ', count: garage.length, icon: Car },
    { id: 'history', label: 'ประวัติการซื้อ', count: history.length, icon: History },
    { id: 'docs', label: 'เอกสาร', icon: FileText }
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลลูกค้า...</p>
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500">
        <p className="text-lg font-medium">ไม่พบข้อมูลลูกค้า</p>
        <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:underline">ย้อนกลับ</button>
    </div>
  );

  return (
    <>
      <MenuAgent activePage='/agent/agent_manage_customer' />
      
      <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Breadcrumb / Back */}
            <nav className="flex items-center text-sm text-slate-500 mb-2">
                <button onClick={() => router.back()} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> ลูกค้าทั้งหมด
                </button>
                <span className="mx-2">/</span>
                <span className="text-slate-800 font-medium">รายละเอียดลูกค้า</span>
            </nav>

            {/* --- 1. Hero Header Card --- */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-indigo-50/80 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                    
                    {/* Left: Profile Info */}
                    <div className="flex-1 flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-slate-100 p-1 ring-4 ring-white shadow-lg">
                                {profile.imgProfile_customer ? (
                                    <img src={profile.imgProfile_customer} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-400">
                                        {profile.first_name[0]}
                                    </div>
                                )}
                            </div>
                            {stats.activePolicies > 0 && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Active Customer">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                                    {profile.first_name} {profile.last_name}
                                </h1>
                                <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-600">
                                        Customer ID: {profile._id.slice(-6).toUpperCase()} <Copy className="w-3 h-3 cursor-pointer hover:text-indigo-600"/>
                                    </span>
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 pt-1">
                                <a href={`tel:${profile.phone}`} className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Phone className="w-4 h-4"/>
                                    </div>
                                    <span className="font-medium">{profile.phone}</span>
                                </a>
                                {profile.email && (
                                    <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                                         <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Mail className="w-4 h-4"/>
                                        </div>
                                        <span className="font-medium">{profile.email}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Key Stats */}
                    <div className="flex gap-4 w-full lg:w-auto">
                        <div className="flex-1 lg:w-48 bg-gradient-to-br from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">ยอดซื้อรวม (LTV)</p>
                            <p className="text-2xl font-bold text-indigo-900">฿{stats.totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-indigo-400 mt-1">ตลอดอายุการเป็นสมาชิก</p>
                        </div>
                        <div className="flex-1 lg:w-48 bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">กรมธรรม์ Active</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-2xl font-bold text-emerald-900">{stats.activePolicies}</p>
                                <span className="text-sm text-emerald-700">ฉบับ</span>
                            </div>
                            <p className="text-xs text-emerald-400 mt-1">คุ้มครองปกติ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. Content Tabs --- */}
            <div className="space-y-6">
                
                {/* Modern Pill Tabs */}
                <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl w-fit border border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${activeTab === tab.id 
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                            `}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    
                    {/* --- GARAGE TAB --- */}
                    {activeTab === 'garage' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {garage.map((car) => (
                                <div key={car._id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden flex flex-col h-full">
                                    {/* Car Header */}
                                    <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{car.brand}</h3>
                                            <p className="text-slate-500 text-sm">{car.carModel}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                                            <Car className="w-5 h-5"/>
                                        </div>
                                    </div>

                                    {/* Car Details */}
                                    <div className="p-5 flex-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-400 text-xs mb-1">ปีรถยนต์</p>
                                                <p className="font-medium text-slate-700">{car.year}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs mb-1">สี</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full border border-slate-200 bg-gray-200 shadow-inner"></span>
                                                    <p className="font-medium text-slate-700">{car.color || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* License Plate Graphic */}
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20"></div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">ทะเบียนรถ</p>
                                            <h4 className="text-xl font-bold text-slate-800 tracking-wider font-mono">{car.registration}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{car.province}</p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="p-4 pt-0 mt-auto">
                                        <button 
                                            onClick={() => handleOfferInsurance(car)}
                                            className="w-full py-2.5 bg-white border border-indigo-600 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            เสนอราคาประกันใหม่
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {/* Empty State for Garage */}
                            {garage.length === 0 && (
                                <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-white border border-dashed border-slate-300 rounded-2xl">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Car className="w-8 h-8 opacity-40" />
                                    </div>
                                    <p className="font-medium text-slate-600">ยังไม่มีข้อมูลรถยนต์</p>
                                    <p className="text-sm mt-1">เพิ่มข้อมูลรถเพื่อเริ่มเสนอราคา</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- HISTORY TAB --- */}
                    {activeTab === 'history' && (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">วันที่ทำรายการ</th>
                                            <th className="px-6 py-4">แผนประกันภัย</th>
                                            <th className="px-6 py-4">รถยนต์ที่คุ้มครอง</th>
                                            <th className="px-6 py-4 text-right">เบี้ยประกัน</th>
                                            <th className="px-6 py-4 text-center">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-slate-700">
                                                        {new Date(item.createdAt).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric'})}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit'})} น.
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-800">{item.carInsurance_id?.insuranceBrand || 'N/A'}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                                                            ชั้น {item.carInsurance_id?.level || '-'}
                                                        </span>
                                                        {item.policy_number && (
                                                            <span className="text-xs text-slate-400 font-mono">{item.policy_number}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-700 font-medium">{item.car_id?.brand || 'ไม่ระบุ'}</div>
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                        <span className="bg-slate-100 px-1.5 rounded text-slate-500 border border-slate-200">{item.car_id?.registration || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                    ฿{(item.carInsurance_id?.premium || 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ring-1 ring-inset ${getStatusColor(item.status)} capitalize`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        {item.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {history.length === 0 && (
                                <div className="p-20 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <History className="w-8 h-8 text-slate-300"/>
                                    </div>
                                    <h3 className="text-slate-900 font-medium">ไม่มีประวัติการซื้อ</h3>
                                    <p className="text-slate-500 text-sm mt-1">ลูกค้าท่านนี้ยังไม่เคยทำรายการสั่งซื้อ</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- DOCUMENTS TAB --- */}
                    {activeTab === 'docs' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center gap-4 hover:border-indigo-400 hover:shadow-lg cursor-pointer transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">สำเนาบัตรประชาชน</h3>
                                    <p className="text-xs text-slate-400 mt-1">อัปเดตล่าสุด: เมื่อสักครู่</p>
                                </div>
                                <div className="mt-2 text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    เปิดดูเอกสาร <ExternalLink className="w-3 h-3"/>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default AgentCustomerDetailPage;