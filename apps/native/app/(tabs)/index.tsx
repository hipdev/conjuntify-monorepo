import React, { useState } from 'react'
import { Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import Toast from 'react-native-toast-message'
import { RequestUnit } from '@/components/home/request-unit'
import PendingRequestsScreen from '@/components/home/pending-requests'

export default function HomeScreen() {
  const user = useQuery(api.users.currentUser)
  const pendingRequests = useQuery(api.users.getPendingRequests)
  const updateUser = useMutation(api.users.updateUserName)

  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleNameSubmit = async () => {
    if (name && lastName) {
      await updateUser({ name: name.trim(), lastName: lastName.trim() })
    } else {
      Toast.show({
        type: 'error',
        text1: 'Por favor, completa tu nombre y apellido',
        position: 'bottom'
      })
    }
  }

  if (!user) {
    return <Text>Loading...</Text>
  }

  console.log(pendingRequests, 'pendingRequests')

  if (pendingRequests && pendingRequests.length > 0) {
    return <PendingRequestsScreen requests={pendingRequests} onNewRequest={() => {}} />
  }

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className='flex-1 px-4'>
        <View className='flex-1 items-center justify-center p-4'>
          {!user.name ? (
            <View className='w-full'>
              <Text className='mb-2 text-lg font-semibold'>¿Cómo te llamas?</Text>
              <TextInput
                className='mb-4 w-full rounded-md border border-gray-300 px-5 py-4 focus:border-indigo-500'
                value={name}
                onChangeText={setName}
                placeholder='Escribe tu nombre'
                placeholderTextColor='#777'
              />
              <TextInput
                className='mb-4 w-full rounded-md border border-gray-300 px-5 py-4 focus:border-indigo-500'
                value={lastName}
                onChangeText={setLastName}
                placeholder='Escribe tu apellido'
                placeholderTextColor='#777'
              />
              <TouchableOpacity
                className='rounded bg-indigo-500 px-4 py-4'
                onPress={handleNameSubmit}
              >
                <Text className='text-center font-bold text-white'>Enviar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <RequestUnit />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
