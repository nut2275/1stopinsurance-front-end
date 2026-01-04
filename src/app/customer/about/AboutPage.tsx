"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Zap, 
  HeartHandshake, 
  Users, 
  Award, 
  Clock, 
  ArrowRight 
} from "lucide-react";
import api from "@/services/api"; // ✅ Import API

// สมมติว่ามี Navbar ของฝั่ง Public
// import Navbar from "@/components/element/Navbar"; 
import Footer from "@/components/element/Footer"; 

export default function AboutPage() {
  // ✅ State สำหรับเก็บจำนวนกรมธรรม์ (เริ่มต้นที่ 0 หรือค่า Placeholder)
  const [totalPolicies, setTotalPolicies] = useState<string>("50k");

  // ✅ Fetch ข้อมูลจาก API เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // สมมติ Endpoint เป็น /purchase/count หรือ /stats ที่ Backend
        // ต้องตรวจสอบว่า Backend มี Endpoint นี้หรือไม่
        const res = await api.get("/purchase/count"); 
        
        if (res.data && typeof res.data.count === 'number') {
            // จัด Format ตัวเลขให้สวยงาม (เช่น 1234 -> 1,234)
            setTotalPolicies(res.data.count.toLocaleString());
        }
      } catch (error) {
        console.error("Failed to load stats:", error);
        // กรณี Error จะยังคงใช้ค่า Default "50k" หรือจะเปลี่ยนเป็น "-" ก็ได้
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- 1. Hero Section --- */}
      <section className="relative bg-gradient-to-r from-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern-bg.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            เกี่ยวกับ <span className="text-blue-300">1Stop</span>Insurance
          </h1>
          <p className="text-lg md:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            เราคือแพลตฟอร์มประกันภัยรถยนต์ยุคใหม่ ที่รวบรวมทุกความคุ้มครองไว้ในที่เดียว 
            เพื่อให้คุณ &quot;ครบ จบ เรื่องประกัน&quot; ได้ง่ายๆ เพียงปลายนิ้ว
          </p>
        </div>
        {/* Curve Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* --- 2. Story & Mission --- */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold tracking-wide uppercase">
              Our Story
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              ทำไมเราถึงสร้าง <br/> <span className="text-indigo-600">1StopInsurance?</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              เราเริ่มต้นด้วยความเชื่อที่ว่า &quot;การซื้อประกันรถยนต์ไม่ควรเป็นเรื่องยุ่งยาก&quot;
              ในอดีต การเปรียบเทียบราคา การติดต่อตัวแทน หรือการจัดการเอกสารเป็นเรื่องที่ซับซ้อนและใช้เวลา
            </p>
            <p className="text-slate-600 text-lg leading-relaxed">
              1StopInsurance จึงเกิดขึ้นเพื่อเป็น **One-Stop Service** ที่นำเทคโนโลยีมาช่วยให้คุณค้นหา 
              เปรียบเทียบ และเลือกซื้อประกันที่เหมาะสมที่สุดกับไลฟ์สไตล์ของคุณ ได้อย่างรวดเร็ว โปร่งใส และคุ้มค่าที่สุด
            </p>
            
            <div className="pt-4 flex items-center gap-4">
                <div className="flex -space-x-4">
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-200"></div>
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-300"></div>
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-slate-400"></div>
                </div>
                <p className="text-sm text-slate-500">
                    <span className="font-bold text-slate-800">50,000+</span> ลูกค้าที่ไว้วางใจเรา
                </p>
            </div>
          </div>
          
          <div className="relative">
            {/* Placeholder Image: ใส่รูปทีมงาน หรือรูปออฟฟิศ หรือ Vector สวยๆ */}
            <div className="aspect-square md:aspect-[4/3] bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl relative overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 flex items-center justify-center text-indigo-200">
                    <ShieldCheck className="w-32 h-32 opacity-20" />
                </div>
                {/* <Image src="/about-image.jpg" alt="Our Team" fill className="object-cover" /> */}
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
                <p className="font-bold text-indigo-600 text-xl">&quot;ประกันภัยที่เข้าใจคุณ&quot;</p>
                <p className="text-slate-500 text-sm mt-1">พันธกิจหลักของเราในการดูแลลูกค้าทุกคน</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. Stats Section --- */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-8 text-center divide-x divide-slate-700/50">
                <div className="p-4">
                    <p className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">6</p>
                    <p className="text-slate-400">บริษัทประกันภัยพันธมิตร</p>
                </div>
                <div className="p-4">
                    {/* ✅ ใช้ตัวแปร totalPolicies ที่ดึงมาจาก API */}
                    <p className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">{totalPolicies}</p>
                    <p className="text-slate-400">กรมธรรม์ที่ดูแล</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- 4. Why Choose Us --- */}
      <section className="py-20 max-w-7xl mx-auto px-4 bg-white">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">ทำไมต้องเลือก <span className="text-indigo-600">1StopInsurance</span></h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">เรามุ่งมั่นที่จะมอบประสบการณ์การประกันภัยที่ดีที่สุดให้กับคุณ ด้วยจุดเด่นที่แตกต่าง</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="p-8 bg-slate-50 rounded-2xl hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-slate-100">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">เชื่อถือได้ ปลอดภัย 100%</h3>
                <p className="text-slate-600">
                    ตัวแทนของเราผ่านการตรวจสอบประวัติและมีใบอนุญาตถูกต้องทุกท่าน เพื่อมาตรฐานการบริการที่คุณไว้วางใจได้
                </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-slate-50 rounded-2xl hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-slate-100">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">เปรียบเทียบง่าย รวดเร็ว</h3>
                <p className="text-slate-600">
                    มีระบบช่วยคัดกรองแผนประกันที่คุ้มค่าที่สุดสำหรับรถของคุณ เปรียบเทียบราคาได้ทันทีภายใน 30 วินาที
                </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-slate-50 rounded-2xl hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 border border-slate-100">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <HeartHandshake className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">ดูแลดุจคนในครอบครัว</h3>
                <p className="text-slate-600">
                    ตัวแทนผู้เชี่ยวชาญพร้อมให้คำปรึกษาและช่วยเหลือคุณตลอดอายุการคุ้มครอง ไม่ทิ้งกันเมื่อเกิดเหตุ
                </p>
            </div>
        </div>
      </section>

      {/* --- 5. CTA Section --- */}
      <section className="bg-indigo-600 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern-dots.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">พร้อมรับความคุ้มครองที่ใช่ ในราคาที่ชอบหรือยัง?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
                เริ่มต้นเช็คเบี้ยประกันฟรีได้เลยวันนี้
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/customer/car-insurance/car-Insurance-form" className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-full shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all flex items-center justify-center gap-2">
                    เช็คเบี้ยประกันเลย <ArrowRight className="w-5 h-5"/>
                </Link>
                <Link href="/contact" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center">
                    ติดต่อสอบถาม
                </Link>
            </div>
        </div>
      </section>

      {/* ถ้ามี Footer ให้ใส่ตรงนี้ */}
      {/* <Footer /> */}
    </div>
  );
}