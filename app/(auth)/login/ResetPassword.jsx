import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
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
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          type="secondary"
          title="RESET PASSWORD"
          onPress={() => {
            router.push("/login/VerifyCode");
          }}
        />
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default ResetPassword;

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
