import React from 'react'
import EditProfileForm from '@/app/customer/profile/edit-profile/EditProfileForm'
import MenuLogined from '@/components/element/MenuLogined'

function page() {
  return (
    <>
      <MenuLogined activePage='/customer/profile/edit-profile'/>
      <EditProfileForm />
    </>
  )
}

export default page
