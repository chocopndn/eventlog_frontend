import React from "react";
import { Text, View, Image } from "react-native";

import images from "../constants/images";
import { StatusBar } from "expo-status-bar";

import CustomButton from "../components/CustomButton";

export default function App() {
  return (
    <View className="items-center justify-center h-[100%]">
      <Text className="text-[80px] font-SquadaOne color-primary">EVENTLOG</Text>
      <View className="mt-5 mb-7">
        <Image source={images.logo} className="w-52 h-52" />
      </View>
      <Text className="font-SquadaOne color-primary text-[29px]">
        Every CIT Event's Companion
      </Text>

      <View className="mt-5">
        <CustomButton type="primary" title="LOG IN" />
        <CustomButton type="disabled" title="REGISTER" />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}
