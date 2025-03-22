import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import axios from "axios";

import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";
import { API_URL } from "../../../config/config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email: email,
      });

      if (response.status === 200) {
        router.push("/login/VerifyCode");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  return (
    <SafeAreaView style={globalStyles.primaryContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.forgotPassword}>FORGOT PASSWORD</Text>
        <Text style={styles.info}>
          Please enter your email to reset password
        </Text>
      </View>
      <View style={styles.inputContainer}>
        <FormField
          type="email"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          type="secondary"
          title="RESET PASSWORD"
          onPress={handleResetPassword}
        />
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default ForgotPassword;

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
