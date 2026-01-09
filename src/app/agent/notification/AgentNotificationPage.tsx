"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { NextPage } from 'next';
import api from "@/services/api"; 

import MenuAgent from '@/components/element/MenuAgent';

// ✅ Helper มาตรฐาน
import { routesAgentsSession } from '@/routes/session';
import { AgentStatus } from "@/hooks/useAgentStatus";
import { Loader2, CheckCheck } from 'lucide-react';

// --- Icon Components ---
const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const WarningIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
);
const SuccessIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const InfoIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

// ✅ Interface
type NotifyItem = {
    _id: string;
    message: string;
    type: 'warning' | 'success' | 'info' | 'primary';
    isRead: boolean;
    createdAt: string;
    sender?: { name: string; role: string; };
};

interface NotificationResponse {
    data: NotifyItem[];
}

const AgentNotificationPage: NextPage = () => {
    const router = useRouter();
    
    // ✅ 1. เรียก Hook เช็คสถานะ (และรับค่า authLoading)
    const { loading: authLoading } = AgentStatus();

    const [notifications, setNotifications] = useState<NotifyItem[]>([]);
    const [loading, setLoading] = useState(true);

    const unreadIdsRef = useRef<string[]>([]);

    const getSenderPrefix = (sender?: NotifyItem['sender']) => {
        if (!sender) return "";
        switch (sender.role) {
            case 'admin': return "Admin"; 
            case 'agent': return `(ตัวแทน: ${sender.name})`;
            case 'customer': return `(ลูกค้า: ${sender.name})`;
            default: return `(${sender.name})`;
        }
    };

    // ฟังก์ชันอ่านทีละอัน
    const handleRead = async (id: string, isRead: boolean) => {
        if (isRead) return;

        try {
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            await api.put('/api/notifications/read-bulk', { notificationIds: [id] });
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('refreshNotification'));
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    // ฟังก์ชันอ่านทั้งหมด (Manual Click)
    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
        if (unreadIds.length === 0) return;

        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            await api.put('/api/notifications/read-bulk', { notificationIds: unreadIds });
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('refreshNotification'));
            }
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    // อัปเดต Ref เพื่อใช้ตอนออกจากหน้า (Logic เดิมของเพื่อนคุณ)
    useEffect(() => {
        unreadIdsRef.current = notifications
            .filter(n => !n.isRead)
            .map(n => n._id);
    }, [notifications]);

    // Cleanup: อ่าน Auto เมื่อออกจากหน้า (Logic เดิมของเพื่อนคุณ)
    useEffect(() => {
        return () => {
            const idsToMark = unreadIdsRef.current;
            if (idsToMark.length > 0) {
                api.put('/api/notifications/read-bulk', { notificationIds: idsToMark })
                    .then(() => {
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new Event('refreshNotification'));
                        }
                    })
                    .catch(err => console.error("Error marking read on exit:", err));
            }
        };
    }, []);

    // ✅ 2. Fetch Data (รอ authLoading เสร็จก่อนค่อยโหลด)
    useEffect(() => {
        const fetchNotifications = async () => {
            // ถ้ายืนยันตัวตนยังไม่เสร็จ อย่าเพิ่งโหลด
            if (authLoading) return;

            try {
                setLoading(true);

                // ✅ ใช้ routesAgentsSession ดึง ID อย่างปลอดภัย
                const session = routesAgentsSession();
                if (!session) {
                    router.push('/agent/login');
                    return;
                }
                const currentUserId = session.id;

                if (!currentUserId) return;

                const res = await api.get<NotificationResponse>(`/api/notifications?userId=${currentUserId}`);
                
                if (res.data && res.data.data) {
                    setNotifications(res.data.data);
                }
            } catch (error) { 
                console.error("Error fetching notifications:", error); 
            } finally { 
                setLoading(false); 
            }
        };

        fetchNotifications();
    }, [router, authLoading]);

    // -------------------------------------------------------------
    // ✅ 3. Loading Gates (แสดง Spinner ถ้ายังเช็คสิทธิ์ไม่เสร็จ)
    // -------------------------------------------------------------

    if (authLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="mt-4 text-slate-500">กำลังตรวจสอบสิทธิ์...</p>
            </div>
        );
    }

    return (
        <>
            <MenuAgent activePage="notification" />
            <div className="flex flex-col min-h-screen font-sans bg-gray-50/50 text-gray-800">
                <style jsx global>{`
                    .notification.warning { border-left: 6px solid #dc2626; }
                    .notification.success { border-left: 6px solid #16a34a; }
                    .notification.info { border-left: 6px solid #2563eb; }
                    .notification.primary { border-left: 6px solid #9333ea; }
                `}</style>

                <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">การแจ้งเตือน</h1>
                        
                        {/* ปุ่มอ่านทั้งหมด (ถ้ามีรายการที่ยังไม่อ่าน) */}
                        {notifications.some(n => !n.isRead) && (
                            <button 
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm text-sm font-medium"
                            >
                                <CheckCheck className="w-4 h-4" />
                                อ่านทั้งหมด
                            </button>
                        )}
                    </div>
                    
                    {loading ? ( 
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <p className="text-gray-400">กำลังโหลดรายการแจ้งเตือน...</p>
                        </div>
                    ) : notifications.length === 0 ? ( 
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <InfoIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">ไม่มีการแจ้งเตือนใหม่</h3>
                            <p className="text-gray-500 mt-1">คุณติดตามข่าวสารครบถ้วนแล้ว</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((note) => (
                                <div 
                                    key={note._id} 
                                    onClick={() => handleRead(note._id, note.isRead)}
                                    className={`
                                        notification ${note.type}
                                        relative flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all duration-200
                                        ${!note.isRead 
                                            ? 'bg-white shadow-md shadow-blue-100/50 border-t border-r border-b border-gray-100' 
                                            : 'bg-white/60 border border-gray-100 hover:bg-white hover:shadow-sm'}
                                    `}
                                >
                                    {/* Unread Indicator */}
                                    {!note.isRead && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">New</span>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-0.5">
                                        {note.type === 'warning' && <WarningIcon className="h-6 w-6 text-red-500" />}
                                        {note.type === 'success' && <SuccessIcon className="h-6 w-6 text-emerald-500" />}
                                        {note.type === 'info' && <InfoIcon className="h-6 w-6 text-blue-500" />}
                                        {note.type === 'primary' && <PlusIcon className="h-6 w-6 text-purple-500" />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow min-w-0 pr-8">
                                        <p className={`text-sm md:text-base whitespace-pre-line leading-relaxed ${!note.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                            {note.sender && (
                                                <span className="text-blue-600 mr-2 font-bold">
                                                    {getSenderPrefix(note.sender)}
                                                </span>
                                            )}
                                            {note.message}
                                        </p>
                                        <span className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            {new Date(note.createdAt).toLocaleDateString('th-TH', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric', 
                                            })}
                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                            {new Date(note.createdAt).toLocaleTimeString('th-TH', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })} น.
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>

    );
};

export default AgentNotificationPage;