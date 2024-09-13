'use client'

import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { useRouter } from 'next/navigation'

export default function Home() {
  const condos = useQuery(api.condos.getCondosByUserId, {})
  const router = useRouter()

  if (condos && condos.length <= 0) {
    router.push('/dashboard/condos/new-condo')
  }

  return (
    <div className=''>
      <h1 className='text-2xl font-semibold'>Overview</h1>
    </div>
  )
}
