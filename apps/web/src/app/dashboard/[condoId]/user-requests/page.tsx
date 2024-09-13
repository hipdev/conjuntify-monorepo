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
const initialUsers: User[] = [
  {
    apartamento: '101',
    edificio: 'A',
    celular: '3001234567',
    whatsapp: true,
    propietario: true,
    identificacion: '1234567890',
    matricula: '50N-12345678'
  },
  {
    apartamento: '202',
    edificio: 'B',
    celular: '3109876543',
    whatsapp: false,
    propietario: false,
    identificacion: '0987654321',
    matricula: '50N-87654321'
  },
  {
    apartamento: '303',
    edificio: 'C',
    celular: '3205555555',
    whatsapp: true,
    propietario: true,
    identificacion: '5555555555',
    matricula: '50N-55555555'
  }
]

export default function Component() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter((user) =>
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
              {filteredUsers.map((user, index) => (
                <TableRow key={index} className='border-t border-neutral-700 hover:bg-neutral-800'>
                  <TableCell className='font-medium'>{user.apartamento}</TableCell>
                  <TableCell className='font-medium'>{user.apartamento}</TableCell>
                  <TableCell>{user.edificio}</TableCell>
                  <TableCell>{user.celular}</TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center'>
                      {user.whatsapp ? (
                        <CheckCircle className='text-green-500' />
                      ) : (
                        <XCircle className='text-red-500' />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center'>
                      {user.propietario ? (
                        <CheckCircle className='text-green-500' />
                      ) : (
                        <XCircle className='text-red-500' />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.identificacion}</TableCell>
                  <TableCell>{user.matricula}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
