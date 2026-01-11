import React from 'react'
import LoginForm from '@/app/customer/login/LoginForm'
import { Suspense } from 'react';

function page() {
  return (
    <Suspense fallback={<div>Loading summary...</div>}>
      <LoginForm />
    </Suspense>
  )
}

export default page
