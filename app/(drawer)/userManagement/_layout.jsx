import { Stack } from "expo-router";
import theme from "../../../constants/theme";

const UserManagementLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="admins/index"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="admins/AdminDetails"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="admins/EditAdmin"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="admins/AddAdmin"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
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
    </Stack>
  );
};

export default UserManagementLayout;
