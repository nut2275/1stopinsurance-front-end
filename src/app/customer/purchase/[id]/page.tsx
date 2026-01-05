"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import api from "@/services/api";
import MenuLogined from "@/components/element/MenuLogined";
import {routesCustomersSession} from "@/routes/session";

// Define the shape of the Purchase data returned from the API
interface PurchaseData {
  citizenCardImage?: string;
  carRegistrationImage?: string;
  policyDocumentImage?: string;
  paymentMethod?: 'installment' | 'full' | string;
  installmentDocImage?: string;
  consentFormImage?: string;
  paymentSlipImage?: string;
}

// Fetcher with generic type support
const fetcher = async (url: string) => {
  const res = await api.get<PurchaseData>(url);
  return res.data;
};

type DocConfig = {
  label: string;
  key: string;
  file?: string;
  downloadName: string;
};

export default function PurchaseDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  useEffect(() => {
    // เช็ค Session ถ้าไม่ได้ Login ให้เด้งไปหน้า Login
    if (!routesCustomersSession()) {  
      router.push("/customer/login");
      return;
    }
  }, []);

  // useSWR with generic type for better type inference
  const { data, error, isLoading } = useSWR<PurchaseData>(
    id ? `/purchase/${id}/documents` : null,
    fetcher
  );

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20">
        <p className="text-xl text-red-600 font-semibold mb-2">ไม่พบข้อมูลเอกสาร</p>
        <button onClick={() => router.back()} className="text-blue-500 hover:underline">กลับไปหน้าก่อนหน้า</button>
      </div>
    );
  }

  // ================= จัดการเอกสารตามเงื่อนไข =================
  
  // 1. เอกสารพื้นฐาน (มีทุกกรณี)
  const baseDocuments: DocConfig[] = [
    {
      label: "สำเนาบัตรประชาชน",
      key: "citizenCardImage",
      file: data?.citizenCardImage,
      downloadName: "สำเนาบัตรประชาชน",
    },
    {
      label: "สำเนาทะเบียนรถ",
      key: "carRegistrationImage",
      file: data?.carRegistrationImage,
      downloadName: "สำเนาทะเบียนรถ",
    },
    {
      label: "กรมธรรม์",
      key: "policyDocumentImage",
      file: data?.policyDocumentImage,
      downloadName: "กรมธรรม์",
    },
  ];

  // 2. เอกสารการเงิน (แยกตาม paymentMethod)
  const financialDocuments: DocConfig[] = [];

  if (data?.paymentMethod === 'installment') {
    // ✅ กรณีผ่อนชำระ: แสดงเอกสารผ่อน + หนังสือยินยอม(ถ้ามี)
    financialDocuments.push({
        label: "เอกสารการผ่อนชำระ",
        key: "installmentDocImage",
        file: data?.installmentDocImage,
        downloadName: "เอกสารการผ่อนชำระ",
    });

    // เช็คว่ามีหนังสือยินยอมไหม ถ้ามีถึงจะแสดง
    if (data?.consentFormImage) {
        financialDocuments.push({
            label: "หนังสือยินยอม",
            key: "consentFormImage",
            file: data?.consentFormImage,
            downloadName: "หนังสือยินยอม",
        });
    }

  } else {
    // ✅ กรณีจ่ายเต็ม (หรืออื่นๆ): แสดงหลักฐานการโอนเงิน
    financialDocuments.push({
        label: "หลักฐานการโอนเงิน",
        key: "paymentSlipImage",
        file: data?.paymentSlipImage,
        downloadName: "หลักฐานการโอนเงิน",
    });
  }

  // รวมเอกสารทั้งหมด
  const documents = [...baseDocuments, ...financialDocuments];


  // ================= ฟังก์ชัน Helper =================
  const isPdf = (url?: string) =>
    url?.toLowerCase().includes(".pdf");

  const getFileName = (name: string, url?: string) => {
    if (!url) return "";
    const ext = url.split(".").pop();
    return `${name}.${ext}`;
  };

  const watermarkText = "ONE STOP INSURANCE • CONFIDENTIAL";

  return (
    <>
      <MenuLogined activePage="/customer/profile" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          กลับ
        </button>

        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
          เอกสารประกอบการซื้อประกัน 
          {/* (Optional) แสดงประเภทการชำระเงินให้รู้ด้วยก็ได้ */}
          {data?.paymentMethod === 'installment' && <span className="text-sm ml-3 bg-orange-100 text-orange-700 px-3 py-1 rounded-full align-middle font-medium">แบบผ่อนชำระ</span>}
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <h2 className="font-semibold text-lg text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
                {doc.label}
              </h2>

              {/* ===== Preview 16:9 ===== */}
              <div className="aspect-[1/1.1414] bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden mb-5 border border-gray-100 relative group">
                {doc.file ? (
                  isPdf(doc.file) ? (
                    <div className="flex flex-col items-center">
                        <i className="fa-solid fa-file-pdf text-6xl text-red-500 mb-2 group-hover:scale-110 transition-transform"></i>
                        <span className="text-sm text-gray-500 font-medium">เอกสาร PDF</span>
                    </div>
                  ) : (
                    <img
                      src={doc.file}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={doc.label}
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">ยังไม่มีเอกสาร</p>
                  </div>
                )}
              </div>

              {/* ===== Actions ===== */}
              <div className="flex gap-3">
                <button
                  disabled={!doc.file}
                  onClick={() => doc.file && setPreviewFile(doc.file)}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
                    ${doc.file
                      ? "bg-gray-800 text-white hover:bg-gray-900 shadow-md hover:shadow-lg"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  <i className="fa-regular fa-eye"></i> ดู
                </button>

                <a
                  href={doc.file || "#"}
                  download={getFileName(doc.downloadName, doc.file)}
                  target="_blank"
                  rel="noreferrer" 
                  className={`flex-1 py-2.5 rounded-lg text-center font-medium transition-all duration-200 flex items-center justify-center gap-2
                    ${doc.file
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                      : "bg-gray-100 text-gray-400 pointer-events-none"
                    }`}
                >
                  <i className="fa-solid fa-download"></i> โหลด
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ================= MODAL เต็มจอ + ลายน้ำ ================= */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewFile(null)}>
          
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white text-4xl z-[70] transition-colors"
          >
            ✕
          </button>

          <div className="relative max-w-5xl w-full h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {isPdf(previewFile) ? (
              <iframe src={previewFile} className="w-full h-full" />
            ) : (
              <img
                src={previewFile}
                className="w-full h-full object-contain bg-gray-50"
                alt="Preview"
              />
            )}

            {/* ลายน้ำ */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center rotate-[-30deg] opacity-20 space-y-32">
                    <p className="text-gray-500 font-black text-4xl md:text-6xl whitespace-nowrap select-none">{watermarkText}</p>
                    <p className="text-gray-500 font-black text-4xl md:text-6xl whitespace-nowrap select-none">{watermarkText}</p>
                    <p className="text-gray-500 font-black text-4xl md:text-6xl whitespace-nowrap select-none">{watermarkText}</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}