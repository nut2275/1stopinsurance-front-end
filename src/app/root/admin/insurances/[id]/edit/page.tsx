import React from 'react'
import InsuranceFormEdit from './InsuranceFormEdit'
import MenuAdmin from '@/components/element/MenuAdmin'

function page() {
  return (
    <div>
      <MenuAdmin activePage='/root/admin/insurances'/>
      <InsuranceFormEdit />
    </div>
  )
}

export default page
