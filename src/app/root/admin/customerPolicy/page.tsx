import React from 'react'
import CustomerPolicy from './CustomerPolicy'
import MenuAdmin from '@/components/element/MenuAdmin'

function page() {
  return (
    <div>
      <MenuAdmin activePage='/root/admin/customerPolicy'/>
      <CustomerPolicy />
    </div>
  )
}

export default page
