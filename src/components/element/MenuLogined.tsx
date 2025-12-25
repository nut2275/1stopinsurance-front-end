'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, UserCircle, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { jwtDecode } from "jwt-decode"; // ✅ 1. Import jwt-decode
import api from '@/services/api';       // ✅ 2. Import API

type AdminHeaderProps = {
  activePage: string;
};

// Interface สำหรับ Token (เผื่อกรณีใช้ Token)
interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

const navLinks = [
  { href: "/customer/car-insurance/car-Insurance-form", label: "ประกันรถยนต์" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "#footer", label: "ติดต่อเรา" },
  { href: "/customer/profile", label: "กรมธรรม์ของฉัน" }, // แก้คำผิด กรมธรรม
];

export default function MenuLogined({ activePage }: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // ✅ 3. เพิ่ม State นับแจ้งเตือน
  const menuRef = useRef<HTMLDivElement>(null);

  // ดึงข้อมูล Customer (ระวังเรื่อง Hydration mismatch ใน Next.js แนะนำให้ย้ายไป useEffect ถ้าทำได้)
  // แต่ถ้าโค้ดเดิมใช้ได้อยู่แล้ว ก็ใช้ต่อได้ครับ
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    // ย้ายการดึง localStorage มาไว้ใน useEffect เพื่อป้องกัน Error ตอน Server Render
    const stored = localStorage.getItem("customer");
    if (stored) {
        setCustomerData(JSON.parse(stored));
    }
  }, []);

  const logout = () => {
    // localStorage.removeItem("token");
    localStorage.clear();
    setIsMenuOpen(false); 
    window.location.assign("/customer/login");
  };

  // ✅ 4. ฟังก์ชันดึงจำนวนแจ้งเตือน (Logic เดียวกับ Agent)
const fetchUnreadCount = async () => {
    try {
      let userId = "";

      // --- วิธีที่ 1: หาจาก Token ---
      const token = localStorage.getItem("token");
      if (token) {
        try {
            const decoded = jwtDecode<any>(token); // ใช้ any เพื่อให้เข้าถึงได้ทุก field
            // console.log("Decoded Token:", decoded); // 👈 เปิดบรรทัดนี้ดูว่าข้างในมี id หรือ _id หรือ userId
            
            // พยายามหา ID จากหลายๆ ชื่อที่เป็นไปได้
            userId = decoded.id || decoded._id || decoded.userId || decoded.sub;
        } catch (e) {
            console.error("Token decode error", e);
        }
      }

      // --- วิธีที่ 2: หาจาก customerData ใน LocalStorage (Backup) ---
      if (!userId) {
         const storedCustomer = localStorage.getItem("customer");
         if (storedCustomer) {
            try {
                const obj = JSON.parse(storedCustomer);
                // console.log("Stored Customer:", obj); // 👈 เปิดดูว่าเก็บอะไรไว้
                
                // พยายามหา ID จาก key "customer"
                userId = obj._id || obj.id || obj.userId;
            } catch (e) {
                console.error("Parse customer data error", e);
            }
         }
      }

      // ถ้ายังหาไม่เจออีก ให้จบการทำงาน
      if (!userId) {
          // console.warn("ยังไม่พบ User ID (อาจจะยังไม่ได้ Login หรือ Token หมดอายุ)");
          return;
      }

      // เรียก API
      const res = await api.get(`/api/notifications?userId=${userId}`);
      
      if (res.data && typeof res.data.unreadCount === 'number') {
        setUnreadCount(res.data.unreadCount);
      }

    } catch (e) {
      // console.error("Failed to fetch notification count:", e);
    }
  };

  // ✅ 5. Setup Interval และ Event Listener
  useEffect(() => {
    if (customerData) {
        fetchUnreadCount(); // เรียกครั้งแรก

        const interval = setInterval(fetchUnreadCount, 60000); // เช็คทุก 1 นาที
        window.addEventListener('refreshNotification', fetchUnreadCount); // รอคำสั่ง Refresh

        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshNotification', fetchUnreadCount);
        };
    }
  }, [customerData]); // ทำงานเมื่อ customerData โหลดเสร็จแล้ว

  // Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);
  

  return (
    <>
        {customerData && (
        <div className="top-0 z-50 z-[9999]" >
          {/* Header */}
          <header className="sticky bg-white/95 backdrop-blur-sm shadow-sm px-4 sm:px-6 h-20 flex items-center justify-between border-b border-slate-200">

            {/* Desktop Right Side */}
            <div className='flex'>
                {/* Mobile Hamburger */}
                <button
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    className="md:hidden text-slate-600 hover:text-blue-600 p-2 rounded-md"
                    >
                    {isNavOpen ? <X size={26} /> : <Menu size={26} />}
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3">
                    <Link href="/customer/mainpage" className="flex items-center gap-2">
                        <Image
                            src="/fotos/Logo.png"
                            alt="logo"
                            width="48"
                            height="48"
                            className="h-10 w-auto"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/48x48/1d4ed8/FFFFFF?text=1S";
                            }}
                        />
                        <span className="text-lg sm:text-xl font-bold text-blue-800 sm:block">
                        1StopInsurance
                        </span>
                    </Link>
                </div>
            </div>


            {/* Desktop Nav */}
            <div className="hidden xl:flex gap-2 bg-white p-3 rounded-full m-4 shadow">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    activePage === link.href
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className=" flex items-center gap-5">
                {/* ✅ 6. Notification Bell (Updated UI) */}
                <Link href={'/customer/notification'} className={`relative w-9 h-9 flex items-center justify-center transition-colors rounded-full hover:bg-slate-100 ${
                      activePage === "notification"
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-500'
                    }`}>

                    <Bell size={24} />
                    
                    {/* แสดงจุดแดงเมื่อมี unreadCount > 0 */}
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white justify-center items-center font-bold border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </span>
                    )}
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"
                    >
                    <UserCircle size={28} className="text-blue-800" />
                    <span className="font-semibold text-sm hidden md:block">{customerData.first_name}</span>
                    <ChevronDown
                        size={16}
                        className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                    />
                    </button>

                    {isMenuOpen && (
                    <div className="cursor-pointer absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-fade-in-down z-50">
                        <div className="border-b">
                          <Link href={"/customer/profile"} className="flex items-center gap-3 w-full px-4 py-2 text-sm  hover:bg-blue-50" >
                            <UserCircle size={28} className="text-blue-800 " />
                            <span className="font-semibold text-sm ">{customerData.first_name}</span>
                          </Link>
                        </div>
                        <div
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <LogOut size={16} />
                            <span>ออกจากระบบ</span>
                        </div>
                    </div>
                    )}
                </div>
            </div>

          </header>
          
          {/* Tablet */}
          <header className='flex justify-center'>
            <div className="hidden md:flex gap-2 bg-white p-3 rounded-full m-4 shadow  xl:hidden">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    activePage === link.href
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </header>

          {/* Mobile Nav (Dropdown style) */}
          {isNavOpen && (
            <div className="md:hidden bg-white shadow-md border-t border-slate-200 animate-fade-in-down">
              <div className="flex flex-col p-3 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activePage === link.href
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Animation */}
          <style jsx global>{`
            @keyframes fade-in-down {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in-down {
              animation: fade-in-down 0.2s ease-out;
            }
          `}</style>
        </div>
        )}

        {!customerData && (
        <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm cursor-pointer" style={{zIndex:9999}}>
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/fotos/Logo.png"
              alt="logo"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-blue-900">1StopInsurance</span>
          </Link>

          <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <Link href="/customer/car-insurance/insurance" className="hover:text-blue-700">ประกันรถยนต์</Link>
            <Link href="/" className="hover:text-blue-700">เกี่ยวกับเรา</Link>
            <Link href="#footer" className="hover:text-blue-700">ติดต่อเรา</Link>
          </nav>

          <Link href="/customer/login"
            className="border border-blue-900 text-blue-900 px-5 py-2 rounded-full font-semibold hover:bg-blue-900 hover:text-white transition">
            เข้าสู่ระบบ
          </Link>
        </header>
        )}
    </>

  );
}