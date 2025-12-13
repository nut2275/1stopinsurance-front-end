import React from 'react'
import Dashboard from '@/app/root/admin/dashboard/Dashboard'
import MenuAdmin from '@/components/element/MenuAdmin'

export default function page() {
  return (
    <div>
      <MenuAdmin activePage='/root/admin/dashboard'/>
      <Dashboard />
    </div>
  )
}
