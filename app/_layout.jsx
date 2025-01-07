import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import React from "react";
import { Slot } from "expo-router";

SplashScreen.preventAutoHideAsync();

import "../global.css";

export default function RootLayout() {
  const [loaded, error] = useFonts({
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

  return <Slot />;
}
