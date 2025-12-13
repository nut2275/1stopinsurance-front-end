import React from 'react'
import InsuranceManage from './InsuranceManage'
import MenuAdmin from '@/components/element/MenuAdmin'

function page() {
  return (
    <div>
      <MenuAdmin activePage='/root/admin/insurances'/>
      < InsuranceManage />
    </div>
  )
}

export default page
