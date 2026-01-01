"use client";

import { useState, useEffect, ChangeEvent, useMemo } from "react";
import api from "@/services/api";
import { 
  Search, Edit, X, Save, Upload, Eye, ChevronLeft, ChevronRight, 
  FileText, CreditCard, Calendar, Copy, Check, AlertCircle, Download, 
  Filter, Car, User, ShieldCheck, Clock, CheckCircle2, XCircle, Briefcase, ListFilter,
  FileCheck, Image as ImageIcon, Paperclip, Phone, Mail, Banknote
} from "lucide-react";

// --- 1. Constants & Types ---
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

interface Customer { 
    _id: string; 
    first_name: string; 
    last_name: string; 
    username: string;
    email?: string; 
    phone?: string; 
    imgProfile_customer?: string; 
}
interface Agent { _id: string; first_name: string; last_name: string; }
interface CarInsurance { insuranceBrand: string; level: string; premium: number; }
interface Car { brand: string; carModel?: string; model?: string; subModel?: string; sub_model?: string; year: string; color: string; registration: string; province: string; }

type Purchase = {
  _id: string;
  customer_id: Customer | null; 
  agent_id: Agent | string | null; 
  carInsurance_id: CarInsurance | null;
  car_id: Car | null;
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

const INSURANCE_COMPANIES = ["ทั้งหมด", "มิตรแท้ประกันภัย", "วิริยะประกันภัย", "กรุงเทพประกันภัย", "ธนชาตประกันภัย", "เมืองไทยประกันภัย", "ทิพยประกันภัย"];
const INSURANCE_LEVELS = ["ชั้น 1", "ชั้น 2+", "ชั้น 2", "ชั้น 3+", "ชั้น 3"];
const ITEMS_PER_PAGE = 10;

const FILTER_STATUSES = [
    { value: "all", label: "สถานะทั้งหมด" },
    { value: "pending", label: "รอตรวจสอบ" },
    { value: "pending_payment", label: "รอชำระเงิน" },
    { value: "active", label: "คุ้มครองแล้ว" },
    { value: "about_to_expire", label: "ใกล้หมดอายุ" },
    { value: "expired", label: "หมดอายุ" },
    { value: "rejected", label: "ไม่ผ่าน" },
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
    return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0];
};
const formatTableDate = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("th-TH", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// --- Component ---
export default function ManagePolicyPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredData, setFilteredData] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchName, setSearchName] = useState("");
  const [searchAgent, setSearchAgent] = useState(""); 
  const [searchCompany, setSearchCompany] = useState("ทั้งหมด");
  const [searchPolicyNo, setSearchPolicyNo] = useState("");
  const [searchStatus, setSearchStatus] = useState("all"); 
  
  const [sortOrder, setSortOrder] = useState("desc"); 
  const [filterCarBrand, setFilterCarBrand] = useState("");
  const [filterCarModel, setFilterCarModel] = useState("");
  const [filterCarSubModel, setFilterCarSubModel] = useState("");

  const [filterModelList, setFilterModelList] = useState<string[]>([]);
  const [filterSubModelList, setFilterSubModelList] = useState<string[]>([]);

  // Pagination & Modal
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'documents'>('info');

  // Edit Form Options
  const [brandOptions, setBrandOptions] = useState<string[]>([]); 
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [subModelOptions, setSubModelOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]); // ✅ เพิ่ม State สำหรับปี

  const [editForm, setEditForm] = useState({
    status: "", reject_reason: "", policy_number: "", start_date: "", end_date: "",
    paymentSlipImage: "", citizenCardImage: "", carRegistrationImage: "",
    installmentDocImage: "", consentFormImage: "", policyFile: "",
    customer_first_name: "", customer_last_name: "", insurance_brand: "", insurance_level: "", 
    car_brand: "", car_model: "", car_submodel: "", car_year: "", car_color: "", car_registration: "", car_province: "", 
    paymentMethod: "full",
    customer_phone: "", customer_email: "", premium_price: 0
  });

  // --- API Fetching ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/purchase/admin/all");
      setPurchases(res.data);
      setFilteredData(res.data);
    } catch (error) { console.error("Error:", error); } 
    finally { setLoading(false); }
  };

  const fetchBrands = async () => {
      try { const res = await api.get("/car-master/brands"); setBrandOptions(res.data); } catch (err) { console.error(err); }
  };
  const fetchModelsGeneric = async (brand: string) => {
      if (!brand) return [];
      try { return (await api.get(`/car-master/models?brand=${encodeURIComponent(brand)}`)).data; } catch (err) { return []; }
  };
  const fetchSubModelsGeneric = async (brand: string, model: string) => {
      if (!brand || !model) return [];
      try { return (await api.get(`/car-master/sub-models?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`)).data; } catch (err) { return []; }
  };
  // ✅ เพิ่มฟังก์ชันดึงปีแบบกรอง
  const fetchYearsGeneric = async (brand: string, model: string, subModel: string) => {
        if (!brand || !model || !subModel) return [];
        try { 
            // 👇 แก้ตรงนี้: เปลี่ยนจาก /years เป็น /years-filter
            const url = `/car-master/years-filter?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&subModel=${encodeURIComponent(subModel)}`;
            const res = await api.get(url);
            return res.data; 
        } catch (err) { return []; }
  };

  useEffect(() => { fetchData(); fetchBrands(); }, []);

  // --- Filter Logic ---
  useEffect(() => {
    let temp = purchases;
    if (searchName) temp = temp.filter((p) => (`${p.customer_id?.first_name} ${p.customer_id?.last_name}`).toLowerCase().includes(searchName.toLowerCase()));
    if (searchAgent) temp = temp.filter((p) => {
        const agentName = typeof p.agent_id === 'object' ? `${(p.agent_id as Agent)?.first_name} ${(p.agent_id as Agent)?.last_name}` : "";
        return agentName.toLowerCase().includes(searchAgent.toLowerCase());
    });
    if (searchCompany && searchCompany !== "ทั้งหมด") temp = temp.filter((p) => (p.carInsurance_id?.insuranceBrand || "") === searchCompany);
    if (searchPolicyNo) temp = temp.filter((p) => (p.policy_number || "").toLowerCase().includes(searchPolicyNo.toLowerCase()));
    
    if (searchStatus !== "all") {
        if (searchStatus === 'rejected_expired') {
             temp = temp.filter((p) => p.status === 'rejected' || p.status === 'expired');
        } else {
             temp = temp.filter((p) => p.status === searchStatus);
        }
    }

    if (filterCarBrand) temp = temp.filter((p) => (p.car_id?.brand || "").trim() === filterCarBrand);
    if (filterCarModel) temp = temp.filter((p) => (p.car_id?.carModel || "").trim() === filterCarModel);
    if (filterCarSubModel) temp = temp.filter((p) => (p.car_id?.subModel || "").trim() === filterCarSubModel);

    temp.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredData([...temp]); 
    setCurrentPage(1); 
  }, [searchName, searchAgent, searchCompany, searchPolicyNo, searchStatus, sortOrder, filterCarBrand, filterCarModel, filterCarSubModel, purchases]);

  // --- Statistics ---
  const stats = useMemo(() => {
      return {
          all: purchases.length,
          pending: purchases.filter(p => p.status === 'pending').length,
          pending_payment: purchases.filter(p => p.status === 'pending_payment').length,
          active: purchases.filter(p => p.status === 'active').length,
          about_to_expire: purchases.filter(p => p.status === 'about_to_expire').length,
          expired: purchases.filter(p => p.status === 'expired').length,
          rejected: purchases.filter(p => p.status === 'rejected').length,
      };
  }, [purchases]);

  // --- Handlers ---
  const handleFilterBrandChange = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value; setFilterCarBrand(val); setFilterCarModel(""); setFilterCarSubModel("");
      setFilterModelList(val ? await fetchModelsGeneric(val) : []); setFilterSubModelList([]);
  };
  const handleFilterModelChange = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value; setFilterCarModel(val); setFilterCarSubModel("");
      setFilterSubModelList(val ? await fetchSubModelsGeneric(filterCarBrand, val) : []);
  };
  
  const handleEditClick = async (item: Purchase) => {
    setSelectedItem(item);
    setActiveModalTab('info');
    const existingStart = formatDateForInput(item.start_date);
    const defaultStart = existingStart || getTodayString(); 
    const defaultEnd = formatDateForInput(item.end_date) || addYearsToDate(defaultStart, 1); 
    const currentBrand = (item.car_id?.brand || "").trim();
    const currentModel = (item.car_id?.carModel || item.car_id?.model || "").trim(); 
    const currentSubModel = (item.car_id?.subModel || item.car_id?.sub_model || "").trim(); 

    setEditForm({
      status: item.status, reject_reason: item.reject_reason || "", policy_number: item.policy_number || "",
      start_date: defaultStart, end_date: defaultEnd,
      paymentSlipImage: item.paymentSlipImage || "", policyFile: item.policyFile || "",
      citizenCardImage: item.citizenCardImage || "", carRegistrationImage: item.carRegistrationImage || "",
      installmentDocImage: item.installmentDocImage || "", consentFormImage: item.consentFormImage || "",
      customer_first_name: item.customer_id?.first_name || "", customer_last_name: item.customer_id?.last_name || "",
      insurance_brand: item.carInsurance_id?.insuranceBrand || "", insurance_level: item.carInsurance_id?.level || "",
      car_brand: currentBrand, car_model: currentModel, car_submodel: currentSubModel,
      car_year: item.car_id?.year?.toString() || "", 
      car_color: item.car_id?.color || "", 
      car_registration: item.car_id?.registration || "", car_province: item.car_id?.province || "", 
      paymentMethod: item.paymentMethod || "full",
      customer_phone: item.customer_id?.phone || "-",
      customer_email: item.customer_id?.email || "-",
      premium_price: item.carInsurance_id?.premium || 0
    });

    // ✅ เพิ่ม Logic โหลด Dropdown ให้ครบถ้วน รวมถึงปี
    if (currentBrand) {
        const models = await fetchModelsGeneric(currentBrand);
        setModelOptions(models);
        
        if (currentModel) {
            const subModels = await fetchSubModelsGeneric(currentBrand, currentModel);
            setSubModelOptions(subModels);

            if (currentSubModel) {
                // ✅ ดึงปีมารอ
                const years = await fetchYearsGeneric(currentBrand, currentModel, currentSubModel);
                setYearOptions(years);
            }
        }
    } else { 
        setModelOptions([]); setSubModelOptions([]); setYearOptions([]);
    }
    setIsModalOpen(true);
  };

  const handleEditBrandChange = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value; 
      setEditForm({ ...editForm, car_brand: val, car_model: "", car_submodel: "", car_year: "" }); 
      setModelOptions(await fetchModelsGeneric(val)); 
      setSubModelOptions([]); setYearOptions([]);
  };
  const handleEditModelChange = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value; 
      setEditForm({ ...editForm, car_model: val, car_submodel: "", car_year: "" }); 
      setSubModelOptions(await fetchSubModelsGeneric(editForm.car_brand, val)); 
      setYearOptions([]);
  };
  // ✅ เพิ่ม Handler เปลี่ยนรุ่นย่อยแล้วไปโหลดปี
  const handleEditSubModelChange = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setEditForm({ ...editForm, car_submodel: val, car_year: "" });
      const years = await fetchYearsGeneric(editForm.car_brand, editForm.car_model, val);
      setYearOptions(years);
  };


  const handleSave = async () => {
    if (!selectedItem) return;
    try {
      await api.put(`/purchase/admin/${selectedItem._id}`, { ...editForm });
      alert("บันทึกข้อมูลเรียบร้อยแล้ว");
      setIsModalOpen(false);
      fetchData();
    } catch (error) { console.error("Save error:", error); alert("เกิดข้อผิดพลาดในการบันทึก"); }
  };

  const handleCopyPolicy = () => { if (editForm.policy_number) { navigator.clipboard.writeText(editForm.policy_number); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: keyof typeof editForm) => { 
      const file = e.target.files?.[0]; 
      if (file) { const reader = new FileReader(); reader.onloadend = () => { setEditForm((prev) => ({ ...prev, [field]: reader.result as string })); }; reader.readAsDataURL(file); } 
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => { setEditForm({...editForm, status: e.target.value}); }
  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => { setEditForm({...editForm, start_date: e.target.value}); }
  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => { setEditForm({...editForm, end_date: e.target.value}); }

  // --- Render Helpers ---
  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'pending': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">● รอตรวจสอบ</span>;
          case 'pending_payment': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">● รอชำระเงิน</span>;
          case 'active': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">● คุ้มครองแล้ว</span>;
          case 'about_to_expire': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">● ใกล้หมดอายุ</span>;
          case 'expired': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600 border border-slate-300">● หมดอายุ</span>;
          case 'rejected': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">● ไม่ผ่าน</span>;
          default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">● {status}</span>;
      }
  };

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentItems = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderImageUpload = (label: string, fieldName: keyof typeof editForm, currentImage: string, extraInfo?: React.ReactNode) => {
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
                                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, fieldName)} />
                            </label>
                        </div>
                    </>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-indigo-500">
                        <Upload className="w-8 h-8 mb-2 opacity-50"/>
                        <span className="text-xs font-medium">คลิกเพื่ออัปโหลด</span>
                        <input type="file" className="hidden" onChange={(e) => handleFileChange(e, fieldName)} />
                    </label>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <FileText className="w-8 h-8 text-indigo-600" /> จัดการรายการกรมธรรม์
                </h1>
                <p className="text-slate-500 mt-1">ตรวจสอบและจัดการข้อมูลการซื้อประกันภัยทั้งหมด</p>
            </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-medium pb-2 border-b border-slate-100">
                <Filter className="w-4 h-4 text-slate-400" /> ตัวกรองเพิ่มเติม
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                    <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1"><User className="w-3 h-3"/> ค้นหาลูกค้า</label>
                    <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input type="text" className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="พิมพ์ชื่อลูกค้า..." value={searchName} onChange={(e) => setSearchName(e.target.value)} /></div>
                </div>
                <div className="lg:col-span-1">
                    <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1"><Briefcase className="w-3 h-3"/> ค้นหาตัวแทน</label>
                    <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input type="text" className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="พิมพ์ชื่อตัวแทน..." value={searchAgent} onChange={(e) => setSearchAgent(e.target.value)} /></div>
                </div>
                <div className="lg:col-span-1">
                    <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1"><FileText className="w-3 h-3"/> เลขกรมธรรม์</label>
                    <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition" placeholder="ระบุเลขกรมธรรม์..." value={searchPolicyNo} onChange={(e) => setSearchPolicyNo(e.target.value)} />
                </div>
                <div className="lg:col-span-1">
                    <label className="text-xs text-slate-500 mb-1 block">บริษัทประกัน</label>
                    <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" value={searchCompany} onChange={(e) => setSearchCompany(e.target.value)}>{INSURANCE_COMPANIES.map((c, i) => <option key={i} value={c}>{c}</option>)}</select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                <div className="md:col-span-3 flex gap-2">
                    <div className="flex-1"><select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" value={filterCarBrand} onChange={handleFilterBrandChange}><option value="">ทุกยี่ห้อ</option>{brandOptions.map((b, i) => <option key={i} value={b}>{b}</option>)}</select></div>
                    <div className="flex-1"><select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50" value={filterCarModel} onChange={handleFilterModelChange} disabled={!filterCarBrand}><option value="">ทุกรุ่น</option>{filterModelList.map((m, i) => <option key={i} value={m}>{m}</option>)}</select></div>
                    <div className="flex-1"><select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:bg-slate-50" value={filterCarSubModel} onChange={(e) => setFilterCarSubModel(e.target.value)} disabled={!filterCarModel}><option value="">ทุกรุ่นย่อย</option>{filterSubModelList.map((s, i) => <option key={i} value={s}>{s}</option>)}</select></div>
                </div>
                <div><select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}><option value="desc">ใหม่ล่าสุด (Newest)</option><option value="asc">เก่าที่สุด (Oldest)</option></select></div>
            </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {[
                { id: 'all', label: 'ทั้งหมด', count: stats.all, badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
                { id: 'pending', label: 'รอตรวจสอบ', count: stats.pending, badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-700' },
                { id: 'pending_payment', label: 'รอชำระเงิน', count: stats.pending_payment, badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
                { id: 'active', label: 'คุ้มครองแล้ว', count: stats.active, badgeBg: 'bg-green-100', badgeText: 'text-green-700' },
                { id: 'about_to_expire', label: 'ใกล้หมดอายุ', count: stats.about_to_expire, badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' }, 
                { id: 'rejected_expired', label: 'ไม่ผ่าน/หมดอายุ', count: stats.rejected + stats.expired, badgeBg: 'bg-red-100', badgeText: 'text-red-700' },
            ].map((tab) => {
                const isActive = searchStatus === tab.id;
                return (
                <button key={tab.id} onClick={() => { setSearchStatus(tab.id); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap border ${isActive ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>{tab.label}<span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive ? 'bg-white/20 text-white' : `${tab.badgeBg} ${tab.badgeText}`}`}>{tab.count}</span></button>
            )})}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                 <div className="flex items-center gap-2">
                    <ListFilter className="w-5 h-5 text-slate-400"/>
                    <span className="font-bold text-slate-700">รายการกรมธรรม์</span>
                    {!loading && <span className="ml-2 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">{filteredData.length.toLocaleString()} รายการ</span>}
                 </div>
                 {!loading && filteredData.length > 0 && <p className="text-xs text-slate-500">แสดงหน้า <span className="font-bold text-slate-700">{currentPage}</span> จาก {totalPages} ({((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)})</p>}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="px-6 py-4">วันที่ทำรายการ</th>
                            <th className="px-6 py-4">ลูกค้า</th>
                            <th className="px-6 py-4">ตัวแทน</th>
                            <th className="px-6 py-4">ข้อมูลรถยนต์</th>
                            <th className="px-6 py-4">แผนประกัน</th>
                            <th className="px-6 py-4 text-center">สถานะ</th>
                            <th className="px-6 py-4 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={7} className="p-12 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr><td colSpan={7} className="p-12 text-center text-slate-400">ไม่พบข้อมูลตามเงื่อนไข</td></tr>
                        ) : (
                            currentItems.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-slate-600"><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400"/> {formatTableDate(item.createdAt)}</div></td>
                                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">{item.customer_id?.imgProfile_customer ? (<img src={item.customer_id.imgProfile_customer} alt="Profile" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />) : (<User className="w-5 h-5 text-slate-400"/>)}</div><div><p className="font-medium text-slate-800 text-sm">{item.customer_id?.first_name} {item.customer_id?.last_name}</p><p className="text-xs text-slate-400">{item.customer_id?.username || "Guest"}</p></div></div></td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{typeof item.agent_id === 'object' ? `${(item.agent_id as Agent)?.first_name} ${(item.agent_id as Agent)?.last_name}` : (item.agent_id as string) || "-"}</td>
                                    <td className="px-6 py-4"><div className="flex items-start gap-3"><div className="mt-1 text-slate-400"><Car className="w-4 h-4"/></div><div><p className="text-sm font-medium text-slate-700">{item.car_id?.brand} {item.car_id?.carModel}</p><div className="flex gap-2 mt-1"><span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{item.car_id?.year}</span><span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{item.car_id?.province}</span></div></div></div></td>
                                    <td className="px-6 py-4"><p className="text-sm font-medium text-indigo-600">{item.carInsurance_id?.insuranceBrand}</p><span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 font-medium">{item.carInsurance_id?.level}</span>{item.policy_number && <p className="text-xs text-slate-500 mt-1 font-mono">#{item.policy_number}</p>}</td>
                                    <td className="px-6 py-4 text-center">{getStatusBadge(item.status)}</td>
                                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => handleEditClick(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="ดูรายละเอียด/แก้ไข"><Edit className="w-4 h-4" /></button></div></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {!loading && filteredData.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* ✅ Summary at Bottom */}
                    <p className="text-xs text-slate-500">แสดงหน้า <span className="font-bold text-slate-700">{currentPage}</span> จาก {totalPages} ({((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)})</p>
                    <div className="flex gap-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 border rounded hover:bg-slate-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4"/></button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 border rounded hover:bg-slate-50 disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button></div>
                </div>
            )}
        </div>

        {/* --- Edit Modal with TABS --- */}
        {isModalOpen && selectedItem && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                        <div className="flex justify-between items-center mb-4">
                            <div><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText className="w-6 h-6 text-indigo-600"/> รายละเอียดกรมธรรม์</h2></div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"><X className="w-6 h-6"/></button>
                        </div>
                        <div className="flex gap-6 border-b border-slate-100"><button onClick={() => setActiveModalTab('info')} className={`pb-2 text-sm font-semibold transition-all border-b-2 ${activeModalTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>ข้อมูลกรมธรรม์</button><button onClick={() => setActiveModalTab('documents')} className={`pb-2 text-sm font-semibold transition-all border-b-2 ${activeModalTab === 'documents' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>เอกสารแนบ</button></div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                        {activeModalTab === 'info' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3"><User className="w-5 h-5 text-indigo-500"/> ข้อมูลผู้เอาประกันภัย</h3>
                                    
                                    <div className="mb-4 bg-slate-50 p-3 rounded-lg flex gap-4 text-xs text-slate-600 border border-slate-100">
                                        <div className="flex items-center gap-1"><Phone className="w-3 h-3"/> {editForm.customer_phone || "-"}</div>
                                        <div className="flex items-center gap-1"><Mail className="w-3 h-3"/> {editForm.customer_email || "-"}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div><label className="form-label">ชื่อจริง</label><input type="text" className="form-input" value={editForm.customer_first_name} onChange={e => setEditForm({...editForm, customer_first_name: e.target.value})}/></div>
                                        <div><label className="form-label">นามสกุล</label><input type="text" className="form-input" value={editForm.customer_last_name} onChange={e => setEditForm({...editForm, customer_last_name: e.target.value})}/></div>
                                        <div><label className="form-label">บริษัทประกัน</label><select className="form-input" value={editForm.insurance_brand} onChange={e => setEditForm({...editForm, insurance_brand: e.target.value})}>{INSURANCE_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                        <div><label className="form-label">ชั้นประกัน</label><select className="form-input" value={editForm.insurance_level} onChange={e => setEditForm({...editForm, insurance_level: e.target.value})}>{INSURANCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3"><Car className="w-5 h-5 text-indigo-500"/> ข้อมูลรถยนต์</h3>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div><label className="form-label">ยี่ห้อ</label><select className="form-input" value={editForm.car_brand} onChange={handleEditBrandChange}><option value="">เลือก</option>{brandOptions.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                                        <div><label className="form-label">รุ่น</label><select className="form-input" value={editForm.car_model} onChange={handleEditModelChange}><option value="">เลือก</option>{modelOptions.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                                        <div><label className="form-label">รุ่นย่อย</label><select className="form-input" value={editForm.car_submodel} onChange={handleEditSubModelChange}><option value="">เลือก</option>{subModelOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                        
                                        {/* ✅ เปลี่ยนเป็น Dropdown ปี */}
                                        <div>
                                            <label className="form-label">ปี (ค.ศ.)</label>
                                            <select className="form-input" value={editForm.car_year} onChange={e => setEditForm({...editForm, car_year: e.target.value})}>
                                                <option value="">เลือก</option>
                                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>

                                        <div><label className="form-label">ทะเบียน</label><input type="text" className="form-input" value={editForm.car_registration} onChange={e => setEditForm({...editForm, car_registration: e.target.value})}/></div>
                                        <div><label className="form-label">จังหวัด</label><select className="form-input" value={editForm.car_province} onChange={e => setEditForm({...editForm, car_province: e.target.value})}>{THAI_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                                    <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3"><ShieldCheck className="w-5 h-5 text-indigo-500"/> สถานะและความคุ้มครอง</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 h-full">
                                                <label className="form-label mb-2">สถานะปัจจุบัน</label>
                                                <select className="form-input bg-white font-medium text-slate-700 border-slate-300 focus:ring-2 focus:ring-indigo-100" value={editForm.status} onChange={handleStatusChange}>{FILTER_STATUSES.slice(1).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            {editForm.status === 'active' && (
                                                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-lg animate-in slide-in-from-top-2">
                                                    <div className="grid grid-cols-2 gap-5">
                                                        <div><label className="text-xs text-emerald-800 font-semibold mb-1 block">วันเริ่มคุ้มครอง</label><input type="date" className="form-input border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200" value={editForm.start_date} onChange={handleStartDateChange}/></div>
                                                        <div><label className="text-xs text-emerald-800 font-semibold mb-1 block">วันสิ้นสุด</label><input type="date" className="form-input border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200" value={editForm.end_date} onChange={handleEndDateChange}/></div>
                                                        <div className="col-span-2">
                                                            <label className="text-xs text-emerald-800 font-semibold mb-1 block">เลขกรมธรรม์</label>
                                                            <div className="relative"><input type="text" className="form-input border-emerald-300 font-mono pr-10 text-lg tracking-wide" value={editForm.policy_number} onChange={e => setEditForm({...editForm, policy_number: e.target.value})} placeholder="XXX-XXXX-XXXX"/><button onClick={handleCopyPolicy} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-800"><Copy className="w-5 h-5"/></button></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {editForm.status === 'rejected' && (
                                                <div className="bg-red-50 border border-red-100 p-5 rounded-lg animate-in slide-in-from-top-2"><label className="text-xs text-red-800 font-semibold mb-1 block">ระบุสาเหตุที่ปฏิเสธ</label><textarea className="form-input border-red-300 focus:border-red-500 focus:ring-red-200 min-h-[100px]" value={editForm.reject_reason} onChange={e => setEditForm({...editForm, reject_reason: e.target.value})} placeholder="เช่น เอกสารไม่ชัดเจน, ข้อมูลไม่ถูกต้อง..."/></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeModalTab === 'documents' && (
                            <div className="animate-in fade-in">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                                    <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3"><Paperclip className="w-5 h-5 text-indigo-500"/> รายการเอกสาร</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {renderImageUpload("บัตรประชาชน", "citizenCardImage", editForm.citizenCardImage)}
                                        {renderImageUpload("ทะเบียนรถ", "carRegistrationImage", editForm.carRegistrationImage)}
                                        {editForm.paymentMethod === 'full' 
                                            ? renderImageUpload("หลักฐานการโอนเงิน", "paymentSlipImage", editForm.paymentSlipImage, 
                                                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2"><Banknote className="w-3 h-3 text-green-600"/> ยอดที่ต้องชำระ: <span className="text-green-600 font-bold">{editForm.premium_price?.toLocaleString()} บาท</span></div>
                                              )
                                            : <>{renderImageUpload("เอกสารการผ่อน", "installmentDocImage", editForm.installmentDocImage)}{renderImageUpload("หนังสือยินยอม", "consentFormImage", editForm.consentFormImage)}</>
                                        }
                                        {renderImageUpload("ไฟล์กรมธรรม์ (PDF)", "policyFile", editForm.policyFile)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition hover:border-slate-300">ยกเลิก</button>
                        <button onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition flex items-center gap-2 transform active:scale-95"><Save className="w-4 h-4"/> บันทึกการเปลี่ยนแปลง</button>
                    </div>
                </div>
            </div>
        )}

        <style jsx global>{`
            .form-label { display: block; font-size: 0.85rem; color: #475569; margin-bottom: 0.35rem; font-weight: 500; }
            .form-input { width: 100%; border-radius: 0.5rem; border: 1px solid #cbd5e1; padding: 0.6rem 0.8rem; font-size: 0.9rem; outline: none; transition: all; background-color: #fff; }
            .form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
            .custom-scrollbar::-webkit-scrollbar { width: 5px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        `}</style>
      </div>
    </div>
  );
}