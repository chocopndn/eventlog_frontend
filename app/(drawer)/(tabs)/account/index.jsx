import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../../../../components/CustomButton";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import {
  clearAllTablesData,
  getStoredUser,
} from "../../../../database/queries";
import Header from "../../../../components/Header";

const Account = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getStoredUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await clearAllTablesData();
      await AsyncStorage.multiRemove(["userToken", "id_number"]);
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <SafeAreaView
      style={[
        globalStyles.secondaryContainer,
        { paddingLeft: 0, paddingRight: 0 },
      ]}
    >
      <Header type="secondary" />
      <Text style={styles.title}>ACCOUNT</Text>
      <View style={styles.detailsWrapper}>
        <View style={[styles.detailsContainer, { borderBottomWidth: 0 }]}>
          <Text style={styles.detailsTitle}>Name: </Text>
          <Text style={styles.details}>
            {user?.first_name || "N/A"} {user?.middle_name || ""}{" "}
            {user?.last_name || "N/A"} {user?.suffix || ""}
          </Text>
        </View>
        <View style={[styles.detailsContainer, { borderBottomWidth: 0 }]}>
          <Text style={styles.detailsTitle}>ID Number: </Text>
          <Text style={styles.details}>{user?.id_number || "N/A"}</Text>
        </View>
        {user?.block_name !== null && (
          <View style={[styles.detailsContainer, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailsTitle}>Block: </Text>
            <Text style={styles.details}>{user?.block_name || "N/A"}</Text>
          </View>
        )}
        <View style={[styles.detailsContainer, { borderBottomWidth: 0 }]}>
          <Text style={styles.detailsTitle}>Department: </Text>
          <Text style={styles.details}>{user?.department_code || "N/A"}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Email: </Text>
          <Text style={styles.details}>{user?.email || "N/A"}</Text>
        </View>
      </View>
      <CustomButton
        type="primary"
        title="Logout"
        onPress={handleLogout}
        otherStyles={styles.logoutButton}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSizes.display,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
  },
  name: {
    fontSize: theme.fontSizes.extraLarge,
    fontFamily: theme.fontFamily.Arial,
    color: theme.colors.primary,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 2,
    padding: theme.spacing.medium,
    borderColor: theme.colors.primary,
  },
  details: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fontFamily.Arial,
    color: theme.colors.primary,
  },
  detailsTitle: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fontFamily.ArialBold,
    color: theme.colors.primary,
  },
  detailsWrapper: {
    width: "90%",
    marginBottom: theme.spacing.medium,
  },
});
