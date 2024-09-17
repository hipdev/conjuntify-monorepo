import { Redirect, Tabs } from 'expo-router'
import React from 'react'
import { Authenticated, Unauthenticated, AuthLoading, useConvexAuth } from 'convex/react'

import { Colors, indigoColor } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { ActivityIndicator, Text, View } from 'react-native'
import { TabBarIcon } from '@/components/navigation/TabBarIcon'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const { isLoading, isAuthenticated } = useConvexAuth()

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-white dark:bg-gray-900'>
        <ActivityIndicator size='large' color='#3B82F6' />
        <Text className='mt-4 text-xl font-semibold text-gray-800 dark:text-white'>
          Cargando Conjuntify...
        </Text>
      </View>
    )
  }

  if (!isAuthenticated) {
    return <Redirect href='/login' />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: indigoColor,
        headerShown: false
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name='settings'
        options={{
          title: 'Configuración',

          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'cog' : 'cog-outline'} color={color} />
          )
        }}
      />
    </Tabs>
  )
}
