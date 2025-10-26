// mockData.ts
import { CustomerPolicy } from '@/types/dataType';

export const customerPolicies: CustomerPolicy[] = [
  { id: 1, name: "นาย พลอ สุภาพ", type: "รถยนต์ ชั้น 1", company: "วิริยะ", policy: "0123-49BAS01", status: "คุ้มครอง" },
  { id: 2, name: "นาง สวยสุด ใจดี", type: "สุขภาพ", company: "ธนชาต", policy: "0456-88THAI", status: "หมดอายุ" },
  { id: 3, name: "นาย วีรวัฒน์ ขยันขาย", type: "ชีวิต", company: "เมืองไทย", policy: "0977-11LIFE", status: "กำลังดำเนินการ" },
  { id: 4, name: "น.ส. มินตรา เก่งกาจ", type: "รถยนต์ พ.ร.บ.", company: "อาคเนย์", policy: "0012-77PRB", status: "คุ้มครอง" },
  { id: 5, name: "นาย สมชาย รักชาติ", type: "สุขภาพ", company: "กรุงเทพ", policy: "0333-22MED", status: "กำลังดำเนินการ" },
];