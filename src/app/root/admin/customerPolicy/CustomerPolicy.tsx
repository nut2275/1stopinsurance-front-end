"use client";

import { useState, useEffect, ChangeEvent } from "react";
import api from "@/services/api";
import { Search, Edit, X, Save, Upload, Eye, ChevronLeft, ChevronRight, FileText, CreditCard, Calendar, Copy, Check, AlertCircle } from "lucide-react";

// --- รายชื่อจังหวัด ---
const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
  "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา",
  "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
  "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์",
  "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี",
  "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร",
  "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู",
  "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
].sort();

// --- Types ---
type Purchase = {
  _id: string;
  customer_id: any;
  agent_id: any;
  carInsurance_id: any;
  car_id: any;
  policy_number: string;
  status: string;
  reject_reason?: string;
  
  start_date?: string;
  end_date?: string;
  updatedAt: string;

  citizenCardImage: string;
  carRegistrationImage: string;
  paymentSlipImage?: string;
  installmentDocImage?: string;
  consentFormImage?: string;
  policyFile?: string;
  
  paymentMethod?: string;

  createdAt: string;
};

const INSURANCE_COMPANIES = [
  "ทั้งหมด",
  "มิตรแท้ประกันภัย",
  "วิริยะประกันภัย",
  "กรุงเทพประกันภัย",
  "ธนชาตประกันภัย",
  "เมืองไทยประกันภัย",
  "ทิพยประกันภัย"
];

const INSURANCE_LEVELS = ["ชั้น 1", "ชั้น 2+", "ชั้น 2", "ชั้น 3+", "ชั้น 3"];
const ITEMS_PER_PAGE = 10;

// ✅ ตัวเลือกสถานะสำหรับการกรอง
const FILTER_STATUSES = [
    { value: "all", label: "ทั้งหมด" },
    { value: "pending", label: "รอตรวจสอบ" },
    { value: "pending_payment", label: "รอชำระเงิน" },
    { value: "active", label: "คุ้มครองแล้ว (Active)" },
    { value: "expired", label: "หมดอายุ" },
    { value: "rejected", label: "ปฏิเสธ" },
];

// --- Helper Functions ---

const getTodayString = () => new Date().toISOString().split('T')[0];

const addYearsToDate = (dateStr: string, years: number): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString().split('T')[0];
};

const formatDateForInput = (isoDateString?: string) => {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return ""; 
    return date.toISOString().split('T')[0];
};

const formatDisplayDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = (date.getFullYear() + 543);
    return `${day}/${month}/${year}`;
};

const formatTableDate = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("th-TH", {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export default function ManagePolicyPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredData, setFilteredData] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchName, setSearchName] = useState("");
  const [searchAgent, setSearchAgent] = useState("");
  const [searchCompany, setSearchCompany] = useState("ทั้งหมด");
  const [searchPolicyNo, setSearchPolicyNo] = useState("");
  const [searchStatus, setSearchStatus] = useState("all"); // ✅ เพิ่ม State สถานะ

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Form Data
  const [editForm, setEditForm] = useState({
    status: "", 
    reject_reason: "", 
    policy_number: "", 
    start_date: "", 
    end_date: "",
    paymentSlipImage: "", citizenCardImage: "", carRegistrationImage: "",
    installmentDocImage: "", consentFormImage: "", policyFile: "",
    customer_first_name: "", customer_last_name: "", insurance_brand: "",
    insurance_level: "", 
    car_brand: "", car_model: "", car_year: "", car_color: "", car_registration: "", car_province: "", 
    paymentMethod: "full" 
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/purchase/admin/all");
      setPurchases(res.data);
      setFilteredData(res.data);
    } catch (error) { console.error("Error:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // ✅ ปรับปรุง Logic การกรอง
  useEffect(() => {
    let temp = purchases;
    if (searchName) temp = temp.filter((p) => (`${p.customer_id?.first_name} ${p.customer_id?.last_name}`).toLowerCase().includes(searchName.toLowerCase()));
    if (searchAgent) temp = temp.filter((p) => JSON.stringify(p.agent_id || "").toLowerCase().includes(searchAgent.toLowerCase()));
    if (searchCompany && searchCompany !== "ทั้งหมด") temp = temp.filter((p) => (p.carInsurance_id?.insuranceBrand || "") === searchCompany);
    if (searchPolicyNo) temp = temp.filter((p) => (p.policy_number || "").toLowerCase().includes(searchPolicyNo.toLowerCase()));
    
    // กรองตามสถานะ
    if (searchStatus !== "all") {
        temp = temp.filter((p) => p.status === searchStatus);
    }

    setFilteredData(temp); 
    setCurrentPage(1); 
  }, [searchName, searchAgent, searchCompany, searchPolicyNo, searchStatus, purchases]); // อย่าลืมใส่ searchStatus ใน dependency

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (n: number) => { if (n >= 1 && n <= totalPages) setCurrentPage(n); };

  const handleEditClick = (item: Purchase) => {
    setSelectedItem(item);
    const existingStart = formatDateForInput(item.start_date);
    const defaultStart = existingStart || getTodayString(); 
    const existingEnd = formatDateForInput(item.end_date);
    const defaultEnd = existingEnd || addYearsToDate(defaultStart, 1); 

    setEditForm({
      status: item.status, 
      reject_reason: item.reject_reason || "", 
      policy_number: item.policy_number || "",
      start_date: defaultStart, end_date: defaultEnd,
      paymentSlipImage: item.paymentSlipImage || "", policyFile: item.policyFile || "",
      citizenCardImage: item.citizenCardImage || "", carRegistrationImage: item.carRegistrationImage || "",
      installmentDocImage: item.installmentDocImage || "", consentFormImage: item.consentFormImage || "",
      customer_first_name: item.customer_id?.first_name || "", customer_last_name: item.customer_id?.last_name || "",
      insurance_brand: item.carInsurance_id?.insuranceBrand || "", insurance_level: item.carInsurance_id?.level || "",
      car_brand: item.car_id?.brand || "", car_model: item.car_id?.carModel || "",
      car_year: item.car_id?.year || "", car_color: item.car_id?.color || "", 
      car_registration: item.car_id?.registration || "", car_province: item.car_id?.province || "", 
      paymentMethod: item.paymentMethod || "full"
    });
    setIsModalOpen(true);
  };

  const handleCopyPolicy = () => {
    if (editForm.policy_number) {
        navigator.clipboard.writeText(editForm.policy_number);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: keyof typeof editForm) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setEditForm((prev) => ({ ...prev, [field]: reader.result as string })); };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedItem) return;
    try { await api.put(`/purchase/admin/${selectedItem._id}`, { ...editForm }); alert("บันทึกข้อมูลสำเร็จ"); setIsModalOpen(false); fetchData(); } 
    catch (error) { console.error("Save error:", error); alert("เกิดข้อผิดพลาดในการบันทึก"); }
  };

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value; const newEnd = addYearsToDate(newStart, 1);
    setEditForm({ ...editForm, start_date: newStart, end_date: newEnd });
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value; const newStart = addYearsToDate(newEnd, -1);
    setEditForm({ ...editForm, start_date: newStart, end_date: newEnd });
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value; let updates: any = { status: newStatus };
    if (newStatus === 'active') {
        if(!editForm.start_date) {
            const today = getTodayString(); updates.start_date = today; updates.end_date = addYearsToDate(today, 1);
        }
    }
    setEditForm({ ...editForm, ...updates });
  };

  const renderImageUpload = (label: string, fieldName: keyof typeof editForm, currentImage: string) => {
    const isPdf = currentImage?.startsWith('data:application/pdf') || currentImage?.toLowerCase().endsWith('.pdf');
    return (
      <div className="mb-4 border-b pb-4 last:border-b-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex justify-between items-center">
              <span>{label}</span> {currentImage && <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">มีไฟล์แล้ว</span>}
          </h3>
          {currentImage ? (
              <div className="relative group mb-2">
                  {isPdf ? (
                      <div className="h-32 w-full border rounded bg-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition" onClick={() => { const win = window.open(); win?.document.write('<iframe src="' + currentImage + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'); }}>
                          <FileText className="w-10 h-10 text-red-500 mb-2" /><span className="text-xs text-gray-600 font-medium">เอกสาร PDF</span><span className="text-[10px] text-gray-400">คลิกเพื่อเปิดดู</span>
                      </div>
                  ) : (
                      <><img src={currentImage} alt={label} className="h-32 w-full object-cover border rounded bg-gray-100 cursor-pointer" onClick={() => window.open(currentImage)} onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Image+Not+Found"; }} /><div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition pointer-events-none rounded"></div></>
                  )}
              </div>
          ) : (
              <div className="h-32 bg-gray-100 border border-dashed rounded flex items-center justify-center text-gray-400 text-sm mb-2">ไม่มีไฟล์แนบ</div>
          )}
          <label className="flex items-center gap-2 w-full p-2 border border-dashed rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition text-sm justify-center text-gray-600 font-medium bg-white"><Upload className="w-4 h-4 text-blue-500" /> {currentImage ? "แก้ไขไฟล์" : "อัปโหลดไฟล์"}<input type="file" className="hidden" accept={fieldName === 'policyFile' ? "image/*,application/pdf" : "image/*"} onChange={(e) => handleFileChange(e, fieldName)} /></label>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <style jsx global>{`
        .custom-date-input { position: relative; color: transparent; }
        .custom-date-input::before { content: attr(data-date); position: absolute; left: 0.5rem; top: 50%; transform: translateY(-50%); color: #374151; pointer-events: none; font-size: 0.875rem; width: 80%; background-color: #f0fdf4; }
        .custom-date-input[value=""]::before { content: "" !important; }
        .custom-date-input[value=""] { color: #9ca3af; }
        .custom-date-input::-webkit-calendar-picker-indicator { position: absolute; right: 0.5rem; z-index: 10; cursor: pointer; }
      `}</style>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">จัดการรายการกรมธรรม์</h1>

      {/* Filter Section - ปรับเป็น grid-cols-5 เพื่อเพิ่มช่องสถานะ */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
         <div><label className="text-sm text-gray-500">ชื่อลูกค้า</label><div className="relative"><input type="text" className="w-full border rounded p-2 pl-8 outline-none" placeholder="ค้นหาชื่อ..." value={searchName} onChange={(e) => setSearchName(e.target.value)} /><Search className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" /></div></div>
         <div><label className="text-sm text-gray-500">ตัวแทน</label><input type="text" className="w-full border rounded p-2 outline-none" placeholder="ค้นหาตัวแทน..." value={searchAgent} onChange={(e) => setSearchAgent(e.target.value)} /></div>
         <div><label className="text-sm text-gray-500">เลขกรมธรรม์</label><input type="text" className="w-full border rounded p-2 outline-none" placeholder="ค้นหาเลข..." value={searchPolicyNo} onChange={(e) => setSearchPolicyNo(e.target.value)} /></div>
         <div><label className="text-sm text-gray-500">บริษัทประกัน</label><select className="w-full border rounded p-2 bg-white outline-none" value={searchCompany} onChange={(e) => setSearchCompany(e.target.value)}>{INSURANCE_COMPANIES.map((c, i) => (<option key={i} value={c}>{c}</option>))}</select></div>
         
         {/* ✅ ช่องเลือกสถานะ */}
         <div>
            <label className="text-sm text-gray-500">สถานะ</label>
            <select className="w-full border rounded p-2 bg-white outline-none" value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                {FILTER_STATUSES.map((status, i) => (
                    <option key={i} value={status.value}>{status.label}</option>
                ))}
            </select>
         </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                <tr><th className="p-4 border-b">วันที่ทำรายการ</th><th className="p-4 border-b">ลูกค้า</th><th className="p-4 border-b">ตัวแทน</th><th className="p-4 border-b">แผนประกัน</th><th className="p-4 border-b">เลขกรมธรรม์</th><th className="p-4 border-b">สถานะ</th><th className="p-4 border-b text-center">จัดการ</th></tr>
            </thead>
            <tbody>
                {loading ? <tr><td colSpan={7} className="p-6 text-center">Loading...</td></tr> : currentItems.map((item) => (
                    <tr key={item._id} className="hover:bg-blue-50/50 border-b last:border-0 transition-colors">
                        <td className="p-4 text-sm text-gray-600">{formatTableDate(item.createdAt)}</td>
                        <td className="p-4"><div className="font-medium text-gray-800">{item.customer_id?.first_name} {item.customer_id?.last_name}</div><div className="text-xs text-gray-500">{item.customer_id?.username || "Guest"}</div></td>
                        <td className="p-4 text-gray-600 text-sm">{typeof item.agent_id === 'object' ? `${item.agent_id?.first_name || '-'} ${item.agent_id?.last_name || ''}` : item.agent_id || "-"}</td>
                        <td className="p-4"><div className="font-semibold text-gray-700">{item.carInsurance_id?.insuranceBrand || "ไม่ระบุ"}</div><div className="text-xs text-gray-500 inline-block bg-gray-100 px-2 py-0.5 rounded mt-1">{item.carInsurance_id?.level || "-"}</div></td>
                        <td className="p-4 font-mono text-sm">{item.policy_number ? <span className="text-blue-600 font-medium">{item.policy_number}</span> : <span className="text-gray-400 italic">รออนุมัติ</span>}</td>
                        <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${item.status === 'active' ? 'bg-green-100 text-green-700' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : item.status === 'pending_payment' ? 'bg-orange-100 text-orange-700' : item.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{item.status.replace('_', ' ')}</span></td>
                        <td className="p-4 text-center"><button onClick={() => handleEditClick(item)} className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 p-2 rounded-lg transition shadow-sm"><Edit className="w-4 h-4" /></button></td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
        {!loading && filteredData.length > 0 && (<div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50 gap-4"><span className="text-sm text-gray-500">แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredData.length)} จาก {filteredData.length}</span><div className="flex items-center gap-2"><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 border rounded-md hover:bg-white disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button><span className="text-sm">Page {currentPage} of {totalPages}</span><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border rounded-md hover:bg-white disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button></div></div>)}
      </div>

      {/* --- Modal Section --- */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-start md:items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl animate-fade-in my-8 relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10 rounded-t-xl">
              <div><h2 className="text-xl font-bold text-gray-800">รายละเอียดกรมธรรม์</h2><p className="text-sm text-gray-500">ID: {selectedItem._id}</p></div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto flex-grow">
              <div className="space-y-6">
                 
                 {/* ข้อมูลลูกค้า/ประกัน/รถ */}
                 <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b"><Edit className="w-4 h-4 text-blue-600"/> แก้ไขข้อมูลผู้ซื้อและการประกัน</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs text-gray-500">ชื่อจริง</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.customer_first_name} onChange={(e) => setEditForm({...editForm, customer_first_name: e.target.value})} /></div>
                        <div><label className="text-xs text-gray-500">นามสกุล</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.customer_last_name} onChange={(e) => setEditForm({...editForm, customer_last_name: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs text-gray-500">บริษัทประกัน</label><select className="w-full border rounded p-1.5 text-sm bg-white outline-none" value={editForm.insurance_brand} onChange={(e) => setEditForm({...editForm, insurance_brand: e.target.value})}>{INSURANCE_COMPANIES.filter(c => c !== "ทั้งหมด").map(c => (<option key={c} value={c}>{c}</option>))}</select></div>
                        <div><label className="text-xs text-gray-500">ชั้นประกัน</label><select className="w-full border rounded p-1.5 text-sm bg-white outline-none" value={editForm.insurance_level} onChange={(e) => setEditForm({...editForm, insurance_level: e.target.value})}>{INSURANCE_LEVELS.map(level => (<option key={level} value={level}>{level}</option>))}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs text-gray-500">ยี่ห้อรถ</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.car_brand} onChange={(e) => setEditForm({...editForm, car_brand: e.target.value})} /></div>
                        <div><label className="text-xs text-gray-500">รุ่นรถ</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.car_model} onChange={(e) => setEditForm({...editForm, car_model: e.target.value})} /></div>
                    </div>
                    
                    {/* ✅ เพิ่มปีรถและสีรถ */}
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs text-gray-500">ปีรถ (ค.ศ.)</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.car_year} onChange={(e) => setEditForm({...editForm, car_year: e.target.value})} placeholder="เช่น 2023" /></div>
                        <div><label className="text-xs text-gray-500">สีรถ</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.car_color} onChange={(e) => setEditForm({...editForm, car_color: e.target.value})} placeholder="เช่น ขาว" /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs text-gray-500">ทะเบียนรถ</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.car_registration} onChange={(e) => setEditForm({...editForm, car_registration: e.target.value})} /></div>
                        {/* ✅ เพิ่ม Dropdown จังหวัด */}
                        <div>
                            <label className="text-xs text-gray-500">จังหวัด</label>
                            <select 
                                className="w-full border rounded p-1.5 text-sm bg-white outline-none" 
                                value={editForm.car_province} 
                                onChange={(e) => setEditForm({...editForm, car_province: e.target.value})}
                            >
                                <option value="">เลือกจังหวัด</option>
                                {THAI_PROVINCES.map((province) => (
                                    <option key={province} value={province}>{province}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                 </div>

                 <hr className="border-gray-200"/>

                 {/* Payment/Status */}
                 <div><label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4"/> รูปแบบการชำระเงิน</label><select value={editForm.paymentMethod} onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 bg-white outline-none"><option value="full">จ่ายเต็ม (Full Payment)</option><option value="installment">ผ่อนชำระ (Installment)</option></select></div>
                 <hr className="border-gray-200"/>
                 <div><label className="block text-sm font-semibold text-gray-700 mb-2">สถานะกรมธรรม์</label><select value={editForm.status} onChange={handleStatusChange} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 bg-white outline-none"><option value="pending">Pending (รอตรวจสอบ)</option><option value="pending_payment">Pending Payment (รอชำระเงิน)</option><option value="active">Active (คุ้มครองแล้ว)</option><option value="expired">Expired (หมดอายุ)</option><option value="rejected">Rejected (ปฏิเสธ)</option></select></div>

                 {/* ✅ เพิ่ม: ช่องหมายเหตุเมื่อปฏิเสธ */}
                 {editForm.status === 'rejected' && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200 animate-fade-in mt-2">
                        <label className="block text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4"/> สาเหตุที่ปฏิเสธ (Reject Reason)
                        </label>
                        <textarea 
                            className="w-full border-red-300 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[80px]"
                            placeholder="ระบุเหตุผล เช่น เอกสารไม่ชัดเจน, ข้อมูลไม่ถูกต้อง..."
                            value={editForm.reject_reason}
                            onChange={(e) => setEditForm({...editForm, reject_reason: e.target.value})}
                        />
                    </div>
                 )}

                 {/* Date Inputs */}
                 {editForm.status === 'active' && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 animate-fade-in">
                        <label className="block text-sm font-semibold text-green-800 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4"/> ระยะเวลาคุ้มครอง (Active)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-green-700 mb-1 block">วันที่เริ่มคุ้มครอง</label>
                                <input type="date" value={editForm.start_date} onChange={handleStartDateChange} className="custom-date-input w-full border-green-300 rounded p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-green-50" data-date={formatDisplayDate(editForm.start_date)} />
                            </div>
                            <div>
                                <label className="text-xs text-green-700 mb-1 block">วันที่สิ้นสุด</label>
                                <input type="date" value={editForm.end_date} onChange={handleEndDateChange} className="custom-date-input w-full border-green-300 rounded p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-green-50" data-date={formatDisplayDate(editForm.end_date)} />
                            </div>
                        </div>
                    </div>
                 )}

                 {/* Policy No + Copy Button */}
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">เลขกรมธรรม์จริง</label>
                    <div className="relative">
                        <input type="text" value={editForm.policy_number} onChange={(e) => setEditForm({...editForm, policy_number: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 pr-10 outline-none font-mono" placeholder="เช่น P-123456789" />
                        <button type="button" onClick={handleCopyPolicy} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="คัดลอกเลขกรมธรรม์">
                            {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />}
                        </button>
                    </div>
                 </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">จัดการเอกสารแนบ</h3>
                {renderImageUpload("รูปบัตรประชาชน (ลูกค้า)", "citizenCardImage", editForm.citizenCardImage)}
                {renderImageUpload("รูปทะเบียนรถ (ลูกค้า)", "carRegistrationImage", editForm.carRegistrationImage)}
                {editForm.paymentMethod === 'full' ? (renderImageUpload("หลักฐานการโอนเงิน (Admin)", "paymentSlipImage", editForm.paymentSlipImage)) : (<>{renderImageUpload("เอกสารการผ่อน (ลูกค้า)", "installmentDocImage", editForm.installmentDocImage)}{renderImageUpload("หนังสือยินยอม (ถ้ามี)", "consentFormImage", editForm.consentFormImage)}</>)}
                {renderImageUpload("ไฟล์กรมธรรม์ฉบับจริง (PDF/รูปภาพ)", "policyFile", editForm.policyFile)}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 rounded-b-xl">
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition">ยกเลิก</button>
               <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm transition transform active:scale-95"><Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}