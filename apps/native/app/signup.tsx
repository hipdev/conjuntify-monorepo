import { Link, router } from "expo-router";
import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/dist/react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function SignupScreen() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = () => {
    if (password !== confirmPassword) {
      // You might want to show an error message to the user here
      console.error("Passwords do not match");
      return;
    }

    try {
      void signIn("password", { email, password, flow: "signUp" });
      router.replace("/(tabs)/");
    } catch (error) {
      console.error("Sign-up failed:", error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-white dark:bg-gray-900">
      <Text className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Conjuntify
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
        className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg py-3 px-4 mb-3"
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg py-3 px-4 mb-6"
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="w-full bg-green-500 rounded-lg py-3 px-4 mb-3"
        onPress={handleSignup}
      >
        <Text className="text-white text-center font-bold">Registrarse</Text>
      </TouchableOpacity>
      <Link href="/" asChild>
        <TouchableOpacity>
          <Text className="text-blue-500">
            ¿Ya tienes una cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
