import React, { useState, useEffect, ChangeEvent } from "react";
import { 
    X, Shield, Car, FileText, Save, Copy, Check, User, 
    Calendar, AlertCircle, Phone, Mail, Banknote, 
    CheckCircle2, Eye, Upload, Edit 
} from "lucide-react";
import { Purchase, PaymentMethod, PurchaseStatus } from "../types";
import { addYearsToDate, formatDateForInput, getTodayString } from "../utils";
import api from "@/services/api";
import { jwtDecode } from "jwt-decode"; 

// --- Type Definitions ---

interface DecodedToken {
    id: string;
    role: string;
}

interface ExtendedCustomer {
    _id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    email?: string;
}

interface ExtendedAgent {
    _id: string;
    first_name: string;
    last_name: string;
}

interface ExtendedInsurance {
    insuranceBrand: string;
    level: string;
    premium?: number;
}

export interface EditFormState {
    status: PurchaseStatus;
    reject_reason: string;
    policy_number: string;
    start_date: string;
    end_date: string;
    paymentMethod: PaymentMethod;
    
    // Customer (Read Only)
    customer_first_name: string;
    customer_last_name: string;
    customer_phone: string;
    customer_email: string;
    
    // Insurance (Read Only)
    insurance_brand: string;
    insurance_level: string;
    insurance_premium: number;
    
    // Car Details (Read Only)
    car_brand: string;
    car_model: string;
    car_submodel: string;
    car_year: number | string;
    car_color: string;
    car_registration: string;
    car_province: string;
    
    // Images (Editable)
    paymentSlipImage: string;
    citizenCardImage: string;
    carRegistrationImage: string;
    installmentDocImage: string;
    consentFormImage: string;
    policyFile: string;
}

interface RenderImageUploadProps {
    label: string;
    currentImage: string;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    extraInfo?: React.ReactNode;
}

interface EditPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchase: Purchase;
    onSave: (id: string, data: Partial<EditFormState>) => Promise<void>;
}

type TabKey = "general" | "car" | "documents";

// Helper แปลงวันที่สำหรับแสดงผลใน Notification (DD/MM/YYYY)
const formatDateNotify = (isoDate?: string) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("th-TH", { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Helper แปลง Status เป็นภาษาไทย
const getStatusLabel = (s: string) => {
    const map: Record<string, string> = {
        'pending': 'รอตรวจสอบ', 
        'pending_payment': 'รอชำระเงิน',
        'active': 'คุ้มครองแล้ว', 
        'about_to_expire': 'ใกล้หมดอายุ',
        'expired': 'หมดอายุ', 
        'rejected': 'ถูกปฏิเสธ'
    };
    return map[s] || s;
};

const EditPolicyModal: React.FC<EditPolicyModalProps> = ({ isOpen, onClose, purchase, onSave }) => {
    const [activeTab, setActiveTab] = useState<TabKey>("general");
    const [isCopied, setIsCopied] = useState(false);
    
    const [currentAgent, setCurrentAgent] = useState<{ fullName: string; id: string } | null>(null);

    const [form, setForm] = useState<EditFormState>({
        status: "pending", reject_reason: "", policy_number: "", start_date: "", end_date: "", paymentMethod: "full",
        customer_first_name: "", customer_last_name: "", customer_phone: "", customer_email: "",
        insurance_brand: "", insurance_level: "", insurance_premium: 0,
        car_brand: "", car_model: "", car_submodel: "", car_year: "", car_color: "", car_registration: "", car_province: "",
        paymentSlipImage: "", citizenCardImage: "", carRegistrationImage: "", installmentDocImage: "", consentFormImage: "", policyFile: ""
    });

    // ✅ ดึงข้อมูล Agent และตรวจสอบชื่อให้ถูกต้อง
    useEffect(() => {
        const fetchAgentProfile = async () => {
            try {
                // 1. ลองดึงจาก LocalStorage ก่อน
                const storedAgent = localStorage.getItem("agentData");
                if (storedAgent) {
                    const agentObj = JSON.parse(storedAgent);
                    if (agentObj.first_name && agentObj.first_name !== "ตัวแทน") {
                        const fullName = `${agentObj.first_name} ${agentObj.last_name || ""}`.trim();
                        setCurrentAgent({ fullName, id: agentObj._id || agentObj.id });
                        return;
                    }
                }

                // 2. ถ้าไม่มี หรือชื่อไม่สมบูรณ์ ให้ดึงจาก API
                const token = localStorage.getItem("token");
                if (token) {
                    const decoded = jwtDecode<DecodedToken>(token);
                    if (decoded && decoded.id) {
                        const res = await api.get(`/agents/${decoded.id}`);
                        const agentObj = res.data;
                        const fullName = `${agentObj.first_name} ${agentObj.last_name || ""}`.trim();
                        setCurrentAgent({ fullName, id: agentObj._id || agentObj.id });
                        
                        localStorage.setItem("agentData", JSON.stringify(agentObj));
                    }
                }
            } catch (e) {
                console.error("Failed to fetch agent profile:", e);
                // Fallback ถ้าหาไม่เจอจริงๆ
                setCurrentAgent({ fullName: "เจ้าหน้าที่", id: "" });
            }
        };

        if (isOpen) {
            fetchAgentProfile();
        }
    }, [isOpen]);

    useEffect(() => {
        if (purchase) {
            const defaultStart = formatDateForInput(purchase.start_date) || getTodayString();
            const defaultEnd = formatDateForInput(purchase.end_date) || addYearsToDate(defaultStart, 1);

            const customer = purchase.customer_id as unknown as ExtendedCustomer;
            const insurance = purchase.carInsurance_id as unknown as ExtendedInsurance;

            setForm({
                status: purchase.status,
                reject_reason: purchase.reject_reason || "",
                policy_number: purchase.policy_number || "",
                start_date: defaultStart,
                end_date: defaultEnd,
                paymentMethod: purchase.paymentMethod || "full",
                
                customer_first_name: customer?.first_name || "",
                customer_last_name: customer?.last_name || "",
                customer_phone: customer?.phone || "-", 
                customer_email: customer?.email || "-", 
                
                insurance_brand: insurance?.insuranceBrand || "",
                insurance_level: insurance?.level || "",
                insurance_premium: insurance?.premium || 0, 
                
                car_brand: purchase.car_id?.brand || "",
                car_model: purchase.car_id?.carModel || "",
                car_submodel: purchase.car_id?.subModel || "",
                car_year: purchase.car_id?.year || "",
                car_color: purchase.car_id?.color || "",
                car_registration: purchase.car_id?.registration || "",
                car_province: purchase.car_id?.province || "",
                
                paymentSlipImage: purchase.paymentSlipImage || "",
                citizenCardImage: purchase.citizenCardImage || "",
                carRegistrationImage: purchase.carRegistrationImage || "",
                installmentDocImage: purchase.installmentDocImage || "",
                consentFormImage: purchase.consentFormImage || "",
                policyFile: purchase.policyFile || "",
            });
        }
    }, [purchase]);

    const handleCopy = () => {
        navigator.clipboard.writeText(form.policy_number);
        setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
    };

    const handleFile = (e: ChangeEvent<HTMLInputElement>, field: keyof EditFormState) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setForm(prev => ({ ...prev, [field]: reader.result as string }));
            reader.readAsDataURL(file);
        }
    };

    const handleSaveLocal = async () => {
        try {
            await onSave(purchase._id, form);

            const changes: string[] = [];
            // ✅ เปลี่ยนให้เป็น 'info' (สีฟ้า) เสมอ ตามที่ต้องการ
            const notiType = 'info'; 

            const compareField = (label: string, oldVal: string | undefined | null, newVal: string) => {
                const o = (oldVal || "").trim();
                const n = (newVal || "").trim();
                if (o !== n) {
                    if (!o && n) changes.push(`เพิ่ม${label}: "${n}"`);
                    else changes.push(`แก้ไข${label}: จาก "${o || '-'}" เป็น "${n}"`);
                }
            };

            const compareImage = (label: string, oldImg: string | undefined | null, newImg: string) => {
                if (newImg && newImg !== (oldImg || "")) {
                    if (!oldImg) changes.push(`อัปโหลด${label}ใหม่`);
                    else changes.push(`เปลี่ยนไฟล์${label}`);
                }
            };

            // เปรียบเทียบข้อมูล
            if (form.status !== purchase.status) {
                changes.push(`สถานะ: เปลี่ยนจาก "${getStatusLabel(purchase.status)}" เป็น "${getStatusLabel(form.status)}"`);
            }

            compareField("เลขกรมธรรม์", purchase.policy_number, form.policy_number);

            const oldStart = formatDateForInput(purchase.start_date);
            const newStart = form.start_date;
            const oldEnd = formatDateForInput(purchase.end_date);
            const newEnd = form.end_date;

            if (oldStart !== newStart || oldEnd !== newEnd) {
                changes.push(`ระยะเวลาคุ้มครอง: เปลี่ยนเป็น ${formatDateNotify(newStart)} ถึง ${formatDateNotify(newEnd)}`);
            }

            if (form.status === 'rejected') {
                compareField("เหตุผลการปฏิเสธ", purchase.reject_reason, form.reject_reason);
            }

            compareImage("ไฟล์กรมธรรม์", purchase.policyFile, form.policyFile);
            compareImage("สลิปโอนเงิน", purchase.paymentSlipImage, form.paymentSlipImage);
            compareImage("บัตรประชาชน", purchase.citizenCardImage, form.citizenCardImage);
            compareImage("ทะเบียนรถ", purchase.carRegistrationImage, form.carRegistrationImage);

            if (changes.length === 0) {
                onClose();
                return;
            }

            // ✅ เตรียมข้อมูลแจ้งเตือน (ตัดคำว่า ตัวแทน ออกจาก Header เพื่อไม่ให้ซ้ำ)
            const carReg = `${form.car_registration} ${form.car_province}`;
            const header = `อัปเดตข้อมูลกรมธรรม์ (ทะเบียน ${carReg})`; // เอาคำว่า (ตัวแทน: ...) ออก
            const body = changes.map(c => `- ${c}`).join("\n");
            const fullMessage = `${header}\n${body}`;

            // ✅ ข้อมูลผู้ส่ง (ชื่อนี้จะไปโผล่เป็นสีฟ้าใน Notification UI เอง)
            const agentName = currentAgent?.fullName || "เจ้าหน้าที่";
            const senderInfo = { 
                name: agentName, 
                role: "agent" 
            };

            const customerId = (purchase.customer_id as unknown as ExtendedCustomer)?._id;
            if (customerId) {
                await api.post("/api/notifications", {
                    recipientType: 'customer',
                    recipientId: customerId,
                    message: fullMessage,
                    type: notiType, // สีฟ้าเสมอ
                    sender: senderInfo,
                    relatedPurchaseId: purchase._id
                });
            }

            // ส่งหา Agent (ป้องกันแจ้งเตือนตัวเอง)
            const agentId = (purchase.agent_id as unknown as ExtendedAgent)?._id || (purchase.agent_id as string);
            if (agentId && (typeof agentId === 'string' && agentId.length > 10)) {
                 if (currentAgent?.id !== agentId) {
                    await api.post("/api/notifications", {
                        recipientType: 'agent',
                        recipientId: agentId,
                        message: `(ลูกค้า: ${form.customer_first_name}) ${fullMessage}`,
                        type: notiType, // สีฟ้าเสมอ
                        sender: senderInfo,
                        relatedPurchaseId: purchase._id
                    });
                 }
            }

            onClose();

        } catch (error) {
            console.error("Error saving/notifying:", error);
            alert("บันทึกข้อมูลสำเร็จ แต่ระบบแจ้งเตือนขัดข้อง");
            onClose();
        }
    };

    // ... (ส่วน Render Image Upload และ UI Render เหมือนเดิมทุกประการ)
    const RenderImageUpload: React.FC<RenderImageUploadProps> = ({ label, currentImage, onFileChange, extraInfo }) => {
        const hasFile = !!currentImage;
        const isPdf = currentImage?.startsWith('data:application/pdf') || currentImage?.toLowerCase().endsWith('.pdf');

        return (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        {hasFile ? <CheckCircle2 className="w-4 h-4 text-green-500"/> : <AlertCircle className="w-4 h-4 text-slate-300"/>}
                        {label}
                    </span>
                    {hasFile && <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">อัปโหลดแล้ว</span>}
                </div>
                
                {extraInfo && <div className="mb-3">{extraInfo}</div>}

                <div className="relative group w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg overflow-hidden flex items-center justify-center transition-colors hover:bg-slate-100 hover:border-slate-300">
                    {hasFile ? (
                        <>
                            {isPdf ? (
                                <div className="flex flex-col items-center text-slate-500">
                                    <FileText className="w-10 h-10 text-red-500 mb-1" />
                                    <span className="text-xs font-medium">เอกสาร PDF</span>
                                </div>
                            ) : (
                                <img src={currentImage} className="w-full h-full object-contain" alt="preview" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error'}/>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                <button onClick={() => window.open(currentImage)} className="p-2 bg-white rounded-full hover:scale-110 transition text-slate-700 shadow-lg" title="ดูไฟล์"><Eye className="w-4 h-4"/></button>
                                <label className="p-2 bg-white rounded-full hover:scale-110 transition text-indigo-600 shadow-lg cursor-pointer" title="เปลี่ยนไฟล์">
                                    <Edit className="w-4 h-4"/>
                                    <input type="file" className="hidden" onChange={onFileChange} accept="image/*,application/pdf" />
                                </label>
                            </div>
                        </>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-indigo-500">
                            <Upload className="w-8 h-8 mb-2 opacity-50"/>
                            <span className="text-xs font-medium">คลิกเพื่ออัปโหลด</span>
                            <input type="file" className="hidden" onChange={onFileChange} accept="image/*,application/pdf" />
                        </label>
                    )}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Shield className="w-6 h-6 text-indigo-600"/> แก้ไขกรมธรรม์</h2>
                        {/* <p className="text-xs text-slate-400 mt-0.5 font-mono">Ref: {purchase._id}</p> */}
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5"/></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-6 gap-6 bg-slate-50/50">
                    {([{ id: "general", label: "ข้อมูลทั่วไป", icon: Shield }, { id: "car", label: "รถยนต์ & ลูกค้า", icon: Car }, { id: "documents", label: "เอกสารแนบ", icon: FileText }] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all ${
                                activeTab === tab.id 
                                ? "border-indigo-600 text-indigo-600 translate-y-[1px]" 
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "fill-indigo-100" : ""}`}/> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
                    {/* --- TAB 1: General --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 max-w-3xl mx-auto">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <Shield className="w-4 h-4 text-indigo-500"/> สถานะและการชำระเงิน
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">สถานะปัจจุบัน</label>
                                        <select value={form.status} onChange={e => setForm({...form, status: e.target.value as PurchaseStatus})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm transition-all cursor-pointer">
                                            <option value="pending">🟡 รอตรวจสอบ</option>
                                            <option value="pending_payment">🟠 รอชำระเงิน</option>
                                            <option value="active">🟢 คุ้มครองแล้ว</option>
                                            <option value="about_to_expire">🟣 ใกล้หมดอายุ</option>
                                            <option value="expired">🔴 หมดอายุ</option>
                                            <option value="rejected">⚪ ปฏิเสธ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">รูปแบบชำระเงิน</label>
                                        <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value as PaymentMethod})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-sm cursor-pointer">
                                            <option value="full">จ่ายเต็มจำนวน</option>
                                            <option value="installment">ผ่อนชำระ</option>
                                        </select>
                                    </div>
                                    {form.status === 'rejected' && (
                                        <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-xs font-semibold text-red-600 mb-1.5 block flex items-center gap-1"><AlertCircle className="w-3 h-3"/> สาเหตุการปฏิเสธ</label>
                                            <textarea className="w-full border border-red-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none bg-red-50/50 min-h-[80px]" placeholder="ระบุเหตุผลที่ปฏิเสธ..." value={form.reject_reason} onChange={e => setForm({...form, reject_reason: e.target.value})} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">เลขกรมธรรม์</label>
                                    <div className="relative group">
                                        <input type="text" value={form.policy_number} onChange={e => setForm({...form, policy_number: e.target.value})} className="w-full border border-slate-300 rounded-xl py-2.5 pl-4 pr-10 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="P-XXXXXXX" />
                                        <button onClick={handleCopy} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors bg-white rounded-md">
                                            {isCopied ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <Calendar className="w-4 h-4 text-indigo-500"/> ระยะเวลาคุ้มครอง
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">วันเริ่มคุ้มครอง</label>
                                        <input type="date" value={form.start_date} onChange={e => { const d = e.target.value; setForm({...form, start_date: d, end_date: addYearsToDate(d, 1)}) }} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">วันสิ้นสุด</label>
                                        <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: Car & Customer --- */}
                    {activeTab === 'car' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2 uppercase tracking-wide"><User className="w-4 h-4 text-indigo-500"/> ข้อมูลลูกค้า</h3>
                                    
                                    <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Phone className="w-4 h-4 text-slate-400"/> {form.customer_phone || "-"}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Mail className="w-4 h-4 text-slate-400"/> {form.customer_email || "-"}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-semibold text-slate-500 block mb-1.5">ชื่อจริง</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600" value={form.customer_first_name} disabled /></div>
                                        <div><label className="text-xs font-semibold text-slate-500 block mb-1.5">นามสกุล</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600" value={form.customer_last_name} disabled /></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2 uppercase tracking-wide"><Shield className="w-4 h-4 text-indigo-500"/> แผนประกัน</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div><label className="text-xs font-semibold text-slate-500 block mb-1.5">บริษัทประกัน</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600" value={form.insurance_brand} disabled /></div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-xs font-semibold text-slate-500 block mb-1.5">ประเภทแผน</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600" value={form.insurance_level} disabled /></div>
                                            
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 block mb-1.5">เบี้ยประกัน</label>
                                                <div className="relative">
                                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-indigo-600" value={form.insurance_premium.toLocaleString()} disabled />
                                                    <Banknote className="w-4 h-4 text-slate-400 absolute left-3 top-3"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2 uppercase tracking-wide"><Car className="w-4 h-4 text-indigo-500"/> ข้อมูลรถยนต์</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div><label className="text-xs font-semibold text-slate-500 mb-1.5 block">ยี่ห้อ</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={form.car_brand} disabled /></div>
                                        <div><label className="text-xs font-semibold text-slate-500 mb-1.5 block">รุ่น</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={form.car_model} disabled /></div>
                                    </div>
                                    <div className="mb-4"><label className="text-xs font-semibold text-slate-500 mb-1.5 block">รุ่นย่อย</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={form.car_submodel} disabled /></div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div><label className="text-xs font-semibold text-slate-500 mb-1.5 block">ปี</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={form.car_year} disabled /></div>
                                        <div><label className="text-xs font-semibold text-slate-500 mb-1.5 block">สี</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={form.car_color} disabled /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-semibold text-slate-500 mb-1.5 block">ทะเบียน</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={form.car_registration} disabled /></div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">จังหวัด</label>
                                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" value={form.car_province} disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 3: Documents --- */}
                    {activeTab === "documents" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <RenderImageUpload label="บัตรประชาชน" currentImage={form.citizenCardImage} onFileChange={(e) => handleFile(e, 'citizenCardImage')} />
                            <RenderImageUpload label="ทะเบียนรถ" currentImage={form.carRegistrationImage} onFileChange={(e) => handleFile(e, 'carRegistrationImage')} />
                            
                            {form.paymentMethod === 'full' ? 
                                <RenderImageUpload 
                                    label="สลิปโอนเงิน" 
                                    currentImage={form.paymentSlipImage} 
                                    onFileChange={(e) => handleFile(e, 'paymentSlipImage')}
                                    extraInfo={<div className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2 bg-slate-50 p-2 rounded border border-slate-100"><Banknote className="w-3 h-3 text-green-600"/> ยอดชำระ: <span className="text-green-600 font-bold">{form.insurance_premium.toLocaleString()} บาท</span></div>}
                                /> 
                                : <div className="col-span-1 p-4 border border-dashed rounded-xl flex items-center justify-center text-sm text-slate-400">ลูกค้าเลือกผ่อนชำระ</div>
                            }
                            
                            {form.paymentMethod === 'installment' && (
                                <>
                                    <RenderImageUpload label="เอกสารผ่อน" currentImage={form.installmentDocImage} onFileChange={(e) => handleFile(e, 'installmentDocImage')} />
                                    <RenderImageUpload label="หนังสือยินยอม" currentImage={form.consentFormImage} onFileChange={(e) => handleFile(e, 'consentFormImage')} />
                                </>
                            )}

                            <div className="md:col-span-3 pt-4 border-t">
                                <RenderImageUpload label="ไฟล์กรมธรรม์ (PDF)" currentImage={form.policyFile} onFileChange={(e) => handleFile(e, 'policyFile')} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 bg-white border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm active:scale-95">ยกเลิก</button>
                    <button onClick={handleSaveLocal} className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center gap-2 active:scale-95"><Save className="w-4 h-4"/> บันทึกข้อมูล</button>
                </div>
            </div>
        </div>
    );
};

export default EditPolicyModal;