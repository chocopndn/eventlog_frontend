import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../../config/config";

import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import CustomModal from "../../../components/CustomModal";
import images from "../../../constants/images";
import useModal from "../../../hooks/useModal";

const clearResetEmail = async () => {
  try {
    await AsyncStorage.removeItem("resetEmail");
  } catch (error) {}
};

const handleDismissAll = async () => {
  await clearResetEmail();
  router.replace("/login");
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { modalVisible, modalDetails, showModal, hideModal } = useModal();

  const isButtonSecondary = email.length > 0;

  const handleResetPassword = async () => {
    if (!email) {
      showModal({
        title: "Input Error",
        message: "Email is required.",
        type: "error",
      });
      return;
    }

    if (!isValidEmail(email)) {
      showModal({
        title: "Validation Error",
        message: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email,
      });

      if (response.status === 200) {
        await AsyncStorage.setItem("resetEmail", email);
        router.push("/login/VerifyCode");
      }
    } catch (error) {
      let title = "Error";
      let message = "An unexpected error occurred. Please try again.";

      if (error.response) {
        const statusCode = error.response.status;

        if (statusCode === 404) {
          title = "USER NOT FOUND";
          message =
            "The email address entered is not associated with any account.";
        } else if (statusCode === 500) {
          title = "SERVER ERROR";
          message = "The server encountered an error. Please try again later.";
        } else {
          message =
            error.response.data?.message ||
            "Something went wrong. Please try again.";
        }
      } else if (error.request) {
        message =
          "Unable to connect to the server. Check your internet connection.";
      }

      showModal({ title, message, type: "error" });
    }
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
          <Text className="color-secondary font-SquadaOne text-[35px]">
            FORGOT PASSWORD?
          </Text>
          <Text className="font-Arial text-[14px] color-secondary">
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

      <CustomModal
        visible={modalVisible}
        onClose={hideModal}
        title={modalDetails.title}
        message={modalDetails.message}
        type={modalDetails.type}
        buttonText="Close"
        buttonAction={hideModal}
      />
    </SafeAreaView>
  );
};

export default ForgotPassword;
