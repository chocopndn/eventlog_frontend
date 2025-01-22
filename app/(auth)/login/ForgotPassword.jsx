import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "../../../config/config";

import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";

import images from "../../../constants/images";

const handleDismissAll = () => {
  router.dismissAll();
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isButtonSecondary = email.length > 0;

  const handleResetPassword = () => {
    if (!email) {
      setErrorMessage("Email is required.");
      return;
    }

    setErrorMessage("");

    router.replace("./VerifyCode");

    axios
      .post(`http://${API_URL}/api/auth/resetPassword`, { email })
      .then((response) => {
        console.log("API response:", response.data);
      })
      .catch((error) => {
        console.error("API error:", error);
        if (error.response) {
          setErrorMessage(
            error.response.data?.message ||
              "Something went wrong. Please try again."
          );
        } else if (error.request) {
          setErrorMessage(
            "Unable to connect to the server. Check your internet connection."
          );
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      });
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center h-full bg-primary pt-5">
      <View className="p-5 absolute top-5 justify-start w-full">
        <TouchableOpacity onPress={handleDismissAll}>
          <View className="w-[40px] h-[40px] items-center justify-center border-[3px] border-secondary rounded-full">
            <Image
              source={images.arrowLeft}
              className="w-[24px] h-[24px]"
              style={{ tintColor: "#FBF1E5" }}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View className="w-full justify-center items-center">
        <View className="w-[85%] items-start">
          <Text className="color-secondary font-SquadaOne text-[30px]">
            FORGOT PASSWORD?
          </Text>
          <Text className="font-Arial text-[12px] color-secondary">
            Please enter your email to reset the password
          </Text>
        </View>
        <FormField
          type="email2"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />

        <CustomButton
          type={isButtonSecondary ? "secondary" : "disabled"}
          title="RESET PASSWORD"
          onPress={handleResetPassword}
          disabled={!isButtonSecondary}
          className="mt-5"
        />
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default ForgotPassword;
