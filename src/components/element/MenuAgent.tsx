'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, UserCircle, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type AdminHeaderProps = {
  activePage: string;
};

const navLinks = [
  { href: '/agent/agent_dashboard', label: 'แดชบอร์ด' },
  { href: '/agent/agent_manage_customer', label: 'จัดการลูกค้า' },
  // { href: '/agent/manage-insurance', label: 'จัดการประกัน' },
  // { href: '/agent/manage-promotion', label: 'จัดการโปรโมชัน' },
  // { href: '/agent/manage-customer', label: 'จัดการลูกค้า' },
];

export default function MenuAgent({ activePage }: AdminHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const logout = () => {
    localStorage.removeItem("token");
    setIsMenuOpen(false); 
    window.location.assign("/agent/login");
  };

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
    <div className="top-0 z-50">
      {/* Header */}
      <header className="sticky bg-white/95 backdrop-blur-sm shadow-sm px-4 sm:px-6 h-20 flex items-center justify-between border-b border-slate-200">


        {/* Desktop Right Side */}
        <div className='flex'>
            {/* Mobile Hamburger */}
            <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="sm:hidden text-slate-600 hover:text-blue-600 p-2 rounded-md"
                >
                {isNavOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
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
          <div className="hidden sm:flex gap-2 bg-white p-3 rounded-full m-4 shadow">
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
        {/* <nav className="hidden sm:flex justify-center items-center bg-[#f0f6ff]">

        </nav> */}

        <div className=" flex items-center gap-5">
            {/* Notification */}
            <Link href={'notification'} className={`relative w-8 h-8 transition-colors rounded-full ${
                  activePage === "notification"
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-blue-600'
                }`}>

                <Bell size={24} className='m-1 ' />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={menuRef}>
                <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"
                >
                <UserCircle size={28} className="text-blue-800" />
                <span className="font-semibold text-sm hidden md:block">Agent</span>
                <ChevronDown
                    size={16}
                    className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                />
                </button>

                {isMenuOpen && (
                <div className="cursor-pointer absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-fade-in-down">
                    <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold text-slate-800">Admin User</p>
                    <p className="text-xs text-slate-500">Administrator</p>
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



      {/* Mobile Nav (Dropdown style) */}
      {isNavOpen && (
        <div className="sm:hidden bg-white shadow-md border-t border-slate-200 animate-fade-in-down">
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
  );
}
