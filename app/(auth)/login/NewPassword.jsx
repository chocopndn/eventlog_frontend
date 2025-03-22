import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
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

const NewPassword = () => {
  const { email } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setModalType("error");
      setModalTitle("Password Mismatch");
      setModalMessage("Passwords do not match. Please try again.");
      setModalVisible(true);
      return;
    }
    if (password.length < 8) {
      setModalType("error");
      setModalTitle("Invalid Password");
      setModalMessage("Password should be at least 8 characters long.");
      setModalVisible(true);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/users/change-password`,
        {
          email: email,
          newPassword: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setModalType("success");
        setModalTitle("Success");
        setModalMessage("Password successfully reset. Please log in.");
        setModalVisible(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setModalType("error");
        setModalTitle("Error");
        setModalMessage(
          response.data?.message ||
            "Failed to reset password. Please try again."
        );
        setModalVisible(true);
      }
    } catch (error) {
      setModalType("error");
      setModalTitle("Error");
      setModalMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={globalStyles.primaryContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.forgotPassword}>SET NEW PASSWORD</Text>
        <Text style={styles.info}>
          Your password should be at least 8 characters long
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <FormField
          type="password"
          placeholder="Enter your new password"
          value={password}
          onChangeText={setPassword}
          title="New Password"
        />
        <FormField
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          title="Confirm Password"
        />
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          type="secondary"
          title="RESET PASSWORD"
          onPress={handleResetPassword}
        />
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

export default NewPassword;

const styles = StyleSheet.create({
  forgotPassword: {
    fontFamily: "SquadaOne",
    fontSize: theme.fontSizes.huge,
    color: theme.colors.secondary,
  },
  headerContainer: {
    width: "80%",
  },
  info: {
    color: theme.colors.secondary,
    fontFamily: "Arial",
  },
  buttonContainer: {
    marginTop: theme.spacing.medium,
  },
  inputContainer: {
    marginTop: theme.spacing.medium,
  },
});
