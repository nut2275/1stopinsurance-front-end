import React from 'react'
import CustomerTable from '@/app/root/admin/customers/CustomerTable'
import {customerPolicies} from '@/app/root/admin/customers/mockData'
export default function page() {
  return (
    <div>
      <CustomerTable initialData={customerPolicies} />
    </div>
  )
}
