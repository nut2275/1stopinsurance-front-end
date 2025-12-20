"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import api from "@/services/api";
import MenuLogined from "@/components/element/MenuLogined";

const fetcher = async (url: string) => {
  const res = await api.get(url);
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

  const { data, error, isLoading } = useSWR(
    id ? `/purchase/${id}/documents` : null,
    fetcher
  );

  if (isLoading) {
    return <p className="text-center mt-10">กำลังโหลดเอกสาร...</p>;
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-600">
        ไม่พบข้อมูลเอกสาร
      </p>
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
  let financialDocuments: DocConfig[] = [];

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
          className="mb-6 text-blue-600 font-semibold"
        >
          ← กลับ
        </button>

        <h1 className="text-2xl font-bold mb-6">
          เอกสารประกอบการซื้อประกัน 
          {/* (Optional) แสดงประเภทการชำระเงินให้รู้ด้วยก็ได้ */}
          {data?.paymentMethod === 'installment' && <span className="text-sm ml-3 bg-orange-100 text-orange-700 px-2 py-1 rounded-full">แบบผ่อนชำระ</span>}
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 shadow-sm"
            >
              <h2 className="font-semibold mb-3">
                {doc.label}
              </h2>

              {/* ===== Preview 16:9 ===== */}
              <div className="aspect-[1/1.1414] bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-4">
                {doc.file ? (
                  isPdf(doc.file) ? (
                    <i className="fa-solid fa-file-pdf text-6xl text-red-600"></i>
                  ) : (
                    <img
                      src={doc.file}
                      className="w-full h-full object-cover"
                      alt={doc.label}
                    />
                  )
                ) : (
                  <p className="text-gray-500 text-sm">ยังไม่มีเอกสาร</p>
                )}
              </div>

              {/* ===== Actions ===== */}
              <div className="flex gap-2">
                <button
                  disabled={!doc.file}
                  onClick={() => doc.file && setPreviewFile(doc.file)}
                  className={`flex-1 py-2 rounded transition
                    ${doc.file
                      ? "bg-gray-700 text-white hover:bg-gray-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  ดูเอกสาร
                </button>

                <a
                  href={doc.file || "#"}
                  download={getFileName(doc.downloadName, doc.file)}
                  className={`flex-1 py-2 rounded text-center transition
                    ${doc.file
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 pointer-events-none"
                    }`}
                >
                  ดาวน์โหลด
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ================= MODAL เต็มจอ + ลายน้ำ ================= */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-6 text-white text-3xl z-50"
          >
            ✕
          </button>

          <div className="relative max-w-6xl w-full h-[90vh] bg-white rounded overflow-hidden">
            {isPdf(previewFile) ? (
              <iframe src={previewFile} className="w-full h-full" />
            ) : (
              <img
                src={previewFile}
                className="w-full h-full object-contain"
                alt="Preview"
              />
            )}

            {/* ลายน้ำ */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 font-bold text-4xl md:text-6xl rotate-[-30deg] opacity-30 select-none">
                {watermarkText}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}