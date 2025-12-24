export const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
  "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา",
  "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
  "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์",
  "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี",
  "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร",
  "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู",
  "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
].sort();

export const INSURANCE_COMPANIES = ["ทั้งหมด", "มิตรแท้ประกันภัย", "วิริยะประกันภัย", "กรุงเทพประกันภัย", "ธนชาตประกันภัย", "เมืองไทยประกันภัย", "ทิพยประกันภัย"];

export const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    pending: { label: "รอตรวจสอบ", color: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
    pending_payment: { label: "รอชำระเงิน", color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    active: { label: "คุ้มครองแล้ว", color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
    about_to_expire: { label: "ใกล้หมดอายุ", color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
    expired: { label: "หมดอายุ", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
    rejected: { label: "ไม่ผ่าน/ปฏิเสธ", color: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
};

export const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || { label: status, color: "bg-gray-100 text-gray-700 border-gray-200", dot: "bg-gray-400" };
};

export const getAvatarColor = (name: string) => {
    const colors = [
        "bg-red-100 text-red-600", "bg-orange-100 text-orange-600", "bg-amber-100 text-amber-600",
        "bg-green-100 text-green-600", "bg-emerald-100 text-emerald-600", "bg-teal-100 text-teal-600",
        "bg-cyan-100 text-cyan-600", "bg-sky-100 text-sky-600", "bg-blue-100 text-blue-600",
        "bg-indigo-100 text-indigo-600", "bg-violet-100 text-violet-600", "bg-purple-100 text-purple-600",
        "bg-fuchsia-100 text-fuchsia-600", "bg-pink-100 text-pink-600", "bg-rose-100 text-rose-600"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

export const getTodayString = () => new Date().toISOString().split('T')[0];

export const addYearsToDate = (dateStr: string, years: number): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString().split('T')[0];
};

export const formatDateForInput = (isoDateString?: string) => {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return ""; 
    return date.toISOString().split('T')[0];
};

// Check if active policy is expiring within 30 days
export const checkIsAboutToExpire = (endDateString?: string): boolean => {
    if (!endDateString) return false;
    const today = new Date();
    const endDate = new Date(endDateString);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
};

// Main function
export const formatThaiDate = (isoString: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("th-TH", { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// ✅ Export Alias เพื่อแก้ Error 'formatTableDate is not a function'
export const formatTableDate = formatThaiDate;