// It's good practice to mark pages with interactivity as client components in Next.js
"use client";

import type { NextPage } from 'next';
// import Head from 'next/head'; // ❌ Removed: This is not used in the App Router.

// --- SVG Icon Components ---
// I have created these simple SVG components to replace the image files and FontAwesome
// This makes the component self-contained and load faster without external dependencies.

// const BellIcon = ({ className }: { className?: string }) => (
//   <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
//   </svg>
// );

// const UserIcon = ({ className }: { className?: string }) => (
//   <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
//   </svg>
// );

const WarningIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

const SuccessIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const AgentNotificationPage: NextPage = () => {
  return (
    <>
      {/* ❌ The <Head> component was removed because it's not compatible with Next.js App Router Client Components. 
          Metadata should be handled in parent layouts or server components. */}
      
      {/* Custom styles from the original file are included here */}
      <style jsx global>{`
        body {
          background-color: #f9fafb;
        }
        .notification {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px; /* Increased gap for better icon spacing */
          transition: all 0.2s ease;
        }
        .notification:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .notification.warning {
          border-left: 6px solid #dc2626;
        }
        .notification.success {
          border-left: 6px solid #16a34a;
        }
        .notification.info {
          border-left: 6px solid #2563eb;
        }
      `}</style>

      <div className="flex flex-col min-h-screen font-sans text-gray-800">

        

        {/* Main Content */}
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 mt-10 mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">การแจ้งเตือน</h1>

          <div className="space-y-4">
            
            <div className="notification warning">
              <WarningIcon className="h-8 w-8 text-red-600 flex-shrink-0"/>
              <p>กรมธรรม์รถยนต์ของคุณจะหมดอายุในอีก <b>7 วัน</b> ตรวจสอบและต่ออายุทันที</p>
            </div>

            <div className="notification success">
              <SuccessIcon className="h-8 w-8 text-green-600 flex-shrink-0"/>
              <p>ชำระค่าเบี้ยประกัน <b>1,250 บาท</b> ภายในวันที่ <b>5 ส.ค.</b> เพื่อรักษาความคุ้มครอง</p>
            </div>

            <div className="notification warning">
              <WarningIcon className="h-8 w-8 text-red-600 flex-shrink-0"/>
              <p>ถึงเวลาชำระเบี้ยประกันแล้ว! กรุณาชำระก่อนครบกำหนดในอีก <b>3 วัน</b></p>
            </div>
            
            <div className="notification info">
              <InfoIcon className="h-8 w-8 text-blue-600 flex-shrink-0"/>
              <div> {/* Added a div wrapper for better text alignment */}
                <p>ยืนยันสำเร็จ! กรมธรรม์ของคุณได้รับการอนุมัติเรียบร้อยแล้ว</p>
                <p><b>เลขกรมธรรม์: XY2987654321</b></p>
              </div>
            </div>

          </div>
        </main>

      </div>
    </>
  );
};

export default AgentNotificationPage;


