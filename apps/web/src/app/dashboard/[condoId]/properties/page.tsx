'use client'

import { useState } from 'react'
import { Eye, Pencil } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { useParams } from 'next/navigation'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'

// Mock data
const properties = [
  {
    id: '1',
    unitNumber: 'A101',
    buildingNumber: '1',
    area: 80,
    propertyType: 'apartment',
    ownerName: 'Juan Pérez',
    ownerPhone: '123-456-7890',
    tenantName: 'María González',
    tenantPhone: '098-765-4321'
  },
  {
    id: '2',
    unitNumber: 'B205',
    buildingNumber: '2',
    area: 100,
    propertyType: 'apartment',
    ownerName: 'Carlos Rodríguez',
    ownerPhone: '234-567-8901',
    tenantName: null,
    tenantPhone: null
  },
  {
    id: '3',
    unitNumber: 'C10',
    buildingNumber: null,
    area: 150,
    propertyType: 'house',
    ownerName: 'Ana Martínez',
    ownerPhone: '345-678-9012',
    tenantName: 'Pedro Sánchez',
    tenantPhone: '456-789-0123'
  }
]

const propertyTypes = {
  apartment: 'Apartamento',
  house: 'Casa'
}

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const params = useParams()
  const condoId = params.condoId as Id<'condos'>

  const properties = condoId ? useQuery(api.units.getCondoUnits, { condoId }) : []

  console.log(properties, 'properties')

  const filteredProperties = properties?.filter((property) =>
    Object.values(property).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className='min-h-screen bg-black p-8 text-white'>
      <div className='mx-auto max-w-6xl space-y-8'>
        <h1 className='text-3xl font-bold'>Propiedades</h1>

        <Input
          placeholder='Buscar propiedades...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='border-neutral-700 bg-neutral-800 focus-visible:ring-neutral-400'
        />

        <div className='overflow-hidden rounded-md border border-neutral-700'>
          <Table>
            <TableHeader className='bg-neutral-900'>
              <TableRow className='text-white hover:bg-neutral-800'>
                <TableHead>Número</TableHead>
                <TableHead>Edificio</TableHead>
                <TableHead>Área (m²)</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Propietarios</TableHead>
                <TableHead>Arrendatarios</TableHead>
                <TableHead>Valor de administración</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties && filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <TableRow
                    key={property._id}
                    className='border-t border-neutral-700 hover:bg-neutral-800'
                  >
                    <TableCell className='font-medium'>{property.unitNumber}</TableCell>
                    <TableCell>{property.buildingNumber || 'N/A'}</TableCell>
                    <TableCell>{property.area || 'Sin asignar'}</TableCell>
                    <TableCell>{propertyTypes[property.propertyType]}</TableCell>
                    <TableCell>
                      {property.owners.length > 0
                        ? property.owners.map((owner) => owner.name).join(', ')
                        : 'Sin asignar'}
                    </TableCell>
                    <TableCell>
                      {property.tenants.length > 0
                        ? property.tenants.map((tenant) => tenant.name).join(', ')
                        : 'Sin asignar'}
                    </TableCell>
                    <TableCell>{property.hoa || 'Sin asignar'}</TableCell>
                    <TableCell>{property.phone || 'Sin asignar'}</TableCell>
                    <TableCell className='flex items-center space-x-2'>
                      <Link
                        href={`#`}
                        className='relative top-px flex items-center gap-2 hover:text-indigo-500'
                      >
                        <Pencil className='h-4 w-4' />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className='hover:bg-neutral-800'>
                  <TableCell colSpan={9} className='text-center'>
                    No se encontraron propiedades
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
