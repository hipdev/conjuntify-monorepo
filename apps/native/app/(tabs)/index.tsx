import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

export default function HomeScreen() {
  const user = useQuery(api.users.currentUser);
  const updateUser = useMutation(api.users.updateUserName);
  const createCondoApplication = useMutation(api.users.createCondoApplication);

  const [name, setName] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [withWhatsapp, setWithWhatsapp] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [cc, setCc] = useState("");
  const [propertyRegistration, setPropertyRegistration] = useState("");

  const handleNameSubmit = async () => {
    if (name) {
      await updateUser({ name: name.trim() });
    }
  };

  const handleDetailsSubmit = async () => {
    if (uniqueCode && unitNumber && buildingNumber) {
      await createCondoApplication({
        uniqueCode,
        unitNumber,
        buildingNumber,
        phone,
        withWhatsapp,
        isOwner,
        cc,
        propertyRegistration,
      });
    }
  };

  if (!user) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 px-4">
        <View className="flex-1 justify-center items-center p-4">
          {!user.name ? (
            <View className="w-full">
              <Text className="text-lg font-semibold mb-2">
                ¿Cómo te llamas?
              </Text>
              <TextInput
                className="w-full border border-gray-300 rounded-md p-2 mb-4"
                value={name}
                onChangeText={setName}
                placeholder="Escribe tu nombre"
              />
              <TouchableOpacity
                className="bg-blue-500 py-2 px-4 rounded"
                onPress={handleNameSubmit}
              >
                <Text className="text-center text-white font-bold">Enviar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="w-full">
              <Text className="text-2xl font-bold mb-2">
                Bienvenido {user.name}!
              </Text>
              <Text className="text-lg font-semibold mb-5">
                Por favor, proporciona más detalles:
              </Text>
              <TextInput
                className="w-full border border-gray-300 rounded-md p-4 mb-4"
                value={uniqueCode}
                onChangeText={setUniqueCode}
                placeholder="Código de la urbanización"
                placeholderTextColor="#777"
              />
              <TextInput
                className="w-full border border-gray-300 rounded-md p-4 mb-4"
                value={unitNumber}
                onChangeText={setUnitNumber}
                placeholder="Número de apartamento"
                placeholderTextColor="#777"
                keyboardType="numeric"
              />
              <TextInput
                className="w-full border border-gray-300 rounded-md p-4 mb-4"
                value={buildingNumber}
                onChangeText={setBuildingNumber}
                placeholder="Número de edificio (si es necesario)"
                placeholderTextColor="#777"
              />

              <TextInput
                className="w-full border border-gray-300 rounded-md p-4 mb-4"
                value={phone}
                onChangeText={setPhone}
                placeholder="Número de teléfono"
                keyboardType="phone-pad"
                placeholderTextColor="#777"
              />
              <View className="flex-row items-center mb-4">
                <Switch value={withWhatsapp} onValueChange={setWithWhatsapp} />
                <Text className="ml-2">
                  Podemos contactar contigo por WhatsApp
                </Text>
              </View>
              <View className="flex-row items-center mb-4">
                <Switch value={isOwner} onValueChange={setIsOwner} />
                <Text className="ml-2">Soy el propietario</Text>
              </View>
              {isOwner && (
                <>
                  <TextInput
                    className="w-full border border-gray-300 rounded-md p-4 mb-4"
                    value={cc}
                    onChangeText={setCc}
                    placeholder="Número de identificación"
                    placeholderTextColor="#777"
                  />
                  <TextInput
                    className="w-full border border-gray-300 rounded-md p-4 mb-4"
                    value={propertyRegistration}
                    onChangeText={setPropertyRegistration}
                    placeholder="Matrícula inmobiliaria"
                    placeholderTextColor="#777"
                  />
                </>
              )}

              <TouchableOpacity
                className="bg-blue-500 py-4 mt-10 px-4 rounded"
                onPress={handleDetailsSubmit}
              >
                <Text className="text-center text-white font-bold">
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
