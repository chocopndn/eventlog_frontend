import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import TabsComponent from "../../../components/TabsComponent";
import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";

const AcademicManagement = () => {
  return (
    <SafeAreaView style={globalStyles.secondaryContainerSA}>
      <Text style={styles.title}>User Management</Text>

      <TouchableOpacity
        style={styles.screenWrapper}
        onPress={() => {
          router.push("/academicManagement/blocks");
        }}
      >
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>Blocks</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.screenWrapper}
        onPress={() => {
          router.push("/academicManagement/courses");
        }}
      >
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>Courses</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.screenWrapper}
        onPress={() => {
          router.push("/academicManagement/departments");
        }}
      >
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>Departments</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.screenWrapper}
        onPress={() => {
          router.push("/academicManagement/schoolyears");
        }}
        accessibilityLabel="Navigate to Roles"
      >
        <View style={styles.screenContainer}>
          <Text style={styles.screenTitle}>School Years</Text>
        </View>
      </TouchableOpacity>

      <TabsComponent />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default AcademicManagement;

const styles = StyleSheet.create({
  title: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: 45,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 20,
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
  screenContainer: {},
  screenTitle: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.extraLarge,
    color: theme.colors.primary,
  },
});
