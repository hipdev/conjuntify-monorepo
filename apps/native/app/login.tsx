import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link, Redirect } from "expo-router";
import { useConvexAuth } from "convex/react";
import { ActivityIndicator } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">
          Cargando Conjuntify...
        </Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/" />;
  }

  const handleLogin = () => {
    // Implement login logic here
    console.log("Login attempted with:", email, password);
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-white dark:bg-gray-900">
      <Text className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Entrar a Conjuntify
      </Text>
      <TextInput
        className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg py-3 px-4 mb-3"
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg py-3 px-4 mb-6"
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="w-full bg-blue-500 rounded-lg py-3 px-4 mb-3"
        onPress={handleLogin}
      >
        <Text className="text-white text-center font-bold">Entrar</Text>
      </TouchableOpacity>
      <Link href="/signup" asChild>
        <TouchableOpacity>
          <Text className="text-blue-500">
            ¿No tienes una cuenta? Registrate
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
