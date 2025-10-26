import React from 'react'
import AgentPageDashboard from '@/app/agent/agent_dashboard/AgentPageDashboard'
import MenuAgent from '@/components/element/MenuAgent'

function page() {
  return (
    <>
      <MenuAgent activePage="/agent/agent_dashboard"/>
      <AgentPageDashboard />
    </>
  )
}

export default page
