'use client'

import { useEffect, useState } from 'react'
import { Pencil, Plus, Bell } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMutation, useQuery } from 'convex/react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'

const areaTypes = {
  gym: 'Gimnasio',
  pool: 'Piscina',
  sauna: 'Sauna',
  steamRoom: 'Baño de vapor',
  soccerField: 'Cancha de fútbol',
  socialRoom: 'Salón social'
}

export default function CommonAreasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const params = useParams()
  const router = useRouter()
  const condoId = params.condoId as Id<'condos'>

  const commonAreas = useQuery(api.condos.getCommonAreas, { condoId })
  const updateCommonAreaAvailability = useMutation(api.condos.updateCommonAreaAvailability)

  useEffect(() => {
    if (commonAreas) {
      commonAreas.forEach((area) => {
        if (area.isAvailable !== area.availableCapacity > 0) {
          updateCommonAreaAvailability({
            commonAreaId: area._id,
            isAvailable: area.availableCapacity > 0
          })
        }
      })
    }
  }, [commonAreas, updateCommonAreaAvailability])

  const filteredAreas = commonAreas?.filter((area) =>
    Object.values(area).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleViewReservations = (areaId: Id<'commonAreas'>) => {
    router.push(`/dashboard/${condoId}/common-areas/${areaId}/reservations`)
  }

  return (
    <div className='min-h-screen bg-black p-8 text-white'>
      <div className='mx-auto max-w-6xl space-y-8'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Áreas Comunes</h1>
          <Button className='bg-indigo-600 hover:bg-indigo-700'>
            <Plus className='mr-2 h-4 w-4' /> Crear Área Común
          </Button>
        </div>

        <Input
          placeholder='Buscar áreas comunes...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='border-neutral-700 bg-neutral-800 focus-visible:ring-neutral-400'
        />

        <div className='overflow-hidden rounded-md border border-neutral-700'>
          <Table>
            <TableHeader className='bg-neutral-900'>
              <TableRow className='text-white hover:bg-neutral-800'>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidad Máxima</TableHead>
                <TableHead>Total Reservas</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAreas && filteredAreas.length > 0 ? (
                filteredAreas.map((area) => (
                  <TableRow
                    key={area._id}
                    className='border-t border-neutral-700 hover:bg-neutral-800'
                  >
                    <TableCell className='font-medium'>{area.name}</TableCell>
                    <TableCell>{areaTypes[area.type as keyof typeof areaTypes]}</TableCell>
                    <TableCell>{area.maxCapacity}</TableCell>
                    <TableCell>{area.totalReservations}</TableCell>
                    <TableCell>{area.availableCapacity}</TableCell>
                    <TableCell>{area.isAvailable ? 'Disponible' : 'No disponible'}</TableCell>
                    <TableCell className='flex items-center space-x-2'>
                      <button
                        type='button'
                        className='relative top-px flex items-center gap-2 hover:text-indigo-500'
                        onClick={() => handleViewReservations(area._id)}
                      >
                        <Bell className='h-4 w-4' />
                      </button>
                      <button
                        type='button'
                        className='relative top-px flex items-center gap-2 hover:text-indigo-500'
                      >
                        <Pencil className='h-4 w-4' />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className='hover:bg-neutral-800'>
                  <TableCell colSpan={7} className='text-center'>
                    No se encontraron áreas comunes
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
