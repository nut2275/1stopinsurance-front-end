import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { Customer } from '@/types/dataType';




function ProfileCard({ user }: { user: Customer | null }) {


  return (
    <section className="max-w-5xl mx-auto mt-10 mb-8 bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative mx-4 md:mx-auto">
      <div className="flex-shrink-0">
        <Image
          src={user?.imgProfile_customer || "/fotos/noPrafile.jpg"}
          alt="Profile Image"
          width={128}
          height={128}
          className="object-cover rounded-full border-4 border-blue-500 shadow-sm"
          priority
        />
      </div>

      <div className="flex-1 text-center md:text-left">
        <div className="flex justify-center md:justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {user ? `${user.first_name} ${user.last_name}` : "กำลังโหลด..."}
          </h2>
          {user && (
            <Link href="/edit-profile" title="แก้ไขโปรไฟล์">
              <i className="fa-solid fa-pen-to-square text-2xl text-gray-600 hover:text-blue-800 cursor-pointer transition hidden md:block"></i>
            </Link>
          )}
        </div>

        {user ? (
          <p className="text-sm text-gray-600 leading-relaxed">
            📍 ที่อยู่: {user.address}
            <br />
            ✉️ email: {user.email}
            <br />
            📞 เบอร์โทร: {user.phone}
            <br />
            🎂 วันเกิด: {new Date(user.birth_date).toLocaleDateString("th-TH")}
          </p>
        ) : (
          <p className="text-sm text-gray-500 italic">กำลังโหลดข้อมูลโปรไฟล์...</p>
        )}
      </div>

      {user && (
        <Link href="/edit-profile" title="แก้ไขโปรไฟล์" className="md:hidden mt-2">
          <i className="fa-solid fa-pen-to-square text-2xl text-gray-600 hover:text-blue-800 cursor-pointer transition"></i>
        </Link>
      )}
    </section>
  );
}

export default ProfileCard;
