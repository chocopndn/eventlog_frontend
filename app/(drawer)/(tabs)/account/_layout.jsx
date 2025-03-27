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
          headerTitle: "Add Event",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
          headerTitle: "Edit Event",
        }}
      />
      <Stack.Screen
        name="EventsList"
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
          headerTitle: "Events List",
        }}
      />
    </Stack>
  );
};

export default AccountLayout;
