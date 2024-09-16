'use client'

import { useState } from 'react'
import { CheckCircle, HousePlus, Trash2, XCircle } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { Input } from '@/components/ui/input'
import { useQuery } from 'convex/react'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'

// Tipo para los datos de usuario
type User = {
  apartamento: string
  edificio: string
  celular: string
  whatsapp: boolean
  propietario: boolean
  identificacion: string
  matricula: string
}

// Datos de ejemplo

const statusValues = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado'
}

export default function UserRequestsPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const condoId = params.condoId as Id<'condos'>

  const userRequests = condoId ? useQuery(api.condos.getCondoTemporalUsers, { condoId }) : null
  const userId = searchParams.get('userId')

  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = userRequests?.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const openDrawer = (userId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('userId', userId)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('userId')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className='min-h-screen bg-black p-8 text-white'>
      <Drawer direction='right' open={!!userId} onOpenChange={closeDrawer}>
        <DrawerContent className='fixed bottom-0 right-0 mt-24 flex h-full w-[400px] flex-col bg-white'>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>

      <div className='mx-auto max-w-6xl space-y-8'>
        <h1 className='text-3xl font-bold'>Solicitudes de usuarios</h1>

        <Input
          placeholder='Buscar usuarios...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='border-neutral-700 bg-neutral-800 focus-visible:ring-neutral-400'
        />

        <div className='overflow-hidden rounded-md border border-neutral-700'>
          <Table>
            <TableHeader className='bg-neutral-900'>
              <TableRow className='text-white hover:bg-neutral-800'>
                <TableHead>Nombre</TableHead>
                <TableHead>Apartamento</TableHead>
                <TableHead>Edificio</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead className='text-center'>WhatsApp</TableHead>
                <TableHead className='text-center'>Propietario</TableHead>
                <TableHead>Identificación</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <TableRow
                    key={index}
                    className='border-t border-neutral-700 hover:bg-neutral-800'
                  >
                    <TableCell className='font-medium'>{user.name}</TableCell>
                    <TableCell className='font-medium'>{user.unitNumber}</TableCell>
                    <TableCell>{user.buildingNumber}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <div className='flex items-center justify-center'>
                        {user.withWhatsapp ? (
                          <CheckCircle className='text-green-500' />
                        ) : (
                          <XCircle className='text-red-500' />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center justify-center'>
                        {user.isOwner ? (
                          <CheckCircle className='text-green-500' />
                        ) : (
                          <XCircle className='text-red-500' />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.idn || 'N/A'}</TableCell>
                    <TableCell>{user.propertyRegistration || 'N/A'}</TableCell>
                    <TableCell>
                      {statusValues[user.status as keyof typeof statusValues] || 'N/A'}
                    </TableCell>
                    <TableCell className='flex items-center gap-5'>
                      <button onClick={() => openDrawer(user._id)} type='button'>
                        <HousePlus className='text-green-700' />
                      </button>
                      <button type='button'>
                        <Trash2 className='text-red-800' />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className='hover:bg-neutral-800'>
                  <TableCell colSpan={8} className='text-center'>
                    Sin solicitudes pendientes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
