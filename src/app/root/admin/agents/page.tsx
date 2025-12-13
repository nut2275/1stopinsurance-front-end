import React from 'react'
import AgentTable from './AgentTable'
import MenuAdmin from '@/components/element/MenuAdmin'

export default function page() {
  return (
    <div>
      <MenuAdmin activePage='/root/admin/agents' />
      <AgentTable />
    </div>
  )
}
