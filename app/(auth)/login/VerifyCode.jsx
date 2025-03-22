import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";

import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import CustomModal from "../../../components/CustomModal";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";
import { API_URL } from "../../../config/config";

const VerifyCode = () => {
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleResend = () => {
    setTimer(60);
  };

  const handleVerifyCode = async () => {
    const enteredCode = code.join("");
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/reset-password/confirm`,
        {
          email,
          reset_code: enteredCode,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setTimeout(() => router.push("/login/NewPassword"));
      } else {
        setIsCodeValid(false);
        setModalType("error");
        setModalTitle("Error");
        setModalMessage("Invalid code, please try again.");
        setModalVisible(true);
      }
    } catch (error) {
      setIsCodeValid(false);
      setModalType("error");
      setModalTitle("Error");
      setModalMessage("Please check the code and try again.");
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={globalStyles.primaryContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.forgotPassword}>CHECK YOUR EMAIL</Text>
        <Text style={styles.info}>Enter the 5-digit code sent to {email}</Text>
      </View>

      <FormField
        type="code"
        value={code}
        onChangeText={setCode}
        error={!isCodeValid ? "Invalid code, please try again." : ""}
      />

      <CustomButton
        type="secondary"
        title="VERIFY CODE"
        onPress={handleVerifyCode}
      />

      <View style={styles.resendContainer}>
        <Text style={styles.question}>Didn't receive the email?</Text>
        {timer > 0 ? (
          <Text style={styles.timerText}>Resend email in {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendText}>Resend email</Text>
          </TouchableOpacity>
        )}
      </View>

      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default VerifyCode;

const styles = StyleSheet.create({
  forgotPassword: {
    fontFamily: "SquadaOne",
    fontSize: theme.fontSizes.huge,
    color: theme.colors.secondary,
  },
  headerContainer: {
    width: "80%",
    marginBottom: theme.spacing.medium,
  },
  info: {
    color: theme.colors.secondary,
    fontFamily: "Arial",
  },
  resendContainer: {
    marginTop: theme.spacing.medium,
    alignItems: "center",
  },
  timerText: {
    color: theme.colors.secondary,
    fontFamily: "Arial",
    fontSize: theme.fontSizes.small,
  },
  resendText: {
    color: theme.colors.secondary,
    fontFamily: "ArialBold",
    fontSize: theme.fontSizes.small,
  },
  question: {
    color: theme.colors.secondary,
    fontFamily: "Arial",
    fontSize: theme.fontSizes.small,
  },
});
