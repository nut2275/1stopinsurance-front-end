"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { NextPage } from 'next';
import api from "@/services/api"; 

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

// ✅ Interface สำหรับ Notification Item
type NotifyItem = {
    _id: string;
    message: string;
    type: 'warning' | 'success' | 'info' | 'primary';
    isRead: boolean;
    createdAt: string;
    sender?: { name: string; role: string; };
};

// ✅ Interface สำหรับข้อมูล Agent ใน LocalStorage
interface AgentLocalStorage {
    _id?: string;
    id?: string;
    userId?: string;
    [key: string]: unknown;
}

// ✅ Interface สำหรับ Response จาก API
interface NotificationResponse {
    data: NotifyItem[];
}

const AgentNotificationPage: NextPage = () => {
    const [notifications, setNotifications] = useState<NotifyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getSenderPrefix = (sender?: NotifyItem['sender']) => {
        if (!sender) return "";
        switch (sender.role) {
            case 'admin': return "Admin"; 
            case 'agent': return `(ตัวแทน: ${sender.name})`;
            case 'customer': return `(ลูกค้า: ${sender.name})`;
            default: return `(${sender.name})`;
        }
    };

    const handleRead = async (id: string, isRead: boolean) => {
        if (isRead) return;

        try {
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            // ใช้ api instance
            await api.put('/api/notifications/read-bulk', { notificationIds: [id] });
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('refreshNotification'));
            }
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const storedAgent = localStorage.getItem('agentData'); 
                if (!storedAgent) { setLoading(false); return; }
                
                // ✅ Type Safe JSON Parse
                let userObj: AgentLocalStorage;
                try { 
                    userObj = JSON.parse(storedAgent) as AgentLocalStorage; 
                } catch (e) { 
                    localStorage.removeItem('agentData'); 
                    return; 
                }
                
                const currentUserId = userObj._id || userObj.id || userObj.userId;
                if (!currentUserId) return;

                // ✅ Type Safe API Call
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
    }, [router]);

    return (
        <div className="flex flex-col min-h-screen font-sans bg-gray-50 text-gray-800">
            <style jsx global>{`
                .notification.warning { border-left: 6px solid #dc2626; }
                .notification.success { border-left: 6px solid #16a34a; }
                .notification.info { border-left: 6px solid #2563eb; }
                .notification.primary { border-left: 6px solid #9333ea; }
            `}</style>

            <main className="flex-grow max-w-4xl mx-auto w-full px-4 mt-10 mb-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">การแจ้งเตือน</h1>
                
                {loading ? ( 
                    <div className="text-center py-10 text-gray-500 animate-pulse">กำลังโหลด...</div> 
                ) : notifications.length === 0 ? ( 
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm text-gray-500">ไม่มีการแจ้งเตือนใหม่</div> 
                ) : (
                    <div className="space-y-4">
                        {notifications.map((note) => (
                            <div 
                                key={note._id} 
                                onClick={() => handleRead(note._id, note.isRead)}
                                className={`
                                    notification ${note.type}
                                    relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 shadow-sm
                                    ${!note.isRead ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-transparent hover:shadow-md hover:-translate-y-0.5'}
                                `}
                            >
                                {/* Unread Indicator */}
                                {!note.isRead && (
                                    <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_0_2px_white]" title="ยังไม่ได้อ่าน" />
                                )}

                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    {note.type === 'warning' && <WarningIcon className="h-8 w-8 text-red-600" />}
                                    {note.type === 'success' && <SuccessIcon className="h-8 w-8 text-green-600" />}
                                    {note.type === 'info' && <InfoIcon className="h-8 w-8 text-blue-600" />}
                                    {note.type === 'primary' && <PlusIcon className="h-8 w-8 text-purple-600" />}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <p className={`text-sm md:text-base whitespace-pre-line ${!note.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                        {note.sender && (
                                            <span className="font-bold text-blue-600 mr-2">
                                                {getSenderPrefix(note.sender)}
                                            </span>
                                        )}
                                        {note.message}
                                    </p>
                                    <span className="text-xs text-gray-400 mt-1 block">
                                        {new Date(note.createdAt).toLocaleDateString('th-TH', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AgentNotificationPage;