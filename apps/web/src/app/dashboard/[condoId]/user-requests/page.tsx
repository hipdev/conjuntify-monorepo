'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'

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

export default function Component() {
  const params = useParams()
  const condoId = params.id as Id<'condos'>
  const userRequests = condoId ? useQuery(api.condos.getCondoTemporalUsers, { condoId }) : null

  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = userRequests?.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className='min-h-screen bg-black p-8 text-white'>
      <div className='mx-auto max-w-6xl space-y-8'>
        <h1 className='text-3xl font-bold'>Tabla de Usuarios</h1>

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
                <TableHead>Matrícula Inmobiliaria</TableHead>
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
                    <TableCell>{user.idn}</TableCell>
                    <TableCell>{user.propertyRegistration}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className='text-center'>
                    No users found
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
