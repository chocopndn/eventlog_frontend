import { Stack } from "expo-router";

const LoginLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" options={{ headerShown: false }} />
      <Stack.Screen name="VerifyCode" options={{ headerShown: false }} />
      <Stack.Screen name="SetPassword" options={{ headerShown: false }} />
    </Stack>
  );
};

export default LoginLayout;
