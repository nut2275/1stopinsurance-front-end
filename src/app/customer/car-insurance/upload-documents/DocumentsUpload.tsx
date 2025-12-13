"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import MenuLogined from "@/components/element/MenuLogined";
import { CloudUpload, Delete, Description, DirectionsCar, Palette, Pin } from "@mui/icons-material";
import axios from "axios";

// Helper แปลง File เป็น Base64
const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export default function UploadDocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("id");
  const agentCode = searchParams.get("agent");

  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [carRegFile, setCarRegFile] = useState<File | null>(null);
  const [carRegPreview, setCarRegPreview] = useState<string | null>(null);

  const [registration, setRegistration] = useState("");
  const [color, setColor] = useState("");
  const [searchData, setSearchData] = useState<any>({});

  const idCardInputRef = useRef<HTMLInputElement>(null);
  const carRegInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      // ✅ 1. ดึงข้อมูลรถที่เลือกไว้จาก LocalStorage
      const storedSearch = localStorage.getItem("searchCriteria"); 
      if (storedSearch) {
          const parsedData = JSON.parse(storedSearch);
          setSearchData(parsedData);
          console.log("Loaded Car Data:", parsedData); // เช็คว่ามาไหม
      }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: any, setPreview: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeFile = (setFile: any, setPreview: any, inputRef: any) => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!idCardFile || !carRegFile || !registration || !color) {
      alert("กรุณากรอกข้อมูลและอัปโหลดเอกสารให้ครบถ้วน");
      return;
    }

    try {
        const idCardBase64 = await toBase64(idCardFile);
        const carRegBase64 = await toBase64(carRegFile);

        const payload = {
            customer_id: localStorage.getItem("customerId"),
            agent_id: agentCode || null,
            plan_id: planId,
            carBrand: searchData.carBrand || "Unknown", 
            carModel: searchData.model || "Unknown",
            subModel: searchData.subModel || "",
            carYear: searchData.year || "2024",
            registration: registration,
            color: color,
            citizenCardImage: idCardBase64,
            carRegistrationImage: carRegBase64
        };

        // ยิงไป Backend Express ที่พอร์ต 5000 (หรือตามที่คุณตั้ง)
        const response = await axios.post("http://localhost:5000/purchase/insurance", payload);

        if (response.status === 201) {
            alert("บันทึกข้อมูลสำเร็จ! เตรียมชำระเงิน");
            // router.push("/customer/car-insurance/payment");
        }
    } catch (error) {
        console.error("Upload Error:", error);
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MenuLogined activePage="/customer/car-insurance" />
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <button onClick={() => router.back()} className="mb-4 text-gray-500 hover:text-blue-600 flex items-center gap-1">← ย้อนกลับ</button>
        <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">อัปโหลดเอกสารและข้อมูลรถ</h1>
        <p className="text-gray-500 text-center mb-8">กรุณาระบุข้อมูลรถเพิ่มเติมและอัปโหลดเอกสาร</p>

        {/* ข้อมูลรถเพิ่มเติม */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ข้อมูลรถยนต์เพิ่มเติม</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">ทะเบียนรถยนต์</label>
                    <input type="text" value={registration} onChange={(e) => setRegistration(e.target.value)} placeholder="เช่น กก-1234 กรุงเทพฯ" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none" />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">สีรถยนต์</label>
                    <input type="text" value={color} onChange={(e) => setColor(e.target.value)} placeholder="เช่น ขาว, ดำ" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none" />
                </div>
            </div>
        </div>

        {/* อัปโหลดรูป */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UploadCard title="สำเนาบัตรประชาชน" icon={<Description className="text-blue-500 text-4xl mb-2" />} preview={idCardPreview} inputRef={idCardInputRef} onUpload={() => idCardInputRef.current?.click()} onChange={(e) => handleFileChange(e, setIdCardFile, setIdCardPreview)} onRemove={() => removeFile(setIdCardFile, setIdCardPreview, idCardInputRef)} description="รองรับไฟล์ .jpg, .png" />
          <UploadCard title="สำเนาทะเบียนรถยนต์" icon={<DirectionsCar className="text-blue-500 text-4xl mb-2" />} preview={carRegPreview} inputRef={carRegInputRef} onUpload={() => carRegInputRef.current?.click()} onChange={(e) => handleFileChange(e, setCarRegFile, setCarRegPreview)} onRemove={() => removeFile(setCarRegFile, setCarRegPreview, carRegInputRef)} description="หน้าที่มีชื่อเจ้าของรถ" />
        </div>

        <div className="mt-10 flex justify-center">
          <button onClick={handleSubmit} disabled={!idCardFile || !carRegFile || !registration || !color} className={`w-full md:w-1/2 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${(!idCardFile || !carRegFile || !registration || !color) ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 text-white hover:-translate-y-1"}`}>ยืนยันและส่งข้อมูล</button>
        </div>
      </div>
    </div>
  );
}

const UploadCard = ({ title, icon, preview, inputRef, onUpload, onChange, onRemove, description }: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      <input type="file" accept="image/png, image/jpeg, image/jpg" hidden ref={inputRef} onChange={onChange} />
      <div className="flex-grow flex flex-col items-center justify-center min-h-[250px] bg-gray-50 rounded-xl border-2 border-dashed border-blue-200 relative overflow-hidden group hover:border-blue-400 transition-colors">
        {preview ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black/5">
             <div className="relative w-full h-full"><Image src={preview} alt="Preview" fill className="object-contain p-2" /></div>
             <button onClick={onRemove} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition"><Delete className="text-xl" /></button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center cursor-pointer w-full h-full" onClick={onUpload}>
            {icon}<p className="text-blue-600 font-semibold mb-1">คลิกเพื่ออัปโหลด</p><p className="text-xs text-gray-400">{description}</p><CloudUpload className="text-blue-200 text-6xl mt-4 opacity-50 group-hover:scale-110 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
};