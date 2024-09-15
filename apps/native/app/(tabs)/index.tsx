import clsx from 'clsx'
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView
} from 'react-native'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import Toast from 'react-native-toast-message'

type FormData = {
  uniqueCode: string
  unitNumber: string
  buildingNumber: string
  phone: string
  withWhatsapp: boolean
  isOwner: boolean
  idn: string
  propertyRegistration: string
  floorNumber: string
}

export default function HomeScreen() {
  const user = useQuery(api.users.currentUser)
  const updateUser = useMutation(api.users.updateUserName)
  const createCondoApplication = useMutation(api.users.createCondoApplication)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      buildingNumber: '',
      idn: '',
      isOwner: false,
      phone: '',
      propertyRegistration: '',
      uniqueCode: '',
      unitNumber: '',
      withWhatsapp: false,
      floorNumber: ''
    }
  })

  const [name, setName] = useState('')

  const handleNameSubmit = async () => {
    if (name) {
      await updateUser({ name: name.trim() })
    }
  }

  const handleDetailsSubmit = async (data: FormData) => {
    console.log(data)
    const formData = {
      ...data
    }
    const result = await createCondoApplication({
      ...formData,
      name: user?.name || ''
    })
    if (result?.error) {
      console.log(result.error, 'error')
      Toast.show({
        type: 'error',
        text1: 'Código no encontrado',
        position: 'bottom',
        text1Style: {
          fontSize: 17,
          fontWeight: 'bold'
        }
      })
      // Handle the error, e.g., show an error message to the user
    }
  }

  if (!user) {
    return <Text>Loading...</Text>
  }

  console.log(errors, 'errors')

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className='flex-1 px-4'>
        <View className='flex-1 items-center justify-center p-4'>
          {!user.name ? (
            <View className='w-full'>
              <Text className='mb-2 text-lg font-semibold'>¿Cómo te llamas?</Text>
              <TextInput
                className='mb-4 w-full rounded-md border border-gray-300 p-2'
                value={name}
                onChangeText={setName}
                placeholder='Escribe tu nombre'
              />
              <TouchableOpacity
                className='rounded bg-blue-500 px-4 py-2'
                onPress={handleNameSubmit}
              >
                <Text className='text-center font-bold text-white'>Enviar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className='w-full'>
              <Text className='mb-2 text-2xl font-bold'>Bienvenido {user.name}!</Text>
              <Text className='mb-5 text-lg font-semibold'>
                Por favor, proporciona más detalles:
              </Text>

              <Controller
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={clsx(
                      'w-full rounded-md border border-gray-300 p-4',
                      errors.uniqueCode ? 'mb-2 border-red-500' : 'mb-4'
                    )}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder='Código de la urbanización'
                    placeholderTextColor='#777'
                  />
                )}
                name='uniqueCode'
              />
              {errors.uniqueCode && (
                <Text className='mb-4 text-red-500'>El código es requerido</Text>
              )}

              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={clsx(
                      'w-full rounded-md border border-gray-300 p-4',
                      errors.unitNumber ? 'mb-2 border-red-500' : 'mb-4'
                    )}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder='Número de apartamento'
                    placeholderTextColor='#777'
                    keyboardType='numeric'
                  />
                )}
                name='unitNumber'
              />
              {errors.unitNumber && (
                <Text className='mb-4 text-red-500'>El número de apartamento es requerido</Text>
              )}

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={clsx(
                      'mb-4 w-full rounded-md border border-gray-300 p-4',
                      errors.buildingNumber ? 'mb-2 border-red-500' : 'mb-4'
                    )}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder='Número de edificio (Si es necesario)'
                    placeholderTextColor='#777'
                  />
                )}
                name='buildingNumber'
              />

              <Controller
                control={control}
                rules={{
                  required: true
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={clsx(
                      'w-full rounded-md border border-gray-300 p-4',
                      errors.uniqueCode ? 'mb-2 border-red-500' : 'mb-4'
                    )}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder='Número de piso (Si es necesario)'
                    placeholderTextColor='#777'
                  />
                )}
                name='floorNumber'
              />

              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={clsx(
                      'w-full rounded-md border border-gray-300 p-4',
                      errors.phone ? 'mb-2 border-red-500' : 'mb-4'
                    )}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder='Número de teléfono'
                    keyboardType='phone-pad'
                    placeholderTextColor='#777'
                  />
                )}
                name='phone'
              />
              {errors.phone && (
                <Text className='mb-4 text-red-500'>El número de télefono es requerido</Text>
              )}

              <Controller
                control={control}
                render={({ field: { value, onChange } }) => (
                  <View className='mb-4 flex-row items-center'>
                    <Switch value={value} onValueChange={onChange} />
                    <Text className='ml-2'>Podemos contactar contigo por WhatsApp</Text>
                  </View>
                )}
                name='withWhatsapp'
              />

              <Controller
                control={control}
                render={({ field: { value, onChange } }) => (
                  <View className='mb-4 flex-row items-center'>
                    <Switch value={value} onValueChange={onChange} />
                    <Text className='ml-2'>Soy el propietario</Text>
                  </View>
                )}
                name='isOwner'
              />

              {watch('isOwner') && (
                <>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className='mb-4 w-full rounded-md border border-gray-300 p-4'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder='Número de identificación'
                        placeholderTextColor='#777'
                      />
                    )}
                    name='idn'
                  />

                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className='mb-4 w-full rounded-md border border-gray-300 p-4'
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        placeholder='Matrícula inmobiliaria'
                        placeholderTextColor='#777'
                      />
                    )}
                    name='propertyRegistration'
                  />
                </>
              )}

              <TouchableOpacity
                className='mt-10 rounded bg-blue-500 px-4 py-4'
                onPress={handleSubmit(handleDetailsSubmit)}
              >
                <Text className='text-center font-bold text-white'>Guardar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
