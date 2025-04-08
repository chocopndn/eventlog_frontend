import { StyleSheet, View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { getStoredUser } from "../../../../database/queries";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

const QRCode = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRoleAndRedirect = async () => {
      try {
        const user = await getStoredUser();
        const role = user?.role_id || null;
        setUserRole(role);

        if (role === 1) {
          router.replace("/qr/Generate");
        } else if (role === 2) {
          console.log("No navigation for role_id 2");
        } else if (role === 3 || role === 4) {
          router.replace("/qr/Scan");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRoleAndRedirect();
  }, []);

  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default QRCode;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fontFamily.Arial,
    color: theme.colors.primary,
  },
});
