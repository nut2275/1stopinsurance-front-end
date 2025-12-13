// app/components/DocumentPreviewModal.tsx
import { X } from 'lucide-react';
import Image from 'next/image';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  filePath: string | null;
  onClose: () => void;
}

export default function DocumentPreviewModal({ isOpen, filePath, onClose }: DocumentPreviewModalProps) {
  if (!isOpen || !filePath) return null;

  const isPdf = filePath.toLowerCase().endsWith('.pdf');

  // ใน Next.js การใช้ iframe สำหรับไฟล์ PDF หรือ img สำหรับรูปภาพ
  // จำเป็นต้องตรวจสอบว่าไฟล์อยู่ใน public/ หรือเป็น URL ภายนอก
  const content = isPdf ? (
    <iframe src={filePath} width="100%" height="500px" title="Document Preview" />
  ) : (
    <Image src={filePath} className="max-h-[80vh] w-auto rounded shadow object-contain" alt="Document Preview" />
  );

  return (
    <div
      className="modal fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4"
      onClick={onClose} // ปิดเมื่อคลิกนอก Modal
    >
      <div
        className="modal-content bg-white p-6 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()} // ป้องกันการปิดเมื่อคลิกใน Modal
      >
        <button
          className="absolute top-3 right-4 text-red-600 font-bold hover:text-red-800 transition"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-blue-900 mb-4 pr-10">ตัวอย่างเอกสาร</h2>
        <div id="previewContent" className="flex justify-center mt-6">
          {content}
        </div>
      </div>
    </div>
  );
}