import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../../../config/config";

import CustomButton from "../../../components/CustomButton";
import CustomModal from "../../../components/CustomModal";

import images from "../../../constants/images";

const clearResetEmail = async () => {
  try {
    await AsyncStorage.removeItem("resetEmail");
    router.replace("/login/ForgotPassword");
  } catch (error) {}
};

const VerifyCode = () => {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    const fetchResetEmail = async () => {
      const storedEmail = await AsyncStorage.getItem("resetEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    };

    fetchResetEmail();
  }, []);

  const isButtonSecondary = code.every((char) => char.length === 1);

  const handleInputChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleBackspace = (index) => {
    const newCode = [...code];
    newCode[index] = "";
    setCode(newCode);

    if (index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerifyCode = async () => {
    if (!isButtonSecondary) return;

    const verificationCode = code.join("");

    if (!email || verificationCode.length !== 5) {
      setErrorMessage("Invalid email or code.");
      setModalVisible(true);
      return;
    }

    try {
      const response = await axios.post(
        `http://${API_URL}/api/auth/verifyResetCode`,
        {
          email,
          reset_code: verificationCode,
        }
      );

      if (response.status === 200 && response.data.message) {
        router.replace("/login/SetPassword");
      } else {
        setErrorMessage("Verification failed. Please try again.");
        setModalVisible(true);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Unable to verify the code. Please try again later.";
      setErrorMessage(errorMsg);
      setModalVisible(true);
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
          <Text className="font-Arial text-[14px] color-secondary">
            Enter the 5-digit code sent to {email}
          </Text>
        </View>

        <View className="flex-row">
          {code.map((char, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              value={char}
              onChangeText={(text) => handleInputChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace") {
                  handleBackspace(index);
                }
              }}
              keyboardType="numeric"
              maxLength={1}
              className={`w-[50px] h-[55px] rounded-lg m-2 mb-10 text-[35px] font-ArialBold text-center text-primary leading-none pb-2 ${
                char ? "bg-secondary" : "bg-[#FBF1E580]"
              }`}
            />
          ))}
        </View>

        <CustomButton
          type={isButtonSecondary ? "secondary" : "disabled"}
          title="VERIFY CODE"
          onPress={handleVerifyCode}
          disabled={!isButtonSecondary}
          className="mt-5"
        />
      </View>
      <StatusBar style="light" />

      <CustomModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title="Verification Error"
        message={errorMessage}
      />
    </SafeAreaView>
  );
};

export default VerifyCode;
