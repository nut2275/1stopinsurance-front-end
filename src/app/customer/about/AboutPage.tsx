"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Zap, 
  HeartHandshake, 
  ArrowRight 
} from "lucide-react";
import api from "@/services/api"; 

// Interface สำหรับ State
interface StatsData {
    policyCount: string;
    customerCount: string;
    customerImages: string[];
}

export default function AboutPage() {
  const [stats, setStats] = useState<StatsData>({
      policyCount: "50k",
      customerCount: "50,000+",
      customerImages: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ดึงจำนวนกรมธรรม์ (จากโค้ดเดิม)
        const policyRes = await api.get("/purchase/count");
        const policyCount = policyRes.data?.count ? policyRes.data.count.toLocaleString() : "50k";

        // 2. ดึงจำนวนลูกค้าและรูปโปรไฟล์ (API ใหม่)
        const customerRes = await api.get("/customers/stats");
        const customerCount = customerRes.data?.count ? customerRes.data.count.toLocaleString() : "0";
        const customerImages = customerRes.data?.samples || [];

        setStats({
            policyCount,
            customerCount,
            customerImages
        });

      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    };
    fetchData();
  }, []);

  // อาร์เรย์เก็บ path ของรูปภาพพันธมิตรทั้งหมด
  const partnerImages = [
    "/fotos/Insur1.png",
    "/fotos/Insur2.png",
    "/fotos/Insur3.png",
    "/fotos/Insur4.png",
    "/fotos/Insur5.png",
    "/fotos/Insur6.png",
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-gray-50">

      <main className="flex-grow">
        
        {/* --- 1. Hero Section --- */}
        <section className="bg-gradient-to-br from-blue-100 to-blue-200 py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-10 md:p-16 text-center shadow-lg border border-white/30">
                <h1 className="text-3xl md:text-5xl font-bold text-blue-900 mb-6">
                  เกี่ยวกับ <span className="text-blue-700">1Stop</span>Insurance
                </h1>
                <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                  เราคือแพลตฟอร์มประกันภัยรถยนต์ยุคใหม่ ที่รวบรวมทุกความคุ้มครองไว้ในที่เดียว 
                  เพื่อให้คุณ &quot;ครบ จบ เรื่องประกัน&quot; ได้ง่ายๆ เพียงปลายนิ้ว
                </p>
            </div>
          </div>
        </section>

        {/* --- 2. Story & Mission --- */}
        <section className="py-16 md:py-24 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold tracking-wide uppercase">
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                ทำไมเราถึงสร้าง <br/> <span className="text-blue-700">1Stop</span>Insurance
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                เราเริ่มต้นด้วยความเชื่อที่ว่า &quot;การซื้อประกันรถยนต์ไม่ควรเป็นเรื่องยุ่งยาก&quot; 
                ในอดีต การเปรียบเทียบราคา การติดต่อตัวแทน หรือการจัดการเอกสารเป็นเรื่องที่ซับซ้อนและใช้เวลา
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                1StopInsurance จึงเกิดขึ้นเพื่อเป็น **One-Stop Service** ที่นำเทคโนโลยีมาช่วยให้คุณค้นหา 
                เปรียบเทียบ และเลือกซื้อประกันที่เหมาะสมที่สุดกับไลฟ์สไตล์ของคุณ ได้อย่างรวดเร็ว โปร่งใส และคุ้มค่าที่สุด
              </p>
              
              {/* ✅ ส่วนแสดงรูปโปรไฟล์ลูกค้าจริง */}
              <div className="pt-4 flex items-center gap-4">
                  <div className="flex -space-x-4">
                      {stats.customerImages.length > 0 ? (
                          stats.customerImages.map((img, index) => (
                              <div key={index} className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                  <Image 
                                    src={img} 
                                    alt={`Customer ${index + 1}`} 
                                    fill 
                                    className="object-cover"
                                  />
                              </div>
                          ))
                      ) : (
                          // Fallback กรณีไม่มีรูป ใช้ Placeholder เดิม
                          <>
                            <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-200"></div>
                            <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-300"></div>
                            <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-400"></div>
                          </>
                      )}
                  </div>
                  <p className="text-sm text-gray-500">
                      <span className="font-bold text-gray-800 text-lg">{stats.customerCount}</span> 
                      <span className="ml-1">ลูกค้าที่ไว้วางใจเรา</span>
                  </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square md:aspect-[4/3] bg-gradient-to-tr from-blue-50 to-white rounded-3xl relative overflow-hidden shadow-lg border border-blue-100 rotate-3 hover:rotate-0 transition-transform duration-500 flex items-center justify-center p-6">
                  <div className="grid grid-cols-3 gap-4 w-full h-full place-items-center">
                      {partnerImages.map((src, index) => (
                          <div key={index} className="relative w-full h-full flex items-center justify-center">
                              <Image
                                  src={src}
                                  alt={`Partner ${index + 1}`}
                                  width={80}
                                  height={80}
                                  className="object-contain max-h-full max-w-full"
                              />
                          </div>
                      ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-blue-200 pointer-events-none">
                      <ShieldCheck className="w-32 h-32 opacity-10" />
                  </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs">
                  <p className="font-bold text-blue-800 text-xl">&quot;ประกันภัยที่เข้าใจคุณ&quot;</p>
                  <p className="text-gray-500 text-sm mt-1">พันธกิจหลักของเราในการดูแลลูกค้าทุกคน</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. Stats Section --- */}
        <section className="bg-white py-16 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-8 text-center divide-x divide-gray-200">
                  <div className="p-4">
                      <p className="text-4xl md:text-5xl font-bold text-blue-700 mb-2">6</p>
                      <p className="text-gray-500">บริษัทประกันภัยพันธมิตร</p>
                  </div>
                  <div className="p-4">
                      <p className="text-4xl md:text-5xl font-bold text-blue-700 mb-2">{stats.policyCount}</p>
                      <p className="text-gray-500">กรมธรรม์ที่ดูแล</p>
                  </div>
              </div>
          </div>
        </section>

        {/* ... (ส่วนอื่นๆ คงเดิม) ... */}
        {/* --- 4. Why Choose Us --- */}
        <section className="py-20 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">ทำไมต้องเลือก <span className="text-blue-700">1StopInsurance</span></h2>
              <p className="text-gray-500 mt-4 max-w-2xl mx-auto">เรามุ่งมั่นที่จะมอบประสบการณ์การประกันภัยที่ดีที่สุดให้กับคุณ ด้วยจุดเด่นที่แตกต่าง</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-8 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                      <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">เชื่อถือได้ ปลอดภัย 100%</h3>
                  <p className="text-gray-600 leading-relaxed">
                      ตัวแทนของเราผ่านการตรวจสอบประวัติและมีใบอนุญาตถูกต้องทุกท่าน เพื่อมาตรฐานการบริการที่คุณไว้วางใจได้
                  </p>
              </div>

              <div className="p-8 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 mb-6">
                      <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">เปรียบเทียบง่าย รวดเร็ว</h3>
                  <p className="text-gray-600 leading-relaxed">
                      มีระบบช่วยคัดกรองแผนประกันที่คุ้มค่าที่สุดสำหรับรถของคุณ เปรียบเทียบราคาได้ทันทีภายใน 30 วินาที
                  </p>
              </div>

              <div className="p-8 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                      <HeartHandshake className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">ดูแลดุจคนในครอบครัว</h3>
                  <p className="text-gray-600 leading-relaxed">
                      ตัวแทนผู้เชี่ยวชาญพร้อมให้คำปรึกษาและช่วยเหลือคุณตลอดอายุการคุ้มครอง ไม่ทิ้งกันเมื่อเกิดเหตุ
                  </p>
              </div>
          </div>
        </section>

        {/* --- 5. CTA Section --- */}
        <section className="bg-blue-600 py-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-20"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">พร้อมรับความคุ้มครองที่ใช่ ในราคาที่ชอบหรือยัง?</h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                  เริ่มต้นเช็คเบี้ยประกันฟรีได้เลยวันนี้
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/customer/car-insurance/car-Insurance-form" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full shadow-lg hover:bg-blue-50 hover:scale-105 transition-all flex items-center justify-center gap-2">
                      เช็คเบี้ยประกันเลย <ArrowRight className="w-5 h-5"/>
                  </Link>
                  <Link href="/contact" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center">
                      ติดต่อสอบถาม
                  </Link>
              </div>
          </div>
        </section>

      </main>
    </div>
  );
}