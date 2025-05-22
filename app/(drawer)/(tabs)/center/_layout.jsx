import { Stack } from "expo-router";

import theme from "../../../../constants/theme";

const CenterLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
          title: "Tutorial",
        }}
      />
    </Stack>
  );
};

export default CenterLayout;
