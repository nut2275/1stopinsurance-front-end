"use client";

import { useState, useEffect, ChangeEvent } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";
import { checkIsAboutToExpire } from "./utils";
import { Purchase, FilterTab } from "./types";
import FilterBar from "./components/FilterBar";
import EditPolicyModal, { EditFormState } from "./components/EditPolicyModal";
import PolicyTable from "./components/PolicyTable";
import StatusTabs from "./components/StatusTabs";
import MenuAgent from '@/components/element/MenuAgent';

import { useRouter } from 'next/navigation';
import { routesAgentsSession } from '@/routes/session';

const ITEMS_PER_PAGE = 10;

export default function AgentPolicyPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredData, setFilteredData] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ ใช้ FilterTab อย่างเดียวได้เลย (เพราะเราแก้ใน types.ts แล้ว)
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  
  // ✅ เพิ่ม about_to_expire ใน state เริ่มต้น
  const [statusCounts, setStatusCounts] = useState({ 
      all: 0, pending: 0, pending_payment: 0, active: 0, about_to_expire: 0, rejected: 0 
  });

  const [searchName, setSearchName] = useState("");
  const [searchCompany, setSearchCompany] = useState("ทั้งหมด");
  const [searchPolicyNo, setSearchPolicyNo] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  
  const [filterCarBrand, setFilterCarBrand] = useState("");
  const [filterCarModel, setFilterCarModel] = useState("");
  const [filterCarSubModel, setFilterCarSubModel] = useState("");
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [subModelOptions, setSubModelOptions] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- API ---
  const fetchData = async () => {
    try {
      setLoading(true);

      const sesion = routesAgentsSession();
      if (!sesion) {
          router.push("/agent/login");
          return;
      }
      const token = localStorage.getItem("token");
      
      const res = await api.get<Purchase[]>("/purchase/agent/my-history", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setPurchases(res.data);
      
      const counts = {
          all: res.data.length,
          pending: res.data.filter(p => p.status === 'pending').length,
          pending_payment: res.data.filter(p => p.status === 'pending_payment').length,
          
          // Active = เป็น active และ "ยังไม่ใกล้หมดอายุ"
          active: res.data.filter(p => p.status === 'active' && !checkIsAboutToExpire(p.end_date)).length,
          
          // About to Expire = เป็น active/about_to_expire และ "ใกล้หมดอายุ"
          about_to_expire: res.data.filter(p => (p.status === 'active' || p.status === 'about_to_expire') && checkIsAboutToExpire(p.end_date)).length,
          
          rejected: res.data.filter(p => p.status === 'rejected' || p.status === 'expired').length,
      };
      setStatusCounts(counts);

    } catch (error) {
        console.error("Error fetching data:", error);
        const err = error as AxiosError;
        if (err.response && err.response.status === 401) {
             window.location.href = "/agent/login";
        }
    } finally { setLoading(false); }
  };

  const fetchBrands = async () => {
      try { const res = await api.get("/car-master/brands"); setBrandOptions(res.data); } catch(e){console.error(e)}
  };
  const fetchModels = async (brand: string) => {
      if(!brand) return [];
      try { return (await api.get(`/car-master/models?brand=${encodeURIComponent(brand)}`)).data; } catch(e){return []}
  };
  const fetchSubModels = async (brand: string, model: string) => {
      if(!brand || !model) return [];
      try { return (await api.get(`/car-master/sub-models?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`)).data; } catch(e){return []}
  };
  useEffect(() => { fetchData(); fetchBrands(); }, []);

  const handleFilterBrand = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value; setFilterCarBrand(val); setFilterCarModel(""); setFilterCarSubModel("");
      if(val) { const m = await fetchModels(val); setModelOptions(m); } else setModelOptions([]);
  };
  const handleFilterModel = async (e: ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value; setFilterCarModel(val); setFilterCarSubModel("");
      if(val) { const s = await fetchSubModels(filterCarBrand, val); setSubModelOptions(s); } else setSubModelOptions([]);
  };
  const handleSave = async (id: string, data: Partial<EditFormState>) => {
      try {
          const token = localStorage.getItem("token");
          await api.put(`/purchase/agent/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
          alert("บันทึกเรียบร้อย");
          setIsModalOpen(false);
          fetchData(); 
      } catch (e) { alert("บันทึกไม่สำเร็จ"); console.error(e); }
  };

  // --- Filter Logic ---
  useEffect(() => {
    let temp = purchases;

    // Filter by Tab
    if (activeTab === 'pending') {
        temp = temp.filter(p => p.status === 'pending');
    } else if (activeTab === 'pending_payment') {
        temp = temp.filter(p => p.status === 'pending_payment');
    } else if (activeTab === 'active') {
        temp = temp.filter(p => p.status === 'active' && !checkIsAboutToExpire(p.end_date));
    } else if (activeTab === 'about_to_expire') {
        temp = temp.filter(p => (p.status === 'active' || p.status === 'about_to_expire') && checkIsAboutToExpire(p.end_date));
    } else if (activeTab === 'rejected') {
        temp = temp.filter(p => p.status === 'rejected' || p.status === 'expired');
    }

    // Other Filters
    if (searchName) temp = temp.filter((p) => (`${p.customer_id?.first_name} ${p.customer_id?.last_name}`).toLowerCase().includes(searchName.toLowerCase()));
    if (searchCompany !== "ทั้งหมด") temp = temp.filter((p) => (p.carInsurance_id?.insuranceBrand || "") === searchCompany);
    if (searchPolicyNo) temp = temp.filter((p) => (p.policy_number || "").toLowerCase().includes(searchPolicyNo.toLowerCase()));
    
    if (filterCarBrand) temp = temp.filter((p) => p.car_id?.brand === filterCarBrand);
    if (filterCarModel) temp = temp.filter((p) => p.car_id?.carModel === filterCarModel);
    if (filterCarSubModel) temp = temp.filter((p) => p.car_id?.subModel === filterCarSubModel);

    temp.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredData([...temp]);
    setCurrentPage(1);
  }, [activeTab, searchName, searchCompany, searchPolicyNo, sortOrder, filterCarBrand, filterCarModel, filterCarSubModel, purchases]);

  const currentItems = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
        <MenuAgent activePage="/agent/agentCustomerPolicy"/>
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans text-slate-800">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">รายการงานขาย</h1>
                    <p className="text-slate-500 mt-2 text-sm">จัดการกรมธรรม์ ตรวจสอบสถานะ และอนุมัติงานขายของคุณ</p>
                </div>

                <FilterBar 
                    searchName={searchName} setSearchName={setSearchName}
                    searchPolicyNo={searchPolicyNo} setSearchPolicyNo={setSearchPolicyNo}
                    searchCompany={searchCompany} setSearchCompany={setSearchCompany}
                    sortOrder={sortOrder} setSortOrder={setSortOrder}
                    filterCarBrand={filterCarBrand} handleFilterBrandChange={handleFilterBrand}
                    filterCarModel={filterCarModel} handleFilterModelChange={handleFilterModel}
                    filterCarSubModel={filterCarSubModel} setFilterCarSubModel={setFilterCarSubModel}
                    brandOptions={brandOptions} modelOptions={modelOptions} subModelOptions={subModelOptions}
                />

                <StatusTabs 
                    currentTab={activeTab} 
                    onTabChange={setActiveTab} 
                    counts={statusCounts} 
                />

                <PolicyTable 
                    loading={loading}
                    purchases={currentItems}
                    totalItems={filteredData.length}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    onEdit={(item) => {
                        setSelectedItem(item);
                        setIsModalOpen(true);
                    }}
                />

                {selectedItem && (
                    <EditPolicyModal 
                        isOpen={isModalOpen} 
                        onClose={() => setIsModalOpen(false)} 
                        purchase={selectedItem} 
                        onSave={handleSave} 
                    />
                )}
            </div>
        </div>
    </>
  );
}