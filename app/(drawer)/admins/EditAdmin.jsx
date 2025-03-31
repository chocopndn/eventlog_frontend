import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import TabsComponent from "../../../components/TabsComponent";
import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";
import FormField from "../../../components/FormField";
import CustomDropdown from "../../../components/CustomDropdown";
import CustomButton from "../../../components/CustomButton";
import {
  fetchDepartments,
  editAdmin,
  fetchAdminById,
} from "../../../services/api";
import CustomModal from "../../../components/CustomModal";
import { useLocalSearchParams } from "expo-router";

const EditAdmin = () => {
  const { id_number } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    id_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
    department_id: null,
    role_id: null,
    status: "active",
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const roleOptions = [
    { label: "Admin", value: 3 },
    { label: "Super Admin", value: 4 },
  ];

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Disabled", value: "disabled" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!id_number) {
          throw new Error("Invalid admin ID");
        }

        const departments = await fetchDepartments();
        setDepartmentOptions(departments);

        const adminDetails = await fetchAdminById(id_number);
        if (!adminDetails) {
          throw new Error("Admin details not found");
        }

        setFormData({
          id_number: adminDetails.id_number || "",
          first_name: adminDetails.first_name || "",
          middle_name: adminDetails.middle_name || "",
          last_name: adminDetails.last_name || "",
          suffix: adminDetails.suffix || "",
          email: adminDetails.email || "",
          department_id: adminDetails.department_id || null,
          role_id: adminDetails.role_id || null,
          status: adminDetails.status || "active",
        });
      } catch (error) {
        setModal({
          visible: true,
          title: "Error",
          message: error.message || "Failed to load admin details.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id_number]);

  const handleChange = (name, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.id_number ||
        !formData.first_name ||
        !formData.last_name ||
        formData.department_id === null ||
        formData.role_id === null
      ) {
        setModal({
          visible: true,
          title: "Warning",
          message: "Please fill in all required fields.",
          type: "warning",
        });
        return;
      }

      const submitData = {
        department_id: formData.department_id,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        suffix: formData.suffix,
        email: formData.email,
        role_id: formData.role_id,
        status: formData.status,
      };

      await editAdmin(formData.id_number, submitData);

      setModal({
        visible: true,
        title: "Success",
        message: "Admin updated successfully!",
        type: "success",
      });
    } catch (error) {
      setModal({
        visible: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to update admin.",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      <CustomModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, visible: false })}
        cancelTitle="CLOSE"
      />

      <Text style={styles.textHeader}>EVENTLOG</Text>
      <View style={styles.titleContainer}>
        <Text style={styles.textTitle}>EDIT ADMIN</Text>
      </View>

      <ScrollView
        style={styles.scrollviewContainer}
        contentContainerStyle={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        <FormField
          title="ID Number"
          value={formData.id_number}
          editable={false}
        />
        <FormField
          title="First Name"
          value={formData.first_name}
          onChangeText={(text) => handleChange("first_name", text)}
        />
        <FormField
          title="Middle Name"
          value={formData.middle_name}
          onChangeText={(text) => handleChange("middle_name", text)}
        />
        <FormField
          title="Last Name"
          value={formData.last_name}
          onChangeText={(text) => handleChange("last_name", text)}
        />
        <FormField
          title="Suffix"
          value={formData.suffix}
          onChangeText={(text) => handleChange("suffix", text)}
        />
        <FormField
          title="Email"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
        />
        <CustomDropdown
          title="Department"
          data={departmentOptions}
          value={formData.department_id}
          onSelect={(item) => handleChange("department_id", item.value)}
        />
        <CustomDropdown
          title="Role"
          data={roleOptions}
          value={formData.role_id}
          onSelect={(item) => handleChange("role_id", item.value)}
        />
        <CustomDropdown
          title="Status"
          data={statusOptions}
          value={formData.status}
          onSelect={(item) => handleChange("status", item.value)}
        />
        <CustomButton title="UPDATE" onPress={handleSubmit} />
      </ScrollView>

      <TabsComponent />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default EditAdmin;

const styles = StyleSheet.create({
  textHeader: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.display,
    color: theme.colors.primary,
  },
  scrollviewContainer: {
    width: "100%",
    marginBottom: 90,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderTopWidth: 0,
  },
  scrollview: {
    flexGrow: 1,
    padding: theme.spacing.medium,
  },
  titleContainer: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  textTitle: {
    fontSize: theme.fontSizes.extraLarge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
  },
});
