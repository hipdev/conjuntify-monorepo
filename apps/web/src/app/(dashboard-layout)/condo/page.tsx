'use client'

import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function Component() {
  const [tipoCondominio, setTipoCondominio] = useState('casas')
  const [amenidades, setAmenidades] = useState<string[]>([])

  const handleAmenidadChange = (amenidad: string) => {
    setAmenidades((prev) =>
      prev.includes(amenidad) ? prev.filter((a) => a !== amenidad) : [...prev, amenidad]
    )
  }
  const handleRegistrarOtro = () => {
    // Aquí iría la lógica para registrar otro condominio
    console.log('Registrar otro condominio')
  }

  return (
    <div className='mx-auto min-h-screen max-w-4xl bg-black p-8 text-white'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Tu Condominio</h1>
        <Button
          onClick={handleRegistrarOtro}
          className='bg-white text-black hover:bg-gray-200 focus-visible:ring-gray-400'
        >
          Registrar otro condominio
        </Button>
      </div>
      <form className='mx-auto max-w-4xl space-y-8'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='nombre'>Nombre del Condominio</Label>
              <Input
                id='nombre'
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='direccion'>Dirección</Label>
              <Input
                id='direccion'
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>

            <div>
              <Label htmlFor='ciudad'>Ciudad</Label>
              <Input
                id='ciudad'
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='departamento'>Departamento</Label>
              <Input
                id='departamento'
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='pais'>País</Label>
              <Input
                id='pais'
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>

            <div>
              <Label htmlFor='numeroUnidades'>
                Número de {tipoCondominio === 'casas' ? 'Casas' : 'Apartamentos'}
              </Label>
              <Input
                id='numeroUnidades'
                type='number'
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
          </div>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='codigoPostal'>Código Postal</Label>
              <Input
                id='codigoPostal'
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='codigoUnico'>Código Único</Label>
              <Input
                id='codigoUnico'
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>
            <div>
              <Label htmlFor='celular'>Celular</Label>
              <Input
                id='celular'
                type='tel'
                className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
              />
            </div>

            {tipoCondominio === 'apartamentos' && (
              <div>
                <Label htmlFor='numeroTorres'>Número de Torres</Label>
                <Input
                  id='numeroTorres'
                  type='number'
                  className='border-gray-700 bg-gray-800 focus-visible:ring-gray-400'
                />
              </div>
            )}
            <div>
              <Label>Tipo de Condominio</Label>
              <RadioGroup
                defaultValue='casas'
                className='flex space-x-4'
                onValueChange={setTipoCondominio}
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value='casas'
                    id='casas'
                    className='border-white focus-visible:ring-gray-400'
                  />
                  <Label htmlFor='casas'>Casas</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem
                    value='apartamentos'
                    id='apartamentos'
                    className='border-white focus-visible:ring-gray-400'
                  />
                  <Label htmlFor='apartamentos'>Apartamentos</Label>
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
                      checked={amenidades.includes(amenidad)}
                      onCheckedChange={() => handleAmenidadChange(amenidad)}
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
          Registrar Condominio
        </Button>
      </form>
    </div>
  )
}
