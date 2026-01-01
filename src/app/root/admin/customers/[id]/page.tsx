'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MenuAdmin from '@/components/element/MenuAdmin';
import { 
  Loader2, Phone, Mail, Car, History, ArrowLeft, 
  Copy, Edit3, Save, UserCog, KeyRound, Lock
} from 'lucide-react';
import api from '@/services/api'; 

// --- Interfaces ---
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
  carInsurance_id: { insuranceBrand: string; level: string; premium: number; };
  car_id: { registration: string; brand: string; };
  agent_id?: { first_name: string; last_name: string; };
}

const AdminCustomerDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const customerId = typeof params.id === 'string' ? params.id : '';

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'garage' | 'history'>('garage');
  
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [garage, setGarage] = useState<CarData[]>([]);
  const [history, setHistory] = useState<PurchaseHistory[]>([]);
  const [stats, setStats] = useState({ totalSpent: 0, activePolicies: 0 });

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
      first_name: '', last_name: '', phone: '', email: '', address: ''
  });

  // Reset Password States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get(`/admin/customers/${customerId}`);
      if (res.data) {
          setProfile(res.data.profile);
          setGarage(res.data.garage || []);
          setHistory(res.data.history || []);
          setStats(res.data.stats || {});
          
          setEditFormData({
              first_name: res.data.profile.first_name,
              last_name: res.data.profile.last_name,
              phone: res.data.profile.phone,
              email: res.data.profile.email,
              address: res.data.profile.address
          });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (customerId) fetchData(); }, [customerId]);

  // Update Profile
  const handleSaveProfile = async () => {
      try {
          await api.put(`/admin/customers/${customerId}`, editFormData);
          setIsEditing(false);
          fetchData(); 
          alert("บันทึกข้อมูลสำเร็จ");
      } catch (error) {
          alert("เกิดข้อผิดพลาดในการบันทึก");
      }
  };

  // Reset Password
  const handleResetPassword = async () => {
      if(newPassword.length < 6) {
          alert("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
          return;
      }
      try {
          await api.put(`/admin/customers/${customerId}/reset-password`, { newPassword });
          setShowPasswordModal(false);
          setNewPassword('');
          alert("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
      } catch (error) {
          alert("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!profile) return <div>ไม่พบข้อมูล</div>;

  return (
    <>
      <MenuAdmin activePage='/root/admin/customers' />
      
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
            
            <nav className="flex items-center text-sm text-slate-500 mb-2">
                <button onClick={() => router.back()} className="hover:text-indigo-600 flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> รายชื่อลูกค้า
                </button>
                <span className="mx-2">/</span>
                <span className="text-slate-800 font-medium">จัดการลูกค้า</span>
            </nav>

            {/* --- Profile Card --- */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-slate-100 p-1 ring-4 ring-white shadow-lg overflow-hidden">
                            {profile.imgProfile_customer ? (
                                <img src={profile.imgProfile_customer} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-400">{profile.first_name[0]}</div>
                            )}
                        </div>
                         {/* <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">
                            ID: {profile._id.slice(-6).toUpperCase()} <Copy className="w-3 h-3 cursor-pointer"/>
                        </span> */}
                    </div>

                    {/* Info Form */}
                    <div className="flex-1 w-full">
                         <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <UserCog className="w-5 h-5 text-indigo-600"/> ข้อมูลส่วนตัว
                            </h2>
                            
                            <div className="flex gap-2">
                                {/* ปุ่ม Reset Password */}
                                {!isEditing && (
                                    <button 
                                        onClick={() => setShowPasswordModal(true)}
                                        className="text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                                    >
                                        <KeyRound className="w-4 h-4" /> เปลี่ยนรหัสผ่าน
                                    </button>
                                )}

                                {/* ปุ่ม Edit */}
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1">
                                        <Edit3 className="w-4 h-4" /> แก้ไขข้อมูล
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => setIsEditing(false)} className="text-sm text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg">ยกเลิก</button>
                                        <button onClick={handleSaveProfile} className="text-sm bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                                            <Save className="w-4 h-4" /> บันทึก
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">ชื่อ</label>
                                <input 
                                    disabled={!isEditing}
                                    value={isEditing ? editFormData.first_name : profile.first_name}
                                    onChange={e => setEditFormData({...editFormData, first_name: e.target.value})}
                                    className={`w-full p-2 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white' : 'border-transparent bg-slate-50 font-medium text-slate-800'}`}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">นามสกุล</label>
                                <input 
                                    disabled={!isEditing}
                                    value={isEditing ? editFormData.last_name : profile.last_name}
                                    onChange={e => setEditFormData({...editFormData, last_name: e.target.value})}
                                    className={`w-full p-2 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white' : 'border-transparent bg-slate-50 font-medium text-slate-800'}`}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">เบอร์โทรศัพท์</label>
                                <input 
                                    disabled={!isEditing}
                                    value={isEditing ? editFormData.phone : profile.phone}
                                    onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                                    className={`w-full p-2 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white' : 'border-transparent bg-slate-50 font-medium text-slate-800'}`}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">อีเมล</label>
                                <input 
                                    disabled={!isEditing}
                                    value={isEditing ? editFormData.email : profile.email}
                                    onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                                    className={`w-full p-2 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white' : 'border-transparent bg-slate-50 font-medium text-slate-800'}`}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs text-slate-400 block mb-1">ที่อยู่</label>
                                <textarea 
                                    disabled={!isEditing}
                                    value={isEditing ? editFormData.address : profile.address}
                                    onChange={e => setEditFormData({...editFormData, address: e.target.value})}
                                    rows={2}
                                    className={`w-full p-2 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white' : 'border-transparent bg-slate-50 font-medium text-slate-800'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats (ไม่มี Note แล้ว) */}
                     <div className="flex flex-col gap-4 w-full lg:w-64">
                        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 h-full flex flex-col justify-center items-center text-center">
                             <p className="text-xs font-bold text-indigo-600 uppercase mb-2">LTV (ยอดซื้อรวม)</p>
                             <p className="text-3xl font-bold text-indigo-900">฿{stats.totalSpent.toLocaleString()}</p>
                             <p className="text-xs text-indigo-400 mt-2">กรมธรรม์ที่ชำระเงินแล้ว</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-200">
                    <button onClick={() => setActiveTab('garage')} className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 ${activeTab === 'garage' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>
                        <Car className="w-4 h-4" /> โรงรถ
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>
                        <History className="w-4 h-4" /> ประวัติการซื้อขาย
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'garage' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {garage.map(car => (
                                <div key={car._id} className="p-4 border border-slate-200 rounded-xl">
                                    <h3 className="font-bold text-slate-800">{car.brand} {car.carModel}</h3>
                                    <p className="text-slate-500 text-sm">{car.year} • {car.color}</p>
                                    <div className="mt-2 bg-slate-50 p-2 rounded text-center font-mono font-bold text-slate-700">
                                        {car.registration}
                                    </div>
                                </div>
                            ))}
                            {garage.length === 0 && <p className="text-slate-400">ไม่มีข้อมูลรถ</p>}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">วันที่</th>
                                        <th className="px-4 py-3">ประกัน</th>
                                        <th className="px-4 py-3">Agent</th>
                                        <th className="px-4 py-3 text-center">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(h => (
                                        <tr key={h._id} className="border-b border-slate-100">
                                            <td className="px-4 py-3">{new Date(h.createdAt).toLocaleDateString('th-TH')}</td>
                                            <td className="px-4 py-3">{h.carInsurance_id?.insuranceBrand} (ชั้น {h.carInsurance_id?.level})</td>
                                            <td className="px-4 py-3">{h.agent_id ? `${h.agent_id.first_name} ${h.agent_id.last_name}` : '-'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${h.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>
                                                    {h.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {history.length === 0 && <p className="text-slate-400 mt-4 text-center">ไม่มีประวัติการซื้อ</p>}
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* --- Reset Password Modal --- */}
        {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 mb-4 text-slate-800">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">เปลี่ยนรหัสผ่าน</h3>
                            <p className="text-xs text-slate-500">กำหนดรหัสผ่านใหม่ให้ลูกค้า</p>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านใหม่</label>
                        <input 
                            type="password"
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="กรอกรหัสผ่านอย่างน้อย 6 ตัว"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button 
                            onClick={() => { setShowPasswordModal(false); setNewPassword(''); }}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            ยกเลิก
                        </button>
                        <button 
                            onClick={handleResetPassword}
                            className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium shadow-sm"
                        >
                            ยืนยันการเปลี่ยน
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default AdminCustomerDetailPage;