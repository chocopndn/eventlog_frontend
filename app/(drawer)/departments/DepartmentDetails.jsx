import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";

import TabsComponent from "../../../components/TabsComponent";
import CustomButton from "../../../components/CustomButton";
import CustomModal from "../../../components/CustomModal";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";
import { fetchDepartmentById, deleteDepartment } from "../../../services/api";
import { useLocalSearchParams } from "expo-router";

const DepartmentDetails = () => {
  const { id: department_id } = useLocalSearchParams();
  const [departmentDetails, setDepartmentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const fetchDepartmentDetails = async () => {
    try {
      if (!department_id) throw new Error("Invalid department ID");

      const departmentData = await fetchDepartmentById(department_id);
      if (!departmentData) throw new Error("Department details not found");

      setDepartmentDetails(departmentData);
    } catch (error) {
      console.error("Error fetching department details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      fetchDepartmentDetails();
    }, [department_id])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!departmentDetails) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <Text style={styles.errorText}>Department details not found.</Text>
      </SafeAreaView>
    );
  }

  const handleDeletePress = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDepartment(departmentDetails.department_id);
      setIsDeleteModalVisible(false);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalVisible(false);
    router.back();
  };

  return (
    <SafeAreaView
      style={[
        globalStyles.secondaryContainer,
        { paddingTop: 0, paddingBottom: 110 },
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Department Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.detailsWrapper}>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Department Name:</Text>
          <Text style={styles.detail}>{departmentDetails.department_name}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Department Code:</Text>
          <Text style={styles.detail}>{departmentDetails.department_code}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <CustomButton
            title="EDIT"
            onPress={() =>
              router.push(
                `/departments/EditDepartment?id=${departmentDetails.department_id}`
              )
            }
          />
        </View>
        <View style={styles.button}>
          <CustomButton
            title="DELETE"
            type="secondary"
            onPress={handleDeletePress}
          />
        </View>
      </View>

      <CustomModal
        visible={isDeleteModalVisible}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${departmentDetails.department_name}?`}
        type="warning"
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        cancelTitle="Cancel"
        confirmTitle="Delete"
      />

      <CustomModal
        visible={isSuccessModalVisible}
        title="Success"
        message="Department deleted successfully!"
        type="success"
        onClose={handleSuccessModalClose}
        cancelTitle="CLOSE"
      />

      <TabsComponent />
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default DepartmentDetails;

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.huge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
  },
  detailsWrapper: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  button: {
    marginHorizontal: theme.spacing.small,
    flex: 1,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.small,
  },
  detailTitle: {
    fontFamily: theme.fontFamily.ArialBold,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    width: "40%",
    flexShrink: 1,
  },
  detail: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    width: "60%",
    flexShrink: 1,
  },
  loadingText: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fontFamily.Regular,
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: theme.spacing.medium,
  },
  errorText: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fontFamily.Regular,
    color: theme.colors.error,
    textAlign: "center",
    marginTop: theme.spacing.medium,
  },
});
