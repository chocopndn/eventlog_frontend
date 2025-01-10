import { Text, View, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import images from "../../constants/images";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

const LogIn = () => {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");

  const isButtonSecondary = idNumber.length > 0 && password.length > 0;

  const signup = () => {
    router.push("./signup");
  };

  return (
    <View className="items-center justify-center h-full bg-primary">
      <View className="w-full h-50 items-center justify-center">
        <View className="absolute w-full h-28 bg-secondary"></View>
        <View className="absolute w-[70%] h-10 bg-cyan-500 top-1/3 right-52"></View>
        <View className="absolute w-[70%] h-10 bg-cyan-500 bottom-1/3 left-52"></View>
        <View className="absolute w-[70%] h-10 bg-primary"></View>

        <View className="mt-5 mb-7">
          <Image source={images.logo} className="w-[196px] h-[196px]" />
        </View>
      </View>

      <Text className="font-SquadaOne text-7xl text-secondary mb-5">
        WELCOME!
      </Text>

      <FormField
        type="id"
        placeholder="ID Number"
        value={idNumber}
        onChangeText={setIdNumber}
      />
      <FormField
        type="password"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />

      <CustomButton
        type={isButtonSecondary ? "secondary" : "disabled"}
        title="LOG IN"
      />

      <View className="flex-row mt-5">
        <Text className="font-Arial text-white">Don't Have An Account? </Text>
        <TouchableOpacity onPress={signup}>
          <Text className="font-Arial font-bold text-white">Register.</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </View>
  );
};

export default LogIn;
