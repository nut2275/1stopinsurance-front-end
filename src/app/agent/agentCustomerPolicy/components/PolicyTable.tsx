import React from "react";
import { Edit, User, FileText, ChevronLeft, ChevronRight, Calendar, Car, X } from "lucide-react";
import { Purchase } from "../types";
import { formatThaiDate, getStatusConfig, getAvatarColor } from "../utils";

interface PolicyTableProps {
    loading: boolean;
    purchases: Purchase[];
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onEdit: (item: Purchase) => void;
}

const PolicyTable: React.FC<PolicyTableProps> = ({ 
    loading, purchases, totalItems, currentPage, itemsPerPage, onPageChange, onEdit 
}) => {
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                            <th className="p-5 text-xs font-bold uppercase tracking-wider w-[180px]">ตัวแทน / วันที่สมัคร</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">ข้อมูลใบอนุญาต</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">รถยนต์</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider">ประกันภัย</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider text-center">สถานะ</th>
                            <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">ดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-5"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                    <td className="p-5"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                    <td className="p-5"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                                    <td className="p-5"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                    <td className="p-5"><div className="h-6 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                                    <td className="p-5"><div className="h-8 bg-slate-100 rounded w-8 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : purchases.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                                            <FileText className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="text-lg font-medium text-slate-600">ไม่พบข้อมูล</p>
                                        <p className="text-sm">ลองปรับตัวกรองหรือเลือก Tab สถานะอื่น</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            purchases.map((item) => {
                                const statusConfig = getStatusConfig(item.status);
                                return (
                                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5 align-top">
                                            <div className="flex items-start gap-3">
                                                {/* ✅ แก้ไขตรงนี้: เช็ครูปภาพก่อนแสดง */}
                                                <div className="shrink-0">
                                                    {item.customer_id?.imgProfile_customer ? (
                                                        <img 
                                                            src={item.customer_id.imgProfile_customer} 
                                                            alt="Profile" 
                                                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-white shadow-sm text-slate-700 ${getAvatarColor(item.customer_id?.first_name || "")} bg-opacity-20`}>
                                                            {item.customer_id?.first_name?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">
                                                        {item.customer_id?.first_name} {item.customer_id?.last_name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                        <User className="w-3 h-3" /> {item.customer_id?.username || "Guest"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="p-5 align-top">
                                            <div className="text-sm font-medium text-slate-700 mb-1">
                                                {item.policy_number || "-"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {formatThaiDate(item.createdAt)}
                                            </div>
                                        </td>

                                        <td className="p-5 align-top">
                                            <div className="space-y-1">
                                                <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                                    <Car className="w-4 h-4 text-slate-400" />
                                                    {item.car_id?.brand} {item.car_id?.carModel}
                                                </div>
                                                <div className="text-xs text-slate-500 pl-6">{item.car_id?.subModel}</div>
                                                <div className="flex gap-2 pl-6 mt-1.5">
                                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">
                                                        {item.car_id?.registration} {item.car_id?.province}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-5 align-top">
                                            <div className="space-y-1.5">
                                                <div className="text-sm text-blue-700 font-semibold">
                                                    {item.carInsurance_id?.insuranceBrand}
                                                </div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {item.carInsurance_id?.level}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="p-5 align-middle text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${statusConfig.color.replace('bg-', 'border-').replace('100', '200')} ${statusConfig.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                                                {statusConfig.label}
                                            </span>
                                        </td>

                                        <td className="p-5 align-middle text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button 
                                                    onClick={() => onEdit(item)} 
                                                    className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all border border-transparent hover:border-blue-100"
                                                    title="แก้ไขข้อมูล"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all border border-transparent hover:border-red-100" title="ลบ (Mock)">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            
            {!loading && purchases.length > 0 && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4 mt-auto">
                    <div className="text-sm text-slate-500 hidden sm:block">
                        แสดง <span className="font-semibold text-slate-700">{indexOfFirstItem + 1}</span> ถึง <span className="font-semibold text-slate-700">{Math.min((currentPage - 1) * itemsPerPage + purchases.length, totalItems)}</span> จากทั้งหมด <span className="font-semibold text-slate-700">{totalItems}</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button 
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
                            disabled={currentPage === 1} 
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4"/>
                        </button>
                        <button 
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
                            disabled={currentPage === totalPages} 
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyTable;