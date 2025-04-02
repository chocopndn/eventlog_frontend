import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import TabsComponent from "../../../../components/TabsComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { fetchDepartments, deleteDepartment } from "../../../../services/api";
import { router, useFocusEffect } from "expo-router";

import images from "../../../../constants/images";
import SearchBar from "../../../../components/CustomSearch";
import CustomModal from "../../../../components/CustomModal";
import CustomButton from "../../../../components/CustomButton";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

export default function DepartmentsScreen() {
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDepartments = async () => {
    try {
      const fetchedDepartments = await fetchDepartments();
      setDepartments(
        Array.isArray(fetchedDepartments) ? fetchedDepartments : []
      );
    } catch (err) {}
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadDepartments();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDepartments();
    }, [])
  );

  const filteredDepartments = Array.isArray(departments)
    ? departments.filter((dept) => {
        const label = dept.label?.toLowerCase() || "";
        const value = dept.value?.toString().toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return label.includes(query) || value.includes(query);
      })
    : [];

  const handleDeletePress = (department) => {
    setDepartmentToDelete(department);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalVisible(false);
    setDepartmentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await deleteDepartment(departmentToDelete.value);
      setDepartments((prevDepartments) =>
        prevDepartments.map((dept) =>
          dept.value === departmentToDelete.value
            ? { ...dept, status: "deleted" }
            : dept
        )
      );
      handleDeleteModalClose();
      setIsSuccessModalVisible(true);
    } catch (error) {}
  };

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      <Text style={styles.headerText}>DEPARTMENTS</Text>
      <View style={{ paddingHorizontal: theme.spacing.medium, width: "100%" }}>
        <SearchBar
          placeholder="Search departments..."
          onSearch={(query) => setSearchQuery(query)}
        />
      </View>
      <ScrollView
        style={{ flex: 1, width: "100%", marginBottom: 70 }}
        contentContainerStyle={[styles.scrollview, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map((department) => (
            <TouchableOpacity
              key={department.value}
              style={styles.departmentContainer}
              onPress={() =>
                router.push(
                  `/departments/DepartmentDetails?id=${department.value}`
                )
              }
            >
              <View style={styles.textContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {department.department_name}
                </Text>
                <Text style={styles.departmentCode} numberOfLines={1}>
                  {department.status}
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (department.value) {
                      router.push(
                        `/departments/EditDepartment?id=${department.value}`
                      );
                    }
                  }}
                >
                  <Image source={images.edit} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeletePress(department)}
                  disabled={department.status === "deleted"}
                  style={{ opacity: department.status === "deleted" ? 0.5 : 1 }}
                >
                  <Image source={images.trash} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResults}>No departments found</Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="ADD DEPARTMENT"
          onPress={() => router.push("/departments/AddDepartment")}
        />
      </View>

      <CustomModal
        visible={isDeleteModalVisible}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${departmentToDelete?.label}?`}
        type="warning"
        onClose={handleDeleteModalClose}
        onConfirm={handleConfirmDelete}
        cancelTitle="Cancel"
        confirmTitle="Delete"
      />

      <CustomModal
        visible={isSuccessModalVisible}
        title="Success"
        message="Department deleted successfully!"
        type="success"
        onClose={() => setIsSuccessModalVisible(false)}
        cancelTitle="CLOSE"
      />

      <TabsComponent />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: 60,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
  },
  departmentContainer: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    height: 50,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  scrollview: {
    padding: theme.spacing.medium,
    flexGrow: 1,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: theme.colors.primary,
    marginLeft: theme.spacing.small,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    flexShrink: 1,
  },
  departmentCode: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    flexShrink: 1,
  },
  noResults: {
    textAlign: "center",
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
    marginTop: theme.spacing.medium,
  },
  buttonContainer: {
    position: "absolute",
    bottom: theme.spacing.medium,
    alignSelf: "center",
    width: "80%",
    padding: theme.spacing.medium,
    marginBottom: 80,
  },
});
