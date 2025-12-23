import React, { useState, useEffect } from 'react';
import { Edit, Save, X, ShieldAlert, Phone, MapPin, Hash, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { Agent } from '@/types/agent';
import { toInputDate } from '../utils';
import FormInput from './FormInput';

interface EditAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: Agent | null;
    onSave: (updatedData: Partial<Agent>) => Promise<void>;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({ isOpen, onClose, agent, onSave }) => {
    const [formData, setFormData] = useState<Partial<Agent> & { password?: string }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (agent) {
            setFormData({ ...agent, password: '' });
        }
    }, [agent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ เพิ่มการยืนยัน (Confirm) ก่อนบันทึก
        if (!confirm('คุณต้องการบันทึกการเปลี่ยนแปลงข้อมูลใช่หรือไม่?')) {
            return;
        }

        setIsSaving(true);
        try {
            const payload = { ...formData };
            // ถ้า password ว่าง ให้ลบออกไปเลย จะได้ไม่ส่งไปทับของเดิม
            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !agent) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl animate-fade-in-down my-8 border border-slate-200">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Edit size={20}/></div>
                        แก้ไขข้อมูลตัวแทน
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full hover:bg-slate-100 transition-colors"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        
                        {/* 1. Admin Override Status */}
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2"><ShieldAlert size={16}/> การจัดการสถานะ (Admin Override)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">สถานะปัจจุบัน</label>
                                    <select name="verification_status" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm cursor-pointer" value={formData.verification_status} onChange={handleChange}>
                                        <option value="in_review">🟡 รอตรวจสอบ (In Review)</option>
                                        <option value="approved">🟢 อนุมัติ (Approved)</option>
                                        <option value="rejected">🔴 ไม่ผ่าน / ระงับ (Rejected)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">หมายเหตุสถานะ</label>
                                    <input type="text" name="note" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="เหตุผลการเปลี่ยนสถานะ..." value={formData.note || ''} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Personal Info */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">ข้อมูลส่วนตัว</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormInput label="ชื่อจริง" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                <FormInput label="นามสกุล" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                <FormInput label="วันเกิด" name="birth_date" type="date" value={toInputDate(formData.birth_date)} onChange={handleChange} required />
                                <FormInput label="เบอร์โทรศัพท์" name="phone" value={formData.phone} onChange={handleChange} required icon={<Phone size={14}/>} />
                                <FormInput label="Line ID" name="idLine" value={formData.idLine} onChange={handleChange} />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ที่อยู่ปัจจุบัน <span className="text-red-500">*</span></label>
                                    <div className="relative"><MapPin className="absolute top-3 left-3 text-slate-400" size={16} /><textarea name="address" rows={2} required className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all" value={formData.address || ''} onChange={handleChange}></textarea></div>
                                </div>
                            </div>
                        </div>

                        {/* 3. License Info */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">ข้อมูลทางกฎหมาย</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormInput label="เลขใบอนุญาต" name="agent_license_number" value={formData.agent_license_number} onChange={handleChange} required icon={<Hash size={14}/>}/>
                                <FormInput label="วันหมดอายุบัตร" name="card_expiry_date" type="date" value={toInputDate(formData.card_expiry_date)} onChange={handleChange} required />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-500 mb-1.5">Username (Read Only)</label>
                                    <input type="text" disabled className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm cursor-not-allowed" value={formData.username || ''} />
                                </div>
                            </div>
                        </div>

                        {/* 4. Security */}
                        <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 mt-4">
                            <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Lock size={16}/> ความปลอดภัย (Security)
                            </h4>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    เปลี่ยนรหัสผ่านใหม่ (Reset Password)
                                    <span className="text-xs text-slate-400 font-normal ml-2">* เว้นว่างไว้หากไม่ต้องการเปลี่ยน</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3 text-slate-400"><Lock size={16} /></div>
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete="new-password"
                                        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all"
                                        placeholder="ระบุรหัสผ่านใหม่..."
                                        value={formData.password || ''}
                                        onChange={handleChange}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 font-medium transition-all text-sm">ยกเลิก</button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 text-sm disabled:opacity-70">
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} บันทึกการเปลี่ยนแปลง
                        </button>
                    </div>
                </form>
            </div>
         </div>
    );
};

export default EditAgentModal;