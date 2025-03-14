import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="AddEvent" options={{ headerShown: false }} />
      <Stack.Screen name="EditEvent" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
