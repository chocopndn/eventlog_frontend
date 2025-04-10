import { Stack } from "expo-router";
import { useEffect, useState } from "react";

import theme from "../../../../constants/theme";
import { getRoleID } from "../../../../database/queries";

const AccountLayout = () => {
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const fetchRoleId = async () => {
      const id = await getRoleID();
      setRoleId(id);
    };

    fetchRoleId();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: roleId !== 4,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
          title: "Account",
        }}
      />
      <Stack.Screen
        name="AddEvent"
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
          headerTitle: "Add Event",
        }}
      />
      <Stack.Screen
        name="EditEvent"
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
          headerTitle: "Edit Event",
        }}
      />
      <Stack.Screen
        name="EventsList"
        options={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
          headerTitle: "Editable Events",
        }}
      />
    </Stack>
  );
};

export default AccountLayout;
