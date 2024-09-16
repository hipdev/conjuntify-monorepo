import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Doc, Id } from '@packages/backend/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { useToast } from '@/hooks/use-toast'

type AssignUnitProps = {
  temporalUnitId: Id<'condoTemporalUnitUsers'> | null
  closeDrawer: () => void
  userRequests: Doc<'condoTemporalUnitUsers'>[]
  condoId: Id<'condos'>
}

// Mock data for available units
const availableUnits = [
  { value: '101A', label: '101 - Tower A' },
  { value: '102A', label: '102 - Tower A' },
  { value: '201B', label: '201 - Tower B' },
  { value: '202B', label: '202 - Tower B' }
]

export const AssignUnit = ({
  temporalUnitId,
  closeDrawer,
  userRequests,
  condoId
}: AssignUnitProps) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const createUnitAndAssign = useMutation(api.units.createUnitAndAssign)

  const { toast } = useToast()

  const temporalUnit = userRequests.find((user) => user._id === temporalUnitId)

  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      propertyType: '',
      unitNumber: '',
      buildingNumber: ''
    }
  })

  const onSubmit = async (data: any) => {
    if (!temporalUnitId || !temporalUnit) return

    try {
      await createUnitAndAssign({
        buildingNumber: data.buildingNumber,
        condoId,
        isOwner: temporalUnit.isOwner || false,
        phone: temporalUnit.phone,
        propertyType: data.propertyType,
        temporalUnitId,
        unitNumber: data.unitNumber,
        userId: temporalUnit.userId
      })
      closeDrawer()
      toast({
        title: 'Unidad asignada',
        description: 'La unidad se ha asignado correctamente'
      })
    } catch (error) {
      console.error('Error al crear y asignar unidad:', error)
      toast({
        title: 'Error al crear y asignar unidad',
        description: 'Hubo un error al crear y asignar la unidad'
      })
    }
  }
  const propertyType = watch('propertyType')

  return (
    <Drawer direction='right' open={!!temporalUnitId} onOpenChange={closeDrawer}>
      <DrawerContent className='fixed bottom-0 right-0 mt-24 flex h-full w-[400px] flex-col border-b-0 border-t-0 border-l-neutral-700 bg-black text-black'>
        <DrawerHeader>
          <DrawerTitle className='text-white'>Asignar propiedad</DrawerTitle>
          <DrawerDescription>
            {temporalUnitId
              ? `Asignar propiedad para ${userRequests.find((user) => user._id === temporalUnitId)?.name}`
              : 'Sin usuario seleccionado'}
          </DrawerDescription>
        </DrawerHeader>
        <div className='p-4 pb-0'>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={open}
                className='w-full justify-between bg-black text-white'
              >
                {value
                  ? availableUnits.find((framework) => framework.value === value)?.label
                  : 'Buscar propiedad...'}
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 text-white opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-full p-0'>
              <Command className='w-80 bg-black'>
                <CommandInput placeholder='Selecciona una propiedad...' />
                <CommandList>
                  <CommandEmpty>No framework found.</CommandEmpty>
                  <CommandGroup>
                    {availableUnits.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? '' : currentValue)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === framework.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {framework.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <hr className='my-4 border-t border-neutral-500' />
        <div className='p-4 pt-0'>
          <h4 className='mb-4 mt-2 font-medium text-white'>Crear nueva propiedad</h4>
          <p className='mb-4 text-sm text-neutral-600'>
            Esta es una creación rápida para asignar la propiedad al usuario, posteriormente
            deberías actualizar los datos en la sección de propiedades.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-4'>
              <div>
                <label htmlFor='unitNumber' className='block text-sm font-medium text-neutral-600'>
                  Tipo de propiedad
                </label>
                <Controller
                  name='propertyType'
                  control={control}
                  render={({ field }) => (
                    <Select required onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='w-full border border-neutral-600 bg-black text-neutral-400 hover:border-white/70'>
                        <SelectValue placeholder='Tipo de propiedad' />
                      </SelectTrigger>
                      <SelectContent className='bg-black text-white'>
                        <SelectItem value='apartment'>Apartamento</SelectItem>
                        <SelectItem value='house'>Casa</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <label htmlFor='unitNumber' className='block text-sm font-medium text-neutral-600'>
                  {propertyType === 'apartment' ? 'Número de apartamento' : 'Número de casa'}
                </label>
                <input
                  type='text'
                  id='unitNumber'
                  required
                  placeholder='Ej. 101'
                  {...register('unitNumber')}
                  className='mt-1 block w-full rounded-md border border-neutral-600 bg-black px-3 py-2 text-white shadow-sm outline-none focus:border-white/70 sm:text-sm'
                />
              </div>
              <div>
                <label
                  htmlFor='buildingNumber'
                  className='block text-sm font-medium text-neutral-600'
                >
                  Número de torre/edificio (Opcional)
                </label>
                <input
                  type='text'
                  id='buildingNumber'
                  placeholder='Ej. Torre 33'
                  {...register('buildingNumber')}
                  className='mt-1 block w-full rounded-md border border-neutral-600 bg-black px-3 py-2 text-white shadow-sm outline-none focus:border-white/70 sm:text-sm'
                />
              </div>

              <button
                type='submit'
                className='mt-4 inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700'
              >
                <Plus className='mr-2 h-4 w-4' /> Crear propiedad y asignar
              </button>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <button
              onClick={closeDrawer}
              className='inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            >
              Cerrar
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
