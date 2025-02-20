import React from "react";
import { Stack } from "expo-router";

const QRCodeLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Generate" options={{ headerShown: false }} />
      <Stack.Screen name="Scan" options={{ headerShown: false }} />
    </Stack>
  );
};

export default QRCodeLayout;
