"use client";

import React from 'react'
import dynamic from 'next/dynamic'
import MenuLogined from '@/components/element/MenuLogined'

// ✅ ใช้ dynamic import และปิด ssr: false
// เพื่อให้ Next.js ข้ามการ Render หน้านี้ตอน Build (แก้ error จอฟ้า)
const EditProfileForm = dynamic(
  () => import('@/app/customer/profile/edit-profile/EditProfileForm'), 
  { ssr: false }
);

function Page() {
  return (
    <>
      <MenuLogined activePage='/customer/profile/edit-profile'/>
      <EditProfileForm />
    </>
  )
}

export default Page