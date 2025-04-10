import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import theme from "../../../../constants/theme";
import { getStoredUser } from "../../../../database/queries";

const HomeLayout = () => {
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getStoredUser();
      setRoleId(user?.role_id || null);
    };
    fetchUser();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: roleId !== 4,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
          title: "Home",
        }}
      />
      <Stack.Screen
        name="Welcome"
        options={{
          title: "Welcome",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
        }}
      />
    </Stack>
  );
};

export default HomeLayout;
