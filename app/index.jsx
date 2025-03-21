import React, { useEffect } from "react";
import { StyleSheet, Text, Image, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import theme from "../constants/theme";
import globalStyles from "../constants/globalStyles";
import images from "../constants/images";

import CustomButton from "../components/CustomButton";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    Arial: require("../assets/fonts/Arial.ttf"),
    ArialBold: require("../assets/fonts/ArialBold.ttf"),
    ArialItalic: require("../assets/fonts/ArialItalic.ttf"),
    SquadaOne: require("../assets/fonts/SquadaOne.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <Text style={styles.header}>EVENTLOG</Text>
      <View style={styles.logoContainer}>
        <Image source={images.logo} style={styles.logo} />
      </View>
      <Text style={styles.tagline}>Every CIT Event's Companion</Text>

      <View style={styles.buttons}>
        <CustomButton type="primary" title="Log In" />
        <CustomButton type="secondary" title="Register" />
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
  },
  logo: {
    width: 200,
    height: 200,
  },
  logoContainer: {
    padding: 20,
  },
  tagline: {
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    fontSize: theme.fontSizes.huge,
  },
  buttons: {
    paddingTop: 20,
  },
});
