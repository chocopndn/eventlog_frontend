import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";

const VerifyCode = () => {
  const [email, setEmail] = useState("chocopndn@gmail.com");
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleResend = () => {
    setTimer(60);

    console.log("Resending code to:", email);
  };

  return (
    <SafeAreaView style={globalStyles.primaryContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.forgotPassword}>CHECK YOUR EMAIL</Text>
        <Text style={styles.info}>Enter the 5-digit code sent to {email}</Text>
      </View>

      <FormField type="code" value={code} onChangeText={setCode} />

      <CustomButton
        type="secondary"
        title="VERIFY CODE"
        onPress={() => router.push("/login/NewPassword")}
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
