import { Text, View, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "../../../constants/images";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import CustomModal from "../../../components/CustomModal";
import { API_URL } from "../../../config/config";
import useModal from "../../../hooks/useModal";

const LogIn = () => {
  const [student_id, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { modalVisible, modalDetails, showModal, hideModal } = useModal();

  const isButtonSecondary = student_id.length > 0 && password.length > 0;

  useEffect(() => {
    const checkAuthToken = async () => {
      const authToken = await AsyncStorage.getItem("authToken");
      if (authToken) {
        router.replace("/home");
      }
    };

    checkAuthToken();
  }, []);

  useEffect(() => {
    const loadCredentials = async () => {
      const storedId = await AsyncStorage.getItem("storedStudentId");
      const storedPassword = await AsyncStorage.getItem("storedPassword");
      if (storedId && storedPassword) {
        setStudentId(storedId);
        setPassword(storedPassword);
        setRememberPassword(true);
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (!student_id || !password) {
      showModal({
        title: "Input Error",
        message: "ID Number and Password are required.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`http://${API_URL}/api/auth/login`, {
        student_id,
        password,
      });

      const { token } = response.data;

      if (rememberPassword) {
        await AsyncStorage.setItem("storedStudentId", student_id);
        await AsyncStorage.setItem("storedPassword", password);
      } else {
        await AsyncStorage.removeItem("storedStudentId");
        await AsyncStorage.removeItem("storedPassword");
      }

      await AsyncStorage.setItem("authToken", token);

      router.replace("/home");
    } catch (error) {
      if (error.response) {
        showModal({
          title: "Login Failed",
          message:
            error.response.data?.message ||
            "Something went wrong. Please try again.",
          type: "error",
          buttonText: "Retry",
        });
      } else if (error.request) {
        showModal({
          title: "Network Error",
          message:
            "Unable to connect to the server. Please check your internet connection.",
          type: "error",
          buttonText: "Retry",
        });
      } else {
        showModal({
          title: "Unexpected Error",
          message: "An error occurred. Please try again later.",
          type: "error",
          buttonText: "Retry",
        });
      }
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
          value={student_id}
          onChangeText={setStudentId}
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
        type={isButtonSecondary ? "secondary" : "disabled"}
        title={loading ? "Loading..." : "LOG IN"}
        onPress={handleLogin}
        disabled={loading || !isButtonSecondary}
        className="mt-5"
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
