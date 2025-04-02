import { Stack } from "expo-router";

const UserManagementLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="admins" />
      <Stack.Screen name="students" />
      <Stack.Screen name="roles" />
    </Stack>
  );
};

export default UserManagementLayout;
