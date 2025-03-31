import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";

import TabsComponent from "../../../components/TabsComponent";
import CustomButton from "../../../components/CustomButton";
import CustomModal from "../../../components/CustomModal";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";
import { fetchAdminById, deleteAdmin } from "../../../services/api";
import { useLocalSearchParams } from "expo-router";

const AdminDetails = () => {
  const { id_number } = useLocalSearchParams();
  const [adminDetails, setAdminDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const fetchAdminDetails = async () => {
    try {
      if (!id_number) throw new Error("Invalid admin ID");

      const adminData = await fetchAdminById(id_number);
      if (!adminData) throw new Error("Admin details not found");

      setAdminDetails(adminData);
    } catch (error) {
      console.error("Error fetching admin details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      fetchAdminDetails();
    }, [id_number])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!adminDetails) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <Text style={styles.errorText}>Admin details not found.</Text>
      </SafeAreaView>
    );
  }

  const handleDeletePress = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAdmin(adminDetails.id_number);
      router.back();
    } catch (error) {
      console.error("Error deleting admin:", error);
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        globalStyles.secondaryContainer,
        { paddingTop: 0, paddingBottom: 110 },
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Admin Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.detailsWrapper}>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>ID Number:</Text>
          <Text style={styles.detail}>{adminDetails.id_number}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>First Name:</Text>
          <Text style={styles.detail}>{adminDetails.first_name}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Middle Name:</Text>
          <Text style={styles.detail}>{adminDetails.middle_name || "-"}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Last Name:</Text>
          <Text style={styles.detail}>{adminDetails.last_name}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Suffix:</Text>
          <Text style={styles.detail}>{adminDetails.suffix || "-"}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Email Address:</Text>
          <Text style={styles.detail}>{adminDetails.email}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Department:</Text>
          <Text style={styles.detail}>
            {adminDetails.department_code || "-"}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Role:</Text>
          <Text style={styles.detail}>{adminDetails.role_name || "-"}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Status:</Text>
          <Text style={styles.detail}>{adminDetails.status}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <CustomButton
            title="EDIT"
            onPress={() =>
              router.push(
                `/admins/EditAdmin?id_number=${adminDetails.id_number}`
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
        message={`Are you sure you want to delete ${adminDetails.first_name} ${adminDetails.last_name}?`}
        type="warning"
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        cancelTitle="Cancel"
        confirmTitle="Delete"
      />

      <TabsComponent />
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default AdminDetails;

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
