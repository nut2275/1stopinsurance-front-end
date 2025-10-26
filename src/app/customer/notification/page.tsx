import React from 'react'
import NotificationsPage from '@/app/customer/notification/NotificationsPage'
import MenuLogined from '@/components/element/MenuLogined';


function page() {
  return (
    <>
      {/* Header */}
      <MenuLogined />
      
      <NotificationsPage />
    </>
  )
}

export default page
