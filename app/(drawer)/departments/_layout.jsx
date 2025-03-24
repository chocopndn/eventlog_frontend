import { Stack } from "expo-router";

const DepartmentsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default DepartmentsLayout;
