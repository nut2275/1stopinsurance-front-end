"use client";

import { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode"; 
import api from "@/services/api";

// --- Icon Components ---
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
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

// --- Types ---
type NotifyItem = {
  _id: string;
  message: string;
  type: 'warning' | 'success' | 'info' | 'primary';
  isRead: boolean;
  createdAt: string;
  recipientType: string;
  sender?: { name: string; role: string; };
};

const AdminNotificationPage: NextPage = () => {
  const [notifications, setNotifications] = useState<NotifyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ใช้ useRef เก็บรายการ ID ที่ยังไม่อ่าน เพื่อส่งไป Mark Read ตอนออกจากหน้า
  const unreadIdsRef = useRef<string[]>([]);

  const getSenderPrefix = (sender?: NotifyItem['sender']) => {
    if (!sender) return "";
    switch (sender.role) {
        case 'admin': return "(Admin ท่านอื่น)"; 
        case 'agent': return `(ตัวแทน: ${sender.name})`;
        case 'customer': return `(ลูกค้า: ${sender.name})`;
        case 'guest': return `(ผู้สมัครใหม่: ${sender.name})`;
        default: return `(${sender.name})`;
    }
  };

  const handleRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      // อัปเดต UI ทันที
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      // ยิง API หลังบ้าน
      await api.put('/api/notifications/read-bulk', { notificationIds: [id] });
      // อัปเดตตัวเลขที่ Navbar
      window.dispatchEvent(new Event('refreshNotification'));
    } catch (error) { console.error("Failed to mark read:", error); }
  };

  // อัปเดต Ref ทุกครั้งที่ State เปลี่ยน (เพื่อให้ Cleanup function เห็นค่าล่าสุด)
  useEffect(() => {
      unreadIdsRef.current = notifications
          .filter(n => !n.isRead)
          .map(n => n._id);
  }, [notifications]);

  // Cleanup: ทำงานเมื่อ "ออกจากหน้า" (Unmount)
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

  // Main Fetch Logic
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let currentUserId = "";

        // 1. หา ID ส่วนตัวของ Admin
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                currentUserId = decoded.id || decoded._id || decoded.userId;
            } catch (e) { console.error("Token decode failed:", e); }
        }

        if (!currentUserId) {
            const storedUser = localStorage.getItem("userData");
            if (storedUser) {
                try {
                    const userObj = JSON.parse(storedUser);
                    currentUserId = userObj._id || userObj.id;
                } catch (e) { console.error("Parse admin user failed:", e); }
            }
        }

        // 2. ID กลางสำหรับแจ้งเตือนระบบ (ต้องตรงกับที่ส่งตอน RegisterAgentPage)
        const commonAdminId = "000000000000000000000000";

        // 3. ยิง API พร้อมกัน 2 เส้น (ส่วนตัว + ส่วนกลาง)
        const [resPersonal, resCommon] = await Promise.all([
            currentUserId ? api.get(`/api/notifications?userId=${currentUserId}`).catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
            api.get(`/api/notifications?userId=${commonAdminId}`).catch(() => ({ data: { data: [] } }))
        ]);
        
        // 4. รวมข้อมูล
        let allNotis: NotifyItem[] = [];
        if (resPersonal.data?.data) allNotis = [...allNotis, ...resPersonal.data.data];
        if (resCommon.data?.data) allNotis = [...allNotis, ...resCommon.data.data];

        // 5. เรียงลำดับ (ใหม่สุดขึ้นก่อน) และกรองเฉพาะ Admin
        // กรอง recipientType === 'admin' เพื่อความชัวร์
        const finalNotis = allNotis
            .filter((item) => item.recipientType === 'admin')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // กรอง ID ซ้ำ (เผื่อมี)
        const uniqueNotis = Array.from(new Map(finalNotis.map(item => [item._id, item])).values());

        setNotifications(uniqueNotis);

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
          cursor: pointer;
        }
        .notification:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .notification.unread { background-color: #f0f9ff; border: 1px solid #bae6fd; }
        
        .notification.warning { border-left: 6px solid #dc2626; }
        .notification.success { border-left: 6px solid #16a34a; }
        .notification.info { border-left: 6px solid #2563eb; }
        .notification.primary { border-left: 6px solid #9333ea; }
        
        .unread-indicator {
            position: absolute; top: 10px; right: 10px; width: 10px; height: 10px;
            background-color: #ef4444; border-radius: 50%; box-shadow: 0 0 0 2px white;
        }
      `}</style>

      <div className="flex flex-col min-h-screen font-sans text-gray-800">
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 mt-10 mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">การแจ้งเตือน (ผู้ดูแลระบบ)</h1>

          {loading ? (
            <div className="text-center py-10 text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg text-gray-500 shadow-sm">ไม่มีการแจ้งเตือนสำหรับผู้ดูแลระบบ</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((note) => (
                <div 
                    key={note._id} 
                    className={`notification ${note.type} ${!note.isRead ? 'unread' : ''}`}
                    onClick={() => handleRead(note._id, note.isRead)}
                >
                  {!note.isRead && <div className="unread-indicator" title="กดเพื่ออ่าน"></div>}

                  {note.type === 'warning' && <WarningIcon className="h-8 w-8 text-red-600 flex-shrink-0"/>}
                  {note.type === 'success' && <SuccessIcon className="h-8 w-8 text-green-600 flex-shrink-0"/>}
                  {note.type === 'info' && <InfoIcon className="h-8 w-8 text-blue-600 flex-shrink-0"/>}
                  {note.type === 'primary' && <PlusIcon className="h-8 w-8 text-purple-600 flex-shrink-0" />}

                  <div className="flex-grow">
                    <p className={`text-sm md:text-base whitespace-pre-line ${!note.isRead ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                        {note.sender && ( 
                            <span className="font-bold text-blue-600 mr-2">
                                {getSenderPrefix(note.sender)}
                            </span> 
                        )}
                        {note.message}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                        {new Date(note.createdAt).toLocaleDateString('th-TH', { 
                            year: 'numeric', month: 'short', day: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
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

export default AdminNotificationPage;