import React from 'react'
import InsuranceFormNew from './InsuranceFormNew'
import MenuAdmin from '@/components/element/MenuAdmin'

function page() {
  return (
    <div>
      <MenuAdmin activePage='/root/admin/insurances/new'/>
      < InsuranceFormNew />
    </div>
  )
}

export default page
