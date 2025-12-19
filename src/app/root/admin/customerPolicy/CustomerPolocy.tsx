"use client";

import { useState, useEffect, ChangeEvent } from "react";
import api from "@/services/api";
import { Search, Edit, X, Save, Upload, Eye, ChevronLeft, ChevronRight, FileText } from "lucide-react";

// --- Types ---
type Purchase = {
  _id: string;
  customer_id: any;
  agent_id: any;
  carInsurance_id: any;
  car_id: any;
  policy_number: string;
  status: string;
  citizenCardImage: string;
  carRegistrationImage: string;
  paymentSlipImage?: string;
  policyFile?: string;
  createdAt: string;
};

// ตัวเลือกบริษัทประกัน (ตัด 'ทั้งหมด' ออกเวลาใช้ใน Dropdown แก้ไข)
const INSURANCE_COMPANIES = [
  "ทั้งหมด",
  "มิตรแท้ประกันภัย",
  "วิริยะประกันภัย",
  "กรุงเทพประกันภัย",
  "ธนชาตประกันภัย",
  "เมืองไทยประกันภัย",
  "ทิพยประกันภัย"
];

// ตัวเลือกชั้นประกัน
const INSURANCE_LEVELS = ["ชั้น 1", "ชั้น 2+", "ชั้น 2", "ชั้น 3+", "ชั้น 3"];

const ITEMS_PER_PAGE = 10;

export default function ManagePolicyPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredData, setFilteredData] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchName, setSearchName] = useState("");
  const [searchAgent, setSearchAgent] = useState("");
  const [searchCompany, setSearchCompany] = useState("ทั้งหมด");
  const [searchPolicyNo, setSearchPolicyNo] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Data for Edit
  const [editForm, setEditForm] = useState({
    status: "",
    policy_number: "",
    paymentSlipImage: "",
    policyFile: "",
    citizenCardImage: "",
    carRegistrationImage: "",
    // ✅ เพิ่ม Fields สำหรับแก้ไขข้อมูล
    customer_first_name: "",
    customer_last_name: "",
    insurance_brand: "",
    insurance_level: "",
    car_brand: "",
    car_model: "",
    car_registration: ""
  });

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/purchase/admin/all");
      setPurchases(res.data);
      setFilteredData(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Filter Logic
  useEffect(() => {
    let temp = purchases;

    if (searchName) {
      temp = temp.filter((p) => {
        const name = `${p.customer_id?.first_name || ""} ${p.customer_id?.last_name || ""}`;
        return name.toLowerCase().includes(searchName.toLowerCase());
      });
    }
    if (searchAgent) {
      temp = temp.filter((p) => 
        JSON.stringify(p.agent_id || "").toLowerCase().includes(searchAgent.toLowerCase())
      );
    }
    if (searchCompany && searchCompany !== "ทั้งหมด") {
      temp = temp.filter((p) => 
        (p.carInsurance_id?.insuranceBrand || "") === searchCompany
      );
    }
    if (searchPolicyNo) {
      temp = temp.filter((p) => 
        (p.policy_number || "").toLowerCase().includes(searchPolicyNo.toLowerCase())
      );
    }

    setFilteredData(temp);
    setCurrentPage(1); 
  }, [searchName, searchAgent, searchCompany, searchPolicyNo, purchases]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // 4. Open Modal & Populate Data
  const handleEditClick = (item: Purchase) => {
    setSelectedItem(item);
    setEditForm({
      status: item.status,
      policy_number: item.policy_number || "",
      paymentSlipImage: item.paymentSlipImage || "",
      policyFile: item.policyFile || "",
      citizenCardImage: item.citizenCardImage || "",
      carRegistrationImage: item.carRegistrationImage || "",
      // ✅ ดึงข้อมูลเดิมมาใส่ Form
      customer_first_name: item.customer_id?.first_name || "",
      customer_last_name: item.customer_id?.last_name || "",
      insurance_brand: item.carInsurance_id?.insuranceBrand || "",
      insurance_level: item.carInsurance_id?.level || "",
      car_brand: item.car_id?.brand || "",
      car_model: item.car_id?.carModel || "",
      car_registration: item.car_id?.registration || ""
    });
    setIsModalOpen(true);
  };

  // 5. Handle File Upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: keyof typeof editForm) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 6. Save Changes
  const handleSave = async () => {
    if (!selectedItem) return;
    try {
      // ⚠️ สำคัญ: ต้องแน่ใจว่า Backend รองรับการรับค่า field ใหม่เหล่านี้ด้วย
      await api.put(`/purchase/admin/${selectedItem._id}`, {
        ...editForm,
      });
      alert("บันทึกข้อมูลสำเร็จ");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  // Helper: Render Image Upload
  const renderImageUpload = (label: string, fieldName: keyof typeof editForm, currentImage: string) => (
    <div className="mb-4 border-b pb-4 last:border-b-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex justify-between items-center">
            <span>{label}</span>
            {currentImage && <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">มีไฟล์แล้ว</span>}
        </h3>
        
        {currentImage ? (
            <div className="relative group mb-2">
                <img 
                    src={currentImage} 
                    alt={label} 
                    className="h-32 w-full object-cover border rounded bg-gray-100 cursor-pointer" 
                    onClick={() => window.open(currentImage)}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                    }}
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition pointer-events-none rounded"></div>
            </div>
        ) : (
            <div className="h-32 bg-gray-100 border border-dashed rounded flex items-center justify-center text-gray-400 text-sm mb-2">
                ไม่มีไฟล์แนบ
            </div>
        )}

        <label className="flex items-center gap-2 w-full p-2 border border-dashed rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition text-sm justify-center text-gray-600 font-medium bg-white">
            <Upload className="w-4 h-4 text-blue-500" /> อัปโหลด / แก้ไขรูปภาพ
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, fieldName)} />
        </label>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">จัดการรายการกรมธรรม์</h1>

      {/* --- Filter Section --- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm text-gray-500">ชื่อลูกค้า</label>
          <div className="relative">
            <input 
              type="text" 
              className="w-full border rounded p-2 pl-8 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="ค้นหาชื่อ..." 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <Search className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-500">ตัวแทน</label>
          <input 
             type="text" 
             className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
             placeholder="ค้นหาตัวแทน..." 
             value={searchAgent}
             onChange={(e) => setSearchAgent(e.target.value)}
          />
        </div>
        
        <div>
          <label className="text-sm text-gray-500">บริษัทประกัน</label>
          <select 
             className="w-full border rounded p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
             value={searchCompany}
             onChange={(e) => setSearchCompany(e.target.value)}
          >
             {INSURANCE_COMPANIES.map((company, index) => (
                <option key={index} value={company}>{company}</option>
             ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-500">เลขกรมธรรม์</label>
          <input 
             type="text" 
             className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
             placeholder="ค้นหาเลข..." 
             value={searchPolicyNo}
             onChange={(e) => setSearchPolicyNo(e.target.value)}
          />
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                <tr>
                <th className="p-4 border-b">วันที่ทำรายการ</th>
                <th className="p-4 border-b">ลูกค้า</th>
                <th className="p-4 border-b">ตัวแทน</th>
                <th className="p-4 border-b">แผนประกัน</th>
                <th className="p-4 border-b">เลขกรมธรรม์</th>
                <th className="p-4 border-b">สถานะ</th>
                <th className="p-4 border-b text-center">จัดการ</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan={7} className="p-6 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                ) : currentItems.length === 0 ? (
                    <tr><td colSpan={7} className="p-6 text-center text-gray-500">ไม่พบข้อมูลตามเงื่อนไขที่ระบุ</td></tr>
                ) : (
                    currentItems.map((item) => (
                    <tr key={item._id} className="hover:bg-blue-50/50 border-b last:border-0 transition-colors">
                        <td className="p-4 text-sm text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString("th-TH", { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}
                        </td>
                        <td className="p-4">
                            <div className="font-medium text-gray-800">{item.customer_id?.first_name} {item.customer_id?.last_name}</div>
                            <div className="text-xs text-gray-500">{item.customer_id?.username || "Guest"}</div>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                            {typeof item.agent_id === 'object' 
                            ? `${item.agent_id?.first_name || '-'} ${item.agent_id?.last_name || ''}` 
                            : item.agent_id || "-"}
                        </td>
                        <td className="p-4">
                            <div className="font-semibold text-gray-700">{item.carInsurance_id?.insuranceBrand || "ไม่ระบุ"}</div>
                            <div className="text-xs text-gray-500 inline-block bg-gray-100 px-2 py-0.5 rounded mt-1">{item.carInsurance_id?.level || "-"}</div>
                        </td>
                        <td className="p-4 font-mono text-sm">
                            {item.policy_number ? <span className="text-blue-600 font-medium">{item.policy_number}</span> : <span className="text-gray-400 italic">รออนุมัติ</span>}
                        </td>
                        <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                item.status === 'active' ? 'bg-green-100 text-green-700' :
                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                item.status === 'pending_payment' ? 'bg-orange-100 text-orange-700' :
                                item.status === 'expired' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {item.status.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            <button 
                                onClick={() => handleEditClick(item)}
                                className="bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600 p-2 rounded-lg transition shadow-sm"
                                title="แก้ไขรายละเอียด"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50 gap-4">
                <span className="text-sm text-gray-500">
                    แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredData.length)} จากทั้งหมด {filteredData.length} รายการ
                </span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="p-2 border rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-600 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-md border text-sm font-medium transition ${
                                currentPage === page 
                                ? "bg-blue-600 text-white border-blue-600" 
                                : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    </div>

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-600 transition"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* --- Modal Section --- */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-start md:items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl animate-fade-in my-8 relative flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10 rounded-t-xl">
              <div>
                  <h2 className="text-xl font-bold text-gray-800">รายละเอียดกรมธรรม์</h2>
                  <p className="text-sm text-gray-500">ID: {selectedItem._id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto flex-grow">
              {/* Left Column: ข้อมูล & สถานะ */}
              <div className="space-y-6">
                 
                 {/* ✅ 1. ส่วนแก้ไขข้อมูลลูกค้าและการประกัน */}
                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                    <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                        <span className="bg-blue-200 p-1 rounded"><Edit className="w-4 h-4"/></span> 
                        แก้ไขข้อมูลผู้ซื้อและการประกัน
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500">ชื่อจริง</label>
                            <input 
                                type="text"
                                className="w-full border rounded p-1.5 text-sm"
                                value={editForm.customer_first_name}
                                onChange={(e) => setEditForm({...editForm, customer_first_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">นามสกุล</label>
                            <input 
                                type="text"
                                className="w-full border rounded p-1.5 text-sm"
                                value={editForm.customer_last_name}
                                onChange={(e) => setEditForm({...editForm, customer_last_name: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500">บริษัทประกัน</label>
                            <select 
                                className="w-full border rounded p-1.5 text-sm bg-white"
                                value={editForm.insurance_brand}
                                onChange={(e) => setEditForm({...editForm, insurance_brand: e.target.value})}
                            >
                                <option value="">เลือกบริษัท</option>
                                {INSURANCE_COMPANIES.filter(c => c !== "ทั้งหมด").map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">ชั้นประกัน</label>
                            <select 
                                className="w-full border rounded p-1.5 text-sm bg-white"
                                value={editForm.insurance_level}
                                onChange={(e) => setEditForm({...editForm, insurance_level: e.target.value})}
                            >
                                <option value="">เลือกชั้น</option>
                                {INSURANCE_LEVELS.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500">ยี่ห้อรถ</label>
                            <input 
                                type="text"
                                className="w-full border rounded p-1.5 text-sm"
                                value={editForm.car_brand}
                                onChange={(e) => setEditForm({...editForm, car_brand: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">รุ่นรถ</label>
                            <input 
                                type="text"
                                className="w-full border rounded p-1.5 text-sm"
                                value={editForm.car_model}
                                onChange={(e) => setEditForm({...editForm, car_model: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500">ทะเบียนรถ</label>
                        <input 
                            type="text"
                            className="w-full border rounded p-1.5 text-sm"
                            value={editForm.car_registration}
                            onChange={(e) => setEditForm({...editForm, car_registration: e.target.value})}
                        />
                    </div>
                 </div>

                 <hr className="border-gray-200"/>

                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">สถานะกรมธรรม์</label>
                    <select 
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="pending">Pending (รอตรวจสอบ)</option>
                        <option value="pending_payment">Pending Payment (รอชำระเงิน)</option>
                        <option value="active">Active (คุ้มครองแล้ว)</option>
                        <option value="expired">Expired (หมดอายุ)</option>
                        <option value="rejected">Rejected (ปฏิเสธ)</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">เลขกรมธรรม์จริง</label>
                    <input 
                        type="text" 
                        value={editForm.policy_number}
                        onChange={(e) => setEditForm({...editForm, policy_number: e.target.value})}
                        className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        placeholder="เช่น P-123456789"
                    />
                 </div>
              </div>

              {/* Right Column: เอกสารต่างๆ */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">จัดการเอกสารแนบ</h3>
                
                {renderImageUpload("รูปบัตรประชาชน (ลูกค้า)", "citizenCardImage", editForm.citizenCardImage)}
                {renderImageUpload("รูปทะเบียนรถ (ลูกค้า)", "carRegistrationImage", editForm.carRegistrationImage)}
                {renderImageUpload("หลักฐานการโอนเงิน (Admin)", "paymentSlipImage", editForm.paymentSlipImage)}

                {/* ✅ 2. ไฟล์กรมธรรม์ (แก้ไขให้แสดง ไม่มีไฟล์แนบ) */}
                <div className="pt-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex justify-between items-center">
                        <span>ไฟล์กรมธรรม์ฉบับจริง (PDF/รูปภาพ)</span>
                        {editForm.policyFile && <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">มีไฟล์แล้ว</span>}
                    </h3>

                    {/* แสดง preview หรือ กล่องว่าง */}
                    {editForm.policyFile ? (
                        <div className="mt-2 mb-2 bg-gray-50 p-3 rounded border flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                <FileText className="w-4 h-4"/> เอกสารแนบปัจจุบัน
                            </span>
                            <button 
                            type="button"
                            className="text-blue-600 text-sm hover:underline flex items-center gap-1 font-medium"
                            onClick={() => {
                                const win = window.open();
                                win?.document.write('<iframe src="' + editForm.policyFile  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
                            }}
                            >
                                <Eye className="w-4 h-4"/> เปิดดูเอกสาร
                            </button>
                        </div>
                    ) : (
                        <div className="h-20 bg-gray-100 border border-dashed rounded flex items-center justify-center text-gray-400 text-sm mb-2">
                            ไม่มีไฟล์แนบ
                        </div>
                    )}

                    <label className="flex items-center gap-2 w-full p-2 border border-dashed rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition text-sm justify-center text-gray-600 font-medium bg-white">
                        <Upload className="w-4 h-4 text-blue-500" /> อัปโหลด / แก้ไขกรมธรรม์
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'policyFile')} />
                    </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 rounded-b-xl">
               <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition">ยกเลิก</button>
               <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm transition transform active:scale-95">
                    <Save className="w-4 h-4" /> บันทึกการเปลี่ยนแปลง
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}