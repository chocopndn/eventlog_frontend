import { Stack } from "expo-router";
import theme from "../../../../constants/theme";

const RecordsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="Attendance"
        options={{
          headerTitle: "Attendance",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
        }}
      />
    </Stack>
  );
};

export default RecordsLayout;
