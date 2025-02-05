import { Text, View, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import axios from "axios";
import Checkbox from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { saveUser, getStoredUser } from "../../../src/database/queries";
import images from "../../../constants/images";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import CustomModal from "../../../components/CustomModal";
import { API_URL } from "../../../config/config";
import useModal from "../../../hooks/useModal";

const LogIn = () => {
  const [id_number, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { modalVisible, modalDetails, showModal, hideModal } = useModal();
  const isButtonEnabled = id_number.length > 0 && password.length > 0;

  useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        const storedId = await AsyncStorage.getItem("storedIdNumber");
        const storedPass = await AsyncStorage.getItem("storedPassword");
        const rememberMe = await AsyncStorage.getItem("rememberMe");

        if (rememberMe === "true" && storedId && storedPass) {
          setIdNumber(storedId);
          setPassword(storedPass);
          setRememberPassword(true);
        }
      } catch (error) {
        console.error("Error loading stored credentials:", error);
      }
    };

    loadStoredCredentials();
  }, []);

  useEffect(() => {
    const checkStoredUser = async () => {
      const storedUser = await getStoredUser();
      if (storedUser) {
        router.replace("/home");
      }
    };

    checkStoredUser();
  }, []);

  const handleLogin = async () => {
    if (!id_number || !password) {
      showModal({
        title: "Input Error",
        message: "ID Number and Password are required.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        id_number,
        password,
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem("authToken", token);

      await saveUser(user);

      if (rememberPassword) {
        await AsyncStorage.setItem("storedIdNumber", id_number);
        await AsyncStorage.setItem("storedPassword", password);
        await AsyncStorage.setItem("rememberMe", "true");
      } else {
        await AsyncStorage.removeItem("storedIdNumber");
        await AsyncStorage.removeItem("storedPassword");
        await AsyncStorage.setItem("rememberMe", "false");
      }

      router.replace("/home");
    } catch (error) {
      showModal({
        title: "Login Failed",
        message: error.response?.data?.message || "Something went wrong.",
        type: "error",
        buttonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="items-center justify-center h-full bg-primary">
      <View className="w-full h-50 items-center justify-center">
        <View className="absolute w-full h-28 bg-secondary"></View>
        <View className="absolute w-[70%] h-10 bg-cyan-500 top-1/3 right-52"></View>
        <View className="absolute w-[70%] h-10 bg-cyan-500 bottom-1/3 left-52"></View>
        <View className="absolute w-[70%] h-10 bg-primary"></View>

        <View className="mt-5 mb-7">
          <Image source={images.logo} style={{ width: 160, height: 160 }} />
        </View>
      </View>

      <Text className="font-SquadaOne text-7xl text-secondary mb-5">
        WELCOME!
      </Text>
      <View>
        <FormField
          type="id"
          placeholder="ID Number"
          value={id_number}
          onChangeText={setIdNumber}
        />

        <FormField
          type="password"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center ml-6">
            <Checkbox
              value={rememberPassword}
              onValueChange={setRememberPassword}
              style={{
                width: 20,
                height: 20,
                borderColor: "#FBF1E5",
                borderWidth: 2,
                backgroundColor: "#FBF1E5",
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

          <View className="mr-6">
            <TouchableOpacity
              onPress={() => router.push("/login/ForgotPassword")}
            >
              <Text className="font-Arial color-secondary font-[12px]">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <CustomButton
        type={isButtonEnabled ? "secondary" : "disabled"}
        title={loading ? "Loading..." : "LOG IN"}
        onPress={handleLogin}
        disabled={loading || !isButtonEnabled}
      />

      <View className="flex-row mt-5">
        <Text className="font-Arial text-secondary text-[15px]">
          Don't Have An Account?{" "}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/SignUp")}>
          <Text className="font-Arial font-bold text-secondary text-[15px]">
            Register.
          </Text>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={modalVisible}
        onClose={hideModal}
        title={modalDetails.title}
        message={modalDetails.message}
        buttonText={modalDetails.buttonText}
      />

      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default LogIn;
