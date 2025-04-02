import { Stack } from "expo-router";

const RecordsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RecordsLayout;
