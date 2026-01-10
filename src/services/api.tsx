// /services/api.ts
import axios from "axios";

// ✅ ใช้ตัวแปรจาก .env
// ถ้าหาไม่เจอ ให้กันเหนียวไว้ที่ localhost (Optional)
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: baseURL, // url ของ API
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;