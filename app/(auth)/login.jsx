import { Text, View, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";

import images from "../../constants/images";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

const LogIn = () => {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isButtonSecondary = idNumber.length > 0 && password.length > 0;

  useEffect(() => {
    const checkAuthToken = async () => {
      const authToken = await AsyncStorage.getItem("authToken");
      if (authToken) {
        router.replace("../(tabs)/Home");
      }
    };

    checkAuthToken();
  }, []);

  useEffect(() => {
    const loadCredentials = async () => {
      const storedId = await AsyncStorage.getItem("storedIdNumber");
      const storedPassword = await AsyncStorage.getItem("storedPassword");
      if (storedId && storedPassword) {
        setIdNumber(storedId);
        setPassword(storedPassword);
        setRememberPassword(true);
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (!idNumber || !password) {
      setErrorMessage("ID Number and Password are required.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.1.239:3000/api/auth/login",
        { student_ID: idNumber, password }
      );

      const { token } = response.data;

      if (rememberPassword) {
        await AsyncStorage.setItem("storedIdNumber", idNumber);
        await AsyncStorage.setItem("storedPassword", password);
      } else {
        await AsyncStorage.removeItem("storedIdNumber");
        await AsyncStorage.removeItem("storedPassword");
      }

      await AsyncStorage.setItem("authToken", token);

      router.replace("../(tabs)/Home");
    } catch (error) {
      if (error.response) {
        setErrorMessage(
          error.response.data?.message ||
            "Something went wrong. Please try again."
        );
      } else if (error.request) {
        setErrorMessage(
          "Unable to connect to the server. Please check your internet connection."
        );
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = () => {
    router.push("./SignUp");
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
      <View>
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

        <View className="flex-row items-center ml-6 mt-3">
          <Checkbox
            value={rememberPassword}
            onValueChange={setRememberPassword}
            style={{
              width: 20,
              height: 20,
              borderColor: "white",
              borderWidth: 2,
              backgroundColor: "white",
            }}
            color={rememberPassword ? "#81b0ff" : undefined}
          />
          <TouchableOpacity
            className="ml-2"
            onPress={() => setRememberPassword(!rememberPassword)}
          >
            <Text className="text-white">Remember Me</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-red-500 text-s mt-2">{errorMessage}</Text>

      <CustomButton
        type={isButtonSecondary ? "secondary" : "disabled"}
        title={loading ? "Loading..." : "LOG IN"}
        onPress={handleLogin}
        disabled={loading || !isButtonSecondary}
        className="mt-5"
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
