import { Stack } from "expo-router";

const AdminsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AdminsLayout;
