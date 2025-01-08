import React from "react";
import { Text, View, Image } from "react-native";
import { router } from "expo-router";

import images from "../constants/images";
import { StatusBar } from "expo-status-bar";

import CustomButton from "../components/CustomButton";

export default function App() {
  const login = () => {
    router.push("./login");
  };

  const signup = () => {
    router.push("./signup");
  };

  return (
    <View className="items-center justify-center h-[100%] bg-secondary">
      <Text className="text-[80px] font-SquadaOne color-primary">EVENTLOG</Text>
      <View className="mt-5 mb-7">
        <Image source={images.logo} className="w-52 h-52" />
      </View>
      <Text className="font-SquadaOne color-primary text-[29px]">
        Every CIT Event's Companion
      </Text>

      <View className="mt-5">
        <CustomButton type="primary" title="LOG IN" onPress={login} />
        <CustomButton type="secondary" title="REGISTER" onPress={signup} />
      </View>

      <StatusBar style="dark" />
    </View>
  );
}
