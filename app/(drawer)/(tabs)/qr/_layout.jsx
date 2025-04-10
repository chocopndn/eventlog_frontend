import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { getRoleID } from "../../../../database/queries";
import theme from "../../../../constants/theme";

const QRLayout = () => {
  const [roleId, setRoleId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleId = async () => {
      try {
        const fetchedRoleId = await getRoleID();
        setRoleId(fetchedRoleId);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleId();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="Generate"
        options={{
          headerTitle: "Generate QR Code",
          headerShown: false,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
        }}
      />
      <Stack.Screen
        name="Scan"
        options={{
          headerTitle: "Scan QR Code",
          headerShown: false,
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
        }}
      />
    </Stack>
  );
};

export default QRLayout;
