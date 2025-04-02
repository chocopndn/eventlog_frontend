import { Stack } from "expo-router";

import theme from "../../../constants/theme";

const UserManagementLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="admins"
        options={{
          headerTintColor: theme.colors.secondary,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          title: "Admins",
        }}
      />
      <Stack.Screen
        name="students"
        options={{
          headerTintColor: theme.colors.secondary,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          title: "Students",
        }}
      />
      <Stack.Screen
        name="roles"
        options={{
          headerTintColor: theme.colors.secondary,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          title: "Roles",
        }}
      />
    </Stack>
  );
};

export default UserManagementLayout;
