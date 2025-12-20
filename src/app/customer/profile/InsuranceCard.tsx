import { useRouter } from "next/navigation";
import { Prompt } from "next/font/google";

export type InsuranceStatus =
  | "active"
  | "expiring"
  | "expired"
  | "processing"
  | "pending_payment"
  | "rejected";

export type InsurancePolicy = {
  id: string;
  status: InsuranceStatus;
  date: string;
  title: string;
  registration: string;
  policyNumber: string;
  rejectReason?: string; 
};

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
    borderColor: "border-amber-600",
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
  // ✅ แก้ไขตรงนี้: กำหนดสีขอบเป็นสีฟ้า (border-blue-600)
  pending_payment: {
    text: "รอการชำระเงิน",
    badgeColor: "bg-blue-600", 
    borderColor: "border-amber-600",
    dateLabel: "อัปเดต",
  },
  rejected: {
    text: "ถูกปฏิเสธ",
    badgeColor: "bg-red-600",
    borderColor: "border-amber-600",
    dateLabel: "อัปเดต",
  },
};

export const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

type InsuranceCardProps = {
  policy: InsurancePolicy;
  className?: string;
};

export default function InsuranceCard({
  policy,
  className = "",
}: InsuranceCardProps) {
  const router = useRouter();
  const config = statusConfig[policy.status];

  const isPendingPayment = policy.status === "pending_payment";
  const isRejected = policy.status === "rejected";

  return (
    // ✅ ใช้ config.borderColor ที่เรากำหนดไว้ด้านบน
    <div className={`card border-t-4 ${config.borderColor} ${className} bg-white p-4 rounded-lg shadow-sm border border-gray-200`}>
      
      {/* ส่วนหัว: ป้ายสถานะ & วันที่ */}
      <div className="flex justify-between items-start mb-3">
        <span className={`px-3 py-1 rounded-full text-xs text-white font-medium ${config.badgeColor}`}>
          {config.text}
        </span>
        
        <div className="text-right flex flex-col items-end">
            <span className="text-sm text-gray-700 font-semibold">
              {config.dateLabel}: {policy.date}
            </span>
            
            {isRejected && policy.rejectReason && (
                <span className="text-xs text-red-600 font-medium mt-1 max-w-[200px] truncate" title={policy.rejectReason}>
                    (เหตุผล: {policy.rejectReason})
                </span>
            )}
        </div>
      </div>

      <p className="text-sm text-gray-700 font-medium mb-1">
        <b>ประกันรถยนต์:</b> {policy.title.split(": ")[1] || policy.title}
      </p>
      <p className="text-sm text-gray-600">ทะเบียน: {policy.registration}</p>
      <p className="text-sm text-gray-600 mb-4">
        เลขกรมธรรม์: {policy.policyNumber}
      </p>

      <div className="flex justify-between gap-3">
        <button
          className="flex-1 bg-slate-700 text-white py-2 rounded-md hover:bg-slate-800 transition text-sm font-medium"
          onClick={() => router.push(`/customer/purchase/${policy.id}`)}
        >
          <i className="fa-regular fa-file-lines mr-2"></i> ดูเอกสาร
        </button>

        <button
          className={`flex-1 py-2 rounded-md text-white transition text-sm font-medium ${
            isPendingPayment
              ? "bg-blue-600 hover:bg-blue-700" // ✅ ปุ่มสีฟ้า
              : isRejected
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={() =>
            router.push(`/customer/contact-agent?purchaseId=${policy.id}`)
          }
        >
          <i className="fa-solid fa-phone-volume mr-2"></i>
          {isPendingPayment ? "ชำระเงิน" : "ติดต่อเจ้าหน้าที่"}
        </button>
      </div>
    </div>
  );
}