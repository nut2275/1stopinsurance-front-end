// app/agent-customer-documents/page.tsx
'use client';

import { useState, useMemo, FormEvent, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MenuAgent from '@/components/element/MenuAgent';
import DocumentPreviewModal from '@/app/agent/agent_manage_customer/document/DocumentPreviewModal';
import { Download, FileText } from 'lucide-react';

// ข้อมูลเอกสารจำลอง (ในแอปจริงควรมาจาก API)
const initialDocuments = [
  { id: 1, name: 'บัตรประชาชน.pdf', path: '/documents/sample-idcard.pdf', type: 'application/pdf' },
  { id: 2, name: 'ทะเบียนรถ.jpg', path: '/documents/sample-carreg.jpg', type: 'image/jpeg' },
];

export default function CustomerDocumentsPage() {
  const searchParams = useSearchParams();
  const customerName = searchParams.get('name') || 'ไม่พบชื่อลูกค้า';
  const policyNo = searchParams.get('policy') || 'ไม่พบเลขกรมธรรม์';

  const [modalOpen, setModalOpen] = useState(false);
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openPreview = (path: string) => {
    setPreviewPath(path);
    setModalOpen(true);
  };

  const closePreview = () => {
    setModalOpen(false);
    setPreviewPath(null);
  };

  const handleUpload = (e: FormEvent) => {
    e.preventDefault();
    const files = fileInputRef.current?.files;
    
    if (files && files.length > 0) {
      // Logic การอัปโหลดจำลอง (ในแอปจริงต้องเรียก API และจัดการไฟล์)
      
      // การจำลองการเพิ่มเอกสารใหม่
      const newDocs = Array.from(files).map((file, index) => ({
        id: documents.length + 1 + index,
        name: file.name,
        path: `/uploaded/${file.name}`, // สมมติ path หลังอัปโหลด
        type: file.type,
      }));

      setDocuments(prev => [...prev, ...newDocs]);
      
      alert(`อัปโหลดเอกสาร ${files.length} ไฟล์เรียบร้อยแล้ว!`);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // ล้าง input
      }
    } else {
      alert("กรุณาเลือกไฟล์ก่อนอัปโหลด");
    }
  };

  return (
    <>
      <MenuAgent activePage="/agent/agent_manage_customer" />
      
      <main className="flex-grow max-w-3xl mx-auto w-full bg-white shadow rounded-xl mt-10 mb-10 p-4 md:p-8">
        <h1 className="text-2xl font-bold text-blue-900 text-center mb-6">เอกสารลูกค้า</h1>

        <div className="text-center mb-6 border-b pb-4">
          <p className="mb-1">ชื่อลูกค้า: <span id="customerName" className="font-semibold text-blue-800">{customerName}</span></p>
          <p>เลขกรมธรรม์: <span id="policyNo" className="font-semibold">{policyNo}</span></p>
        </div>

        {/* เอกสารที่อัปโหลดแล้ว */}
        <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
            <FileText size={20} className="mr-2 text-blue-600" /> เอกสารที่อัปโหลดแล้ว
        </h2>
        
        <ul className="list-none pl-0 mb-8 text-gray-700 space-y-3">
          {documents.map((doc) => (
            <li key={doc.id} className="flex justify-between items-center border p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <button
                className="text-blue-600 hover:underline flex-1 text-left"
                onClick={() => openPreview(doc.path)}
                title="ดูตัวอย่าง"
              >
                {doc.name}
              </button>
              
              <a 
                href={doc.path} 
                download={doc.name}
                className="ml-4 text-gray-500 hover:text-blue-700 text-sm flex items-center transition"
                title="ดาวน์โหลด"
              >
                <Download size={16} className="mr-1" /> ดาวน์โหลด
              </a>
            </li>
          ))}
        </ul>

        {/* อัปโหลดเอกสารเพิ่มเติม */}
        <h2 className="text-lg font-bold text-gray-700 mb-3">อัปโหลดเอกสารเพิ่มเติม</h2>
        <form onSubmit={handleUpload} className="space-y-4 p-4 border border-dashed border-gray-300 rounded-lg bg-white">
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button 
            type="submit" 
            className="w-full bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition font-semibold shadow"
          >
            อัปโหลด
          </button>
        </form>

      </main>

      {/* Modal Component */}
      <DocumentPreviewModal
        isOpen={modalOpen}
        filePath={previewPath}
        onClose={closePreview}
      />
      
      {/* Footer ถูกจัดการใน RootLayout */}
    </>
  );
}