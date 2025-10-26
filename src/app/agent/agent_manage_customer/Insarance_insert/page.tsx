import React from 'react'
import Insarance_insertPage from './Insarance_insertPage'
import MenuAgent from '@/components/element/MenuAgent'

export default function page() {
  return (
    <>
        <MenuAgent activePage='/agent/agent_manage_customer' />
        <Insarance_insertPage />
    </>
  )
}

