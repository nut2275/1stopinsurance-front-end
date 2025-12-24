import React from "react";
import { FilterTab } from "../types";

interface StatusTabsProps {
    currentTab: FilterTab;
    onTabChange: (tab: FilterTab) => void;
    counts: {
        all: number;
        pending: number;
        pending_payment: number;
        active: number;
        about_to_expire: number; // ✅ ต้องมีอันนี้
        rejected: number;
    };
}

const StatusTabs: React.FC<StatusTabsProps> = ({ currentTab, onTabChange, counts }) => {
    // กำหนดสีของแต่ละ Tab
    const tabs: { id: FilterTab; label: string; count: number; colorClass: string }[] = [
        { id: "all", label: "ทั้งหมด", count: counts.all, colorClass: "text-slate-600 bg-slate-100" },
        { id: "pending", label: "รอตรวจสอบ", count: counts.pending, colorClass: "text-yellow-700 bg-yellow-100" },
        { id: "pending_payment", label: "รอชำระเงิน", count: counts.pending_payment, colorClass: "text-orange-700 bg-orange-100" },
        { id: "active", label: "คุ้มครองแล้ว", count: counts.active, colorClass: "text-green-700 bg-green-100" },
        // ✅ เพิ่ม Tab นี้อย่างถูกต้อง
        { id: "about_to_expire", label: "ใกล้หมดอายุ", count: counts.about_to_expire, colorClass: "text-purple-700 bg-purple-100" },
        { id: "rejected", label: "ไม่ผ่าน/หมดอายุ", count: counts.rejected, colorClass: "text-red-700 bg-red-100" },
    ];

    return (
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-2 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        group relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap
                        ${currentTab === tab.id 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                            : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
                        }
                    `}
                >
                    {tab.label}
                    <span className={`
                        flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold transition-colors
                        ${currentTab === tab.id 
                            ? "bg-white/20 text-white" 
                            : tab.colorClass
                        }
                    `}>
                        {tab.count}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default StatusTabs;