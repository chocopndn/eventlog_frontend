import { Stack } from "expo-router";

import theme from "../../../constants/theme";

const AcademicManagementLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="blocks"
        options={{
          headerTintColor: theme.colors.secondary,
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          title: "Blocks",
        }}
      />
      <Stack.Screen
        name="courses"
        options={{
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
          title: "Courses",
        }}
      />
      <Stack.Screen
        name="departments"
        options={{
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
          title: "Departments",
        }}
      />
    </Stack>
  );
};

export default AcademicManagementLayout;
