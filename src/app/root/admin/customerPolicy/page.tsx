import React from 'react'
import CustomerPolocy from './CustomerPolocy'
import MenuAdmin from '@/components/element/MenuAdmin'

function page() {
  return (
    <div>
      <MenuAdmin activePage='/root/admin/dashboard'/>
      <CustomerPolocy />
    </div>
  )
}

export default page
