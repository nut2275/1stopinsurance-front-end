//================================================================
// 1. CSS STYLES (จาก globals.css)
//================================================================
/* เราสร้าง component นี้เพื่อฝัง CSS ทั้งหมดลงไปในหน้า
  โดยใช้ <style jsx global>
*/
export const GlobalStyles = () => (
  <style jsx global>{`
    /* Tailwind base (จำเป็น) */

    /* Custom styles จาก globals.css */
    body {
      background-color: #f9fafb;
    }

    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      padding: 20px;
      transition: 0.2s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1);
    }

    .status-badge {
      font-weight: 600;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s ease;
      padding: 8px 12px;
      cursor: pointer; /* เพิ่ม cursor pointer ให้ */
    }

    .btn-dark {
      background-color: #374151;
      color: white;
    }
    .btn-dark:hover {
      background-color: #111827;
    }

    .btn-green {
      background-color: #16a34a;
      color: white;
    }
    .btn-green:hover {
      background-color: #15803d;
    }

    /* --- ส่วนที่เพิ่มใหม่สำหรับปุ่มชำระเงิน --- */
    .btn-orange {
      background-color: #ea580c; /* สีส้มแบบ Tailwind orange-600 */
      color: white;
    }
    .btn-orange:hover {
      background-color: #c2410c; /* สีส้มเข้มตอนเอาเมาส์ชี้ orange-700 */
    }
  `}</style>
);