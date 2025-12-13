"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/services/api";
import MenuLogined from "@/components/element/MenuLogined";

const fetcher = async (url: string) => {
  const res = await api.get(url);
  return res.data;
};

export default function AgentContactPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const router = useRouter();

  const { data, error, isLoading } = useSWR(
    purchaseId ? `/purchase/${purchaseId}/agent` : null,
    fetcher
  );

  if (isLoading) {
    return <p className="text-center mt-10">กำลังโหลดข้อมูลเจ้าหน้าที่...</p>;
  }

  if (error || !data) {
    return (
      <p className="text-center mt-10 text-red-600">
        ไม่พบข้อมูลเจ้าหน้าที่
      </p>
    );
  }

  const hasLine = data.idLine && data.idLine.trim() !== "";

  const openLineChat = () => {
    if (!hasLine) return;
    window.open(`https://line.me/R/ti/p/~${data.idLine}`, "_blank");
  };

  const profileImage =
    data.imgProfile && data.imgProfile !== ""
      ? data.imgProfile
      : "/images/avatar-placeholder.png"; // 👈 รูป fallback

  return (
    <>
      <MenuLogined activePage="/customer/profile" />

      <main className="max-w-xl mx-auto px-4 py-10">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 font-semibold"
        >
          ← กลับ
        </button>

        <div className="border rounded-2xl p-6 shadow-md text-center bg-white">
          <h1 className="text-2xl font-bold mb-6">
            ติดต่อเจ้าหน้าที่เพื่อชำระค่าประกัน
          </h1>

          {/* ===== รูปโปรไฟล์ ===== */}
          <div className="flex justify-center mb-4">
            <img
              src={profileImage}
              alt="Agent Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow"
            />
          </div>

          {/* ===== ชื่อ ===== */}
          <p className="text-xl font-semibold">
            {data.first_name} {data.last_name}
          </p>

          {/* ===== License ===== */}
          <p className="text-gray-600 mt-1">
            เลขที่ใบอนุญาตตัวแทน: {data.agent_license_number}
          </p>

          {/* ===== โทร ===== */}
          <p className="text-gray-700 mt-4">
            📞 โทรศัพท์:{" "}
            <a
              href={`tel:${data.phone}`}
              className="font-semibold text-blue-600"
            >
              {data.phone}
            </a>
          </p>

          {/* ===== LINE ===== */}
          <div className="mt-4">
            <p className="text-gray-700 mb-1">LINE ID</p>
            {hasLine ? (
              <p className="text-lg font-bold text-green-700">
                {data.idLine}
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                ไม่มีข้อมูล LINE
              </p>
            )}
          </div>

          {/* ===== ปุ่ม LINE ===== */}
          <button
            onClick={openLineChat}
            disabled={!hasLine}
            className={`mt-6 w-full py-3 rounded-lg text-lg font-semibold transition
              ${
                hasLine
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            <i className="fa-brands fa-line mr-2"></i>
            แชท LINE กับเจ้าหน้าที่
          </button>
        </div>
      </main>
    </>
  );
}
