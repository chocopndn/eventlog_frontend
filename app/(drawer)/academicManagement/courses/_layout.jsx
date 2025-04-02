import { Stack } from "expo-router";

import theme from "../../../../constants/theme";

const CoursesLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="AddCourse"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
      <Stack.Screen
        name="EditCourse"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
      <Stack.Screen
        name="CourseDetails"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
    </Stack>
  );
};

export default CoursesLayout;
