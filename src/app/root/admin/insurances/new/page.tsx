import React from 'react'
import InsuranceFormNew from './InsuranceFormNew'
import MenuAdmin from '@/components/element/MenuAdmin'
import { Suspense } from 'react';

function page() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <MenuAdmin activePage='/root/admin/insurances'/>
      < InsuranceFormNew />
    </Suspense>
  )
}

export default page
