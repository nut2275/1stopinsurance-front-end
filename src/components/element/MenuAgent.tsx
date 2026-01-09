'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, UserCircle, LogOut, Menu, X, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import api from '@/services/api';

// --- Type Definitions ---
interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

interface NotificationResponse {
  success: boolean;
  unreadCount: number;
}

type AdminHeaderProps = {
  activePage: string;
};

const navLinks = [
  { href: '/agent/agent_dashboard', label: 'แดชบอร์ด' },
  { href: '/agent/agentCustomerPolicy', label: 'กรมธรรม์ลูกค้า' }, // ย่อชื่อให้สั้นลงนิดนึงเพื่อประหยัดที่
  { href: '/agent/agent_manage_customer', label: 'จัดการลูกค้า' },
];

export default function MenuAgent({ activePage }: AdminHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  const [displayName, setDisplayName] = useState("Agent");
  const [unreadCount, setUnreadCount] = useState(0); 

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("agentData");
    window.location.assign("/agent/login");
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode<DecodedToken>(token);
      if (decoded && decoded.id) {
        const res = await api.get<NotificationResponse>(`/api/notifications?userId=${decoded.id}`);
        if (res.data && typeof res.data.unreadCount === 'number') {
          setUnreadCount(res.data.unreadCount);
        }
      }
    } catch (e) {
      console.error("Failed to fetch notification count:", e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    window.addEventListener('refreshNotification', fetchUnreadCount);
    return () => {
        clearInterval(interval);
        window.removeEventListener('refreshNotification', fetchUnreadCount);
    };
  }, [router, pathname]);

  // Click Outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // ปิด Mobile Menu เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Spacer เพื่อดันเนื้อหาลงมา เพราะ Navbar เป็น Fixed */}
      <div className="h-16 md:h-20 w-full bg-transparent" />

      {/* --- Navbar หลัก (Fixed Top) --- */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm h-16 md:h-20 transition-all duration-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* 1. Left: Logo & Mobile Hamburger */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Mobile Hamburger */}
            <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="md:hidden text-slate-500 hover:text-blue-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
                {isMobileNavOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
                <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
                    <Image
                        src="/fotos/Logo.png"
                        alt="1StopInsurance"
                        fill
                        className="object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/48x48/1d4ed8/FFFFFF?text=1S";
                        }}
                    />
                </div>
                <span className="text-lg md:text-xl font-bold text-blue-800 tracking-tight hidden sm:block">
                    1StopInsurance
                </span>
            </Link>
          </div>

          {/* 2. Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-full border border-slate-200/50">
            {navLinks.map((link) => {
              const isActive = activePage === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200
                    ${isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Actions (Notification & Profile) */}
          <div className="flex items-center gap-3 md:gap-5">
            
            {/* Notification Bell */}
            <Link 
              href={'/agent/notification'} 
              className={`
                relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200
                ${activePage === "notification" ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
              `}
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                  </span>
                )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`
                    flex items-center gap-2 pl-2 pr-2 md:pr-3 py-1.5 rounded-full border border-transparent transition-all duration-200
                    ${isDropdownOpen ? 'bg-blue-50 border-blue-100' : 'hover:bg-slate-50 hover:border-slate-200'}
                `}
              >
                <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 ring-2 ring-white shadow-sm">
                    <UserCircle size={24} />
                </div>
                
                {/* ชื่อแสดงเฉพาะจอใหญ่ (Tablet ขึ้นไป) */}
                <span className="font-semibold text-sm text-slate-700 hidden lg:block max-w-[100px] truncate">
                    {displayName}
                </span>
                
                <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu (Standard UI) */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-[100] overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                        <p className="text-xs text-slate-500">Agent Account</p>
                    </div>
                    
                    <div className="p-1">
                        <Link 
                            href={"/agent/profile"} 
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            <User size={18} className="text-slate-400" />
                            ข้อมูลส่วนตัว (Profile)
                        </Link>
                    </div>

                    <div className="border-t border-slate-100 p-1">
                        <button
                            onClick={logout}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} />
                            ออกจากระบบ
                        </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Mobile Navigation Menu (Slide Down) --- */}
        {isMobileNavOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg z-50 animate-in slide-in-from-top-5">
                <div className="flex flex-col p-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileNavOpen(false)}
                            className={`
                                flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                                ${activePage === link.href 
                                    ? 'bg-blue-50 text-blue-700' 
                                    : 'text-slate-600 hover:bg-slate-50'}
                            `}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        )}
      </header>
    </>
  );
}