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
        name="roles/index"
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
        name="students/index"
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
        name="students/AddStudent"
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
        name="students/EditStudent"
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
        name="students/StudentDetails"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
    </Stack>
  );
};

export default UserManagementLayout;
