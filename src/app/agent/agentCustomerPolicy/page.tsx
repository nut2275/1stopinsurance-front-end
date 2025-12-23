import React from 'react'
import AgentPolicyPage from './AgentCustomerPolicy'
import MenuAgent from '@/components/element/MenuAgent'

function page() {
  return (
    <div>
      <MenuAgent activePage="/agent/agentCustomerPolicy"/>
      <AgentPolicyPage />
    </div>
  )
}

export default page
