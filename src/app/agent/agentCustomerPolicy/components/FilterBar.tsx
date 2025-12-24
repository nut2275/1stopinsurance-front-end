import { Search, Filter, Car, Calendar, FileText, User } from "lucide-react";
import React, { ChangeEvent } from "react";
import { INSURANCE_COMPANIES } from "../utils";

interface FilterBarProps {
    searchName: string; setSearchName: (v: string) => void;
    searchPolicyNo: string; setSearchPolicyNo: (v: string) => void;
    searchCompany: string; setSearchCompany: (v: string) => void;
    sortOrder: "asc" | "desc"; setSortOrder: (v: "asc" | "desc") => void;
    
    // Car Filters
    filterCarBrand: string; handleFilterBrandChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    filterCarModel: string; handleFilterModelChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    filterCarSubModel: string; setFilterCarSubModel: (v: string) => void;
    
    // Options
    brandOptions: string[]; modelOptions: string[]; subModelOptions: string[];
}

const FilterBar: React.FC<FilterBarProps> = (props) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">ตัวกรองเพิ่มเติม</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3" /> ค้นหาลูกค้า
                </label>
                <div className="relative group">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" 
                        placeholder="พิมพ์ชื่อลูกค้า..." 
                        value={props.searchName} 
                        onChange={(e) => props.setSearchName(e.target.value)} 
                    />
                </div>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> เลขกรมธรรม์
                </label>
                <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono placeholder:text-slate-400" 
                    placeholder="ระบุเลขกรมธรรม์..." 
                    value={props.searchPolicyNo} 
                    onChange={(e) => props.setSearchPolicyNo(e.target.value)} 
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">บริษัทประกัน</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer" value={props.searchCompany} onChange={(e) => props.setSearchCompany(e.target.value)}>
                    {INSURANCE_COMPANIES.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
            </div>
        </div>

        {/* Car Filters Section */}
        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Car className="w-3.5 h-3.5" /> ตัวกรองรถยนต์ & การเรียงลำดับ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" value={props.filterCarBrand} onChange={props.handleFilterBrandChange}>
                    <option value="">ทุกยี่ห้อ</option>
                    {props.brandOptions.map((b, i) => <option key={i} value={b}>{b}</option>)}
                </select>
                <select className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400" value={props.filterCarModel} onChange={props.handleFilterModelChange} disabled={!props.filterCarBrand}>
                    <option value="">ทุกรุ่น</option>
                    {props.modelOptions.map((m, i) => <option key={i} value={m}>{m}</option>)}
                </select>
                <select className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400" value={props.filterCarSubModel} onChange={(e) => props.setFilterCarSubModel(e.target.value)} disabled={!props.filterCarModel}>
                    <option value="">ทุกรุ่นย่อย</option>
                    {props.subModelOptions.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <select className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-blue-700 font-medium cursor-pointer" value={props.sortOrder} onChange={(e) => props.setSortOrder(e.target.value as "asc" | "desc")}>
                        <option value="desc">ใหม่ล่าสุด (Newest)</option>
                        <option value="asc">เก่าที่สุด (Oldest)</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
  );
};

export default FilterBar;