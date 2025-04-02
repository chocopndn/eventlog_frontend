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
        name="events/index"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="events/PendingEvents"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="events/AddEvent"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="events/EditEvent"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="events/EventDetails"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />

      <Stack.Screen
        name="eventnames/index"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="eventnames/EventNameDetails"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="eventnames/EditEventName"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
      <Stack.Screen
        name="records/index"
        options={{
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerStyle: {
            backgroundColor: theme.colors.secondary,
          },
          title: "",
        }}
      />
    </Stack>
  );
};

export default AcademicManagementLayout;
