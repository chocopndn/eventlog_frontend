import { Stack } from "expo-router";

import theme from "../../../constants/theme";

const EventManagementLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />

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
        name="eventnames/AddEventName"
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

export default EventManagementLayout;
