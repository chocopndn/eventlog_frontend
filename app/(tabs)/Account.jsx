import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import { clearUser } from "../../src/database/queries";
const Account = () => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await clearUser();
      router.replace("/login");
    } catch (error) {}
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-2xl font-bold mb-5">Account</Text>
      <TouchableOpacity
        className="px-5 py-3 bg-red-500 rounded-md"
        onPress={handleLogout}
      >
        <Text className="text-white text-lg font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Account;
