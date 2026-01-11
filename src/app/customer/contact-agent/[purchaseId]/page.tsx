"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import api from '@/services/api'; 
import MenuLogined from '@/components/element/MenuLogined';
// --- Interfaces ---

interface IAgent {
  _id: string;
  first_name: string;
  last_name: string;
  agent_license_number: string;
  phone: string;
  idLine: string;
  imgProfile?: string;
}

// ✅ แก้ที่ 1: เปลี่ยน type ของ agent_id ให้เป็น IAgent (Object) เพราะ Backend populate มาให้แล้ว
interface IPurchase {
  _id: string;
  status: string;
  agent_id?: IAgent | null; 
}

export default function ContactAgentPage() {
  const router = useRouter();
  const params = useParams<{ purchaseId: string }>();
  const purchaseId = params.purchaseId;

  const [agent, setAgent] = useState<IAgent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!purchaseId) { 
        setLoading(false);
        return; 
      }

      try {
        // Step 1: ดึงข้อมูล Purchase (ซึ่งมี Agent ติดมาด้วยแล้ว)
        // ✅ แก้ที่ 2: ใช้ path /api/purchases (ตามมาตรฐาน Backend ส่วนใหญ่)
        const purchaseRes = await api.get<IPurchase>(`/purchase/${purchaseId}`);
        const purchaseData = purchaseRes.data;

        // เช็คว่ามีข้อมูล Agent ติดมาไหม
        if (!purchaseData.agent_id) {
            setError("รายการนี้ยังไม่มีเจ้าหน้าที่รับผิดชอบ (กำลังรอการอนุมัติ)");
            setLoading(false);
            return;
        }

        // ✅ แก้ที่ 3: ลบ Step 2 ทิ้ง! แล้วเอาข้อมูลใส่ State ได้เลย
        // ไม่ต้องยิง api.get('/agents/...') อีกแล้ว
        setAgent(purchaseData.agent_id);
        
      } catch (err: unknown) {
        console.error(err);
        
        if (err instanceof AxiosError) {
          const message = err.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
          setError(message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [purchaseId]);

  // Helper Functions
  const getProfileImageSrc = (imgProfile?: string): string => {
    // 1. ถ้าไม่มีข้อมูล หรือ เป็นค่าว่าง ("") ให้ใช้รูป Default
    if (!imgProfile || imgProfile.trim() === "") {
        return "/fotos/profile.PNG"; 
    }

    // 2. ถ้าเป็น Link จากภายนอก (เช่น https://...) ให้ใช้เลย
    if (imgProfile.startsWith('http')) {
        return imgProfile;
    }

    // ✅ เพิ่มส่วนนี้: ถ้าเป็น Base64 (data:image/...) ให้ใช้เลย ไม่ต้องต่อ localhost
    if (imgProfile.startsWith('data:')) {
        return imgProfile;
    }
    
    // 3. ถ้าเป็นชื่อไฟล์จาก Backend ให้ต่อ Path ของ Server
    return `http://localhost:5000/uploads/${imgProfile}`;
  };

  const getLineUrl = (idLine: string): string => {
      if(idLine.startsWith('http')) return idLine;
      return `https://line.me/ti/p/~${idLine}`;
  }

  // --- Render ---
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-blue-50">
      
      <MenuLogined activePage='' />

      <main className="flex-grow py-10 px-6 flex justify-center">
        <div className="w-full max-w-2xl">
            
          <button 
            onClick={() => router.back()} 
            className="text-blue-600 font-semibold hover:underline mb-4 inline-block"
            type="button"
          >
            ← กรมธรรมของฉัน
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center relative overflow-hidden min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-900"></div>

            <h1 className="text-2xl font-bold text-blue-900 mb-2">ข้อมูลเจ้าหน้าที่ดูแลกรมธรรม์</h1>
            
            {loading && (
                <div className="py-20 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                    <p className="mt-4 text-gray-400">กำลังค้นหาข้อมูลเจ้าหน้าที่...</p>
                </div>
            )}

            {!loading && error && (
                <div className="py-10">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <p className="text-gray-500">กรุณาติดต่อ Call Center หากต้องการความช่วยเหลือด่วน</p>
                </div>
            )}

            {!loading && agent && !error && (
                <div className="animate-fade-in-up">
                    <div className="relative mx-auto w-32 h-32 mb-6 mt-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={getProfileImageSrc(agent.imgProfile)} 
                            alt="Agent Profile" 
                            className="w-full h-full object-cover rounded-full border-4 border-blue-100 shadow-md"
                        />
                        <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white" title="Online"></div>
                    </div>

                    <div className="space-y-1 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {agent.first_name} {agent.last_name}
                        </h2>
                        <div className="inline-block bg-blue-50 px-4 py-1 rounded-full border border-blue-100">
                            <p className="text-sm text-blue-800 font-medium">
                                เลขใบอนุญาต : {agent.agent_license_number}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                        
                        {agent.idLine ? (
                            <a 
                                href={getLineUrl(agent.idLine)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center space-x-2 bg-[#06C755] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#05b54d] transition shadow-md hover:shadow-lg hover:-translate-y-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0c4.411 0 8 2.912 8 6.492 0 1.433-.755 2.723-2.082 3.794-.135.11-.278.223-.418.337l.092.836c.036.326.064.55.034.721a.48.48 0 0 1-.027.135c-.015.068-.083.25-.333.328-.21.066-.462.016-.694-.09-.345-.158-2.618-1.428-2.618-1.428a9.4 9.4 0 0 1-1.954.218C3.589 11.492 0 8.58 0 5s3.589-6.492 8-6.492"/></svg>
                                <span>แชทผ่าน LINE</span>
                            </a>
                        ) : (
                            <button disabled className="bg-gray-300 text-white px-6 py-3 rounded-xl font-bold cursor-not-allowed">
                                ไม่ระบุ LINE
                            </button>
                        )}

                        {agent.phone ? (
                            <a 
                                href={`tel:${agent.phone}`}
                                className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg hover:-translate-y-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span>{agent.phone}</span>
                            </a>
                        ) : (
                            <button disabled className="bg-gray-300 text-white px-6 py-3 rounded-xl font-bold cursor-not-allowed">
                                ไม่ระบุเบอร์โทร
                            </button>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-blue-900 text-white py-6 mt-auto text-center text-sm">
        <p>&copy; 2025 1StopInsurance. All rights reserved.</p>
      </footer>
    </div>
  );
}