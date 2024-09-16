import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Pencil, Trash } from 'lucide-react'
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
import { useMutation, useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { toast } from 'sonner'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

const areaTypes = {
  gym: 'Gimnasio',
  pool: 'Piscina',
  sauna: 'Sauna',
  steamRoom: 'Baño de vapor',
  soccerField: 'Cancha de fútbol',
  socialRoom: 'Salón social'
}

export const EditCommonArea = () => {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const condoId = params.condoId as Id<'condos'>
  const commonAreaId = searchParams.get('editCommonAreaId') as Id<'commonAreas'>

  const commonArea = useQuery(api.condos.getCommonArea, { commonAreaId })
  const updateCommonArea = useMutation(api.condos.updateCommonArea)
  const deleteCommonArea = useMutation(api.condos.deleteCommonArea)

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      type: '',
      maxCapacity: 0,
      isAvailable: true
    }
  })

  useEffect(() => {
    if (commonArea) {
      reset({
        name: commonArea.name,
        description: commonArea.description,
        type: commonArea.type,
        maxCapacity: commonArea.maxCapacity,
        isAvailable: commonArea.isAvailable
      })
    }
  }, [commonArea, reset])

  const onSubmit = async (data: any) => {
    try {
      await updateCommonArea({
        commonAreaId: commonAreaId!,
        ...data,
        maxCapacity: parseInt(data.maxCapacity, 10)
      })
      onClose()
      toast.success('Área común actualizada correctamente', {
        position: 'bottom-center'
      })
    } catch (error) {
      console.error('Error al actualizar área común:', error)
      toast.error('Error al actualizar área común', {
        position: 'bottom-center'
      })
    }
  }

  const onDelete = async () => {
    try {
      const result = await deleteCommonArea({ commonAreaId: commonAreaId! })
      if (result === 'success') {
        onClose()
        toast.success('Área común eliminada correctamente', {
          position: 'bottom-center'
        })
      } else {
        toast.error('No se puede eliminar el área común porque tiene reservas activas', {
          position: 'bottom-center'
        })
      }
    } catch (error) {
      console.error('Error al eliminar área común:', error)
      toast.error('Error al eliminar área común', {
        position: 'bottom-center'
      })
    }
  }

  const onClose = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('editCommonAreaId')
    router.push(`/dashboard/${condoId}/common-areas?${params.toString()}`, { scroll: false })
  }

  if (!commonAreaId || !commonArea) return null

  return (
    <Drawer direction='right' open={commonAreaId ? true : false} onOpenChange={onClose}>
      <DrawerContent className='fixed bottom-0 right-0 mt-24 flex h-full w-[400px] flex-col border-b-0 border-t-0 border-l-neutral-700 bg-black text-black'>
        <DrawerHeader>
          <DrawerTitle className='text-white'>Editar área común</DrawerTitle>
          <DrawerDescription>Modifique los detalles del área común</DrawerDescription>
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
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='isAvailable'
                  {...register('isAvailable')}
                  className='mr-2 rounded border-neutral-600 bg-black text-indigo-600 focus:ring-indigo-500'
                />
                <label htmlFor='isAvailable' className='text-sm font-medium text-neutral-600'>
                  Disponible
                </label>
              </div>
              <Button type='submit' className='mt-4 bg-indigo-600 hover:bg-indigo-700'>
                <Pencil className='mr-2 h-4 w-4' /> Actualizar área común
              </Button>
            </div>
          </form>
        </div>
        <DrawerFooter className='flex flex-col items-stretch'>
          <Button
            variant='destructive'
            className='mt-4 bg-red-600 hover:bg-red-700'
            onClick={onDelete}
          >
            <Trash className='mr-2 h-4 w-4' /> Eliminar área común
          </Button>
          <DrawerClose asChild>
            <Button className='mt-2 text-white' variant='outline' onClick={onClose}>
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
