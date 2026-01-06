'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, UserCircle, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { jwtDecode } from "jwt-decode"; 
import api from '@/services/api'; 

type AdminHeaderProps = {
  activePage: string;
};

// ตัด "ติดต่อเรา" ออกจาก Array หลักก่อน เพื่อไปจัดการแยกต่างหาก
const navLinks = [
  { href: "/customer/car-insurance/car-Insurance-form", label: "ประกันรถยนต์" },
  { href: "/customer/about", label: "เกี่ยวกับเรา" },
  { href: "/customer/profile", label: "กรมธรรม์ของฉัน" },
];

export default function MenuLogined({ activePage }: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 
  const menuRef = useRef<HTMLDivElement>(null);
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("customer");
    if (stored) {
        setCustomerData(JSON.parse(stored));
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setIsMenuOpen(false); 
    window.location.assign("/customer/login");
  };

  // ✅ เพิ่มฟังก์ชัน Scroll ไปหา Footer
  const scrollToFooter = () => {
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
      setIsNavOpen(false); // ปิดเมนูมือถือถ้าเปิดอยู่
    }
  };

  const fetchUnreadCount = async () => {
    try {
      let userId = "";
      const token = localStorage.getItem("token");
      if (token) {
        try {
            const decoded = jwtDecode<any>(token); 
            userId = decoded.id || decoded._id || decoded.userId || decoded.sub;
        } catch (e) { console.error("Token decode error", e); }
      }

      if (!userId) {
         const storedCustomer = localStorage.getItem("customer");
         if (storedCustomer) {
            try {
                const obj = JSON.parse(storedCustomer);
                userId = obj._id || obj.id || obj.userId;
            } catch (e) { console.error("Parse customer error", e); }
         }
      }

      if (!userId) return;

      const res = await api.get(`/api/notifications?userId=${userId}`);
      if (res.data && typeof res.data.unreadCount === 'number') {
        setUnreadCount(res.data.unreadCount);
      }

    } catch (e) { /* silent fail */ }
  };

  useEffect(() => {
    if (customerData) {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); 
        window.addEventListener('refreshNotification', fetchUnreadCount); 

        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshNotification', fetchUnreadCount);
        };
    }
  }, [customerData]);

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
      <div className="top-0 z-50 z-[9999]" >
          {/* Header */}
          <header className="sticky bg-white/95 backdrop-blur-sm shadow-sm px-4 sm:px-6 h-20 flex items-center justify-between border-b border-slate-200">

            {/* Left Side: Logo & Hamburger */}
            <div className='flex items-center gap-3'>
                <button
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    className="xl:hidden text-slate-600 hover:text-blue-600 p-2 rounded-md"
                    >
                    {isNavOpen ? <X size={26} /> : <Menu size={26} />}
                </button>

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
            <div className="hidden xl:flex gap-2 bg-white p-3 rounded-full m-4 shadow border border-slate-100">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    activePage === link.href
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* ✅ ปุ่มติดต่อเรา (Desktop) */}
              <button
                onClick={scrollToFooter}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 text-slate-600 hover:bg-slate-100"
              >
                ติดต่อเรา
              </button>
            </div>

            {/* Right Side: Notification & User Profile (Only if Logged In) */}
            {customerData ? (
                <div className="flex items-center gap-5">
                    {/* Notification Bell */}
                    <Link href={'/customer/notification'} className={`relative w-9 h-9 flex items-center justify-center transition-colors rounded-full hover:bg-slate-100 ${
                          activePage === "notification" ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
                        }`}>
                        <Bell size={24} />
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
                        <ChevronDown size={16} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMenuOpen && (
                        <div className="cursor-pointer absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-fade-in-down z-50 border border-slate-100">
                            <div className="border-b">
                              <Link href={"/customer/profile"} className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-blue-50" >
                                <UserCircle size={28} className="text-blue-800 " />
                                <span className="font-semibold text-sm ">{customerData.first_name}</span>
                              </Link>
                            </div>
                            <div onClick={logout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <LogOut size={16} />
                                <span>ออกจากระบบ</span>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            ) : (
                // Case: Not Logged In (แสดงปุ่ม Login แทน)
                <Link href="/customer/login" className="border border-blue-900 text-blue-900 px-5 py-2 rounded-full font-semibold hover:bg-blue-900 hover:text-white transition text-sm">
                    เข้าสู่ระบบ
                </Link>
            )}

          </header>
          
          {/* Mobile Nav */}
          {isNavOpen && (
            <div className="xl:hidden bg-white shadow-md border-t border-slate-200 animate-fade-in-down fixed w-full z-40">
              <div className="flex flex-col p-3 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      activePage === link.href ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => setIsNavOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* ✅ ปุ่มติดต่อเรา (Mobile) */}
                <button
                    onClick={scrollToFooter}
                    className="text-left px-4 py-3 rounded-md text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100 w-full"
                >
                    ติดต่อเรา
                </button>
              </div>
            </div>
          )}

          {/* Animation & Smooth Scroll */}
          <style jsx global>{`
            @keyframes fade-in-down {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down {
              animation: fade-in-down 0.2s ease-out;
            }
            html { scroll-behavior: smooth; }
          `}</style>
        </div>
    </>
  );
}