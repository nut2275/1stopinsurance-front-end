import React from 'react'
import MenuAgent from '@/components/element/MenuAgent';
import AgentNotificationPage from './AgentNotificationPage'

export default function page() {
  return (
    <>
        <MenuAgent activePage="notification" />
        <AgentNotificationPage />
    </>
  )
}


