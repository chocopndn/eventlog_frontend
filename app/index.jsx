import React from "react";
import { Text, View, Image } from "react-native";
import { router } from "expo-router";

import images from "../constants/images";
import { StatusBar } from "expo-status-bar";

import CustomButton from "../components/CustomButton";

const App = () => {
  const login = () => {
    router.push("./LogIn");
  };

  const signup = () => {
    router.push("./SignUp");
  };

  return (
    <View className="items-center justify-center h-full bg-secondary">
      <Text className="text-[80px] font-SquadaOne color-primary">EVENTLOG</Text>
      <View className="mt-5 mb-7">
        <Image source={images.logo} className="w-[196px] h-[196px]" />
      </View>
      <Text className="font-SquadaOne color-primary text-[30px]">
        Every CIT Event's Companion
      </Text>

      <View className="mt-5">
        <CustomButton type="primary" title="LOG IN" onPress={login} />
        <CustomButton type="secondary" title="REGISTER" onPress={signup} />
      </View>

      <StatusBar style="dark" />
    </View>
  );
};

export default App;
