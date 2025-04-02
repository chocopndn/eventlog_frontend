import { Stack } from "expo-router";

import theme from "../../../constants/theme";

const AcademicManagementLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="records"
        options={{
          headerTintColor: theme.colors.secondary,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          title: "Records",
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
          title: "Events",
        }}
      />
    </Stack>
  );
};

export default AcademicManagementLayout;
