import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import React from "react";
import { Slot } from "expo-router";

import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SquadaOne: require("../assets/fonts/SquadaOne.ttf"),
    Arial: require("../assets/fonts/Arial.ttf"),
    ArialBold: require("../assets/fonts/ArialBold.ttf"),
    ArialItalic: require("../assets/fonts/ArialItalic.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <Slot />;
}
