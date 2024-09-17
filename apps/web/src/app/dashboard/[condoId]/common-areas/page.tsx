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
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { CreateCommonArea } from './_components/new-common-area'
import { EditCommonArea } from './_components/edit-common-area'

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
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)

  const params = useParams()
  const router = useRouter()
  const condoId = params.condoId as Id<'condos'>
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const commonAreas = useQuery(api.condos.getCommonAreas, { condoId })

  const commonAreaId = searchParams.get('editCommonAreaId') as Id<'commonAreas'> | null

  const filteredAreas = commonAreas?.filter((area) =>
    Object.values(area).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleViewReservations = (areaId: Id<'commonAreas'>) => {
    router.push(`/dashboard/${condoId}/common-areas/${areaId}/reservations`)
  }

  const handleEditCommonArea = (areaId: Id<'commonAreas'>) => {
    const params = new URLSearchParams(searchParams)
    params.set('editCommonAreaId', areaId)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className='min-h-screen bg-black p-8 text-white'>
      <CreateCommonArea
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        condoId={condoId}
      />
      {commonAreaId && <EditCommonArea />}
      <div className='mx-auto max-w-6xl space-y-8'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Áreas Comunes</h1>
          <Button
            className='bg-indigo-600 hover:bg-indigo-700'
            onClick={() => setIsCreateDrawerOpen(true)}
          >
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
                <TableHead className='text-center'>Capacidad Máxima</TableHead>
                <TableHead className='text-center'>Cupos Disponibles</TableHead>
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
                    <TableCell className='text-center'>{area.maxCapacity}</TableCell>
                    <TableCell className='text-center'>{area.availableCapacity}</TableCell>
                    <TableCell
                      className={`font-medium ${area.isAvailable ? 'text-green-600' : 'text-red-700'}`}
                    >
                      {area.isAvailable ? 'Disponible' : 'No disponible'}
                    </TableCell>
                    <TableCell className='flex items-center gap-4'>
                      <button
                        type='button'
                        className='relative top-px hover:text-indigo-500'
                        onClick={() => handleViewReservations(area._id)}
                      >
                        <Bell className='h-4 w-4' />
                      </button>
                      <button
                        type='button'
                        className='relative top-px flex items-center gap-2 hover:text-indigo-500'
                        onClick={() => handleEditCommonArea(area._id)}
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
