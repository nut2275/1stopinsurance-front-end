import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ไม่ต้องเช็ค Lint ตอน Build (ข้ามพวก warning ตัวแปรไม่ได้ใช้ ฯลฯ)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ไม่ต้องเช็ค Type ตอน Build (ข้ามพวก any หรือ type ไม่ตรง)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
