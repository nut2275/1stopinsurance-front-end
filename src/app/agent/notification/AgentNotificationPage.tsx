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

type NotifyItem = {
    _id: string;
    message: string;
    type: 'warning' | 'success' | 'info' | 'primary';
    isRead: boolean;
    createdAt: string;
    sender?: { name: string; role: string; };
};

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

    // ✅ ฟังก์ชันกดอ่าน: จะทำการ Mark as Read เฉพาะตัวที่กด
    const handleRead = async (id: string, isRead: boolean) => {
        if (isRead) return; // ถ้าอ่านแล้วไม่ต้องทำอะไร

        try {
            // 1. อัปเดต UI ทันทีให้จุดแดงหายไป (User Experience ที่ดี)
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

            // 2. ส่ง API ไปอัปเดตหลังบ้าน
            // ใช้ route read-bulk ก็ได้แต่ส่งไป id เดียว หรือจะทำ route แยกก็ได้
            // ในที่นี้ขอใช้ read-bulk เหมือนเดิมเพื่อความง่าย
            await api.put('/api/notifications/read-bulk', { notificationIds: [id] });
            
            // 3. บอกให้ Navbar ลดเลขลงด้วย
            window.dispatchEvent(new Event('refreshNotification'));

        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const storedAgent = localStorage.getItem('agentData'); 
                if (!storedAgent) { setLoading(false); return; }
                
                let userObj;
                try { userObj = JSON.parse(storedAgent); } catch (e) { localStorage.removeItem('agentData'); return; }
                const currentUserId = userObj._id || userObj.id || userObj.userId;
                if (!currentUserId) return;

                const res = await api.get(`/api/notifications?userId=${currentUserId}`);
                
                if (res.data && res.data.data) {
                    setNotifications(res.data.data);
                }

                // ❌ ลบบรรทัด Auto Mark as Read ออกไปเลย
                // เพื่อให้จุดแดงยังค้างอยู่จนกว่า User จะกดเอง

            } catch (error) { console.error("Error:", error); } 
            finally { setLoading(false); }
        };
        fetchNotifications();
    }, [router]);

    return (
        <>
            <style jsx global>{`
                body { background-color: #f9fafb; }
                .notification {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.2s ease;
                    position: relative;
                    cursor: pointer; /* เพิ่ม cursor ให้รู้ว่ากดได้ */
                }
                .notification:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                /* เปลี่ยนสีพื้นหลังถ้ายังไม่อ่านให้เด่นขึ้นนิดนึง (Optional) */
                .notification.unread {
                    background-color: #f0f9ff; 
                    border: 1px solid #bae6fd;
                }

                .notification.warning { border-left: 6px solid #dc2626; }
                .notification.success { border-left: 6px solid #16a34a; }
                .notification.info { border-left: 6px solid #2563eb; }
                .notification.primary { border-left: 6px solid #9333ea; }
                
                .unread-indicator {
                    position: absolute; top: 10px; right: 10px; width: 10px; height: 10px;
                    background-color: #ef4444; border-radius: 50%;
                    box-shadow: 0 0 0 2px white;
                }
            `}</style>

            <div className="flex flex-col min-h-screen font-sans text-gray-800">
                <main className="flex-grow max-w-4xl mx-auto w-full px-4 mt-10 mb-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">การแจ้งเตือน</h1>
                    {loading ? ( <div className="text-center py-10 text-gray-500">กำลังโหลด...</div> ) : 
                     notifications.length === 0 ? ( <div className="text-center py-10 bg-white rounded-lg text-gray-500">ไม่มีการแจ้งเตือนใหม่</div> ) : 
                    (
                        <div className="space-y-4">
                            {notifications.map((note) => (
                                <div 
                                    key={note._id} 
                                    // ✅ เพิ่ม onClick เพื่อกดอ่าน
                                    onClick={() => handleRead(note._id, note.isRead)}
                                    className={`notification ${note.type} ${!note.isRead ? 'unread' : ''}`}
                                >
                                    {/* จุดแดงจะแสดงถ้า isRead === false */}
                                    {!note.isRead && <div className="unread-indicator" title="กดเพื่ออ่าน"></div>}

                                    {/* Icon */}
                                    {note.type === 'warning' && <WarningIcon className="h-8 w-8 text-red-600 flex-shrink-0" />}
                                    {note.type === 'success' && <SuccessIcon className="h-8 w-8 text-green-600 flex-shrink-0" />}
                                    {note.type === 'info' && <InfoIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />}
                                    {note.type === 'primary' && <PlusIcon className="h-8 w-8 text-purple-600 flex-shrink-0" />}

                                    <div className="flex-grow">
                                        <p className={`text-sm md:text-base whitespace-pre-line ${!note.isRead ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                                            {note.sender && ( <span className="font-bold text-blue-600 mr-2">{getSenderPrefix(note.sender)}</span> )}
                                            {note.message}
                                        </p>
                                        <span className="text-xs text-gray-400 mt-1 block">
                                            {new Date(note.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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