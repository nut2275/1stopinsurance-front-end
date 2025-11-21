'use client'; // 👈 สำคัญมาก: หน้านี้มีการโต้ตอบกับผู้ใช้ (คลิก, กราฟ) จึงต้องเป็น Client Component

import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto'; // นำเข้า Chart.js อย่างถูกวิธี


// --- ส่วนของข้อมูล (Data) ---
// เราจะเก็บข้อมูลไว้ข้างนอก Component เพื่อไม่ให้ถูกสร้างใหม่ทุกครั้งที่ re-render
const companyData = {
  "วิริยะ": { sales: 1000, orders: 12, closed: 8, new: 12 },
  "ทิพย": { sales: 1500, orders: 15, closed: 10, new: 9 },
  "เมืองไทย": { sales: 900, orders: 8, closed: 5, new: 6 },
  "ธนชาต": { sales: 1200, orders: 10, closed: 6, new: 8 },
  "มิตรแท้": { sales: 700, orders: 7, closed: 3, new: 4 },
  "กรุงเทพ": { sales: 800, orders: 9, closed: 5, new: 7 }
};

const policyData = {
  "วิริยะ": [{ name: "ชั้น 1", popularity: 45 }, { name: "ชั้น 2+", popularity: 35 }, { name: "ชั้น 3+", popularity: 20 }],
  "ทิพย": [{ name: "ชั้น 1", popularity: 50 }, { name: "ชั้น 2+", popularity: 30 }, { name: "ชั้น 3+", popularity: 20 }],
  "เมืองไทย": [{ name: "ชั้น 1", popularity: 40 }, { name: "ชั้น 2+", popularity: 40 }, { name: "ชั้น 3+", popularity: 20 }],
  "ธนชาต": [{ name: "ชั้น 1", popularity: 55 }, { name: "ชั้น 2+", popularity: 25 }, { name: "ชั้น 3+", popularity: 20 }],
  "มิตรแท้": [{ name: "ชั้น 1", popularity: 50 }, { name: "ชั้น 2+", popularity: 30 }, { name: "ชั้น 3+", popularity: 20 }],
  "กรุงเทพ": [{ name: "ชั้น 1", popularity: 60 }, { name: "ชั้น 2+", popularity: 25 }, { name: "ชั้น 3+", popularity: 15 }]
};


// --- Component หลักของหน้า Dashboard ---
export default function AgentPageDashboard() {
  
  // --- State Management ---
  const [selectedCompany, setSelectedCompany] = useState<string>('วิริยะ');

  // --- Refs for Chart instances ---
  const insuranceChartRef = useRef<HTMLCanvasElement>(null);
  const salesChartRef = useRef<HTMLCanvasElement>(null);
  const userChartRef = useRef<HTMLCanvasElement>(null);
  const salesChartInstance = useRef<Chart | null>(null);


  // --- useEffect: สำหรับจัดการกราฟ (Side Effects) ---
  useEffect(() => {
    // ---- 1. กราฟวงกลม (Pie Chart) - สร้างแค่ครั้งเดียว ----
    const pieCtx = insuranceChartRef.current?.getContext('2d');
    if (!pieCtx) return;

    const pieChart = new Chart(pieCtx, {
      type: "doughnut",
      data: {
        labels: Object.keys(companyData),
        datasets: [{
          data: [30, 25, 20, 15, 10, 10], // Sample distribution data
          backgroundColor: ["#2563eb","#facc15","#2dd4bf","#f87171","#a855f7","#ec4899"],
          // cutout ถูกย้ายออกไปจากตรงนี้
        }]
      },
      options: {
        // ✅ ย้าย 'cutout' มาไว้ใน options ซึ่งเป็นตำแหน่งที่ถูกต้อง
        cutout: "70%",
        plugins: { legend: { display: false } },
        onClick: (e, activeEls) => {
          if (activeEls.length > 0) {
            const companyIndex = activeEls[0].index;
            const companyName = pieChart.data.labels?.[companyIndex] as string;
            setSelectedCompany(companyName);
          }
        }
      }
    });

    // ---- 2. กราฟผู้ใช้งานรายวัน (Line Chart) - สร้างแค่ครั้งเดียว ----
    const userCtx = userChartRef.current?.getContext('2d');
    if (!userCtx) return;
    const userChart = new Chart(userCtx, {
      type: "line",
      data: {
        labels: ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"],
        datasets: [
          { label: "เดือนนี้", data: [140, 130, 135, 150, 145, 155, 160], borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", fill: true, tension: 0.3 },
          { label: "เดือนที่แล้ว", data: [120, 125, 130, 135, 128, 140, 150], borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)", fill: true, tension: 0.3 }
        ]
      },
      options: { plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } }
    });

    // --- Cleanup function ---
    return () => {
      pieChart.destroy();
      userChart.destroy();
      if(salesChartInstance.current) {
        salesChartInstance.current.destroy();
      }
    };
  }, []); // [] dependency array หมายความว่า effect นี้จะทำงานแค่ครั้งเดียวตอน mount

  // --- useEffect: สำหรับอัปเดตกราฟยอดขาย (Sales Chart) ---
  useEffect(() => {
    const salesCtx = salesChartRef.current?.getContext('2d');
    if (!salesCtx) return;

    if(salesChartInstance.current) {
      salesChartInstance.current.destroy();
    }
    
    const cData = companyData[selectedCompany as keyof typeof companyData];

    salesChartInstance.current = new Chart(salesCtx, {
      type: "bar",
      data: {
        labels: ["ชั้น 1", "ชั้น 2+", "ชั้น 3", "ชั้น 3+"],
        datasets: [{
          data: [cData.sales * 0.5, cData.sales * 0.3, cData.sales * 0.15, cData.sales * 0.05],
          backgroundColor: "#1e3a8a",
          borderRadius: 5
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }, [selectedCompany]); // Dependency array: ทำงานใหม่เมื่อ selectedCompany เปลี่ยน


  // --- Data for Rendering ---
  const currentCompanyData = companyData[selectedCompany as keyof typeof companyData];
  const currentPolicyData = policyData[selectedCompany as keyof typeof policyData];

  return (
    <>
      {/* Head tag is handled by Next.js layout file, so it's removed from here */}

       <div className="flex flex-col min-h-screen bg-[#f0f6ff] font-sans text-gray-800">
        {/* Dashboard Main Content */}
        <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
            <div className="bg-white rounded-xl p-4 shadow">
                <h2 className="text-blue-900 font-bold mb-2 text-sm">ประกันภัยทั้งหมด</h2>
                <canvas ref={insuranceChartRef} height="120"></canvas>
                <div className="grid grid-cols-2 text-xs mt-2 text-gray-700">
                    <p><span className="text-blue-600">●</span> วิริยะ</p>
                    <p><span className="text-yellow-400">●</span> ทิพย</p>
                    <p><span className="text-teal-400">●</span> เมืองไทย</p>
                    <p><span className="text-red-400">●</span> ธนชาต</p>
                    <p><span className="text-purple-500">●</span> มิตรแท้</p>
                    <p><span className="text-pink-500">●</span> กรุงเทพ</p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow text-sm">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">กรมธรรม์ที่ลูกค้านิยม ({selectedCompany})</h3>
                <table className="w-full">
                  <thead>
                    <tr className='text-gray-500 text-xs'>
                      <th className='text-left font-medium'>กรมธรรม์</th>
                      <th className='text-left font-medium'>ความนิยม</th>
                      <th className='text-right font-medium'>ยอดขาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPolicyData.map((policy, index) => (
                      <tr key={index}>
                        <td>{policy.name}</td>
                        <td>
                          <div className='w-full bg-gray-200 rounded-full h-2 mt-1'>
                            <div className='bg-green-500 h-2 rounded-full' style={{ width: `${policy.popularity}%` }}></div>
                          </div>
                        </td>
                        <td className='text-right text-gray-600'>{policy.popularity}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>

            <div className="bg-white rounded-xl p-4 shadow">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm">ยอดขายประกัน ({selectedCompany})</h3>
                    <span className="text-xs text-gray-400">Sort by: xxx</span>
                </div>
                <canvas ref={salesChartRef} height="120"></canvas>
            </div>
            
            <div className="col-span-1 lg:col-span-3 flex flex-col lg:flex-row justify-between items-start mt-2 space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-2/3">
                    <div className="flex-1 bg-pink-100 rounded-xl p-4 text-center shadow">
                        <div className="text-pink-600 text-xl font-bold">{currentCompanyData.sales.toLocaleString()} ฿</div>
                        <p className="font-medium text-gray-800">ยอดขายทั้งหมด</p>
                        <p className="text-xs text-blue-700">+8% จากเมื่อวาน</p>
                    </div>
                    <div className="flex-1 bg-amber-100 rounded-xl p-4 text-center shadow">
                        <div className="text-amber-600 text-xl font-bold">{currentCompanyData.orders}</div>
                        <p className="font-medium text-gray-800">ออเดอร์ทั้งหมด</p>
                        <p className="text-xs text-blue-700">+8% จากเมื่อวาน</p>
                    </div>
                    <div className="flex-1 bg-green-100 rounded-xl p-4 text-center shadow">
                        <div className="text-green-600 text-xl font-bold">{currentCompanyData.closed}</div>
                        <p className="font-medium text-gray-800">ปิดการขาย</p>
                        <p className="text-xs text-blue-700">+8% จากเมื่อวาน</p>
                    </div>
                    <div className="flex-1 bg-purple-100 rounded-xl p-4 text-center shadow">
                        <div className="text-purple-600 text-xl font-bold">{currentCompanyData.new}</div>
                        <p className="font-medium text-gray-800">ลูกค้าใหม่</p>
                        <p className="text-xs text-blue-700">+8% จากเมื่อวาน</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow w-full lg:w-1/3">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">สรุปยอดผู้ใช้งานรายวัน</h3>
                    <canvas ref={userChartRef} height="100"></canvas>
                </div>
            </div>
        </main>

      </div>
    </>
  );
}
