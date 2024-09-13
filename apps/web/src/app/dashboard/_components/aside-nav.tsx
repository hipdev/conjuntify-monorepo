'use client'

import { Bell, Building2, Handshake, Home } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSidebarStore } from './sidebar-store'
import CustomLink from '@/components/design-system/custom-link'
import { Id } from '@packages/backend/convex/_generated/dataModel'

export default function AsideNav({ condoId }: { condoId: Id<'condos'> }) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed)

  const iconClassName = cn(
    'h-auto w-5 text-sm',
    isCollapsed ? 'text-neutral-500' : 'text-gray-500/80'
  )

  return (
    <nav>
      <CustomLink
        href='/'
        IconComponent={<Home className={iconClassName} />}
        label='Reservas'
        isCollapsed={isCollapsed}
      />
      <CustomLink
        href={`/dashboard/${condoId}/users`}
        IconComponent={<Bell size={20} className={iconClassName} />}
        label='Usuarios'
        isCollapsed={isCollapsed}
      />
      <CustomLink
        href={`/dashboard/${condoId}/user-requests`}
        IconComponent={<Bell size={20} className={iconClassName} />}
        label='Solicitudes'
        isCollapsed={isCollapsed}
      />

      <h5
        className={cn(
          'pb-2 pl-5 pt-10 font-medium uppercase text-gray-500',
          isCollapsed && 'hidden'
        )}
      >
        Recursos
      </h5>

      <div className={cn('w-full border-t border-white/30 px-5 pt-6', !isCollapsed && 'hidden')} />

      <CustomLink
        href='/'
        IconComponent={<Building2 size={20} className={iconClassName} />}
        label='Apartamentos'
        isCollapsed={isCollapsed}
      />

      <CustomLink
        href='/'
        IconComponent={<Handshake size={20} className={iconClassName} />}
        label='Áreas comunes'
        isCollapsed={isCollapsed}
      />
    </nav>
  )
}
