
import { Prompt } from "next/font/google"; // นำ Font มาไว้ที่นี่

//================================================================
// 2. TYPES (จาก lib/types.ts)
//================================================================
export type InsuranceStatus =
  | "active"
  | "expiring"
  | "expired"
  | "processing"
  | "pending_payment";


export type InsurancePolicy = {
  id: string;
  status: InsuranceStatus;
  date: string;
  title: string;
  registration: string;
  policyNumber: string;
};


//--- Component: InsuranceCard ---
type StatusDetails = {
  text: string;
  badgeColor: string;
  borderColor: string;
  dateLabel: string;
};
const statusConfig: Record<InsuranceStatus, StatusDetails> = {
  active: {
    text: "กำลังใช้งาน",
    badgeColor: "bg-green-600",
    borderColor: "border-green-600",
    dateLabel: "หมดอายุ",
  },
  expiring: {
    text: "ใกล้หมดอายุ",
    badgeColor: "bg-red-600",
    borderColor: "border-red-600",
    dateLabel: "หมดอายุ",
  },
  expired: {
    text: "หมดอายุแล้ว",
    badgeColor: "bg-gray-500",
    borderColor: "border-gray-500",
    dateLabel: "หมดอายุ",
  },
  processing: {
    text: "กำลังดำเนินการ",
    badgeColor: "bg-amber-500",
    borderColor: "border-amber-500",
    dateLabel: "อัปเดต",
  },
  pending_payment: {
    text: "รอการชำระเงิน",
    badgeColor: "bg-orange-600",
    borderColor: "border-orange-600",
    dateLabel: "กำหนดชำระ",
  },
};



export const policies: InsurancePolicy[] = [
  {
    id: "p1",
    status: "active",
    date: "20/08/68",
    title: "ประกันรถยนต์: วิริยะประกันภัย ชั้น 1",
    registration: "เครชู้ 88",
    policyNumber: "1124692",
  },
  {
    id: "p2",
    status: "expiring",
    date: "20/08/68",
    title: "ประกันรถยนต์: วิริยะประกันภัย ชั้น 1",
    registration: "เครชู้ 88",
    policyNumber: "1124692",
  },
  {
    id: "p3",
    status: "expired",
    date: "01/06/68",
    title: "ประกันรถยนต์: ธนชาตประกันภัย ชั้น 2+",
    registration: "พร 2214",
    policyNumber: "5578912",
  },
  {
    id: "p4",
    status: "processing",
    date: "15/09/68",
    title: "ประกันรถยนต์: วิริยะประกันภัย ชั้น 1",
    registration: "เครชู้ 88",
    policyNumber: "1124692",
  },
  {
    id: "p5",
    status: "pending_payment",
    date: "25/09/68",
    title: "ประกันรถยนต์: วิริยะประกันภัย ชั้น 1",
    registration: "เครชู้ 88",
    policyNumber: "1124692",
  },
];


//================================================================
// 5. FONT SETUP (จาก layout.tsx)
//================================================================
export const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});


type InsuranceCardProps = {
  policy: InsurancePolicy;
  className?: string;
};
export default function InsuranceCard({ policy, className = "" }: InsuranceCardProps) {
  const config = statusConfig[policy.status];
  return (
    <div className={`card border-t-4 ${config.borderColor} ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`status-badge ${config.badgeColor}`}>
          {config.text}
        </span>
        <span className="text-sm text-gray-700 font-semibold">
          {config.dateLabel}: {policy.date}
        </span>
      </div>
      <p className="text-sm text-gray-700">
        <b>ประกันรถยนต์:</b> {policy.title.split(": ")[1]}
      </p>
      <p className="text-sm text-gray-600">ทะเบียน: {policy.registration}</p>
      <p className="text-sm text-gray-600 mb-4">
        เลขกรมธรรม์: {policy.policyNumber}
      </p>
      <div className="flex justify-between gap-2">
        <button className="btn btn-dark flex-1">
          <i className="fa-regular fa-file-lines mr-2"></i> ดูเอกสาร
        </button>
        <button className="btn btn-green flex-1">
          <i className="fa-solid fa-phone-volume mr-2"></i> ติดต่อเจ้าหน้าที่
        </button>
      </div>
    </div>
  );
}