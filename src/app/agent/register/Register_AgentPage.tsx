"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/services/api";
import MenuLogin from "@/components/element/MenuLogin";

export default function RegisterAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    agent_license_number: "",
    card_expiry_date: "",
    address: "",
    phone: "",
    birth_date: "",
    username: "",
    password: "",
    passwordConfirm: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "edit") {
      setIsEdit(true);
      setForm({
        first_name: searchParams.get("name") || "",
        last_name: searchParams.get("last_name") || "",
        agent_license_number: searchParams.get("agent_license_number") || "",
        card_expiry_date: searchParams.get("card_expiry_date") || "",
        address: searchParams.get("address") || "",
        phone: searchParams.get("phone") || "",
        birth_date: searchParams.get("birth_date") || "",
        username: searchParams.get("username") || "",
        password: searchParams.get("password") || "",
        passwordConfirm: searchParams.get("passwordConfirm") || "",
      });
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // setForm({ ...form, [e.target.id]: e.target.value });
    const { id, value } = e.target;
    if (id === "phone") {
      // เอาเฉพาะตัวเลข 0-9
      const numericValue = value.replace(/\D/g, "");
      setForm({ ...form, [id]: numericValue });
    } else {
      setForm({ ...form, [id]: value });
    }
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if(form.password !== form.passwordConfirm) return alert("ยืนยันรหัสผ่านไม่ตรงกับ รหัสผ่าน")

    try {
      await api.post('/agents/register', form)
      alert("บันทึกข้อมูลสำเร็จ!");
      router.push("/agent/login");
    }catch (err){
      console.log(err);
      alert('การสมัครสมาชิกไม่สำเร็จ')
    }
    
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f6ff] text-gray-800 font-sans">
      {/* Navbar */}
      <MenuLogin />

      {/* Main */}
      <main className="max-w-4xl w-full mx-auto bg-white shadow rounded-xl mt-10 px-8 sm:px-15 py-8">
        <h1 className="text-center text-2xl font-bold text-blue-900 mb-6">
          {isEdit ? "แก้ไขข้อมูลตัวแทน" : "สมัครสมาชิกนายหน้า"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block font-medium mb-1">
                ชื่อ
              </label>
              <input
                id="first_name"
                type="text"
                placeholder="ชื่อ"
                value={form.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block font-medium mb-1">
                นามสกุล
              </label>
              <input
                id="last_name"
                type="text"
                placeholder="นามสกุล"
                value={form.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
          </div>

          {/* License */}
          <div>
            <label htmlFor="agent_license_number" className="block font-medium mb-1">
              เลขที่ใบอนุญาตนายหน้าประกันภัย
            </label>
            <input
              id="agent_license_number"
              type="text"
              placeholder="เลขที่ใบอนุญาตนายหน้าประกันภัย"
              value={form.agent_license_number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          {/* Card expiry */}
          <div>
            <label htmlFor="card_expiry_date" className="block font-medium mb-1">
              วันหมดอายุบัตร
            </label>
            <input
              placeholder="วันหมดอายุบัตร"
              id="card_expiry_date"
              type="date"
              required
              value={form.card_expiry_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block font-medium mb-1">
              ที่อยู่
            </label>
            <textarea
              placeholder="ที่อยู่"
              id="address"
              rows={2}
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          {/* Phone & Birth Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block font-medium mb-1">
                เบอร์โทร
              </label>
              <input
                id="phone"
                type="tel"              // ใช้ tel ดีกว่าถ้าเป็นเบอร์โทร
                inputMode="numeric"     // บนมือถือจะโชว์ numeric keyboard
                pattern="[0-9]*"        // รับเฉพาะตัวเลข
                placeholder="เบอร์โทร"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="birth_date" className="block font-medium mb-1">
                วันเกิด
              </label>
              <input
                placeholder="วันเกิด"
                id="birth_date"
                type="date"
                value={form.birth_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="username" className="block font-medium mb-1">
                Username
              </label>
              <input
                placeholder="username"
                id="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block font-medium mb-1">
                รหัสผ่าน
              </label>
              <input
                placeholder="รหัสผ่าน"
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block font-medium mb-1">
              ยืนยัน รหัสผ่าน
            </label>
            <input
              placeholder="ยืนยัน รหัสผ่าน"
              id="passwordConfirm"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-700 w-full mt-4 text-white px-4 py-2 rounded hover:bg-blue-800"
            onSubmit={handleSubmit}
          >
            สมัครสมาชิก
          </button>

          <p className="mt-2 text-sm text-gray-600 text-center">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/agent/login" className="text-blue-600 font-semibold hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </main>

      {/* Footer */}
      <div className="mt-20 w-full">
      </div>
    </div>
  );
}



// "use client";



// import { useEffect, useState } from "react";
// import api from "@/services/api";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import Footer from "@/components/element/Footer";

// export default function RegisterAgentPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [form, setForm] = useState({
//     first_name: "",
//     last_name: "",
//     agent_license_number: "",
//     card_expiry_date: "",
//     address: "",
//     phone: "",
//     birth_date: "",
//     username: "",
//     password: "",
//     passwordConfirm: "",
//     imgProfile: "",
//     idLine: "",
//     note: "",
//   });

//   const [isEdit, setIsEdit] = useState(false);

//   useEffect(() => {
//     const action = searchParams.get("action");
//     if (action === "edit") {
//       setIsEdit(true);
//       setForm({
//         first_name: searchParams.get("first_name") || "",
//         last_name: searchParams.get("last_name") || "",
//         agent_license_number: searchParams.get("agent_license_number") || "",
//         card_expiry_date: searchParams.get("card_expiry_date") || "",
//         address: searchParams.get("address") || "",
//         phone: searchParams.get("phone") || "",
//         birth_date: searchParams.get("birth_date") || "",
//         username: searchParams.get("username") || "",
//         password: searchParams.get("password") || "",
//         passwordConfirm: searchParams.get("passwordConfirm") || "",
//         imgProfile: searchParams.get("imgProfile") || "",
//         idLine: searchParams.get("idLine") || "",
//         note: searchParams.get("note") || "",
//       });
//     }
//   }, [searchParams]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.id]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (form.password !== form.passwordConfirm) {
//       alert("รหัสผ่านไม่ตรงกัน");
//       return;
//     }

//     try {
//       const payload = {
//         first_name: form.first_name,
//         last_name: form.last_name,
//         agent_license_number: form.agent_license_number,
//         card_expiry_date: form.card_expiry_date,
//         address: form.address,
//         phone: form.phone,
//         birth_date: form.birth_date,
//         username: form.username,
//         password: form.password,
//         imgProfile: form.imgProfile,
//         idLine: form.idLine,
//         note: form.note,
//       };

//       const res = await api.post("/agents/create", payload);
//       if (res.status === 201) {
//         alert("สร้างบัญชีตัวแทนสำเร็จ!");
//         router.push("/login");
//       }
//     } catch (err: unknown) {
//       if (err instanceof Error) alert(err.message);
//       else alert("สร้างบัญชีล้มเหลว");
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-[#f0f6ff] text-gray-800 font-sans">
//       {/* Navbar */}
//       <header className="bg-white shadow flex justify-between items-center px-4 sm:px-10 py-4 sticky top-0 z-20">
//         <a href="/manage-agent" className="flex items-center space-x-2">
//           <Image src="/fotos/Logo.png" alt="Logo" width={40} height={40} />
//           <span className="text-xl font-bold text-[#1d4ed8]">1StopInsurance</span>
//         </a>
//         <div className="border border-[#1d4ed8] px-4 py-1 rounded-full text-[#1d4ed8] font-semibold">Admin</div>
//       </header>

//       <main className="max-w-4xl w-full mx-auto bg-white shadow rounded-xl mt-10 px-4 sm:px-10 py-8">
//         <h1 className="text-center text-2xl font-bold text-blue-900 mb-6">
//           {isEdit ? "แก้ไขข้อมูลตัวแทน" : "สมัครสมาชิกนายหน้า"}
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* First & Last Name */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input id="first_name" placeholder="ชื่อ" value={form.first_name} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
//             <input id="last_name" placeholder="นามสกุล" value={form.last_name} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
//           </div>

//           <input id="agent_license_number" placeholder="เลขที่ใบอนุญาต" value={form.agent_license_number} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
//           <input id="card_expiry_date" type="date" placeholder="วันหมดอายุบัตร" value={form.card_expiry_date} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
//           <textarea id="address" placeholder="ที่อยู่" value={form.address} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input id="phone" placeholder="เบอร์โทร" value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
//             <input id="birth_date" type="date" placeholder="วันเกิด" value={form.birth_date} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
//           </div>

//           <input id="username" placeholder="Username" value={form.username} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
//           <input id="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
//           <input id="passwordConfirm" type="password" placeholder="Confirm Password" value={form.passwordConfirm} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" required />
          
//           {/* Optional */}
//           <input id="imgProfile" placeholder="URL Profile" value={form.imgProfile} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
//           <input id="idLine" placeholder="LINE QR URL" value={form.idLine} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
//           <textarea id="note" placeholder="หมายเหตุ" value={form.note} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />

//           <button type="submit" className="bg-blue-700 w-full mt-4 text-white px-4 py-2 rounded hover:bg-blue-800">
//             สมัครสมาชิก
//           </button>
//         </form>
//       </main>

//       <Footer />
//     </div>
//   );
// }
