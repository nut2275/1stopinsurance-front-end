import React, { useState, useEffect, ChangeEvent } from "react";
import { X, Shield, Car, FileText, Save, Copy, Check, User, Calendar, AlertCircle } from "lucide-react";
import { Purchase, PaymentMethod, PurchaseStatus } from "../types";
import { THAI_PROVINCES, addYearsToDate, formatDateForInput, getTodayString } from "../utils";
import ImageUpload from "./ImageUpload";
import api from "@/services/api";

// Interface สำหรับข้อมูล Agent ที่ถูก Populate มา
interface PopulatedAgent {
    _id: string;
    first_name: string;
    last_name: string;
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
    
    // Insurance (Read Only)
    insurance_brand: string;
    insurance_level: string;
    
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

interface EditPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchase: Purchase;
    onSave: (id: string, data: Partial<EditFormState>) => Promise<void>;
}

type TabKey = "general" | "car" | "documents";

const EditPolicyModal: React.FC<EditPolicyModalProps> = ({ isOpen, onClose, purchase, onSave }) => {
    const [activeTab, setActiveTab] = useState<TabKey>("general");
    const [isCopied, setIsCopied] = useState(false);
    
    const [form, setForm] = useState<EditFormState>({
        status: "pending", reject_reason: "", policy_number: "", start_date: "", end_date: "", paymentMethod: "full",
        customer_first_name: "", customer_last_name: "", insurance_brand: "", insurance_level: "",
        car_brand: "", car_model: "", car_submodel: "", car_year: "", car_color: "", car_registration: "", car_province: "",
        paymentSlipImage: "", citizenCardImage: "", carRegistrationImage: "", installmentDocImage: "", consentFormImage: "", policyFile: ""
    });

    useEffect(() => {
        if (purchase) {
            const defaultStart = formatDateForInput(purchase.start_date) || getTodayString();
            const defaultEnd = formatDateForInput(purchase.end_date) || addYearsToDate(defaultStart, 1);

            setForm({
                status: purchase.status,
                reject_reason: purchase.reject_reason || "",
                policy_number: purchase.policy_number || "",
                start_date: defaultStart,
                end_date: defaultEnd,
                paymentMethod: purchase.paymentMethod || "full",
                
                customer_first_name: purchase.customer_id?.first_name || "",
                customer_last_name: purchase.customer_id?.last_name || "",
                
                insurance_brand: purchase.carInsurance_id?.insuranceBrand || "",
                insurance_level: purchase.carInsurance_id?.level || "",
                
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

    // ✅ ฟังก์ชันใหม่สำหรับจัดการ Save + Detailed Notification
    const handleSaveWithNotification = async () => {
        try {
            // 1. บันทึกข้อมูลลงฐานข้อมูล
            await onSave(purchase._id, form);

            // 2. ตรวจสอบการเปลี่ยนแปลงเพื่อสร้างข้อความแจ้งเตือน
            let messageParts: string[] = [];
            let type = "info";

            // --- ตรวจสอบ Status (สำคัญที่สุด) ---
            if (form.status !== purchase.status) {
                if (form.status === 'active') {
                    messageParts.push(`กรมธรรม์ของคุณได้รับการอนุมัติแล้ว`);
                    type = "success";
                } else if (form.status === 'rejected') {
                    messageParts.push(`คำขอซื้อประกันถูกปฏิเสธเนื่องจาก: ${form.reject_reason}`);
                    type = "warning";
                } else if (form.status === 'pending_payment') {
                    messageParts.push(`กรุณาชำระเงินสำหรับคำขอซื้อประกัน`);
                    type = "warning";
                } else {
                    messageParts.push(`สถานะกรมธรรม์เปลี่ยนเป็น: ${form.status}`);
                }
            }

            // --- ตรวจสอบรายละเอียดอื่นๆ (เปลี่ยนแปลงข้อมูล) ---
            const detailChanges: string[] = [];

            // 1. เลขกรมธรรม์
            if (form.policy_number !== (purchase.policy_number || "")) {
                detailChanges.push(`เลขกรมธรรม์เป็น ${form.policy_number}`);
            }

            // 2. รูปแบบการชำระเงิน
            if (form.paymentMethod !== purchase.paymentMethod) {
                const methodTH = form.paymentMethod === 'full' ? 'จ่ายเต็มจำนวน' : 'ผ่อนชำระ';
                detailChanges.push(`รูปแบบชำระเงินเป็น ${methodTH}`);
            }

            // 3. ระยะเวลาคุ้มครอง
            const oldStart = formatDateForInput(purchase.start_date);
            const oldEnd = formatDateForInput(purchase.end_date);
            if (form.start_date !== oldStart || form.end_date !== oldEnd) {
                detailChanges.push(`ระยะเวลาคุ้มครองเป็น ${form.start_date} ถึง ${form.end_date}`);
            }

            // 4. ตรวจสอบรูปภาพเอกสาร
            if (form.policyFile && form.policyFile !== (purchase.policyFile || "")) {
                detailChanges.push("อัปโหลดไฟล์กรมธรรม์ฉบับจริง");
            }
            if (form.paymentSlipImage && form.paymentSlipImage !== (purchase.paymentSlipImage || "")) {
                detailChanges.push("แก้ไขสลิปโอนเงิน");
            }
            if (form.citizenCardImage && form.citizenCardImage !== (purchase.citizenCardImage || "")) {
                detailChanges.push("แก้ไขรูปบัตรประชาชน");
            }
            if (form.carRegistrationImage && form.carRegistrationImage !== (purchase.carRegistrationImage || "")) {
                detailChanges.push("แก้ไขรูปเล่มทะเบียน");
            }
            if (form.installmentDocImage && form.installmentDocImage !== (purchase.installmentDocImage || "")) {
                detailChanges.push("แก้ไขเอกสารผ่อนชำระ");
            }
            if (form.consentFormImage && form.consentFormImage !== (purchase.consentFormImage || "")) {
                detailChanges.push("แก้ไขหนังสือยินยอม");
            }

            // --- รวมข้อความ ---
            if (detailChanges.length > 0) {
                if (messageParts.length > 0) {
                    messageParts.push(`และมีการแก้ไข: ${detailChanges.join(", ")}`);
                } else {
                    messageParts.push(`มีการแก้ไขข้อมูลกรมธรรม์: ${detailChanges.join(", ")}`);
                }
            }

            // ถ้าไม่มีการเปลี่ยนแปลงอะไรเลย ไม่ต้องส่ง Noti
            if (messageParts.length === 0) return;

            const finalMessage = messageParts.join(" ");

            // --- ส่ง Notification ---
            const customerId = purchase.customer_id?._id || purchase.customer_id;

            console.log("Debug Agent ID:", purchase.agent_id);

            // ✅ เตรียมชื่อ Agent (ผู้ส่ง) แบบ Type Safe
            const agentData = purchase.agent_id as unknown as (string | PopulatedAgent);
            
            let agentName = "";

            // ตรวจสอบว่าเป็น Object และมี field first_name หรือไม่
            if (agentData && typeof agentData === 'object' && 'first_name' in agentData) {
                agentName = `${agentData.first_name} ${agentData.last_name}`;
            }

            if (customerId) {
                await api.post("/api/notifications", {
                    recipientType: 'customer',
                    recipientId: customerId,
                    message: finalMessage,
                    type: type, 
                    sender: {
                        name: agentName, 
                        role: "agent"
                    }
                });
                console.log(`Notification sent from agent (${agentName}) to customer:`, finalMessage);
            }

        } catch (error) {
            console.error("Error saving or sending notification:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100">
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">แก้ไขข้อมูลกรมธรรม์</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono border border-slate-200 uppercase tracking-wide">ID: {purchase._id.substring(0, 10)}...</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shadow-sm"><X className="w-5 h-5" /></button>
                </div>

                {/* Modern Tabs */}
                <div className="flex border-b border-slate-200 px-8 bg-slate-50/50 sticky top-0 z-10 gap-6">
                    {([{ id: "general", label: "ข้อมูลทั่วไป", icon: Shield }, { id: "car", label: "รถยนต์ & ลูกค้า", icon: Car }, { id: "documents", label: "เอกสารแนบ", icon: FileText }] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 text-sm font-semibold border-b-2 transition-all ${
                                activeTab === tab.id 
                                ? "border-indigo-600 text-indigo-600 translate-y-[1px]" 
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "fill-indigo-100" : ""}`}/> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    {activeTab === "general" && (
                        <div className="space-y-8 max-w-3xl mx-auto">
                            {/* Status Section */}
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

                    {activeTab === "car" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2 uppercase tracking-wide"><User className="w-4 h-4 text-indigo-500"/> ข้อมูลลูกค้า</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-semibold text-slate-500 block mb-1.5">ชื่อจริง</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600" value={form.customer_first_name} disabled /></div>
                                        <div><label className="text-xs font-semibold text-slate-500 block mb-1.5">นามสกุล</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600" value={form.customer_last_name} disabled /></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2 uppercase tracking-wide"><Shield className="w-4 h-4 text-indigo-500"/> แผนประกัน</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div><label className="text-xs font-semibold text-slate-500 block mb-1.5">บริษัทประกัน</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600" value={form.insurance_brand} disabled /></div>
                                        <div><label className="text-xs font-semibold text-slate-500 block mb-1.5">ประเภทแผน</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600" value={form.insurance_level} disabled /></div>
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

                    {activeTab === "documents" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ImageUpload label="บัตรประชาชน" currentImage={form.citizenCardImage} onFileChange={e => handleFile(e, 'citizenCardImage')} />
                            <ImageUpload label="ทะเบียนรถ" currentImage={form.carRegistrationImage} onFileChange={e => handleFile(e, 'carRegistrationImage')} />
                            {form.paymentMethod === 'full' ? 
                                <ImageUpload label="สลิปโอนเงิน" currentImage={form.paymentSlipImage} onFileChange={e => handleFile(e, 'paymentSlipImage')} /> :
                                <><ImageUpload label="เอกสารผ่อน" currentImage={form.installmentDocImage} onFileChange={e => handleFile(e, 'installmentDocImage')} /> <ImageUpload label="หนังสือยินยอม" currentImage={form.consentFormImage} onFileChange={e => handleFile(e, 'consentFormImage')} /></>
                            }
                            <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                                <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-500"/> เอกสารส่งมอบลูกค้า</h4>
                                <ImageUpload label="ไฟล์กรมธรรม์ฉบับจริง (สำหรับลูกค้าดาวน์โหลด)" currentImage={form.policyFile} onFileChange={e => handleFile(e, 'policyFile')} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 bg-white border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm active:scale-95">ยกเลิก</button>
                    {/* ✅ เรียกใช้ handleSaveWithNotification */}
                    <button onClick={handleSaveWithNotification} className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center gap-2 active:scale-95"><Save className="w-4 h-4"/> บันทึกข้อมูล</button>
                </div>
            </div>
        </div>
    );
};

export default EditPolicyModal;