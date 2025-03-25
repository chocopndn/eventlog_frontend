import React, { useEffect, useState } from "react";
import { StyleSheet, Text, Image, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/config";
import { storeDepartments, storeBlocks } from "../database/queries";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import theme from "../constants/theme";
import globalStyles from "../constants/globalStyles";
import images from "../constants/images";
import CustomButton from "../components/CustomButton";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Arial: require("../assets/fonts/Arial.ttf"),
    ArialBold: require("../assets/fonts/ArialBold.ttf"),
    ArialItalic: require("../assets/fonts/ArialItalic.ttf"),
    SquadaOne: require("../assets/fonts/SquadaOne.ttf"),
  });
  const [hasFetched, setHasFetched] = useState(false);
  const [appReady, setAppReady] = useState(false);

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

        if (!hasFetched) {
          const deptResponse = await axios.get(`${API_URL}/api/departments`);
          const fetchedDepartments = deptResponse.data?.data || [];
          await storeDepartments(fetchedDepartments);

          const blocksResponse = await axios.get(`${API_URL}/api/blocks`);
          const fetchedBlocks = blocksResponse.data?.data || [];
          await storeBlocks(blocksResponse.data);

          setHasFetched(true);
        }
      } catch (error) {
        console.error("Error during app preparation:", error);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, [fontsLoaded, fontError, hasFetched]);

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
            title="Log In"
            onPress={() => router.push("/login")}
          />
        </View>
        <CustomButton
          type="secondary"
          title="Register"
          onPress={() => router.push("/signup")}
        />
      </View>
      <StatusBar style="auto" />
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
  },
  loginContainer: {
    marginBottom: theme.spacing.medium,
    marginTop: theme.spacing.medium,
  },
});
