"use client";

import React, { useState } from 'react';

import Image from "next/image";
import Link from "next/link";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'; 
import {jwtDecode} from 'jwt-decode'

const navLinks = [
  { href: "/act", label: "ต่อ พ.ร.บ." },
  { href: "/car-insurance", label: "ประกันรถยนต์" },
  { href: "/health-insurance", label: "ประกันสุขภาพ" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/contact", label: "ติดต่อเรา" },
  { href: "/promotions", label: "โปรโมชั่น" },
];

// const getCustomerData = () => {
//   const stored = ;
//   console.log(stored);
  
//   if (stored) JSON.parse(stored);
//   return
// }

function MenuLogined() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [customerData, setCustomerData] = useState(JSON.parse(localStorage.getItem("customer") || "null"))
  const logout = () => {
    localStorage.removeItem("token");
    setIsMenuOpen(false); 
    window.location.assign("/customer/login");
  };

  const customerData = JSON.parse(localStorage.getItem("customer") || "null");
  

  
  return (
    <header className="bg-white border-b border-gray-200 relative z-10">
      
      {/* ⭐️ 1. ปรับโครงสร้างหลัก ⭐️
        ใช้ justify-between กับ 2 กล่องหลัก: 
        (กล่องซ้าย: โลโก้ + เมนู) และ (กล่องขวา: ไอคอน)
      */}
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* --------------------------- */}
        {/* 2. กล่องซ้าย (โลโก้ + เมนู) */}
        {/* --------------------------- */}
        <div className="flex items-center space-x-8"> {/* 👈 เพิ่ม space-x-8 ระหว่างโลโก้กับเมนู */}
          
          {/* Logo (เหมือนเดิม) */}
          <Link href="/customer/mainpage" className="flex items-center space-x-2 flex-shrink-0">
            <Image src="/fotos/Logo.png" alt="logo" width={40} height={40} />
            <span className="text-xl font-bold text-blue-900">1StopInsurance</span>
          </Link>

          {/* เมนู Desktop (เหมือนเดิม แต่ตอนนี้จะอยู่ชิดโลโก้) */}
          <nav className="hidden md:flex space-x-7"> {/* 👈 เพิ่ม space-x-7 ให้ห่างขึ้นเล็กน้อย */}
            {navLinks.map((link) => (
              <Link 
                key={link.label} 
                href={link.href} 
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* --------------------------- */}
        {/* 3. กล่องขวา (ไอคอน) */}
        {/* --------------------------- */}
        <div className="flex items-center space-x-3 md:space-x-4">
          
          {/* ปุ่มกระดิ่ง */}
          <Link href={'/customer/notification'} className="relative p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full">3</span>
            <NotificationsNoneIcon className="h-6 w-6" />
          </Link>
          
          {/* Profile Link */}
          <Link href="/customer/profile" className="flex items-center space-x-2 group">
            <Image 
              src="/fotos/profile.png" 
              alt="profile" 
              width={40} 
              height={40} 
              className="rounded-full border border-gray-200" 
            />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline group-hover:text-blue-600 transition-colors">
              {customerData?.first_name}
            </span>
          </Link>
          
          {/* ปุ่ม Logout (Desktop) */}
          <button 
            onClick={logout} 
            className="hidden md:block bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer text-sm font-medium transition-colors duration-200"
          >
            ออกจากระบบ
          </button>

          {/* ปุ่ม Hamburger (Mobile) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* เมนู Dropdown สำหรับมือถือ (ส่วนนี้เหมือนเดิม 100% ครับ) */}
      <div 
        className={`
          md:hidden absolute top-full left-0 w-full bg-white shadow-lg 
          transition-all duration-300 ease-in-out
          border-t border-gray-100 
          ${isMenuOpen ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible'}
          overflow-hidden
        `}
      >
        <nav className="flex flex-col p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 mt-2"
          >
            ออกจากระบบ
          </button>
        </nav>
      </div>
    </header>
  );
}

export default MenuLogined;