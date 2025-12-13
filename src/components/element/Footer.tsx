import React from 'react'
import Link from "next/link";

function Footer() {
  return (
    // 1. เพิ่ม role="contentinfo" เพื่อ accessibility
    // 2. ปรับ padding/gap ให้อ่านง่ายขึ้นบนมือถือ
    <footer 
      id='footer'
      role="contentinfo" 
      className="bg-blue-900 text-white text-sm relative w-full cursor-pointer"
    >
      <div 
        className="
          max-w-6xl mx-auto 
          px-4 py-8 md:px-6 md:py-6 
          grid grid-cols-1 md:grid-cols-4 
          gap-y-8 md:gap-y-6 gap-x-6 
          text-center md:text-left
        "
      >
        {/* คอลัมน์ 1: Brand */}
        <div>
          <p className="font-bold">1StopInsurance</p>
          <p>วันสต๊อปอินชัวรันส์</p>
        </div>

        {/* คอลัมน์ 2: Address */}
        <div>
          <p>123 ถนน... แขวง...</p>
          <p>เขต... กรุงเทพฯ 10220</p>
        </div>

        {/* คอลัมน์ 3: Contact */}
        <div>
          <p>โทร xxx-xxx-xxxx</p>
          <p>อีเมล xxx@bumail.net</p>
        </div>

        {/* คอลัมน์ 4: Link */}
        <div>
          {/* ปรับปรุงเล็กน้อย: 
            ย้าย hover:underline มาไว้ที่ Link (แท็ก a) โดยตรง
            และเปลี่ยน <p> เป็น <span> เพื่อความถูกต้องทาง semantic
            (เพราะ <p> ไม่ควรอยู่ใน <p> แต่ Link จะ render เป็น <a>)
          */}
          <Link 
            href="/agent/login" 
            className="hover:underline"
          >
            สนใจเป็นตัวแทนจำหน่ายประกัน คลิก
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer