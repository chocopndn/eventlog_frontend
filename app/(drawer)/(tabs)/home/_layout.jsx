import { Stack } from "expo-router";

import theme from "../../../../constants/theme";

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Welcome" options={{ headerShown: false }} />
    </Stack>
  );
};

export default HomeLayout;
