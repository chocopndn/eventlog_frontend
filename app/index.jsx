import React, { useEffect, useState } from "react";
import { StyleSheet, Text, Image, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import theme from "../constants/theme";
import globalStyles from "../constants/globalStyles";
import images from "../constants/images";
import CustomButton from "../components/CustomButton";
import CustomModal from "../components/CustomModal";
import NetInfo from "@react-native-community/netinfo";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Arial: require("../assets/fonts/Arial.ttf"),
    ArialBold: require("../assets/fonts/ArialBold.ttf"),
    ArialItalic: require("../assets/fonts/ArialItalic.ttf"),
    SquadaOne: require("../assets/fonts/SquadaOne.ttf"),
  });
  const [appReady, setAppReady] = useState(false);
  const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          await SplashScreen.hideAsync();
          router.replace("/(tabs)/home");
          return;
        }

        if (!fontsLoaded || fontError) return;
      } catch (error) {
        console.error("Error during app preparation:", error);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, [fontsLoaded, fontError]);

  const handleLoginPress = async () => {
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      setIsOfflineModalVisible(true);
      return;
    }
    router.push("/login");
  };

  const handleRegisterPress = async () => {
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      setIsOfflineModalVisible(true);
      return;
    }
    router.push("/signup");
  };

  const closeOfflineModal = () => {
    setIsOfflineModalVisible(false);
  };

  if (!appReady || !fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { padding: 0 }]}>
      <Text style={styles.header}>EVENTLOG</Text>
      <View style={styles.logoContainer}>
        <Image source={images.logo} style={styles.logo} />
      </View>
      <Text style={styles.tagline}>Every CIT Event's Companion</Text>

      <View style={styles.buttons}>
        <View style={styles.loginContainer}>
          <CustomButton
            type="primary"
            title="LOG IN"
            onPress={handleLoginPress}
          />
        </View>
        <CustomButton
          type="secondary"
          title="REGISTER"
          onPress={handleRegisterPress}
        />
      </View>
      <StatusBar style="auto" />

      <CustomModal
        visible={isOfflineModalVisible}
        title="No Internet Connection"
        message="Please check your internet connection and try again."
        type="error"
        onClose={closeOfflineModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    fontSize: theme.fontSizes.display,
    textAlign: "center",
    marginTop: 20,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  logoContainer: {
    padding: 20,
  },
  tagline: {
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    fontSize: theme.fontSizes.huge,
    textAlign: "center",
  },
  buttons: {
    paddingTop: 20,
    paddingHorizontal: 20,
    width: "70%",
  },
  loginContainer: {
    marginBottom: theme.spacing.medium,
    marginTop: theme.spacing.medium,
  },
});
