import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Plus } from 'lucide-react'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { Button } from '@/components/ui/button'
import { Id } from '@packages/backend/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { toast } from 'sonner'

type CreateCommonAreaProps = {
  isOpen: boolean
  onClose: () => void
  condoId: Id<'condos'>
}

const areaTypes = {
  gym: 'Gimnasio',
  pool: 'Piscina',
  sauna: 'Sauna',
  steamRoom: 'Baño de vapor',
  soccerField: 'Cancha de fútbol',
  socialRoom: 'Salón social'
}

export const CreateCommonArea = ({ isOpen, onClose, condoId }: CreateCommonAreaProps) => {
  const createCommonArea = useMutation(api.condos.createCommonArea)

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      type: '',
      maxCapacity: 0,
      isAvailable: true
    }
  })

  const onSubmit = async (data: any) => {
    try {
      await createCommonArea({
        ...data,
        condoId,
        maxCapacity: parseInt(data.maxCapacity, 10)
      })
      onClose()
      reset()
      toast.success('Área común creada correctamente', {
        position: 'bottom-center'
      })
    } catch (error) {
      console.error('Error al crear área común:', error)
      toast.error('Error al crear área común', {
        position: 'bottom-center'
      })
    }
  }

  return (
    <Drawer direction='right' open={isOpen} onOpenChange={onClose}>
      <DrawerContent className='fixed bottom-0 right-0 mt-24 flex h-full w-[400px] flex-col border-b-0 border-t-0 border-l-neutral-700 bg-black text-black'>
        <DrawerHeader>
          <DrawerTitle className='text-white'>Crear nueva área común</DrawerTitle>
          <DrawerDescription>
            Complete los detalles para crear una nueva área común
          </DrawerDescription>
        </DrawerHeader>
        <div className='p-4 pt-0'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-4'>
              <div>
                <label htmlFor='name' className='block text-sm font-medium text-neutral-600'>
                  Nombre
                </label>
                <input
                  type='text'
                  id='name'
                  required
                  {...register('name')}
                  className='mt-1 block w-full rounded-md border border-neutral-600 bg-black px-3 py-2 text-white shadow-sm outline-none focus:border-white/70 sm:text-sm'
                />
              </div>
              <div>
                <label htmlFor='description' className='block text-sm font-medium text-neutral-600'>
                  Descripción
                </label>
                <textarea
                  id='description'
                  required
                  {...register('description')}
                  className='mt-1 block w-full rounded-md border border-neutral-600 bg-black px-3 py-2 text-white shadow-sm outline-none focus:border-white/70 sm:text-sm'
                />
              </div>
              <div>
                <label htmlFor='type' className='block text-sm font-medium text-neutral-600'>
                  Tipo de área
                </label>
                <Controller
                  name='type'
                  control={control}
                  render={({ field }) => (
                    <Select required onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full border border-neutral-600 bg-black text-neutral-400 hover:border-white/70'>
                        <SelectValue placeholder='Seleccione el tipo de área' />
                      </SelectTrigger>
                      <SelectContent className='bg-black text-white'>
                        {Object.entries(areaTypes).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <label htmlFor='maxCapacity' className='block text-sm font-medium text-neutral-600'>
                  Capacidad máxima
                </label>
                <input
                  type='number'
                  id='maxCapacity'
                  required
                  min='1'
                  {...register('maxCapacity')}
                  className='mt-1 block w-full rounded-md border border-neutral-600 bg-black px-3 py-2 text-white shadow-sm outline-none focus:border-white/70 sm:text-sm'
                />
              </div>

              <Button type='submit' className='mt-4 bg-indigo-600 hover:bg-indigo-700'>
                <Plus className='mr-2 h-4 w-4' /> Crear área común
              </Button>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className='text-white' variant='outline' onClick={onClose}>
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
