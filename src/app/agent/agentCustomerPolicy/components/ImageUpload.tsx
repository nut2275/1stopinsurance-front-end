import React, { ChangeEvent } from "react";
import { Check, Upload, FileText, Eye } from "lucide-react";

interface ImageUploadProps {
    label: string;
    currentImage: string;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, currentImage, onFileChange }) => {
    const isPdf = currentImage?.startsWith('data:application/pdf') || currentImage?.toLowerCase().endsWith('.pdf');
    
    const handleView = () => {
        const win = window.open();
        if(win) win.document.write(`<iframe src="${currentImage}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    };

    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors">
          <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              {currentImage ? 
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"><Check className="w-3 h-3"/> มีไฟล์แล้ว</span> : 
                <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-medium">ว่าง</span>
              }
          </div>
          
          {currentImage ? (
              <div className="relative group h-36 w-full bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden mb-3 cursor-pointer shadow-sm" onClick={handleView}>
                  {isPdf ? (
                      <div className="text-center">
                          <FileText className="w-10 h-10 text-red-500 mx-auto mb-2"/>
                          <span className="text-xs text-slate-500 font-medium">เอกสาร PDF</span>
                      </div>
                  ) : (
                      <img src={currentImage} alt={label} className="w-full h-full object-contain p-2" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleView(); }} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-slate-700 text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 transition shadow-lg">
                          <Eye className="w-4 h-4"/> ดูตัวอย่าง
                      </button>
                  </div>
              </div>
          ) : (
              <div className="h-36 w-full bg-white rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 mb-3 group-hover:border-blue-300 transition-colors">
                  <div className="p-3 bg-slate-50 rounded-full mb-2 group-hover:bg-blue-50 transition-colors">
                    <Upload className="w-6 h-6 group-hover:text-blue-500 transition-colors"/>
                  </div>
                  <span className="text-xs font-medium">คลิกเพื่ออัปโหลด</span>
              </div>
          )}

          <label className="cursor-pointer block">
              <span className="flex items-center justify-center w-full py-2.5 px-4 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-[0.98]">
                  {currentImage ? "เปลี่ยนไฟล์แนบ" : "เลือกไฟล์จากเครื่อง"}
              </span>
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={onFileChange} />
          </label>
      </div>
    );
};

export default ImageUpload;