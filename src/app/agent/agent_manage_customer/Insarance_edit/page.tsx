import React from 'react'
import InsaranceEditPage from './InsaranceEditPage'
import MenuAgent from '@/components/element/MenuAgent';

function page() {
  return (
    <>
        <MenuAgent activePage="/agent/agent_manage_customer" />
        <InsaranceEditPage />
    </>
  )
}

export default page
