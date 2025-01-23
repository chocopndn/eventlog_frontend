import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../../config/config";

import FormField2 from "../../../components/FormField2";
import CustomButton from "../../../components/CustomButton";
import CustomModal from "../../../components/CustomModal";
import images from "../../../constants/images";

const clearResetEmail = async () => {
  try {
    await AsyncStorage.removeItem("resetEmail");
    router.push("./ForgotPassword");
  } catch {}
};

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetails, setModalDetails] = useState({
    title: "",
    message: "",
    type: "error",
  });

  const handleSavePassword = async () => {
    if (!password || !confirmPassword) {
      setModalDetails({
        title: "Input Error",
        message: "Both password fields are required.",
        type: "error",
      });
      setModalVisible(true);
      return;
    }

    if (password.length < 8) {
      setModalDetails({
        title: "Validation Error",
        message: "Password must be at least 8 characters long.",
        type: "error",
      });
      setModalVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalDetails({
        title: "Validation Error",
        message: "Passwords do not match.",
        type: "error",
      });
      setModalVisible(true);
      return;
    }

    try {
      const email = await AsyncStorage.getItem("resetEmail");
      if (!email) {
        setModalDetails({
          title: "Missing Email",
          message: "No email found. Please restart the process.",
          type: "error",
        });
        setModalVisible(true);
        return;
      }

      const response = await axios.post(
        `http://${API_URL}/api/user/resetPassword`,
        {
          email,
          newPassword: password,
        }
      );

      if (response.status === 200) {
        setModalDetails({
          title: "Success",
          message: "Your password has been updated successfully.",
          type: "success",
        });
        setModalVisible(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      setModalDetails({
        title: "Error",
        message: errorMessage,
        type: "error",
      });
      setModalVisible(true);
    }
  };

  const isButtonDisabled =
    !password ||
    !confirmPassword ||
    password.length < 8 ||
    confirmPassword.length < 8;

  const handleModalButtonPress = () => {
    if (modalDetails.type === "success") {
      router.replace("/login");
    } else {
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center h-full bg-primary pt-5">
      <View className="p-5 absolute top-5 justify-start w-full">
        <TouchableOpacity onPress={clearResetEmail}>
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
            CHECK YOUR EMAIL
          </Text>
          <Text className="font-Arial text-[14px] color-secondary pb-3">
            Your password must be different from your previous password and at
            least 8 characters long.
          </Text>
        </View>
        <FormField2
          type="password"
          title="New Password"
          placeholder="Enter your new password"
          value={password}
          onChangeText={setPassword}
        />
        <FormField2
          type="password"
          title="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <View className="mt-5">
          <CustomButton
            type={isButtonDisabled ? "disabled" : "secondary"}
            title="UPDATE PASSWORD"
            onPress={handleSavePassword}
            disabled={isButtonDisabled}
          />
        </View>
      </View>
      <CustomModal
        visible={modalVisible}
        onClose={handleModalButtonPress}
        title={modalDetails.title}
        message={modalDetails.message}
        type={modalDetails.type}
        buttonText={
          modalDetails.type === "success" ? "Go to Login" : "Try Again"
        }
      />
    </SafeAreaView>
  );
};

export default SetPassword;
