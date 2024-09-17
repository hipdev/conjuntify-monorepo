import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native'
import { useQuery } from 'convex/react'
import { api } from '@packages/backend/convex/_generated/api'
import { Link } from 'expo-router'

export default function AreasScreen() {
  const user = useQuery(api.users.currentUser)
  const assignedUnit = useQuery(api.users.getUserAssignedUnit)

  if (!user || !assignedUnit) {
    return <Text>Cargando...</Text>
  }

  const commonAreas = useQuery(api.condos.getCommonAreas, { condoId: assignedUnit.condo._id })

  if (!commonAreas) {
    return <Text>Cargando áreas comunes...</Text>
  }

  const getIconForAreaType = (type: string) => {
    switch (type) {
      case 'gym':
        return '🏋️'
      case 'pool':
        return '🏊'
      case 'sauna':
        return '🧖'
      case 'steamRoom':
        return '🚿'
      case 'soccerField':
        return '⚽'
      case 'socialRoom':
        return '🎉'
      default:
        return '🏠'
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-100'>
      <ScrollView className='flex-1 px-4 py-6'>
        <Text className='mb-6 text-2xl font-bold text-indigo-700'>Áreas Comunes</Text>
        <View className='flex-row flex-wrap justify-between'>
          {commonAreas.map((area) => (
            <Link key={area._id} href={`/`} asChild>
              <TouchableOpacity
                className='mb-4 w-[48%] overflow-hidden rounded-lg bg-white p-4 shadow-md'
                style={{ elevation: 3 }}
              >
                <View className='mb-2 items-center justify-center rounded-full bg-indigo-100 p-3'>
                  <Text className='text-3xl'>{getIconForAreaType(area.type)}</Text>
                </View>
                <Text className='mb-1 text-center text-lg font-semibold text-indigo-700'>
                  {area.name}
                </Text>
                <Text className='text-center text-sm text-gray-600'>
                  Capacidad: {area.maxCapacity}
                </Text>
                <Text className='text-center text-sm text-gray-600'>
                  Disponible: {area.isAvailable ? 'Sí' : 'No'}
                </Text>
                <Text className='text-center text-sm text-gray-600'>
                  Reservas: {area.totalReservations}/{area.maxCapacity}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
