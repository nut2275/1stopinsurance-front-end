import React from 'react'
import CustomerTable from '@/app/root/admin/customers/CustomerTable'
import {customerPolicies} from '@/app/root/admin/customers/mockData'
import MenuAdmin from '@/components/element/MenuAdmin'
      
export default function page() {
  return (
    <div>
      <MenuAdmin activePage='/root/admin/customers' />
      <CustomerTable initialData={customerPolicies} />
    </div>
  )
}
