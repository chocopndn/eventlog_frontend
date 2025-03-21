import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";

const ForgotPassword = () => {
  const [password, setPassword] = useState("");
  return (
    <SafeAreaView style={globalStyles.primaryContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.forgotPassword}>FORGOT PASSWORD</Text>
        <Text style={styles.info}>
          Please enter your email to reset password
        </Text>
      </View>

      <FormField
        type="email"
        placeholder="Email"
        value={password}
        onChangeText={setPassword}
      />

      <CustomButton type="secondary" title="RESET PASSWORD" />

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
});
