import { Stack } from "expo-router";

const StudentsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default StudentsLayout;
