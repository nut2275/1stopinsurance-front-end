import React from 'react';
import { Search, Calendar, ArrowUpDown, RefreshCw } from 'lucide-react';
import { SortOrder } from '../types';

interface AgentFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    filterDate: string;
    setFilterDate: (val: string) => void;
    sortOrder: SortOrder;
    setSortOrder: (val: SortOrder) => void;
    onReset: () => void;
}

const AgentFilters: React.FC<AgentFiltersProps> = ({ 
    searchTerm, setSearchTerm, filterDate, setFilterDate, sortOrder, setSortOrder, onReset 
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center">
         {/* Search */}
         <div className="w-full lg:w-96 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
            </div>
            <input 
                type="text" placeholder="ค้นหาชื่อ, สกุล หรือ เลขใบอนุญาต..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full transition-all text-sm"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Filters & Sort */}
         <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                 <Calendar size={16} className="text-slate-500" />
                 <span className="text-xs text-slate-500 font-medium hidden sm:inline">วันที่สมัคร:</span>
                 <input type="date" className="bg-transparent text-sm text-slate-700 outline-none" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
             </div>
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                 <ArrowUpDown size={16} className="text-slate-500" />
                 <select className="bg-transparent text-sm text-slate-700 outline-none cursor-pointer" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
                     <option value="newest">ใหม่ล่าสุด</option>
                     <option value="oldest">เก่าที่สุด</option>
                 </select>
             </div>
             {(searchTerm || filterDate || sortOrder !== 'newest') && (
                 <button onClick={onReset} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="ล้างตัวกรอง">
                     <RefreshCw size={18} />
                 </button>
             )}
         </div>
    </div>
  );
};

export default AgentFilters;