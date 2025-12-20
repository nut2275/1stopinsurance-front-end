import React from 'react'
import CustomerPolicy from './CustomerPolicy'
import MenuAdmin from '@/components/element/MenuAdmin'

function page() {
  return (
    <div>
      <MenuAdmin activePage='/root/admin/dashboard'/>
      <CustomerPolicy />
    </div>
  )
}

export default page
