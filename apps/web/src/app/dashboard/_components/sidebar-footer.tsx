'use client'

import DropdownUser from './dropdown-user'
import SidebarHotkeys from './sidebar-hotkeys'

export default function SidebarFooter({ condoId }: { condoId: string }) {
  return (
    <div>
      {condoId && <SidebarHotkeys />}

      <DropdownUser />
    </div>
  )
}
