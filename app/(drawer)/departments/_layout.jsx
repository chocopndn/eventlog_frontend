import { Stack } from "expo-router";

import theme from "../../../constants/theme";

const DepartmentsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="AddDepartment"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
      <Stack.Screen
        name="EditDepartment"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
      <Stack.Screen
        name="DepartmentDetails"
        options={{
          headerTitle: "",
          headerTintColor: theme.colors.secondary,
          headerStyle: { backgroundColor: theme.colors.primary },
        }}
      />
    </Stack>
  );
};

export default DepartmentsLayout;
