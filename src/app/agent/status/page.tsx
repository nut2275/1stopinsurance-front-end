'use client';

import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, Clock, FileText, AlertCircle, LogOut, 
  User, Calendar, CreditCard, MapPin, Phone, ShieldCheck,
  Ticket, Users, LucideIcon 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode"; // ✅ Import jwt-decode

// Import Services และ Types
import { getAgentStatus, AgentWithQueue } from '@/services/agentService'; 

// ✅ Interface สำหรับ Token ที่ Decode ออกมา
interface DecodedToken {
  id: string;
  username: string;
  role: string;
  exp: number;
}

// Utility Function: แปลงวันที่
const formatDate = (dateInput: string | Date | undefined) => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Interface Props
interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value?: string | number;
  isMono?: boolean;
  className?: string;
}

export default function AgentStatusPage() {
  const router = useRouter();
  
  const [agentData, setAgentData] = useState<AgentWithQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ดึง Token
        const token = localStorage.getItem("token");

        // ถ้าไม่มี Token ให้ดีดกลับไป Login
        if (!token) {
          router.push('/agent/login');
          return;
        }

        // 2. Decode Token เพื่อหา ID ✅ (ตามที่คุณขอ)
        const decoded = jwtDecode<DecodedToken>(token);
        
        if (decoded && decoded.id) {
          // 3. ใช้ ID ที่ได้จาก Token ไปดึงข้อมูลล่าสุด
          const freshData = await getAgentStatus(decoded.id);
          setAgentData(freshData);
        } else {
            throw new Error("Token ไม่ถูกต้อง");
        }

      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Session หมดอายุหรือไม่สามารถดึงข้อมูลได้");
        // กรณี Token พัง หรือหมดอายุ อาจจะล้างทิ้งแล้วให้ Login ใหม่
        localStorage.removeItem('token');
        // router.push('/login'); // หรือจะ redirect เลยก็ได้
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Loading State
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
       <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-slate-500 animate-pulse">กำลังตรวจสอบข้อมูล...</p>
    </div>
  );

  // Error State
  if (error || !agentData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
       <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-slate-800 font-bold">เกิดข้อผิดพลาด</p>
          <p className="text-slate-500">{error}</p>
          <button onClick={() => router.push('/login')} className="mt-4 text-blue-600 hover:underline">กลับไปหน้าเข้าสู่ระบบ</button>
       </div>
    </div>
  );

  const currentStatus = agentData.verification_status;

  // กำหนด Step Status Layout
  const steps = [
    { id: 1, title: 'ยื่นใบสมัคร', desc: `ส่งเมื่อ ${formatDate(agentData.createdAt)}`, icon: FileText, status: 'completed' },
    { 
      id: 2, 
      title: 'ตรวจสอบคุณสมบัติ', 
      desc: 'ฝ่ายทะเบียนตรวจสอบความถูกต้อง', 
      icon: Clock, 
      status: currentStatus === 'in_review' ? 'current' : (currentStatus === 'approved' || currentStatus === 'rejected' ? 'completed' : 'pending') 
    },
    { 
      id: 3, 
      title: 'อนุมัติสถานะตัวแทน', 
      desc: 'ออกรหัสตัวแทนและเปิดสิทธิ์', 
      icon: CheckCircle2, 
      status: currentStatus === 'approved' ? 'completed' : (currentStatus === 'rejected' ? 'error' : 'pending') 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    // ไม่ต้องลบ agentInfo แล้วเพราะเราไม่ได้ใช้
    router.push('/agent/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-900 p-3 rounded-lg text-white shadow-blue-900/20 shadow-lg">
               <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">ระบบทะเบียนตัวแทนประกันภัย</h1>
              <p className="text-slate-500 text-sm">Application Tracking System</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
            <LogOut size={16} /> ลงชื่อออก
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Queue Card */}
            {currentStatus === 'in_review' && agentData.queue_number !== undefined && (
               <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg shadow-blue-600/20 text-white overflow-hidden relative">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  <div className="p-6 text-center">
                     <div className="flex justify-center mb-3">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                           <Ticket size={24} className="text-white" />
                        </div>
                     </div>
                     <p className="text-blue-100 text-sm font-medium mb-1">ลำดับคิวของคุณ</p>
                     <h2 className="text-5xl font-bold tracking-tight mb-2">#{agentData.queue_number}</h2>
                     <p className="text-xs text-blue-200 bg-blue-900/30 inline-block px-3 py-1 rounded-full">กำลังตรวจสอบตามลำดับ</p>
                  </div>
                  <div className="bg-black/10 p-3 text-center text-xs text-blue-200 flex justify-center items-center gap-2">
                     <Users size={12}/> อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
                  </div>
               </div>
            )}

            {/* Timeline Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-100">
                 <h2 className="font-semibold text-slate-700">สถานะการดำเนินการ</h2>
              </div>
              <div className="p-6">
                {currentStatus === 'rejected' && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-red-700">
                      <strong className="block mb-1">ไม่ผ่านการอนุมัติ</strong>
                      {agentData.note || 'กรุณาติดต่อเจ้าหน้าที่เพื่อสอบถามรายละเอียด'}
                    </div>
                  </div>
                )}
                <div className="space-y-0 relative">
                  <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-200 -z-10"></div>
                  {steps.map((step) => (
                    <div key={step.id} className="flex gap-4 pb-8 last:pb-0 group">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 bg-white transition-all duration-300 ${step.status === 'completed' ? 'border-green-500 text-green-600 shadow-sm' : ''} ${step.status === 'current' ? 'border-blue-600 text-blue-600 ring-4 ring-blue-50 shadow-md scale-110' : ''} ${step.status === 'error' ? 'border-red-500 text-red-600' : ''} ${step.status === 'pending' ? 'border-slate-300 text-slate-300' : ''}`}>
                        <step.icon size={18} />
                      </div>
                      <div className="pt-1">
                        <h3 className={`text-sm font-bold transition-colors ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>{step.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {currentStatus === 'approved' && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <button onClick={() => router.push('/agent/agent_dashboard')} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg shadow-md shadow-green-600/20 transition-all active:scale-95 flex justify-center items-center gap-2 text-sm">
                      เข้าสู่ระบบงานขาย <CheckCircle2 size={16}/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
               <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                 <h2 className="font-semibold text-slate-700">ข้อมูลใบสมัคร</h2>
                 {/* <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium border ${currentStatus === 'in_review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''} ${currentStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : ''} ${currentStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}`}>
                    Ref: {agentData._id.slice(-6).toUpperCase()}
                 </span> */}
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-slate-100 text-center sm:text-left">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md shrink-0 ring-1 ring-slate-100">
                    {agentData.imgProfile ? (
                      <img src={agentData.imgProfile} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-slate-300" size={40} />
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="text-2xl font-bold text-slate-900">คุณ{agentData.first_name} {agentData.last_name}</h3>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono border border-slate-200">User: {agentData.username}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-5">
                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b pb-2">ข้อมูลส่วนบุคคล</h4>
                    <InfoItem icon={Calendar} label="วันเกิด" value={formatDate(agentData.birth_date).split(' ')[0]} />
                    <InfoItem icon={Phone} label="เบอร์โทรศัพท์" value={agentData.phone} />
                    <InfoItem icon={MapPin} label="ที่อยู่ปัจจุบัน" value={agentData.address} className="leading-relaxed" />
                  </div>
                  <div className="space-y-5">
                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider border-b pb-2">ข้อมูลใบอนุญาต</h4>
                    <InfoItem icon={CreditCard} label="เลขที่ใบอนุญาตตัวแทน" value={agentData.agent_license_number} isMono />
                    <div className="flex gap-4">
                      <div className="bg-slate-50 p-2 rounded-lg text-slate-400 h-fit"><Clock size={20} /></div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">วันที่บัตรหมดอายุ</p>
                        <p className={`text-sm font-medium mt-0.5 ${new Date(agentData.card_expiry_date) < new Date() ? 'text-red-600' : 'text-slate-800'}`}>
                          {formatDate(agentData.card_expiry_date).split(' ')[0]}
                        </p>
                        {new Date(agentData.card_expiry_date) < new Date() && (
                            <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded">หมดอายุแล้ว</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component
const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, isMono = false, className = '' }) => (
  <div className="flex gap-4">
    <div className="bg-slate-50 p-2 rounded-lg text-slate-400 h-fit">
        <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-sm font-medium text-slate-800 mt-0.5 ${isMono ? 'font-mono tracking-wide' : ''} ${className}`}>
        {value || '-'}
      </p>
    </div>
  </div>
);