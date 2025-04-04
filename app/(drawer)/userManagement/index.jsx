import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import TabsComponent from "../../../components/TabsComponent";
import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";

const UserManagementScreen = () => {
  return (
    <View style={globalStyles.secondaryContainerSA}>
      <Text style={styles.title}>User Management</Text>

      <TouchableOpacity
        style={styles.screenWrapper}
        onPress={() => {
          router.push("/userManagement/admins");
        }}
        accessibilityLabel="Navigate to Admins"
      >
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>Admins</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.screenWrapper}
        onPress={() => {
          router.push("/userManagement/roles");
        }}
        accessibilityLabel="Navigate to Roles"
      >
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>Roles</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.screenWrapper}
        onPress={() => {
          router.push("/userManagement/students");
        }}
        accessibilityLabel="Navigate to Students"
      >
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>Students</Text>
        </View>
      </TouchableOpacity>

      <TabsComponent />

      <StatusBar style="auto" />
    </View>
  );
};

export default UserManagementScreen;

const styles = StyleSheet.create({
  title: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.title,
    textAlign: "center",
    marginBottom: theme.spacing.small,
  },
  screenWrapper: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    width: "80%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderRadius: 8,
  },
  screenTitle: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.extraLarge,
    color: theme.colors.primary,
  },
});
