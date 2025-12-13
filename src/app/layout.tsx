import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


import Footer from '@/components/element/Footer';

export const metadata: Metadata = {
  title: 'จัดการลูกค้า | Agent Dashboard | 1StopInsurance',
  description: 'หน้าจัดการข้อมูลลูกค้าสำหรับตัวแทนประกัน',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      {/* เพิ่ม flex flex-col และ min-h-screen ที่ body ถูกต้องแล้ว */}
      <body className="font-sans text-gray-800 flex flex-col min-h-screen bg-[#f0f6ff]">
        
        {/* ✅ แก้ไข: เพิ่ม main หรือ div ครอบ children แล้วใส่ flex-grow */}
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}