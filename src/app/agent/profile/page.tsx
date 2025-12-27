"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import api from "@/services/api";
import { Agent, UpdateAgentDTO } from "@/types/agent";
import { 
  User, Phone, MapPin, Calendar, FileBadge, 
  CheckCircle, XCircle, Clock, MessageSquare, CreditCard,
  Edit2, Save, X, UploadCloud, Camera
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { jwtDecode } from "jwt-decode";
import MenuAgent from "@/components/element/MenuAgent";

// --- Types ---
interface DecodedToken {
  username: string;
  id: string;
  role: string;
  exp?: number;
  iat?: number;
}

// --- Skeleton Loader ---
const SkeletonLoader = () => (
  <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
    <div className="flex justify-between">
       <div className="h-8 bg-slate-200 rounded w-1/3"></div>
       <div className="h-10 bg-slate-200 rounded w-24"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 h-96 bg-slate-200 rounded-2xl"></div>
      <div className="lg:col-span-2 space-y-6">
        <div className="h-40 bg-slate-200 rounded-2xl"></div>
        <div className="h-40 bg-slate-200 rounded-2xl"></div>
        <div className="h-40 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  </div>
);

export default function AgentProfilePage() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State สำหรับโหมดแก้ไข
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateAgentDTO>({
    address: "",
    phone: "",
    idLine: "",
    note: "",
    imgProfile: ""
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch Data
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) throw new Error("ไม่พบ Token กรุณาเข้าสู่ระบบใหม่");

        const decoded = jwtDecode<DecodedToken>(token);
        
        if (decoded && decoded.id) {
          const response = await api.get<Agent>(`/agents/${decoded.id}`);
          setAgent(response.data);
          
          // Set ค่าเริ่มต้นให้ Form
          setFormData({
            address: response.data.address || "",
            phone: response.data.phone || "",
            idLine: response.data.idLine || "",
            note: response.data.note || "",
            imgProfile: response.data.imgProfile || ""
          });
        } else {
          throw new Error("Token ไม่ถูกต้อง");
        }

      } catch (err: unknown) {
        // จัดการ Error แบบ Type Safe
        if (err instanceof Error) {
          console.error("Error fetching agent:", err.message);
          setError(err.message);
        } else {
          setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  // Handle Input Change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload (Convert to Base64)
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, imgProfile: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Submit Update
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    try {
      setIsSaving(true);
      // ส่งข้อมูลไปอัปเดต (สมมติว่า backend รับ PUT ที่ /agents/:id)
      const response = await api.put<Agent>(`/agents/${agent._id}`, formData); // หรือ patch
      
      // อัปเดต State หน้าจอด้วยข้อมูลใหม่จาก Server
      setAgent(response.data);
      setIsEditing(false);
      alert("บันทึกข้อมูลสำเร็จ");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`บันทึกไม่สำเร็จ: ${err.message}`);
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Cancel Edit
  const handleCancel = () => {
    if (agent) {
      // Revert กลับเป็นค่าเดิม
      setFormData({
        address: agent.address,
        phone: agent.phone,
        idLine: agent.idLine || "",
        note: agent.note || "",
        imgProfile: agent.imgProfile || ""
      });
    }
    setIsEditing(false);
  };

  // --- Helpers ---
  const renderStatus = (status: string) => {
    const statusConfig = {
      approved: { color: "bg-green-100 text-green-700", icon: <CheckCircle size={16} />, text: "อนุมัติแล้ว" },
      rejected: { color: "bg-red-100 text-red-700", icon: <XCircle size={16} />, text: "ถูกปฏิเสธ" },
      in_review: { color: "bg-yellow-100 text-yellow-700", icon: <Clock size={16} />, text: "รอตรวจสอบ" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_review;
    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy", { locale: th });
    } catch { return "-"; }
  };

  // --- Render ---
  if (loading) return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <SkeletonLoader />
    </div>
  );

  if (error || !agent) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
      <User size={48} className="mb-4 text-slate-300" />
      <p>{error || "ไม่พบข้อมูล"}</p>
    </div>
  );

  return (
    <>
      <MenuAgent activePage="/agent/profile" />
      
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header Section with Edit Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">ข้อมูลตัวแทนประกัน</h1>
              {/* <p className="text-slate-500 text-sm">รหัสอ้างอิง: <span className="font-mono">{agent._id}</span></p> */}
            </div>
            
            <div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm transition-all font-medium"
                >
                  <Edit2 size={18} /> แก้ไขข้อมูล
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    <X size={18} /> ยกเลิก
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? "กำลังบันทึก..." : <><Save size={18} /> บันทึก</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Form/Display Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Sidebar Profile */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-blue-700 to-blue-500"></div>
                
                <div className="px-6 pb-8 relative text-center">
                  {/* Avatar with Edit Overlay */}
                  <div className="relative -mt-16 mb-4 inline-block group">
                    <div className="w-32 h-32 rounded-full border-[5px] border-white shadow-md bg-white flex items-center justify-center overflow-hidden mx-auto relative">
                      {/* Priority: Preview Image (ตอนแก้) -> Existing Image -> Default Icon */}
                      {isEditing && formData.imgProfile ? (
                        <img src={formData.imgProfile} alt="Preview" className="w-full h-full object-cover" />
                      ) : agent.imgProfile ? (
                        <img src={agent.imgProfile} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={64} className="text-slate-300" />
                      )}

                      {/* Image Upload Overlay */}
                      {isEditing && (
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white" size={24} />
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                    {isEditing && <p className="text-xs text-slate-400 mt-2">คลิกรูปเพื่อเปลี่ยน</p>}
                  </div>

                  <h2 className="text-xl font-bold text-slate-800 mb-1">
                    {agent.first_name} {agent.last_name}
                  </h2>
                  <p className="text-slate-500 text-sm mb-4">@{agent.username}</p>
                  <div className="flex justify-center mb-6">{renderStatus(agent.verification_status)}</div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <p className="text-blue-800 text-xs font-semibold uppercase tracking-wide mb-1">ลูกค้าในความดูแล</p>
                    <p className="text-3xl font-bold text-blue-600">{agent.assigned_count}</p>
                  </div>

                  <div className="space-y-4 text-left">
                    {/* Phone Field */}
                    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isEditing ? 'bg-slate-50 border border-blue-200' : 'hover:bg-slate-50'}`}>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-1">
                        <Phone size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400">เบอร์โทรศัพท์ {isEditing && <span className="text-red-500">*</span>}</p>
                        {isEditing ? (
                          <input 
                            type="text" 
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full mt-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                          />
                        ) : (
                          <p className="text-slate-700 font-medium">{agent.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* ID Line Field */}
                    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isEditing ? 'bg-slate-50 border border-blue-200' : 'hover:bg-slate-50'}`}>
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-1">
                        <MessageSquare size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400">LINE ID / QR</p>
                        {isEditing ? (
                          <input 
                            type="text" 
                            name="idLine"
                            placeholder="ใส่ ID Line หรือ URL"
                            value={formData.idLine}
                            onChange={handleInputChange}
                            className="w-full mt-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                          />
                        ) : (
                          agent.idLine ? (
                            <a href={agent.idLine} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium truncate block max-w-[180px]">
                              {agent.idLine}
                            </a>
                          ) : <span className="text-slate-400 italic text-sm">- ไม่ระบุ -</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Official Info (Read Only) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <FileBadge className="text-blue-600" size={24} />
                  <h3 className="text-lg font-bold text-slate-800">ข้อมูลใบอนุญาต (แก้ไขไม่ได้)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">เลขที่ใบอนุญาต</label>
                    <div className="mt-1 text-slate-800 font-medium text-lg font-mono">{agent.agent_license_number}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">วันหมดอายุบัตร</label>
                    <div className={`mt-1 font-medium text-lg flex items-center gap-2 ${new Date(agent.card_expiry_date) < new Date() ? 'text-red-600' : 'text-slate-800'}`}>
                      {formatDate(agent.card_expiry_date)}
                      {new Date(agent.card_expiry_date) < new Date() && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">หมดอายุ</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Personal Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <User className="text-blue-600" size={24} />
                  <h3 className="text-lg font-bold text-slate-800">ข้อมูลส่วนตัว</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">วันเกิด</label>
                    <div className="mt-1 text-slate-800 font-medium flex items-center gap-2">
                      <Calendar size={18} className="text-slate-400" />
                      {formatDate(agent.birth_date)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">วันที่สมัครสมาชิก</label>
                    <div className="mt-1 text-slate-500 font-medium text-sm">
                      {formatDate(agent.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Address Field (Editable) */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ที่อยู่ตามบัตรประชาชน {isEditing && <span className="text-red-500">*</span>}</label>
                  {isEditing ? (
                    <textarea 
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full mt-2 p-3 text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  ) : (
                    <div className="mt-2 text-slate-800 flex items-start gap-2 bg-slate-50 p-4 rounded-lg">
                      <MapPin size={20} className="text-blue-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{agent.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Note (Editable) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="text-blue-600" size={24} />
                  <h3 className="text-lg font-bold text-slate-800">หมายเหตุ</h3>
                </div>
                
                {isEditing ? (
                  <textarea 
                    name="note"
                    rows={4}
                    placeholder="เขียนบันทึกเพิ่มเติม..."
                    value={formData.note}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-yellow-50 text-slate-800 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 placeholder:text-slate-400 italic"
                  />
                ) : (
                  <div className={`p-4 rounded-lg border italic ${agent.note ? 'bg-yellow-50 text-yellow-800 border-yellow-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {agent.note ? `"${agent.note}"` : "- ไม่มีบันทึก -"}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>

  );
}