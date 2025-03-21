import { Stack, useRouter } from "expo-router";

import theme from "../../../constants/theme";

const LoginLayout = () => {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="ForgotPassword"
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.secondary,
        }}
      />
      <Stack.Screen
        name="VerifyCode"
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.secondary,
        }}
      />
    </Stack>
  );
};

export default LoginLayout;
