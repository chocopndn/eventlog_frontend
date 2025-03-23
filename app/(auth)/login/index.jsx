import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Checkbox from "expo-checkbox";
import axios from "axios";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomModal from "../../../components/CustomModal";

import theme from "../../../constants/theme";
import globalStyles from "../../../constants/globalStyles";
import Header from "../../../components/Header";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import { API_URL } from "../../../config/config";

const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const handleLogin = async () => {
    if (!id || !password) {
      setModalTitle("Login Error");
      setModalMessage("Please enter your credentials.");
      setModalType("error");
      setModalVisible(true);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        id_number: id,
        password: password,
      });

      if (response.status === 200) {
        await AsyncStorage.setItem("userToken", response.data.token);
        router.replace("/(tabs)/home");
      } else {
        setModalTitle("Login Failed");
        setModalMessage(
          response.data.message || "Invalid credentials. Please try again."
        );
        setModalType("error");
        setModalVisible(true);
      }
    } catch (error) {
      setModalTitle("Login Error");
      setModalMessage(
        error.response?.data?.message || "An error occurred during login."
      );
      setModalType("error");
      setModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={globalStyles.primaryContainer}>
      <Header type="primary" />
      <Text style={styles.header}>WELCOME!</Text>
      <FormField
        type="id"
        value={id}
        onChangeText={setId}
        placeholder="ID Number"
      />
      <FormField
        type="password"
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
      />
      <View style={styles.rememberForgotContainer}>
        <View style={styles.rememberMeContainer}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? "#81b0ff" : undefined}
          />
          <TouchableOpacity onPress={() => setChecked(!isChecked)}>
            <Text style={styles.rememberMe}>Remember Me</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.forgotPassContainer}>
          <TouchableOpacity
            onPress={() => {
              router.push("/login/ForgotPassword");
            }}
          >
            <Text style={styles.forgotPass}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CustomButton type="secondary" title="Login" onPress={handleLogin} />

      <View style={styles.registerContainer}>
        <Text style={styles.registerQ}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  header: {
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.display,
    fontFamily: "SquadaOne",
    marginBottom: theme.spacing.medium,
  },
  checkbox: {
    marginRight: theme.spacing.small,
    borderColor: theme.colors.secondary,
    borderWidth: 2,
    backgroundColor: "#FBF1E5",
    width: 20,
    height: 20,
  },
  rememberMe: {
    fontFamily: "Arial",
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    marginBottom: theme.spacing.large,
  },
  forgotPass: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    fontFamily: "Arial",
  },
  registerQ: {
    color: theme.colors.secondary,
    fontFamily: "Arial",
    paddingRight: theme.spacing.small,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: theme.spacing.medium,
  },
  registerLink: {
    color: theme.colors.secondary,
    fontFamily: "ArialBold",
  },
});
