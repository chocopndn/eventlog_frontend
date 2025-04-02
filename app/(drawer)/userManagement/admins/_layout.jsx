import { Stack } from "expo-router";

import theme from "../../../../constants/theme";

const AdminsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="AddAdmin"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
      <Stack.Screen
        name="EditAdmin"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
      <Stack.Screen
        name="AdminDetails"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
    </Stack>
  );
};

export default AdminsLayout;
