"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { NextPage } from 'next';
import api from "@/services/api"; // ตรวจสอบ path ให้ถูกต้อง

// --- SVG Icon Components ---
const WarningIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const SuccessIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Type สำหรับข้อมูล Notification
type NotifyItem = {
    _id: string;
    message: string;
    type: 'warning' | 'success' | 'info';
    isRead: boolean;
    createdAt: string;
};

const AgentNotificationPage: NextPage = () => {
    const [notifications, setNotifications] = useState<NotifyItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // ... (Logic ดึง LocalStorage ส่วนเดิม) ...
                const storedAgent = localStorage.getItem('agentData'); 
                if (!storedAgent) return; 
                // ... (Parsing logic ส่วนเดิม) ...
                const userObj = JSON.parse(storedAgent);
                const currentUserId = userObj._id || userObj.id || userObj.userId;

                // 1. เรียกดึงข้อมูลมาก่อน
                const res = await api.get(`/api/notifications?userId=${currentUserId}`);
                
                let fetchedData: NotifyItem[] = [];
                if (res.data && res.data.data) {
                    fetchedData = res.data.data;
                    setNotifications(fetchedData);
                }

                // ========================================================
                // ✅ เพิ่มส่วนนี้: หาตัวที่ยังไม่อ่าน แล้วส่งกลับไปอัปเดต
                // ========================================================
                
                // กรองเอาเฉพาะ ID ของตัวที่ isRead === false
                const unreadIds = fetchedData
                    .filter((item) => !item.isRead)
                    .map((item) => item._id);

                if (unreadIds.length > 0) {
                    // ส่งไปอัปเดตที่ Backend (ทำเงียบๆ ไม่ต้องรอ loading)
                    await api.put('/api/notifications/read-bulk', { 
                        notificationIds: unreadIds 
                    });
                    
                    // (Optional) ถ้าอยากให้ UI เปลี่ยนเป็นอ่านแล้วทันทีโดยไม่ต้อง Refresh หน้า
                    // ให้ใช้ setNotifications เพื่อเปลี่ยน state ทันที
                    /*
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    */
                   
                   // แต่ปกติ User เข้ามาดูแล้ว พอ Refresh หน้า หรือกดเข้ามาใหม่ ค่อยเห็นว่าจุดแดงหายไปก็ได้
                }

            } catch (error) {
                console.error("Error loading notifications:", error);
            } finally {
                setLoading(false);
            }
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
                }
                .notification:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .notification.warning { border-left: 6px solid #dc2626; }
                .notification.success { border-left: 6px solid #16a34a; }
                .notification.info { border-left: 6px solid #2563eb; }
                
                .unread-indicator {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 8px;
                    height: 8px;
                    background-color: #ef4444;
                    border-radius: 50%;
                }
            `}</style>

            <div className="flex flex-col min-h-screen font-sans text-gray-800">
                <main className="flex-grow max-w-4xl mx-auto w-full px-4 mt-10 mb-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">การแจ้งเตือน</h1>

                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                            <p className="text-gray-500">ไม่มีการแจ้งเตือนใหม่</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((note) => (
                                <div key={note._id} className={`notification ${note.type}`}>
                                    {/* จุดแดงแสดงสถานะยังไม่อ่าน */}
                                    {!note.isRead && <div className="unread-indicator" title="ยังไม่ได้อ่าน"></div>}

                                    {/* Icon */}
                                    {note.type === 'warning' && <WarningIcon className="h-8 w-8 text-red-600 flex-shrink-0" />}
                                    {note.type === 'success' && <SuccessIcon className="h-8 w-8 text-green-600 flex-shrink-0" />}
                                    {note.type === 'info' && <InfoIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />}

                                    {/* Content */}
                                    <div className="flex-grow">
                                        <p className="text-sm md:text-base">{note.message}</p>
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
        </>
    );
};

export default AgentNotificationPage;