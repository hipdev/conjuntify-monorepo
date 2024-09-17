'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { CheckCircle, Eye, HousePlus, Trash2, XCircle } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { AssignUnit } from './_components/assign-unit'
import { cn } from '@/lib/utils'

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
  const deleteTemporalUnitUser = useMutation(api.condos.deleteTemporalUnitUser)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<Id<'condoTemporalUnitUsers'> | null>(null)

  const temporalUnitId = searchParams.get('temporalUnitId') as Id<'condoTemporalUnitUsers'> | null

  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = userRequests?.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const openDrawer = (userId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('temporalUnitId', userId)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const closeDrawer = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('temporalUnitId')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleDeleteRequest = async () => {
    if (!userToDelete) return
    try {
      await deleteTemporalUnitUser({ temporalUnitId: userToDelete })
      toast.success('Solicitud eliminada correctamente')
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('Error deleting temporal unit user:', error)
      toast.error('Error al eliminar la solicitud')
    }
  }

  const openDeleteDialog = (userId: Id<'condoTemporalUnitUsers'>) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  return (
    <div className='min-h-screen bg-black p-8 text-white'>
      {userRequests && userRequests.length > 0 && (
        <AssignUnit
          temporalUnitId={temporalUnitId || null}
          closeDrawer={closeDrawer}
          userRequests={userRequests}
          condoId={condoId}
        />
      )}

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
                          <CheckCircle className='text-green-600' />
                        ) : (
                          <XCircle className='text-red-600' />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center justify-center'>
                        {user.isOwner ? (
                          <CheckCircle className='text-green-600' />
                        ) : (
                          <XCircle className='text-red-600' />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.idn || 'N/A'}</TableCell>
                    <TableCell>{user.propertyRegistration || 'N/A'}</TableCell>
                    <TableCell
                      className={cn(
                        user.status == 'pending'
                          ? 'text-yellow-500'
                          : user.status == 'approved'
                            ? 'text-green-600'
                            : 'text-red-500'
                      )}
                    >
                      {statusValues[user.status as keyof typeof statusValues] || 'N/A'}
                    </TableCell>
                    <TableCell className='flex items-center gap-3'>
                      {user.status == 'pending' ? (
                        <>
                          <button onClick={() => openDrawer(user._id)} type='button'>
                            <HousePlus className='text-green-700' />
                          </button>
                          <button type='button' onClick={() => openDeleteDialog(user._id)}>
                            <Trash2 className='text-red-800' />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* TODO: Ver y editar user */}
                          <Link
                            href={`#`}
                            className='relative top-px flex items-center gap-2 hover:text-indigo-500'
                          >
                            Ver <Eye className='h-4 w-4' />
                          </Link>
                        </>
                      )}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription className='text-base text-neutral-400'>
              ¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-10'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant='destructive' onClick={handleDeleteRequest}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
