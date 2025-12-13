// src/utils/insuranceHelpers.ts

export interface InsurancePlan {
  id: number | string;
  company: string;
  logoSrc: string;
  level: string;
  repairType: string; // "อู่" | "ห้าง"
  features: string[];
  premium: number;
  coverageAmount: number;
  installment: string;
  hasFloodCoverage?: boolean;
  hasFireCoverage?: boolean;
  personalAccidentCoverageIn?: number;
}

export const getBrandLogo = (brandName: string) => {
  if (!brandName) return "/fotos/Insur1.png";

  const name = brandName.toLowerCase();
  if (name.includes("วิริยะ")) return "/fotos/Insur5.png";
  if (name.includes("กรุงเทพ")) return "/fotos/Insur6.png"; // แก้ให้ตรงกับไฟล์จริงของคุณ
  if (name.includes("เมืองไทย")) return "/fotos/Insur2.png";
  if (name.includes("ธนชาต")) return "/fotos/Insur3.png";
  if (name.includes("ทิพย")) return "/fotos/Insur1.png";
  if (name.includes("มิตรแท้")) return "/fotos/Insur4.png";
  if (name.includes("ไทยศรี")) return "/fotos/InsurDefault.png"; // เพิ่มตามต้องการ
  
  return "/fotos/Insur1.png";
};