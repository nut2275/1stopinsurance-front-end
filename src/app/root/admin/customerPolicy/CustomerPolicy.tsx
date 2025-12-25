"use client";

import { useState, useEffect, ChangeEvent } from "react";
import api from "@/services/api";
import { Search, Edit, X, Save, Upload, Eye, ChevronLeft, ChevronRight, FileText, CreditCard, Calendar, Copy, Check, AlertCircle, Download, Filter } from "lucide-react";

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

const FILTER_STATUSES = [
    { value: "all", label: "สถานะทั้งหมด" },
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

  // --- Filter State ---
  const [searchName, setSearchName] = useState("");
  const [searchAgent, setSearchAgent] = useState("");
  const [searchCompany, setSearchCompany] = useState("ทั้งหมด");
  const [searchPolicyNo, setSearchPolicyNo] = useState("");
  const [searchStatus, setSearchStatus] = useState("all");
  
  // New Filters
  const [sortOrder, setSortOrder] = useState("desc"); 
  const [filterCarBrand, setFilterCarBrand] = useState("");
  const [filterCarModel, setFilterCarModel] = useState("");
  const [filterCarSubModel, setFilterCarSubModel] = useState("");

  const [filterModelList, setFilterModelList] = useState<string[]>([]);
  const [filterSubModelList, setFilterSubModelList] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // --- Edit Form State ---
  const [brandOptions, setBrandOptions] = useState<string[]>([]); 
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [subModelOptions, setSubModelOptions] = useState<string[]>([]);

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
    
    car_brand: "", car_model: "", car_submodel: "", 
    car_year: "", car_color: "", car_registration: "", car_province: "", 
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

  // --- API Handlers ---
  const fetchBrands = async () => {
      try {
          const res = await api.get("/car-master/brands");
          setBrandOptions(res.data);
      } catch (err) { console.error(err); }
  };

  const fetchModelsGeneric = async (brand: string) => {
      if (!brand) return [];
      try { return (await api.get(`/car-master/models?brand=${encodeURIComponent(brand)}`)).data; } 
      catch (err) { return []; }
  };

  const fetchSubModelsGeneric = async (brand: string, model: string) => {
      if (!brand || !model) return [];
      try { return (await api.get(`/car-master/sub-models?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`)).data; } 
      catch (err) { return []; }
  };

  // --- Filter Handlers ---
  const handleFilterBrandChange = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setFilterCarBrand(val);
      setFilterCarModel("");
      setFilterCarSubModel("");
      if (val) {
          const models = await fetchModelsGeneric(val);
          setFilterModelList(models);
      } else {
          setFilterModelList([]);
      }
      setFilterSubModelList([]);
  };

  const handleFilterModelChange = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setFilterCarModel(val);
      setFilterCarSubModel("");
      if (val) {
          const subs = await fetchSubModelsGeneric(filterCarBrand, val);
          setFilterSubModelList(subs);
      } else {
          setFilterSubModelList([]);
      }
  };

  // --- Edit Form Handlers ---
  const handleEditBrandChange = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setEditForm({ ...editForm, car_brand: val, car_model: "", car_submodel: "" }); 
      const models = await fetchModelsGeneric(val);
      setModelOptions(models);
      setSubModelOptions([]); 
  };

  const handleEditModelChange = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setEditForm({ ...editForm, car_model: val, car_submodel: "" }); 
      const subs = await fetchSubModelsGeneric(editForm.car_brand, val);
      setSubModelOptions(subs); 
  };

  useEffect(() => { 
      fetchData(); 
      fetchBrands(); 
  }, []);

  useEffect(() => {
    let temp = purchases;

    if (searchName) temp = temp.filter((p) => (`${p.customer_id?.first_name} ${p.customer_id?.last_name}`).toLowerCase().includes(searchName.toLowerCase()));
    if (searchAgent) temp = temp.filter((p) => JSON.stringify(p.agent_id || "").toLowerCase().includes(searchAgent.toLowerCase()));
    if (searchCompany && searchCompany !== "ทั้งหมด") temp = temp.filter((p) => (p.carInsurance_id?.insuranceBrand || "") === searchCompany);
    if (searchPolicyNo) temp = temp.filter((p) => (p.policy_number || "").toLowerCase().includes(searchPolicyNo.toLowerCase()));
    
    if (searchStatus !== "all") {
        temp = temp.filter((p) => p.status === searchStatus);
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

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (n: number) => { if (n >= 1 && n <= totalPages) setCurrentPage(n); };

  const handleEditClick = async (item: Purchase) => {
    setSelectedItem(item);
    const existingStart = formatDateForInput(item.start_date);
    const defaultStart = existingStart || getTodayString(); 
    const existingEnd = formatDateForInput(item.end_date);
    const defaultEnd = existingEnd || addYearsToDate(defaultStart, 1); 

    const currentBrand = (item.car_id?.brand || "").trim();
    const currentModel = (item.car_id?.carModel || item.car_id?.model || "").trim(); 
    const currentSubModel = (item.car_id?.subModel || item.car_id?.sub_model || "").trim(); 

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
      
      car_brand: currentBrand, 
      car_model: currentModel,
      car_submodel: currentSubModel,
      
      car_year: item.car_id?.year || "", 
      car_color: item.car_id?.color || "", 
      car_registration: item.car_id?.registration || "", 
      car_province: item.car_id?.province || "", 
      paymentMethod: item.paymentMethod || "full"
    });

    if (currentBrand) {
        const models = await fetchModelsGeneric(currentBrand);
        setModelOptions(models);
        if (currentModel) {
            const subs = await fetchSubModelsGeneric(currentBrand, currentModel);
            setSubModelOptions(subs);
        }
    } else {
        setModelOptions([]);
        setSubModelOptions([]);
    }

    setIsModalOpen(true);
  };

  const handleCopyPolicy = () => { if (editForm.policy_number) { navigator.clipboard.writeText(editForm.policy_number); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); } };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: keyof typeof editForm) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setEditForm((prev) => ({ ...prev, [field]: reader.result as string })); }; reader.readAsDataURL(file); } };
  
  // ✅ Function บันทึกและส่ง Notification
const handleSave = async () => {
    if (!selectedItem) return;

    try {
      await api.put(`/purchase/admin/${selectedItem._id}`, { ...editForm });

      // ============================================
      // 🟢 Logic ตรวจสอบการแก้ไขและกำหนดสีแจ้งเตือน
      // ============================================
      const changes: string[] = [];
      let hasAddition = false; // ตัวแปรเช็คว่ามีการเพิ่มข้อมูลใหม่ไหม
      let hasEdit = false;     // ตัวแปรเช็คว่ามีการแก้ไขไหม

      const getStatusLabel = (s: string) => {
        const map: Record<string, string> = {
          'pending': 'รอตรวจสอบ', 'pending_payment': 'รอชำระเงิน',
          'active': 'คุ้มครองแล้ว', 'expired': 'หมดอายุ', 'rejected': 'ปฏิเสธ'
        };
        return map[s] || s;
      };

      // ฟังก์ชันเช็ค Field ทั่วไป
      const checkField = (label: string, oldVal: any, newVal: any) => {
        const o = String(oldVal || "").trim();
        const n = String(newVal || "").trim();
        
        if (o !== n) {
            // ถ้าค่าเดิมว่าง แล้วค่าใหม่มีข้อมูล = การเพิ่ม
            if (o === "" && n !== "") {
                changes.push(`เพิ่ม${label} ("${n}")`);
                hasAddition = true;
            } else {
                changes.push(`แก้ไข${label} (จาก "${o || '-'}" เป็น "${n || '-'}")`);
                hasEdit = true;
            }
        }
      };

      // ฟังก์ชันเช็ครูปภาพ
      const checkImage = (label: string, oldImg: string | undefined, newImg: string) => {
        if (newImg && newImg !== (oldImg || "")) {
           if (!oldImg) {
             changes.push(`เพิ่มรูปภาพ (${label})`);
             hasAddition = true;
           } else {
             if (label === "หลักฐานการโอนเงิน") changes.push(`เปลี่ยนรูปภาพการชำระ`);
             else changes.push(`แก้ไขรูปภาพ (${label})`);
             
             hasEdit = true;
           }
        }
      };

      // --- เริ่มเปรียบเทียบ ---
      checkField("ชื่อลูกค้า", selectedItem.customer_id?.first_name, editForm.customer_first_name);
      checkField("นามสกุล", selectedItem.customer_id?.last_name, editForm.customer_last_name);
      checkField("บริษัทประกัน", selectedItem.carInsurance_id?.insuranceBrand, editForm.insurance_brand);
      checkField("ชั้นประกัน", selectedItem.carInsurance_id?.level, editForm.insurance_level);
      
      checkField("ยี่ห้อรถ", selectedItem.car_id?.brand, editForm.car_brand);
      checkField("รุ่นรถ", selectedItem.car_id?.carModel || selectedItem.car_id?.model, editForm.car_model);
      checkField("รุ่นย่อย", selectedItem.car_id?.subModel || selectedItem.car_id?.sub_model, editForm.car_submodel);
      checkField("ปีรถ", selectedItem.car_id?.year, editForm.car_year);
      checkField("สีรถ", selectedItem.car_id?.color, editForm.car_color);
      checkField("ทะเบียน", selectedItem.car_id?.registration, editForm.car_registration);
      checkField("จังหวัด", selectedItem.car_id?.province, editForm.car_province);
      
      // เลขกรมธรรม์
      if (selectedItem.policy_number !== editForm.policy_number) {
        const oldP = selectedItem.policy_number || "";
        const newP = editForm.policy_number || "";
        if (oldP === "" && newP !== "") {
            changes.push(`เพิ่มเลขกรมธรรม์ ("${newP}")`);
            hasAddition = true;
        } else {
            changes.push(`แก้ไขเลขกรมธรรม์ (จาก "${oldP || '-'}" เป็น "${newP || '-'}")`);
            hasEdit = true;
        }
      }

      // สถานะ
      if (selectedItem.status !== editForm.status) {
        changes.push(`แก้ไขสถานะกรมธรรม์ (จาก "${getStatusLabel(selectedItem.status)}" เป็น "${getStatusLabel(editForm.status)}")`);
        // การเปลี่ยนสถานะถือเป็นการแก้ไขที่สำคัญ (จะไปเช็คสีด้านล่างอีกที)
      }

      // รูปภาพ
      checkImage("บัตรประชาชน", selectedItem.citizenCardImage, editForm.citizenCardImage);
      checkImage("ทะเบียนรถ", selectedItem.carRegistrationImage, editForm.carRegistrationImage);
      checkImage("หลักฐานการโอนเงิน", selectedItem.paymentSlipImage, editForm.paymentSlipImage);
      checkImage("เอกสารการผ่อน", selectedItem.installmentDocImage, editForm.installmentDocImage);
      checkImage("หนังสือยินยอม", selectedItem.consentFormImage, editForm.consentFormImage);
      checkImage("ไฟล์กรมธรรม์", selectedItem.policyFile, editForm.policyFile);

      // --- สรุปข้อความและกำหนดสี (Type) ---
      const carReg = editForm.car_registration || "ไม่ระบุทะเบียน";
      let message = "";
      let type = 'info'; // ค่าเริ่มต้น: สีฟ้า (info)

      if (changes.length > 0) {
        message = `รายการอัปเดต กรมธรรม์ทะเบียน ${carReg}:\n- ${changes.join('\n- ')}`;
      } else {
        message = `ยืนยันข้อมูลกรมธรรม์ ทะเบียน ${carReg} (ไม่มีการเปลี่ยนแปลง)`;
      }

      // 🔴 ลำดับความสำคัญของสี (Priority)
      // 1. สถานะปฏิเสธ -> สีแดง (warning)
      if (editForm.status === 'rejected') {
          type = 'warning';
      }
      // 2. สถานะคุ้มครอง/Active -> สีเขียว (success)
      else if (editForm.status === 'active' && selectedItem.status !== 'active') {
          type = 'success';
      }
      // 3. สถานะหมดอายุ -> สีแดง (warning)
      else if (editForm.status === 'expired') {
          type = 'warning';
      }
      // 4. ถ้ามีการ "เพิ่ม" ข้อมูล/รูปภาพ -> สีม่วง (primary)
      else if (hasAddition) {
          type = 'primary';
      }
      // 5. ถ้าเป็นการ "แก้ไข" ข้อมูล/รูปภาพ -> สีฟ้า (info) - (เป็นค่า Default อยู่แล้ว)
      else if (hasEdit) {
          type = 'info';
      }

      // --- เตรียมข้อมูลผู้ส่ง ---
      let senderData = { name: "Admin", role: "admin" };
      const storedUser = localStorage.getItem('userData');
      if (storedUser && storedUser !== "undefined") {
        try {
            const user = JSON.parse(storedUser);
            senderData.name = user.first_name || user.username || "Admin";
        } catch(e) {}
      }

      // --- ส่ง API ---
      const notificationPayload = {
          message,
          type, // ส่งสีที่คำนวณได้ไป
          relatedPurchaseId: selectedItem._id,
          sender: senderData
      };

      const customerId = typeof selectedItem.customer_id === 'object' ? selectedItem.customer_id._id : selectedItem.customer_id;
      const agentId = typeof selectedItem.agent_id === 'object' ? selectedItem.agent_id._id : selectedItem.agent_id;

      if (customerId) {
        await api.post('/api/notifications', { ...notificationPayload, recipientId: customerId, recipientType: 'customer' });
      }

      if (agentId) {
        // เพิ่ม prefix ชื่อลูกค้าให้ Agent
        const agentMsg = `(ลูกค้า: ${editForm.customer_first_name}) ${message}`;
        await api.post('/api/notifications', { ...notificationPayload, message: agentMsg, recipientId: agentId, recipientType: 'agent' });
      }

      window.dispatchEvent(new Event('refreshNotification'));
      alert("บันทึกข้อมูลและส่งการแจ้งเตือนเรียบร้อยแล้ว");
      setIsModalOpen(false);
      fetchData();

    } catch (error) {
      console.error("Save error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => { const newStart = e.target.value; const newEnd = addYearsToDate(newStart, 1); setEditForm({ ...editForm, start_date: newStart, end_date: newEnd }); };
  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => { const newEnd = e.target.value; const newStart = addYearsToDate(newEnd, -1); setEditForm({ ...editForm, start_date: newStart, end_date: newEnd }); };
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => { const newStatus = e.target.value; let updates: any = { status: newStatus }; if (newStatus === 'active') { if(!editForm.start_date) { const today = getTodayString(); updates.start_date = today; updates.end_date = addYearsToDate(today, 1); } } setEditForm({ ...editForm, ...updates }); };

  const renderImageUpload = (label: string, fieldName: keyof typeof editForm, currentImage: string) => {
    // ... (Your existing renderImageUpload code remains exactly the same, hidden for brevity) ...
    const isPdf = currentImage?.startsWith('data:application/pdf') || currentImage?.toLowerCase().endsWith('.pdf');
    const getDownloadFilename = () => `${fieldName}_${Date.now()}.${isPdf ? "pdf" : "png"}`;
    const handleMainDownload = (e: React.MouseEvent) => { e.stopPropagation(); const link = document.createElement("a"); link.href = currentImage; link.download = getDownloadFilename(); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const handleView = () => { const win = window.open("", "_blank"); if (!win) return; const filename = getDownloadFilename(); const styles = `body { margin: 0; background-color: #e5e7eb; height: 100vh; display: flex; justify-content: center; align-items: center; overflow: hidden; font-family: sans-serif; } iframe { width: 100%; height: 100%; border: none; } img { max-width: 95%; max-height: 95%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 8px; object-fit: contain; } .download-btn { position: fixed; top: 20px; right: 20px; background: rgba(255,255,255,0.8); backdrop-filter: blur(4px); border: 1px solid #d1d5db; border-radius: 50%; padding: 12px; width: 48px; height: 48px; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.2s; z-index: 100; } .download-btn:hover { background: white; transform: scale(1.05); color: #2563eb; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2); } .download-icon { width: 24px; height: 24px; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; fill: none; color: #4b5563; } .download-btn:hover .download-icon { color: #2563eb; }`; const script = `<script>function downloadCurrentFile() { const link = document.createElement("a"); link.href = "${currentImage}"; link.download = "${filename}"; document.body.appendChild(link); link.click(); document.body.removeChild(link); }</script>`; const downloadButtonHtml = `<button class="download-btn" onclick="downloadCurrentFile()" title="ดาวน์โหลดไฟล์นี้"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="download-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg></button>`; let contentHtml = isPdf ? `${downloadButtonHtml}<iframe src="${currentImage}"></iframe>` : `${downloadButtonHtml}<img src="${currentImage}" alt="${label}" />`; win.document.write(`<!DOCTYPE html><html><head><title>Preview: ${label}</title><meta charset="utf-8"><style>${styles}</style></head><body>${contentHtml}${script}</body></html>`); win.document.close(); };

    return (
      <div className="mb-4 border-b pb-4 last:border-b-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex justify-between items-center"><span>{label}</span> {currentImage && <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">มีไฟล์แล้ว</span>}</h3>
          {currentImage ? ( <div className="relative group mb-2 border rounded bg-gray-100 overflow-hidden h-40"> <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20"> <button type="button" onClick={handleView} className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 hover:scale-110 transition shadow-lg" title="ดูภาพเต็ม"><Eye className="w-5 h-5" /></button> <button type="button" onClick={handleMainDownload} className="p-2 bg-white rounded-full text-gray-700 hover:text-green-600 hover:scale-110 transition shadow-lg" title="ดาวน์โหลด"><Download className="w-5 h-5" /></button> </div> <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={handleView}> {isPdf ? <div className="flex flex-col items-center text-gray-500"><FileText className="w-12 h-12 mb-2 text-red-500" /><span className="text-sm font-medium">เอกสาร PDF</span></div> : <img src={currentImage} alt={label} className="w-full h-full object-contain bg-gray-200" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Image+Not+Found"; }} />} </div> </div> ) : ( <div className="h-40 bg-gray-50 border-2 border-dashed rounded flex flex-col items-center justify-center text-gray-400 text-sm mb-2 gap-2"><div className="p-3 bg-gray-100 rounded-full"><Upload className="w-6 h-6 text-gray-300"/></div><span>ไม่มีไฟล์แนบ</span></div> )}
          <label className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition text-sm justify-center text-gray-700 font-medium bg-white shadow-sm"><Upload className="w-4 h-4 text-blue-600" /> {currentImage ? "เปลี่ยนไฟล์" : "อัปโหลดไฟล์"} <input type="file" className="hidden" accept={fieldName === 'policyFile' ? "image/*,application/pdf" : "image/*"} onChange={(e) => handleFileChange(e, fieldName)} /></label>
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
      {/* ... (Filter UI Code เหมือนเดิม) ... */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-6 space-y-4">
         <div className="flex items-center gap-2 text-gray-700 font-semibold border-b pb-2 mb-2">
             <Filter className="w-4 h-4"/> ตัวกรองข้อมูล
         </div>
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
             <div><label className="text-xs text-gray-500 mb-1 block">ชื่อลูกค้า</label><div className="relative"><input type="text" className="w-full border rounded p-2 pl-8 outline-none text-sm" placeholder="ค้นหาชื่อ..." value={searchName} onChange={(e) => setSearchName(e.target.value)} /><Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" /></div></div>
             <div><label className="text-xs text-gray-500 mb-1 block">ตัวแทน</label><input type="text" className="w-full border rounded p-2 outline-none text-sm" placeholder="ค้นหาตัวแทน..." value={searchAgent} onChange={(e) => setSearchAgent(e.target.value)} /></div>
             <div><label className="text-xs text-gray-500 mb-1 block">เลขกรมธรรม์</label><input type="text" className="w-full border rounded p-2 outline-none text-sm" placeholder="ค้นหาเลข..." value={searchPolicyNo} onChange={(e) => setSearchPolicyNo(e.target.value)} /></div>
             <div><label className="text-xs text-gray-500 mb-1 block">บริษัทประกัน</label><select className="w-full border rounded p-2 bg-white outline-none text-sm" value={searchCompany} onChange={(e) => setSearchCompany(e.target.value)}>{INSURANCE_COMPANIES.map((c, i) => (<option key={i} value={c}>{c}</option>))}</select></div>
             <div><label className="text-xs text-gray-500 mb-1 block">สถานะ</label><select className="w-full border rounded p-2 bg-white outline-none text-sm" value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>{FILTER_STATUSES.map((status, i) => (<option key={i} value={status.value}>{status.label}</option>))}</select></div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-dashed">
             <div>
                <label className="text-xs text-gray-500 mb-1 block">ยี่ห้อรถ (Filter)</label>
                <select className="w-full border rounded p-2 bg-white outline-none text-sm" value={filterCarBrand} onChange={handleFilterBrandChange}>
                    <option value="">ทั้งหมด</option>
                    {brandOptions.map((b, i) => <option key={i} value={b}>{b}</option>)}
                </select>
             </div>
             <div>
                <label className="text-xs text-gray-500 mb-1 block">รุ่นรถ (Filter)</label>
                <select className="w-full border rounded p-2 bg-white outline-none text-sm disabled:bg-gray-100" value={filterCarModel} onChange={handleFilterModelChange} disabled={!filterCarBrand}>
                    <option value="">ทั้งหมด</option>
                    {filterModelList.map((m, i) => <option key={i} value={m}>{m}</option>)}
                </select>
             </div>
             <div>
                <label className="text-xs text-gray-500 mb-1 block">รุ่นย่อย (Filter)</label>
                <select className="w-full border rounded p-2 bg-white outline-none text-sm disabled:bg-gray-100" value={filterCarSubModel} onChange={(e) => setFilterCarSubModel(e.target.value)} disabled={!filterCarModel}>
                    <option value="">ทั้งหมด</option>
                    {filterSubModelList.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
             </div>
             <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1 block">เรียงลำดับวันที่</label>
                <select className="w-full border rounded p-2 bg-white outline-none text-sm border-blue-200 text-blue-700 font-medium" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="desc">ใหม่ล่าสุด (Newest)</option>
                    <option value="asc">เก่าที่สุด (Oldest)</option>
                </select>
             </div>
         </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                <tr>
                    <th className="p-4 border-b">วันที่ทำรายการ</th>
                    <th className="p-4 border-b">ลูกค้า</th>
                    <th className="p-4 border-b">ตัวแทน</th>
                    <th className="p-4 border-b">ข้อมูลรถยนต์</th> 
                    <th className="p-4 border-b">แผนประกัน</th>
                    <th className="p-4 border-b">เลขกรมธรรม์</th>
                    <th className="p-4 border-b">สถานะ</th>
                    <th className="p-4 border-b text-center">จัดการ</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan={8} className="p-6 text-center">Loading...</td></tr>
                ) : (
                    currentItems.map((item) => (
                    <tr key={item._id} className="hover:bg-blue-50/50 border-b last:border-0 transition-colors">
                        <td className="p-4 text-sm text-gray-600">{formatTableDate(item.createdAt)}</td>
                        <td className="p-4"><div className="font-medium text-gray-800">{item.customer_id?.first_name} {item.customer_id?.last_name}</div><div className="text-xs text-gray-500">{item.customer_id?.username || "Guest"}</div></td>
                        <td className="p-4 text-gray-600 text-sm">{typeof item.agent_id === 'object' ? `${item.agent_id?.first_name || '-'} ${item.agent_id?.last_name || ''}` : item.agent_id || "-"}</td>
                        <td className="p-4">
                            <div className="font-semibold text-gray-700">{item.car_id?.brand || "-"} {item.car_id?.carModel || ""}</div>
                            {item.car_id?.subModel && (<div className="text-xs text-gray-500 mb-1 line-clamp-1" title={item.car_id?.subModel}>{item.car_id?.subModel}</div>)}
                            {item.car_id?.year && (<span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">ปี {item.car_id?.year}</span>)}
                        </td>
                        <td className="p-4"><div className="font-semibold text-gray-700">{item.carInsurance_id?.insuranceBrand || "ไม่ระบุ"}</div><div className="text-xs text-gray-500 inline-block bg-gray-100 px-2 py-0.5 rounded mt-1">{item.carInsurance_id?.level || "-"}</div></td>
                        <td className="p-4 font-mono text-sm">{item.policy_number ? <span className="text-blue-600 font-medium">{item.policy_number}</span> : <span className="text-gray-400 italic">รออนุมัติ</span>}</td>
                        <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${item.status === 'active' ? 'bg-green-100 text-green-700' : item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : item.status === 'pending_payment' ? 'bg-orange-100 text-orange-700' : item.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{item.status.replace('_', ' ')}</span></td>
                        <td className="p-4 text-center"><button onClick={() => handleEditClick(item)} className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 p-2 rounded-lg transition shadow-sm"><Edit className="w-4 h-4" /></button></td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
        {!loading && filteredData.length > 0 && (<div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50 gap-4"><span className="text-sm text-gray-500">แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredData.length)} จาก {filteredData.length}</span><div className="flex items-center gap-2"><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 border rounded-md hover:bg-white disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button><span className="text-sm">Page {currentPage} of {totalPages}</span><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border rounded-md hover:bg-white disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button></div></div>)}
      </div>

      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-start md:items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl animate-fade-in my-8 relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10 rounded-t-xl">
              <div><h2 className="text-xl font-bold text-gray-800">รายละเอียดกรมธรรม์</h2><p className="text-sm text-gray-500">ID: {selectedItem._id}</p></div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto flex-grow">
              <div className="space-y-6">
                  <div className="space-y-4">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b"><Edit className="w-4 h-4 text-blue-600"/> แก้ไขข้อมูลผู้ซื้อและการประกัน</h3>
                      {/* ... (Your existing Input fields) ... */}
                      <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-xs text-gray-500">ชื่อจริง</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.customer_first_name} onChange={(e) => setEditForm({...editForm, customer_first_name: e.target.value})} /></div>
                          <div><label className="text-xs text-gray-500">นามสกุล</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.customer_last_name} onChange={(e) => setEditForm({...editForm, customer_last_name: e.target.value})} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-xs text-gray-500">บริษัทประกัน</label><select className="w-full border rounded p-1.5 text-sm bg-white outline-none" value={editForm.insurance_brand} onChange={(e) => setEditForm({...editForm, insurance_brand: e.target.value})}>{INSURANCE_COMPANIES.filter(c => c !== "ทั้งหมด").map(c => (<option key={c} value={c}>{c}</option>))}</select></div>
                          <div><label className="text-xs text-gray-500">ชั้นประกัน</label><select className="w-full border rounded p-1.5 text-sm bg-white outline-none" value={editForm.insurance_level} onChange={(e) => setEditForm({...editForm, insurance_level: e.target.value})}>{INSURANCE_LEVELS.map(level => (<option key={level} value={level}>{level}</option>))}</select></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-xs text-gray-500">ยี่ห้อรถ</label><select className="w-full border rounded p-1.5 text-sm bg-white outline-none" value={editForm.car_brand} onChange={handleEditBrandChange}><option value="">เลือกยี่ห้อ</option>{brandOptions.map((b, i) => <option key={i} value={b}>{b}</option>)}</select></div>
                          <div><label className="text-xs text-gray-500">รุ่นรถ</label><select className="w-full border rounded p-1.5 text-sm bg-white outline-none disabled:bg-gray-100" value={editForm.car_model} onChange={handleEditModelChange} disabled={!editForm.car_brand}><option value="">เลือกรุ่น</option>{modelOptions.map((m, i) => <option key={i} value={m}>{m}</option>)}</select></div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                          <div><label className="text-xs text-gray-500">รุ่นย่อย</label><select className="w-full border rounded p-1.5 text-sm bg-white outline-none disabled:bg-gray-100" value={editForm.car_submodel} onChange={(e) => setEditForm({...editForm, car_submodel: e.target.value})} disabled={!editForm.car_model}><option value="">เลือกรุ่นย่อย</option>{subModelOptions.map((s, i) => <option key={i} value={s}>{s}</option>)}</select></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-xs text-gray-500">ปีรถ (ค.ศ.)</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.car_year} onChange={(e) => setEditForm({...editForm, car_year: e.target.value})} placeholder="เช่น 2023" /></div>
                          <div><label className="text-xs text-gray-500">สีรถ</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.car_color} onChange={(e) => setEditForm({...editForm, car_color: e.target.value})} placeholder="เช่น ขาว" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-xs text-gray-500">ทะเบียนรถ</label><input type="text" className="w-full border rounded p-1.5 text-sm outline-none" value={editForm.car_registration} onChange={(e) => setEditForm({...editForm, car_registration: e.target.value})} /></div>
                          <div><label className="text-xs text-gray-500">จังหวัด</label><select className="w-full border rounded p-1.5 text-sm bg-white outline-none" value={editForm.car_province} onChange={(e) => setEditForm({...editForm, car_province: e.target.value})}><option value="">เลือกจังหวัด</option>{THAI_PROVINCES.map((province) => (<option key={province} value={province}>{province}</option>))}</select></div>
                      </div>
                  </div>
                  <hr className="border-gray-200"/>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4"/> รูปแบบการชำระเงิน</label><select value={editForm.paymentMethod} onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 bg-white outline-none"><option value="full">จ่ายเต็ม (Full Payment)</option><option value="installment">ผ่อนชำระ (Installment)</option></select></div>
                  <hr className="border-gray-200"/>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">สถานะกรมธรรม์</label><select value={editForm.status} onChange={handleStatusChange} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 bg-white outline-none"><option value="pending">Pending (รอตรวจสอบ)</option><option value="pending_payment">Pending Payment (รอชำระเงิน)</option><option value="active">Active (คุ้มครองแล้ว)</option><option value="expired">Expired (หมดอายุ)</option><option value="rejected">Rejected (ปฏิเสธ)</option></select></div>

                  {editForm.status === 'rejected' && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200 animate-fade-in mt-2">
                          <label className="block text-sm font-semibold text-red-800 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> สาเหตุที่ปฏิเสธ (Reject Reason)</label>
                          <textarea className="w-full border-red-300 rounded p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[80px]" placeholder="ระบุเหตุผล..." value={editForm.reject_reason} onChange={(e) => setEditForm({...editForm, reject_reason: e.target.value})}/>
                      </div>
                  )}

                  {editForm.status === 'active' && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200 animate-fade-in">
                          <label className="block text-sm font-semibold text-green-800 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4"/> ระยะเวลาคุ้มครอง (Active)</label>
                          <div className="grid grid-cols-2 gap-3">
                              <div><label className="text-xs text-green-700 mb-1 block">วันที่เริ่มคุ้มครอง</label><input type="date" value={editForm.start_date} onChange={handleStartDateChange} className="custom-date-input w-full border-green-300 rounded p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-green-50" data-date={formatDisplayDate(editForm.start_date)} /></div>
                              <div><label className="text-xs text-green-700 mb-1 block">วันที่สิ้นสุด</label><input type="date" value={editForm.end_date} onChange={handleEndDateChange} className="custom-date-input w-full border-green-300 rounded p-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-green-50" data-date={formatDisplayDate(editForm.end_date)} /></div>
                          </div>
                      </div>
                  )}

                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">เลขกรมธรรม์จริง</label>
                      <div className="relative">
                          <input type="text" value={editForm.policy_number} onChange={(e) => setEditForm({...editForm, policy_number: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 pr-10 outline-none font-mono" placeholder="เช่น P-123456789" />
                          <button type="button" onClick={handleCopyPolicy} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="คัดลอกเลขกรมธรรม์">{isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />}</button>
                      </div>
                  </div>
              </div>

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