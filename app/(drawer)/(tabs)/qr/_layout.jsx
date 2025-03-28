import { Stack } from "expo-router";

const QRLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Generate" />
      <Stack.Screen name="Scan" />
    </Stack>
  );
};

export default QRLayout;
