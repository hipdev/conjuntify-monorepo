'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const reservationStatus = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  inUse: 'En uso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  noShow: 'No show'
}

export default function ReservationsPage() {
  const params = useParams()
  const condoId = params.condoId as Id<'condos'>

  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reservationToDelete, setReservationToDelete] = useState<Id<'reservations'> | null>(null)

  const reservations = useQuery(api.reservations.getCondoReservations, { condoId })
  const deleteReservation = useMutation(api.reservations.deleteReservation)

  const filteredReservations = reservations?.filter((reservation) =>
    Object.values(reservation).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleDeleteReservation = async () => {
    if (!reservationToDelete) return
    try {
      await deleteReservation({ reservationId: reservationToDelete })
      toast.success('Reserva eliminada correctamente')
      setDeleteDialogOpen(false)
      setReservationToDelete(null)
    } catch (error) {
      console.error('Error deleting reservation:', error)
      toast.error('Error al eliminar la reserva')
    }
  }

  const openDeleteDialog = (reservationId: Id<'reservations'>) => {
    setReservationToDelete(reservationId)
    setDeleteDialogOpen(true)
  }

  return (
    <div className='min-h-screen bg-black p-8 text-white'>
      <div className='mx-auto max-w-6xl space-y-8'>
        <h1 className='text-3xl font-bold'>Reservas</h1>

        <Input
          placeholder='Buscar reservas...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='border-neutral-700 bg-neutral-800 focus-visible:ring-neutral-400'
        />

        <div className='overflow-hidden rounded-md border border-neutral-700'>
          <Table>
            <TableHeader className='bg-neutral-900'>
              <TableRow className='text-white hover:bg-neutral-800'>
                <TableHead>Área Común</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations && filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
                  <TableRow
                    key={reservation._id}
                    className='border-t border-neutral-700 hover:bg-neutral-800'
                  >
                    <TableCell>{reservation.commonArea?.name}</TableCell>
                    <TableCell>{reservation.userName}</TableCell>
                    <TableCell>{reservation.condoUnit?.unitNumber}</TableCell>
                    <TableCell>{new Date(reservation.reservationTime).toLocaleString()}</TableCell>
                    <TableCell>{reservation.numberOfPeople}</TableCell>
                    <TableCell>{reservationStatus[reservation.status]}</TableCell>
                    <TableCell>
                      <button
                        type='button'
                        onClick={() => openDeleteDialog(reservation._id)}
                        className='text-red-500 hover:text-red-400'
                      >
                        <Trash2 className='h-5 w-5' />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className='hover:bg-neutral-800'>
                  <TableCell colSpan={7} className='text-center'>
                    No se encontraron reservas
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
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant='destructive' onClick={handleDeleteReservation}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
