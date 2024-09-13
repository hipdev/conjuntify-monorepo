'use client'

import { cn } from '@/lib/utils'
import { useSidebarStore } from './sidebar-store'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'

export default function MainWrapper({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed)

  const user = useQuery(api.users.currentUser, {})

  if (!user) {
    console.log('User not found')
  }

  return <div className={cn('w-full', isCollapsed ? 'pl-11' : 'pl-52')}>{children}</div>
}
