import { Stack } from "expo-router";

import theme from "../../../../constants/theme";

const AccountLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="AddEvent"
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
        }}
      />
      <Stack.Screen
        name="EditEvent"
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
        }}
      />
      <Stack.Screen
        name="EventsList"
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
        }}
      />
    </Stack>
  );
};

export default AccountLayout;
