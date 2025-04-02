import { Stack } from "expo-router";

import theme from "../../../../constants/theme";

const BlocksLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="AddBlock"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
      <Stack.Screen
        name="EditBlock"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
      <Stack.Screen
        name="BlockDetails"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
    </Stack>
  );
};

export default BlocksLayout;
