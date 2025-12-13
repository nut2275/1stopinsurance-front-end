import React from 'react'
import Link from "next/link";
import Image from "next/image";


function Menu() {
  return (

  <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm cursor-pointer" style={{zIndex:9999}}>
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/fotos/Logo.png" // ✅ ควรขึ้นต้นด้วย / เพื่ออ้างอิงจากโฟลเดอร์ public
        alt="logo"
        width={160} // บอก Next.js ถึงขนาดต้นฉบับเพื่อคงอัตราส่วน
        height={40} // บอก Next.js ถึงขนาดต้นฉบับเพื่อคงอัตราส่วน
        className="h-10 w-auto" // ✅ กำหนดความสูง และให้ความกว้างปรับอัตโนมัติ
      />
      <span className="text-xl font-bold text-blue-900">1StopInsurance</span>
    </Link>

    <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
      <Link href="customer/car-insurance/car-Insurance-form" className="hover:text-blue-700">ประกันรถยนต์</Link>
      <Link href="/" className="hover:text-blue-700">เกี่ยวกับเรา</Link>
      <Link href="#footer" className="hover:text-blue-700">ติดต่อเรา</Link>
    </nav>

    <Link href="/customer/login"
       className="border border-blue-900 text-blue-900 px-5 py-2 rounded-full font-semibold hover:bg-blue-900 hover:text-white transition">
      เข้าสู่ระบบ
    </Link>
  </header>
  )
}

export default Menu
