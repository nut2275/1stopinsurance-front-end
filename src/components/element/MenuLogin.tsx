'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

type MenuLoginProps = {
  activePage?: string; 
};

const navLinks = [
  { href: "/customer/car-insurance/car-Insurance-form", label: "ประกันรถยนต์" },
  { href: "/customer/about", label: "เกี่ยวกับเรา" },
  // { href: "#footer", label: "ติดต่อเรา" } // ❌ เอาออก เดี๋ยวเราจัดการเองใน loop
];

export default function MenuLogin({ activePage }: MenuLoginProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  // ✅ ฟังก์ชันเลื่อนหา Footer
  const scrollToFooter = () => {
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth' });
      setIsNavOpen(false); // ปิดเมนูมือถือด้วย (ถ้าเปิดอยู่)
    }
  };

  return (
    <div className="top-0 z-50 z-[9999]">
      
      <header className="sticky bg-white/95 backdrop-blur-sm shadow-sm px-4 sm:px-6 h-20 flex items-center justify-between border-b border-slate-200">
        
        {/* Left Side */}
        <div className="flex items-center gap-3">
            <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="md:hidden text-slate-600 hover:text-blue-600 p-2 rounded-md"
            >
                {isNavOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            <Link href="/" className="flex items-center gap-2">
                <Image src="/fotos/Logo.png" alt="logo" width="48" height="48" className="h-10 w-auto" 
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/48x48/1d4ed8/FFFFFF?text=1S"; }}
                />
                <span className="text-lg sm:text-xl font-bold text-blue-800 sm:block">1StopInsurance</span>
            </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-2 bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
            {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    activePage === link.href ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {link.label}
                </Link>
            ))}
            
            {/* ✅ ปุ่มติดต่อเรา (แยกออกมาเพื่อใส่ onClick) */}
            <button
                onClick={scrollToFooter}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 text-slate-600 hover:bg-slate-100`}
            >
                ติดต่อเรา
            </button>
        </div>

        {/* Right Side */}
        <div>
            <Link 
                href="/customer/login" 
                className="border border-blue-900 text-blue-900 px-5 py-2 rounded-full font-semibold hover:bg-blue-900 hover:text-white transition text-sm shadow-sm"
            >
                เข้าสู่ระบบ
            </Link>
        </div>

      </header>

      {/* Mobile Nav */}
      {isNavOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-slate-200 animate-fade-in-down absolute w-full z-50">
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

      <style jsx global>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.2s ease-out;
        }
        /* เพิ่ม smooth scroll ให้ทั้งหน้าเว็บ */
        html {
            scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}