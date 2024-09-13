'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { toast } from '@/hooks/use-toast'

export default function EditCondoPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const params = useParams()
  const condoId = params.id as string

  const [initialData, setInitialData] = useState<any>(null)
  const getCondo = useQuery(api.condos.getCondo, { id: condoId as Id<'condos'> })
  const updateCondo = useMutation(api.condos.updateCondo)

  useEffect(() => {
    if (getCondo) {
      setInitialData(getCondo)
    }
  }, [getCondo])

  console.log(getCondo, 'data')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formRef.current || !initialData) return

    const formData = new FormData(formRef.current)

    const condoData = {
      address: formData.get('address') as string,
      amenities: Array.from(formData.getAll('amenities')) as string[],
      city: formData.get('city') as string,
      country: formData.get('country') as string,
      name: formData.get('name') as string,
      numberUnits: parseInt(formData.get('numberUnits') as string),
      phone: formData.get('phone') as string,
      state: formData.get('state') as string,
      type: formData.get('type') as 'houses' | 'apartments',
      uniqueCode: formData.get('uniqueCode') as string,
      zipCode: formData.get('zipCode') as string
    }

    // Check if data has changed
    const hasChanged = JSON.stringify(condoData) !== JSON.stringify(initialData)

    if (hasChanged) {
      try {
        await updateCondo({ id: condoId as Id<'condos'>, ...condoData })
        toast({
          title: 'Condominio actualizado con éxito',
          variant: 'default'
        })
      } catch (error) {
        console.error('Error updating condo:', error)
        toast({
          title: 'Error actualizando el condominio',
          variant: 'destructive'
        })
      }
    } else {
      console.log('No changes detected')
    }
  }

  if (!initialData) {
    return <div>Loading...</div>
  }

  return (
    <div className='mx-auto min-h-screen max-w-4xl bg-black p-8 text-white'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Actualizar Condominio</h1>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className='mx-auto max-w-4xl space-y-8'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='nombre'>Nombre del Condominio</Label>
              <Input
                id='nombre'
                name='name'
                defaultValue={initialData.name}
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='direccion'>Dirección</Label>
              <Input
                id='direccion'
                name='address'
                defaultValue={initialData.address}
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='city'>Ciudad</Label>
              <Input
                id='city'
                name='city'
                defaultValue={initialData.city}
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='departamento'>Departamento</Label>
              <Input
                id='state'
                name='state'
                defaultValue={initialData.state}
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='country'>País</Label>
              <Input
                id='country'
                name='country'
                defaultValue={initialData.country}
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='numberUnits'>Número de casas/aptos</Label>
              <Input
                id='numberUnits'
                name='numberUnits'
                type='number'
                defaultValue={initialData.numberUnits}
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
          </div>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='zipCode'>Código Postal</Label>
              <Input
                id='zipCode'
                name='zipCode'
                defaultValue={initialData.zipCode}
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='uniqueCode'>Código Único</Label>
              <Input
                id='uniqueCode'
                name='uniqueCode'
                defaultValue={initialData.uniqueCode}
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='phone'>Celular</Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                defaultValue={initialData.phone}
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label>Tipo de Condominio</Label>
              <RadioGroup name='type' defaultValue={initialData.type} className='flex space-x-4'>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value='houses'
                    id='houses'
                    className='border-white focus-visible:ring-gray-400'
                  />
                  <Label htmlFor='houses'>Casas</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value='apartments'
                    id='apartments'
                    className='border-white focus-visible:ring-gray-400'
                  />
                  <Label htmlFor='apartments'>Apartamentos</Label>
                </div>
              </RadioGroup>
            </div>
            <div className='space-y-2'>
              <Label>Amenidades</Label>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  'Piscina',
                  'Gimnasio',
                  'Parque Infantil',
                  'Salón Comunal',
                  'BBQ',
                  'Zona Verde'
                ].map((amenidad) => (
                  <div key={amenidad} className='flex items-center space-x-2'>
                    <Checkbox
                      id={amenidad}
                      name='amenities'
                      value={amenidad}
                      defaultChecked={initialData.amenities.includes(amenidad)}
                      className='h-5 w-5 border-white focus-visible:ring-gray-400'
                    />
                    <Label htmlFor={amenidad}>{amenidad}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Button
          type='submit'
          className='w-full bg-white text-black hover:bg-gray-200 focus-visible:ring-gray-400'
        >
          Actualizar Condominio
        </Button>
      </form>
    </div>
  )
}
