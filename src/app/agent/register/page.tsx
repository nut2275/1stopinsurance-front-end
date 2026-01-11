import { Suspense } from 'react';
import RegisterAgentPage from '@/app/agent/register/Register_AgentPage'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterAgentPage />
    </Suspense>
  )
}

export default page
