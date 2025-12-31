"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, FileText, Download, Car, Calendar, 
  ShieldCheck, AlertCircle, Loader2, User, ImageIcon , Eye
} from "lucide-react";

import MenuAgent from "@/components/element/MenuAgent";
import api from "@/services/api";

// --- Type Definitions ---
interface PurchaseDetail {
  _id: string;
  policy_number?: string;
  status: string;
  
  // ✅ เอกสารหลัก
  policyFile?: string; 
  
  // ✅ เอกสารประกอบอื่นๆ
  citizenCardImage?: string;
  carRegistrationImage?: string;
  paymentSlipImage?: string;
  installmentDocImage?: string;
  consentFormImage?: string;

  start_date?: string;
  end_date?: string;
  carInsurance_id: {
    insuranceBrand: string;
    level: string;
    premium: number;
    company_name?: string;
  };
  car_id: {
    brand: string;
    carModel: string;
    year: number;
    registration: string;
    province: string;
    color: string;
  };
  customer_id: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
}

export default function AgentPolicyDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseId = typeof params.id === 'string' ? params.id : '';

  const [data, setData] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!purchaseId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            router.push('/login');
            return;
        }

        const res = await api.get<PurchaseDetail>(`/purchase/${purchaseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(res.data);
      } catch (err) {
        console.error("Error fetching policy detail:", err);
        setError("ไม่สามารถโหลดข้อมูลกรมธรรม์ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [purchaseId, router]);

  const isPdf = (url?: string) => {
    if (!url) return false;
    return url.toLowerCase().endsWith(".pdf") || url.startsWith("data:application/pdf");
  };

  const handleDownload = (fileUrl?: string, fileName: string = "Document") => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    const ext = isPdf(fileUrl) ? "pdf" : "png";
    link.download = `${fileName}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
        case 'pending': return 'text-amber-700 bg-amber-50 border-amber-200';
        case 'expired': return 'text-slate-600 bg-slate-50 border-slate-200';
        default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">กำลังโหลดเอกสาร...</p>
    </div>
  );

  if (error || !data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-600 font-medium">{error || "ไม่พบข้อมูลกรมธรรม์"}</p>
        <button onClick={() => router.back()} className="text-indigo-600 hover:underline">ย้อนกลับ</button>
    </div>
  );

  // ✅ รวบรวมเอกสารอื่นๆ เพื่อนำมาวนลูปแสดงผล
  const otherDocuments = [
    { label: "สำเนาบัตรประชาชน", file: data.citizenCardImage },
    { label: "สำเนาทะเบียนรถ", file: data.carRegistrationImage },
    { label: "สลิปโอนเงิน", file: data.paymentSlipImage },
    { label: "เอกสารผ่อนชำระ", file: data.installmentDocImage },
    { label: "หนังสือยินยอม", file: data.consentFormImage },
  ].filter(doc => doc.file); // กรองเอาเฉพาะที่มีไฟล์

  return (
    <>
      <MenuAgent activePage='/agent/agent_manage_customer' />

      <div className="min-h-screen bg-slate-50/30 p-6 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Navigation */}
            <nav className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                </button>
                {data.policyFile && (
                    <button 
                        onClick={() => handleDownload(data.policyFile, `Policy_${data.policy_number}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-shadow shadow-sm active:scale-95 text-sm font-semibold"
                    >
                        <Download className="w-4 h-4" /> ดาวน์โหลดกรมธรรม์
                    </button>
                )}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Info Cards */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-lg font-bold text-slate-800">ข้อมูลกรมธรรม์</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(data.status)} capitalize`}>
                                {data.status}
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide">เลขกรมธรรม์</p>
                                <p className="font-mono text-slate-800 font-medium text-lg">{data.policy_number || "-"}</p>
                            </div>
                            
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-sm font-semibold text-slate-700">{data.carInsurance_id?.insuranceBrand}</p>
                                <p className="text-xs text-slate-500">ชั้น {data.carInsurance_id?.level}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> เริ่มต้น</p>
                                    <p className="text-sm text-slate-700 font-medium">
                                        {data.start_date ? new Date(data.start_date).toLocaleDateString('th-TH') : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> สิ้นสุด</p>
                                    <p className="text-sm text-slate-700 font-medium">
                                        {data.end_date ? new Date(data.end_date).toLocaleDateString('th-TH') : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">ผู้เอาประกันภัย</h2>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                <User className="w-5 h-5"/>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">{data.customer_id?.first_name} {data.customer_id?.last_name}</p>
                                <p className="text-xs text-slate-500">{data.customer_id?.phone}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 mt-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Car className="w-4 h-4 text-slate-400"/> รถยนต์คันเอาประกัน
                            </h3>
                            <div className="text-sm text-slate-600 space-y-1 pl-6">
                                <p><span className="text-slate-400">ยี่ห้อ/รุ่น:</span> {data.car_id?.brand} {data.car_id?.carModel}</p>
                                <p><span className="text-slate-400">ทะเบียน:</span> {data.car_id?.registration} {data.car_id?.province}</p>
                                <p><span className="text-slate-400">ปี:</span> {data.car_id?.year}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Documents Viewer */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. Policy Document (Main) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" /> ไฟล์กรมธรรม์ฉบับจริง
                            </h3>
                        </div>

                        <div className="flex-1 bg-slate-100/50 p-4 flex items-center justify-center relative">
                            {data.policyFile ? (
                                isPdf(data.policyFile) ? (
                                    <iframe 
                                        src={data.policyFile} 
                                        className="w-full h-full min-h-[600px] rounded-lg border border-slate-200 shadow-sm bg-white"
                                        title="Policy Document"
                                    />
                                ) : (
                                    <div className="relative w-full h-full min-h-[500px]">
                                        <Image 
                                            src={data.policyFile} 
                                            alt="Policy Document" 
                                            fill 
                                            className="object-contain"
                                        />
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-slate-400">
                                    <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                                    <p>ไม่พบไฟล์เอกสารกรมธรรม์</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Other Documents Grid (New Section) */}
                    {otherDocuments.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-indigo-600"/> เอกสารประกอบอื่นๆ
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {otherDocuments.map((doc, index) => (
                                    <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                            <span className="text-sm font-semibold text-slate-700">{doc.label}</span>
                                            <button 
                                                onClick={() => handleDownload(doc.file, doc.label)}
                                                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                                            >
                                                <Download className="w-3 h-3"/> ดาวน์โหลด
                                            </button>
                                        </div>
                                        <div className="relative h-64 bg-slate-100 w-full group">
                                            {isPdf(doc.file) ? (
                                                <iframe 
                                                    src={doc.file} 
                                                    className="w-full h-full pointer-events-none" // disable interaction for preview
                                                    title={doc.label}
                                                />
                                            ) : (
                                                <Image 
                                                    src={doc.file!} 
                                                    alt={doc.label} 
                                                    fill 
                                                    className="object-contain p-2"
                                                />
                                            )}
                                            {/* Hover Overlay to View Full */}
                                            <a 
                                                href={doc.file} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2"
                                            >
                                                <Eye className="w-5 h-5"/> คลิกเพื่อดูขยาย
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
      </div>
    </>
  );
}